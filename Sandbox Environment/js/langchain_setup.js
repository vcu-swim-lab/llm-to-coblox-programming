function voiceToText() {
    loadSpeechToText();
    //convertOutputToDom();
}

let calls = [function () { move_robot("Test") },
function () { pick_up_object() },
function () { move_robot("Home") },
function () { release_object() }
];

let currBlock, prevBlock;

function convertOutputToDom() {

    calls.push(function () { move_robot("Test2") });

    //get starting block
    prevBlock = Blockly.getMainWorkspace().getBlocksByType("custom_start")[0];

    for (let i = 0; i < calls.length; i++) {
        calls[i]();

    }
}

function move_robot(location) {
    var currBlock = blocklyWorkspace.newBlock("move_to_position");
    currBlock.setFieldValue(location, "DROPDOWN_OPTIONS");
    currBlock.initSvg();
    currBlock.render();
    currBlock.previousConnection.connect(prevBlock.nextConnection);
    prevBlock = currBlock;

}

function pick_up_object() {
    var currBlock = blocklyWorkspace.newBlock("pick_object");
    currBlock.initSvg();
    currBlock.render();
    currBlock.previousConnection.connect(prevBlock.nextConnection);
    prevBlock = currBlock;
}

function release_object() {
    var currBlock = blocklyWorkspace.newBlock("release_object");
    currBlock.initSvg();
    currBlock.render();
    currBlock.previousConnection.connect(prevBlock.nextConnection);
    prevBlock = currBlock;
}

