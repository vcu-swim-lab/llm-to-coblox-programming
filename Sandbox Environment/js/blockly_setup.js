import Blockly from 'blockly'
import { game } from './phaser_setup'
import { loadCreatePositionModal } from './bootstrap_setup'
import { loadPositionsForRemoval } from './bootstrap_setup'
import { phaserSceneName, savedVariables, savedCoordinates } from './initial_setup';
import { voiceToText } from './langchain_setup';
/* "Extensions are functions that run on each block of a given type as the block is created." - Blockly */

/* This extension fill the movement position dropdown with default field values. */
Blockly.Extensions.register('move_block_created',
    function () {
        this
            .getInput('POSITION')
            .appendField(new Blockly.FieldDropdown(
                function () {
                    var options = [];

                    for (let [name, key] of savedVariables) {
                        options.push([name, key]);
                    }

                    return options;
                }), 'DROPDOWN_OPTIONS');
    });

function updateDropdownOptions(dropdownField) {
    var dropdownOptions = dropdownField.getOptions(false);

    // Push unsaved positions into dropdown options
    // TODO: Optmize this verification to reduce complexity
    for (let [name, key] of savedVariables) {
        let value_exists = false;

        for (let [optionName, optionKey] of dropdownOptions) {
            // If position already exists in dropdown options, break */
            if (key == optionKey) {
                value_exists = true;
                break;
            }
        }

        if (!value_exists) {
            dropdownOptions.push([name, key]);
        }
    }

    dropdownField.menuGenerator_ = dropdownOptions;
}

export function updateBlocklyBlocks() {
    Blockly.getMainWorkspace().getBlocksByType("move_to_position").forEach(function (block) {
        var dropdownField = block.getField('DROPDOWN_OPTIONS');
        updateDropdownOptions(dropdownField);
    });
}

Blockly.defineBlocksWithJsonArray([
    /* Custom movement block */
    {
        "type": "custom_start",
        "message0": "When program starts:",
        "nextStatement": null,
        "colour": 210,
        "tooltip": "",
        "helpUrl": ""
    },
    {
        "type": "move_to_position",
        "message0": "%2 Move robot to %1",
        "args0": [
            {
                "type": "input_dummy",
                "name": "POSITION",
                "variable": "<somewhere>"
            },
            {
                "type": "field_checkbox",
                "name": "Breakpoint",
                "checked": false
            }
        ],
        "inputsInline": false,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 0,
        "tooltip": "",
        "helpUrl": "",
        "extensions": ["move_block_created"]
    },
    /* Custom pick object block */
    {
        "type": "pick_object",
        "message0": "%1 Pick up object",
        "args0": [
            {
                "type": "field_checkbox",
                "name": "Breakpoint",
                "checked": false
            }
        ],
        "inputsInline": false,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 42,
        "tooltip": "",
        "helpUrl": "",
        "extensions": []
    },
    /* Custom release object block */
    {
        "type": "release_object",
        "message0": "%1 Release object",
        "args0": [
            {
                "type": "field_checkbox",
                "name": "Breakpoint",
                "checked": false
            }
        ],
        "inputsInline": false,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 120,
        "tooltip": "",
        "helpUrl": "",
        "extensions": []
    },
    /* drag block */
    {
        "type": "drag_block",
        "message0": "Drag %1 tooooo %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "ITEM",
                "options": [
                    ["Item A", "item_a"],
                    ["Item B", "item_b"],
                    ["Item C", "item_c"]
                ]
            },
            {
                "type": "field_dropdown",
                "name": "DESTINATION",
                "options": [
                    ["Destination X", "dest_x"],
                    ["Destination Y", "dest_y"],
                    ["Destination Z", "dest_z"]
                ]
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 160,
        "tooltip": "Drag an item to a destination.",
        "helpUrl": ""
    }
]);

const toolbox = {
    "kind": "flyoutToolbox",
    "contents": [
        {
            "kind": "label",
            "text": "Actions",
        },
        {
            "kind": "button",
            "text": "Start Program",
            "callbackKey": "run-program"
        },
        {
            "kind": "button",
            "text": "Create Position",
            "callbackKey": "create-position"
        },
        {
            "kind": "button",
            "text": "Delete Positions",
            "callbackKey": "delete-positions",
        },
        {
            "kind": "button",
            "text": "Speech to text",
            "callbackKey": "speech-to-text",
        },
        {
            "kind": "label",
            "text": "Blocks",
        },
        {
            "kind": "block",
            "type": "pick_object"
        },
        {
            "kind": "block",
            "type": "release_object"
        },
        {
            "kind": "block",
            "type": "move_to_position"
        },
        {
            "kind": "block",
            "type": "drag_block"
        }
    ]
}

