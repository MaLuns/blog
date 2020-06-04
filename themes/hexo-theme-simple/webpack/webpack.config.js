const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
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
    /*     plugins: [
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