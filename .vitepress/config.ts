import { defineConfig } from 'vitepress-theme-async/config';

export default defineConfig({
    outDir: 'dist',
    title: "白云苍狗的小站",
    head: [],
    themeConfig: {
        user: {

        },
        topBars: [
            { title: 'menu.home', url: '/' },
            { title: 'menu.archives', url: '/archives' },
            { title: 'menu.links', url: '/links' },
            { title: 'menu.about', url: '/about' },
        ],
        sidebar: {
            typedTextPrefix: 'I`m',
            typedText: ['Web Developer'],
            info: [
                { key: 'sidebar.residence', val: 'Mars' },
                { key: 'sidebar.city', val: 'WuHan' },
                { key: 'sidebar.age', val: '18' },
            ]
        },
        footer: {
            powered: {
                enable: true
            },
            copyrightYear: '2019',
            liveTime: {
                enable: true,
                prefix: 'footer.tips',
                startTime: '2019/11/19 17:00:00'
            }
        },
        reward: {
            enable: true,
            methods: [
                { name: '微信', path: 'https://mp-8b005489-7724-4f8c-afdd-30192ff4f7ae.cdn.bspapp.com/cloudstorage/61a57135-2e65-4d51-8be1-03b8bd1c595e.jpg' },
                { name: '支付宝', path: 'https://mp-8b005489-7724-4f8c-afdd-30192ff4f7ae.cdn.bspapp.com/cloudstorage/a21e9954-22f2-43fe-b3b0-3dba1fdde3ed.jpg' },
                { name: 'QQ', path: 'https://mp-8b005489-7724-4f8c-afdd-30192ff4f7ae.cdn.bspapp.com/cloudstorage/69fb1903-d0dc-4169-9a02-1e76ec8e7761.jpg' }
            ]
        },
        creativeCommons: {
            language: 'deed.zh',
            license: 'by-nc-sa',
            post: true,
            clipboard: false
        },
    }
})