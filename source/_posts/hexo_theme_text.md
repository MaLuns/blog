---
title: hexo-theme-text 使用说明
date: 2021-09-25 23:13:34
comments: true
tags: [hexo]
description: 
categories: 创作类
keywords: hexo,hexo主题,hexo-theme
---

这个主题诞生的原因主要是因为闲的，所以就自己动手写了这个相对比较清爽风格的主题。

<!--more -->

## 主题安装

进入主题目录后，克隆此仓库

``` git
cd themes
git clone https://github.com/MaLuns/hexo-theme-text
```

修改 **_config.yml** 配置
``` yml
theme: hexo-theme-text
highlight:
  enable: true
  line_number: false
  auto_detect: false
  tab_replace: ''
```

## 主题配置文件
主题的功能比较简约，所以配置文件也不是很多。如果需要使用文章字数统计和 rss 需要安装下面两个插件 **hexo-generator-feed**、**hexo-wordcount**。

``` yml
# 站点信息 
user:
  name: 白云苍狗 #博主名称
  domain: https://www.imalun.com #站点域名
  avatar: https://www.imalun.com/images/avatar.jpg #站点头像
  desc: 醒，亦在人间；梦，亦在人间。 #站点描述
  birthDay: 11/19/2019 17:00:00 #计时开始时间

# 站点图标和标题切换信息
favicon:
  visibilitychange: true
  narmal: /images/favicon.png #激活标签图标
  hidden: /images/failure.png #未激活标签图标
  show_text: (/≧▽≦/)咦！又好了！ #激活标签标题
  hide_text: (●—●)喔哟，崩溃啦！ #未激活标签标题
  apple_touch_icon: /images/apple-touch-icon-next.png
  safari_pinned_tab: /images/logo.svg

# 文章统计
post_wordcount:
  wordcount: true # 单篇 字数统计
  min2read: true # 单篇 阅读时长

#开启 Service Worker 
sw: true

#开启文章目录
isToc: false

#
canonical: true

# rss
rss: atom.xml

# 顶部菜单配置
menu:
  nav:
    - title: 白云苍狗
      url: /
    - title: ARCHIVES
      url: /archives
    - title: LINKS
      url: /links
    - title: COMMENTS
      url: /comment
    - title: ABOUT
      url: /about

```
开启 Service Worker 缓存，并且想使用 **PWA** 时需要自行添加 **manifest.json** 文件，配置站点被安装的图标等信息。[了解更多PWA信息](https://developer.mozilla.org/zh-CN/docs/Web/Progressive_web_apps)
``` json
// 我的使用示例
{
    "name": "白云苍狗",
    "short_name": "白云苍狗",
    "icons": [
        {
            "src": "/logo-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/logo-256x256.png",
            "sizes": "256x256",
            "type": "image/png"
        }
    ],
    "theme_color": "#fff",
    "background_color": "#fff",
    "display": "standalone",
    "start_url": "/"
}
```


## 修改主题配色
如果你需要修改主题色，你只需要找到 **source/css/var.less** 文件，所有的主题配色都在这里了， **.dark** 下是暗黑模式下的颜色。
```less
:root {
    --transitionTime   : .35s ease; // 过渡时间
    --hColor           : #000; // 主要字体色
    --metaColor        : #5c5c5c; // 次要信息颜色
    --bodyBgColor      : #f2f3f0; // 主题背景色
    --headBgColor      : #fff; // 头部背景色
    --markHeadBgColor  : #eee; // 动画切换遮罩色
    --markBgColor      : #252525; // 动画切换遮罩色
    --commentColor     : #525f7f; // 评论组建主题色
    --dashedBorderColor: #c5c5c5; // 分割边框色
    --postLinkColor    : #bb996d; // 文章中超链接
    --nprogressColor   : #bb996d; // 加载进度条色
    --linkItemBgColor  : #f9f9f9; // 友链背景色
    --linkItemBgColor2 : #fff; // 友链hover背景色
    --ngBarBgColor     : #ca8b58; // 加载进度条颜色

    &.dark {
        --hColor         : #f2f3f0;
        --metaColor      : #e6e6e6;
        --bodyBgColor    : #252525;
        --headBgColor    : #1d1d1d;
        --markHeadBgColor: #353535;
        --markBgColor    : #f2f3f0;
        --commentColor   : #becae7; 
        --nprogressColor : #fff3e5;
        --linkItemBgColor  : #353535; 
        --linkItemBgColor2 : #000; 
    }
}
```

## 多语言配置
在 languages 文件夹里默认只有一个 **zh-cn.yml** 中文文件配置，如果需要其他语言需要自行添加即可。

## 评论系统
本人默认是使用腾讯的云开发的评论系统，所以主题默认是没评论系统的。不过你可以集成其他的第三方评论插件，你只需要在 **themes/hexo-theme-text/layout/components/comment.ejs** 里添加第三方评论插件代码，**_config.yml** 添加对应的配置，你就可以在你的博客里使用评论啦。

## 写在最后
本项目采用 MIT 开源许可证，欢迎大家贡献，你可以随意打开一个 issue 来进行提问，有任何改进想法都可以进行 fork，等待您的 Pull Request。