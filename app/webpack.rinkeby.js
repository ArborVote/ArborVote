const merge = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
    mode: "production",
    devtool: "source-map",
    externals: {
        config: JSON.stringify({
            networkId: 4,
            contractAddress: "0x397E355eC9bCd6AaCAD91D265Ff54Ad7679a8109"
        })
    }
});
