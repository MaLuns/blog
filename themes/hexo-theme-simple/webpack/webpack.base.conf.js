
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
    }
}