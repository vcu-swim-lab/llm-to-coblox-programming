const Dotenv = require('dotenv-webpack');
module.exports = {

    entry: ["./Sandbox\ Environment/js/bootstrap_setup.js", "./Sandbox\ Environment/js/blockly_setup.js",
        "./Sandbox\ Environment/js/phaser_setup.js",
        "./Sandbox\ Environment/js/initial_setup.js",
        "./Sandbox\ Environment/js/record_init.js"],
    mode: 'development',
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    plugins: [
        new Dotenv({
            safe: false,
        })

    ]
};