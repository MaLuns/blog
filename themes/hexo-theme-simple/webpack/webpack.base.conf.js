const webpack = require('webpack');

module.exports.baseConf = {
    mode: 'production',
    module: {
        rules: [{
            test: /\.less$/,
            use: [
                "to-string-loader",
                "css-loader",
                "less-loader"
            ]
        }, {
            test: /\.(html)$/,
            use: {
                loader: 'html-loader',
                options: {
                    minimize: true
                }
            }
        }]
    },
 /*    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            output: {
                comments: false,
                ascii_only: true
            },
            sourceMap: true
        })
    ], */
}