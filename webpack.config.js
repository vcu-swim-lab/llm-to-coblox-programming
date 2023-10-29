module.exports = {

    entry: ["./Sandbox\ Environment/js/blockly_setup.js", "./Sandbox\ Environment/js/phaser_setup.js", "./Sandbox\ Environment/js/bootstrap_setup.js", "./Sandbox\ Environment/js/initial_setup.js", "./Sandbox\ Environment/js/record_init.js"],

    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
};