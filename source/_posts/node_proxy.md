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


https.createServer(function (req, res) {
    console.log(config.type)
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