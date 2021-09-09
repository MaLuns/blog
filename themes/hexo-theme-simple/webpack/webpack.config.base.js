const path = require("path")
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports.baseConf = {
    devtool: 'source-map',
    entry: {
        'index': './src/index'
    },
    output: {
        path: path.resolve(__dirname, '../source/js'),
        filename: '[name].min.js',
        publicPath: '/'
    },
    module: {
        strictExportPresence: true,
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: require.resolve('babel-loader'),
                        options: {
                            compact: true,
                            presets: ['@babel/preset-env']
                        }
                    }
                ]
            },
            {
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
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
    ]
}
