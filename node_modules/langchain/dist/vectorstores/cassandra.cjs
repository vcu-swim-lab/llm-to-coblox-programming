"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CassandraStore = void 0;
/* eslint-disable prefer-template */
const cassandra_driver_1 = require("cassandra-driver");
const async_caller_js_1 = require("../util/async_caller.cjs");
const base_js_1 = require("./base.cjs");
const document_js_1 = require("../document.cjs");
/**
 * Class for interacting with the Cassandra database. It extends the
 * VectorStore class and provides methods for adding vectors and
 * documents, searching for similar vectors, and creating instances from
 * texts or documents.
 */
class CassandraStore extends base_js_1.VectorStore {
    _vectorstoreType() {
        return "cassandra";
    }
    constructor(embeddings, args) {
        const argsWithDefaults = {
            indices: [],
            maxConcurrency: 25,
            batchSize: 1,
            ...args,
        };
        super(embeddings, argsWithDefaults);
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dimensions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "keyspace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "primaryKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "metadataColumns", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "table", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "indices", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "asyncCaller", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "batchSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.asyncCaller = new async_caller_js_1.AsyncCaller(argsWithDefaults ?? {});
        this.client = new cassandra_driver_1.Client(argsWithDefaults);
        this.dimensions = argsWithDefaults.dimensions;
        this.keyspace = argsWithDefaults.keyspace;
        this.table = argsWithDefaults.table;
        this.primaryKey = argsWithDefaults.primaryKey;
        this.metadataColumns = argsWithDefaults.metadataColumns;
        this.indices = argsWithDefaults.indices;
        this.batchSize = argsWithDefaults.batchSize;
        if (this.batchSize < 1) {
            console.warn("batchSize must be greater than or equal to 1, defaulting to 1");
            this.batchSize = 1;
        }
    }
    /**
     * Method to save vectors to the Cassandra database.
     * @param vectors Vectors to save.
     * @param documents The documents associated with the vectors.
     * @returns Promise that resolves when the vectors have been added.
     */
    async addVectors(vectors, documents) {
        if (vectors.length === 0) {
            return;
        }
        if (!this.isInitialized) {
            await this.initialize();
        }
        await this.insertAll(vectors, documents);
    }
    /**
     * Method to add documents to the Cassandra database.
     * @param documents The documents to add.
     * @returns Promise that resolves when the documents have been added.
     */
    async addDocuments(documents) {
        return this.addVectors(await this.embeddings.embedDocuments(documents.map((d) => d.pageContent)), documents);
    }
    /**
     * Method to search for vectors that are similar to a given query vector.
     * @param query The query vector.
     * @param k The number of similar vectors to return.
     * @param filter
     * @returns Promise that resolves with an array of tuples, each containing a Document and a score.
     */
    async similaritySearchVectorWithScore(query, k, filter) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        const queryStr = this.buildSearchQuery(query, k, filter);
        const queryResultSet = await this.client.execute(queryStr);
        return queryResultSet?.rows.map((row, index) => {
            const textContent = row.text;
            const sanitizedRow = Object.assign(row, {});
            delete sanitizedRow.vector;
            delete sanitizedRow.text;
            return [
                new document_js_1.Document({ pageContent: textContent, metadata: sanitizedRow }),
                index,
            ];
        });
    }
    /**
     * Static method to create an instance of CassandraStore from texts.
     * @param texts The texts to use.
     * @param metadatas The metadata associated with the texts.
     * @param embeddings The embeddings to use.
     * @param args The arguments for the CassandraStore.
     * @returns Promise that resolves with a new instance of CassandraStore.
     */
    static async fromTexts(texts, metadatas, embeddings, args) {
        const docs = [];
        for (let index = 0; index < texts.length; index += 1) {
            const metadata = Array.isArray(metadatas) ? metadatas[index] : metadatas;
            const doc = new document_js_1.Document({
                pageContent: texts[index],
                metadata,
            });
            docs.push(doc);
        }
        return CassandraStore.fromDocuments(docs, embeddings, args);
    }
    /**
     * Static method to create an instance of CassandraStore from documents.
     * @param docs The documents to use.
     * @param embeddings The embeddings to use.
     * @param args The arguments for the CassandraStore.
     * @returns Promise that resolves with a new instance of CassandraStore.
     */
    static async fromDocuments(docs, embeddings, args) {
        const instance = new this(embeddings, args);
        await instance.addDocuments(docs);
        return instance;
    }
    /**
     * Static method to create an instance of CassandraStore from an existing
     * index.
     * @param embeddings The embeddings to use.
     * @param args The arguments for the CassandraStore.
     * @returns Promise that resolves with a new instance of CassandraStore.
     */
    static async fromExistingIndex(embeddings, args) {
        const instance = new this(embeddings, args);
        await instance.initialize();
        return instance;
    }
    /**
     * Method to initialize the Cassandra database.
     * @returns Promise that resolves when the database has been initialized.
     */
    async initialize() {
        await this.client.execute(`CREATE TABLE IF NOT EXISTS ${this.keyspace}.${this.table} (
      ${this.primaryKey.name} ${this.primaryKey.type} PRIMARY KEY,
      text TEXT,
      ${this.metadataColumns.length > 0
            ? this.metadataColumns.map((col) => `${col.name} ${col.type},`)
            : ""}
      vector VECTOR<FLOAT, ${this.dimensions}>
    );`);
        await this.client
            .execute(`CREATE CUSTOM INDEX IF NOT EXISTS idx_vector_${this.table}
  ON ${this.keyspace}.${this.table}(vector) USING 'StorageAttachedIndex';`);
        for await (const { name, value } of this.indices) {
            await this.client
                .execute(`CREATE CUSTOM INDEX IF NOT EXISTS idx_${this.table}_${name}
  ON ${this.keyspace}.${this.table} ${value} USING 'StorageAttachedIndex';`);
        }
        this.isInitialized = true;
    }
    buildWhereClause(filter) {
        const whereClause = Object.entries(filter)
            .map(([key, value]) => `${key} = '${value}'`)
            .join(" AND ");
        return `WHERE ${whereClause}`;
    }
    /**
     * Method to build an CQL query for searching for similar vectors in the
     * Cassandra database.
     * @param query The query vector.
     * @param k The number of similar vectors to return.
     * @param filter
     * @returns The CQL query string.
     */
    buildSearchQuery(query, k = 1, filter = undefined) {
        const whereClause = filter ? this.buildWhereClause(filter) : "";
        return `SELECT * FROM ${this.keyspace}.${this.table} ${whereClause} ORDER BY vector ANN OF [${query}] LIMIT ${k}`;
    }
    /**
     * Method for inserting vectors and documents into the Cassandra database in a batch.
     * @param batchVectors The list of vectors to insert.
     * @param batchDocuments The list of documents to insert.
     * @returns Promise that resolves when the batch has been inserted.
     */
    async executeInsert(batchVectors, batchDocuments) {
        // Input validation: Check if the lengths of batchVectors and batchDocuments are the same
        if (batchVectors.length !== batchDocuments.length) {
            throw new Error(`The lengths of vectors (${batchVectors.length}) and documents (${batchDocuments.length}) must be the same.`);
        }
        // Initialize an array to hold query objects
        const queries = [];
        // Loop through each vector and document in the batch
        for (let i = 0; i < batchVectors.length; i += 1) {
            // Convert the list of numbers to a Float32Array, the driver's expected format of a vector
            const preparedVector = new Float32Array(batchVectors[i]);
            // Retrieve the corresponding document
            const document = batchDocuments[i];
            // Extract metadata column names and values from the document
            const metadataColNames = Object.keys(document.metadata);
            const metadataVals = Object.values(document.metadata);
            // Prepare the metadata columns string for the query, if metadata exists
            const metadataInsert = metadataColNames.length > 0 ? ", " + metadataColNames.join(", ") : "";
            // Construct the query string and parameters
            const query = {
                query: `INSERT INTO ${this.keyspace}.${this.table} (vector, text${metadataInsert}) 
                VALUES (?, ?${", ?".repeat(metadataColNames.length)})`,
                params: [preparedVector, document.pageContent, ...metadataVals],
            };
            // Add the query to the list
            queries.push(query);
        }
        // Execute the queries: use a batch if multiple, otherwise execute a single query
        if (queries.length === 1) {
            await this.client.execute(queries[0].query, queries[0].params, {
                prepare: true,
            });
        }
        else {
            await this.client.batch(queries, { prepare: true, logged: false });
        }
    }
    /**
     * Method for inserting vectors and documents into the Cassandra database in
     * parallel, keeping within maxConcurrency number of active insert statements.
     * @param vectors The vectors to insert.
     * @param documents The documents to insert.
     * @returns Promise that resolves when the documents have been added.
     */
    async insertAll(vectors, documents) {
        // Input validation: Check if the lengths of vectors and documents are the same
        if (vectors.length !== documents.length) {
            throw new Error(`The lengths of vectors (${vectors.length}) and documents (${documents.length}) must be the same.`);
        }
        // Early exit: If there are no vectors or documents to insert, return immediately
        if (vectors.length === 0) {
            return;
        }
        // Ensure the store is initialized before proceeding
        if (!this.isInitialized) {
            await this.initialize();
        }
        // Initialize an array to hold promises for each batch insert
        const insertPromises = [];
        // Buffers to hold the current batch of vectors and documents
        let currentBatchVectors = [];
        let currentBatchDocuments = [];
        // Loop through each vector/document pair to insert; we use
        // <= vectors.length to ensure the last batch is inserted
        for (let i = 0; i <= vectors.length; i += 1) {
            // Check if we're still within the array boundaries
            if (i < vectors.length) {
                // Add the current vector and document to the batch
                currentBatchVectors.push(vectors[i]);
                currentBatchDocuments.push(documents[i]);
            }
            // Check if we've reached the batch size or end of the array
            if (currentBatchVectors.length >= this.batchSize ||
                i === vectors.length) {
                // Only proceed if there are items in the current batch
                if (currentBatchVectors.length > 0) {
                    // Create copies of the current batch arrays to use in the async insert operation
                    const batchVectors = [...currentBatchVectors];
                    const batchDocuments = [...currentBatchDocuments];
                    // Execute the insert using the AsyncCaller - it will handle concurrency and queueing.
                    insertPromises.push(this.asyncCaller.call(() => this.executeInsert(batchVectors, batchDocuments)));
                    // Clear the current buffers for the next iteration
                    currentBatchVectors = [];
                    currentBatchDocuments = [];
                }
            }
        }
        // Wait for all insert operations to complete.
        await Promise.all(insertPromises);
    }
}
exports.CassandraStore = CassandraStore;
