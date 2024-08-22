---
title: node 实现简单 http 转发
date: 2020-05-12 17:50:55
tags: [node]
categories: 记录类
comments: true
keywords: node代理
---


由于同源策略的限制，前端想要随便调用别人的数据没有那么容易，利用jsonp去调用虽然可以，但是也得别人支持，而且还只能是get 请求。想要随便调用别人数据，最简单就是弄一个代理服务，实现数据的转发。
<!-- more -->

## node 实现透明转发 ##

主要就是使用 stream.pipe()，将请求得流写入自己写得请求中，再将请求到的数据写入响应流中。
简单实现例子

``` js
const http = require('http')
const https = require('https')
const os = require('os')
const config = {
    url: 'https://www.imalun.com/',
    port: 7000,
    ip: getIpv4(),
    type: 'http',
    http,
    https
}

let argv = process.argv;

if (argv.length < 3) {
    console.log('\t\n\x1B[41m\x1B[1m%s\x1B[22m\x1B[49m  %s\t\n', ' error ', '请指定 proxy url \t\n demo :  node proxy www.imalun.com ');
    process.exit(1);
} else {
    let [, , ...par] = argv;
    config.url = par[0];
    config.port = par[1] || config.port;
    if (par[0].substr(0, 5) === 'https') {
        config.type = 'https'
    } else if (par[0].substr(0, 4) === 'http') {
        config.type = 'http'
    }
}


http.createServer(function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
    if (req.method.toLowerCase() == 'options')
        res.end();
    else
        req.pipe(config[config.type].request(config.url + req.url, (respo) => respo.pipe(res)))
}).listen(config.port, '0.0.0.0', function () {
    console.log('\x1B[42m\x1B[1m%s\x1B[22m\x1B[49m', ' success \t\n')
    console.log('\x1B[44m\x1B[1m%s\x1B[22m\x1B[49m %s\t\n', ' prot ', 'http://' + config.ip + ':' + config.port)
    console.log('\x1B[44m\x1B[1m%s\x1B[22m\x1B[49m  %s\t\n', ' proxy url ', config.url)
})


function getIpv4() {
    let net = os.networkInterfaces();
    let ipv4;
    for (const key in net) {
        net[key].forEach(element => {
            if (element.address !== '127.0.0.1' && element.family.toLocaleLowerCase() === 'ipv4') ipv4 = element.address
        });
    }
    return ipv4;
}
```

效果如下

![](/images/posts/node_proxy/20200629201153.png)