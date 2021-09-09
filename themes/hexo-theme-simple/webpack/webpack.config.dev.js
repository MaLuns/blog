const { baseConf } = require('./webpack.config.base')
const merge = require('webpack-merge')

module.exports = merge(baseConf, {
    mode: 'development',
    watch: true,
    watchOptions: {
        poll: 1000, // 每秒询问多少次
        aggregateTimeout: 500,  //防抖 多少毫秒后再次触发
        ignored: [/node_modules/, /source/, /layout/] //忽略时时监听
    }
})
