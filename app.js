const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config()

const PORT = 3000;
const ROOT_DIR = './'; // Directory containing your webpack output

const server = http.createServer((req, res) => {
    let filePath;

    // Handle requests for CSS, JavaScript, and other static assets
    if (req.url.startsWith('/css') || req.url.startsWith('/js') || req.url.startsWith('bootstrap/js/') || req.url.startsWith('/bootstrap/css/')) {
        filePath = path.join(ROOT_DIR, 'Sandbox Environment' + req.url);
        console.log('Resolved file path:', filePath);
    } else {
        // Handle requests for HTML files
        filePath = path.join(ROOT_DIR, req.url === '/' ? 'Sandbox Environment/index.html' : req.url);
        console.log('Resolved file path:', filePath);
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
        } else {
            let contentType = 'text/html';
            const ext = path.extname(filePath);
            if (ext === '.css') {
                contentType = 'text/css';
            } else if (ext === '.js') {
                contentType = 'text/javascript';
            }

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});