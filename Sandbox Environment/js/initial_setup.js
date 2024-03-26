export const phaserSceneName = "Sandbox"

import { updateBlocklyBlocks } from './blockly_setup'
import { createPositionModal } from './bootstrap_setup';
import { game } from './phaser_setup';

/* savedVariables saves the position names created by the user.
In the example below, "Home" is the variable name, and "HOME_POSITION"
the language-neutral key that identifies this variable in Blockly. */
export const savedVariables = new Map();
savedVariables.set("Home", "Home");
savedVariables.set("Test", "Test");
savedVariables.set("Test2", "Test2");
savedVariables.set("Test3", "Test3");

/* savedCoordinates saves the positions coordinates from the Phaser environment.
In the example below, "HOME_POSITION" is the language-neutral key from Blockly, 
and [0, 0] the coordinates in Phaser. */
export const savedCoordinates = new Map();
savedCoordinates.set("Home", [1024, 1024])
savedCoordinates.set("Test", [1600, 1600])
savedCoordinates.set("Test2", [124, 124])
savedCoordinates.set("Test3", [124, 924])

export let savedCoords = Array.from(savedCoordinates);
export let savedPos = Array.from(savedVariables);

export function createNewPosition(name, key, coordinates) {
    if (name === undefined || key == undefined || coordinates === undefined) {
        window.alert("Arguments missing.");
    } else {
        if (!savedVariables.has(name)) {
            savedVariables.set(name, key);
            savedCoordinates.set(key, coordinates);
            createPositionModal.hide();
            updateBlocklyBlocks();
            savedPos = Array.from(savedVariables);
            savedCoords = Array.from(savedCoordinates);
            var currentScene = game.scene.getScene(phaserSceneName);
            currentScene.drawCircles(savedCoordinates);
            currentScene.drawLabels(savedCoordinates);
        } else {
            window.alert("A variable with the same name already exists.");
        }
    }
}

export function getSavedCoords() {
    return savedCoords;
}