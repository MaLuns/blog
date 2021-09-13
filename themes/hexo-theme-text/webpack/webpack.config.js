const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const merge = require('webpack-merge')
const { baseConf } = require('./webpack.config.base')

module.exports = merge(baseConf, {
    mode: 'production',
    externals: {
        'nprogress': 'NProgress'
    },
    plugins: [
        //   new BundleAnalyzerPlugin()
    ]
})