const blocklyDiv = document.getElementById('blockly-workspace');
export const blocklyWorkspace = Blockly.inject(blocklyDiv, {
    toolbox: toolbox, zoom:
    {
        controls: true,
        startScale: 1.25,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
        pinch: true
    },
    move: {
        scrollbars: {
            horizontal: true,
            vertical: true
        },
        drag: true,
        wheel: false
    },
    trashcan: true
});

/* Listen to changes on workspace */
blocklyWorkspace.addChangeListener(onBlockChange);

/* Define block colors */
Blockly.HSV_SATURATION = 0.90;
Blockly.HSV_VALUE = 0.75;
Blockly.FieldCheckbox.CHECK_CHAR = "✔";

/* Define starting block (root) */
var startingBlocks = document.getElementById("blocks");
//THIS IS WHERE BLOCK IS INJECTED
Blockly.Xml.domToWorkspace(startingBlocks, blocklyWorkspace);
//console.log(Blockly.Xml.domToWorkspace(startingBlocks, blocklyWorkspace));
var startingBlock = Blockly.getMainWorkspace().getBlocksByType("custom_start")[0];

/* TESTING - Stephen Nocera */

var nextBlock = Blockly.getMainWorkspace().getBlocksByType("move_to_position")[0];
var prevBlock = startingBlock;
nextBlock.setFieldValue("Test", "DROPDOWN_OPTIONS");
prevBlock.nextConnection.connect(nextBlock.previousConnection);

prevBlock = nextBlock;
nextBlock = Blockly.getMainWorkspace().getBlocksByType("pick_object")[0];
//nextBlock.setFieldValue("Test2", "DROPDOWN_OPTIONS");
prevBlock.nextConnection.connect(nextBlock.previousConnection);

prevBlock = nextBlock;
nextBlock = Blockly.getMainWorkspace().getBlocksByType("move_to_position")[1];
nextBlock.setFieldValue("Home", "DROPDOWN_OPTIONS");
prevBlock.nextConnection.connect(nextBlock.previousConnection);
/* END TESTING */

console.log(Blockly.Xml.workspaceToDom(blocklyWorkspace).innerHTML);

blocklyWorkspace.centerOnBlock(startingBlock.id);
startingBlock.conn
startingBlock.setDeletable(false);

/* Define workspace buttons callbacks */
blocklyWorkspace.registerButtonCallback("run-program", executeBlocklyCode);
blocklyWorkspace.registerButtonCallback("create-position", loadCreatePositionModal);
blocklyWorkspace.registerButtonCallback("delete-positions", loadPositionsForRemoval);
blocklyWorkspace.registerButtonCallback("speech-to-text", voiceToText);

function executeBlocklyCode() {
    console.log("executing")
    if (startingBlock) {
        var attachedBlocks = startingBlock.getDescendants();
        var currentScene = game.scene.getScene(phaserSceneName);
        currentScene.setAnimationBlocks(attachedBlocks);
        currentScene.executeAnimation();
    } else {
        console.log("Blockly: No starting block available.")
    }
}

export function getBlocklyPositions() {
    if (startingBlock) {
        var attachedBlocks = startingBlock.getDescendants();
        var movementBlocks = [];

        for (var i = 0; i < attachedBlocks.length; i++) {
            var currentBlock = attachedBlocks[i];

            if (currentBlock.type === "move_to_position") {
                var positionKey = currentBlock.getFieldValue("DROPDOWN_OPTIONS");
                var coordinates = savedCoordinates.get(positionKey);
                movementBlocks.push([positionKey, coordinates]);
            }
        }

        return movementBlocks;
    } else {
        console.log("Blockly: No starting block available.")
    }
}

export function removeBlocksWithPosition(removedKey) {
    if (startingBlock) {
        var attachedBlocks = startingBlock.getDescendants();
        var movementBlocks = [];

        for (var i = 0; i < attachedBlocks.length; i++) {
            var currentBlock = attachedBlocks[i];

            if (currentBlock.type === "move_to_position") {
                var positionKey = currentBlock.getFieldValue("DROPDOWN_OPTIONS");
                if (positionKey === removedKey) {
                    currentBlock.unplug(true);

                    currentBlock.dispose();
                }
            }
        }

        return movementBlocks;
    } else {
        console.log("Blockly: No starting block available.")
    }
}

function onBlockChange(event) {
    if (event.type == Blockly.Events.BLOCK_MOVE || event.type == Blockly.Events.BLOCK_CHANGE) {
        var currentScene = game.scene.getScene(phaserSceneName);

        if (currentScene) {
            currentScene.drawCircles();
            currentScene.drawLabels();
            currentScene.drawArrows();
        }
    }
}
