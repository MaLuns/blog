const { baseConf } = require('../../../webpack/webpack.base.conf')
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')

/* let componentName;
if (process.argv.length > 2)
    componentName = process.argv[2]
else
    return;
 */
console.log(baseConf)

const config = merge(baseConf, {
    entry: path.resolve(__dirname, `./src/index.js`),
    output: {
        path: path.resolve(__dirname, `./src`),
        filename: "index.min.js",
    },
    watch: true,
    watchOptions: {
        poll: 1000, // 每秒询问多少次
        aggregateTimeout: 500,  //防抖 多少毫秒后再次触发
        ignored: [/demo/, '*min.js'] //忽略时时监听
    }
})

webpack(config, (err, stats) => {
    if (err || stats.hasErrors()) {
        stats.compilation.errors.forEach(element => { console.error(element) });
    } else {
        console.log(`更新成功: ${new Date().toLocaleTimeString()}\t\n耗时： ${(stats.endTime - stats.startTime) / 1000}s`)
    }
})
