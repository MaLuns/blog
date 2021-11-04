// 新建文章时 注入 hash参数

const tildify = require('tildify');
const chalk = require('chalk');

const reservedKeys = {
    _: true,
    title: true,
    layout: true,
    slug: true,
    path: true,
    replace: true,
    // Global options
    config: true,
    debug: true,
    safe: true,
    silent: true
};

hexo.extend.console.register('new', 'Create a new post.', {
    usage: '[layout] <title>',
    arguments: [
        { name: 'layout', desc: 'Post layout. Use post, page, draft or whatever you want.' },
        { name: 'title', desc: 'Post title. Wrap it with quotations to escape.' }
    ],
    options: [
        { name: '-r, --replace', desc: 'Replace the current post if existed.' },
        { name: '-s, --slug', desc: 'Post slug. Customize the URL of the post.' },
        { name: '-p, --path', desc: 'Post path. Customize the path of the post.' }
    ]
}, function (args) {
    if (!args._.length) {
        return this.call('help', { _: ['new'] });
    }

    const data = {
        title: args._.pop(),
        layout: args._.length ? args._[0] : this.config.default_layout,
        slug: args.s || args.slug,
        path: args.p || args.path,
        //注入hash值
        hash: new Date().getTime()
    };

    const keys = Object.keys(args);

    for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        if (!reservedKeys[key]) data[key] = args[key];
    }

    return this.post.create(data, args.r || args.replace).then(post => {
        this.log.info('Created: %s', chalk.magenta(tildify(post.path)));
    });
});