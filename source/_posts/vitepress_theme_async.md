---
title: vitepress-theme-async 主题发布
comment: true
date: 2024-04-16 13:15:57
tags:
description:
categories: 创作类
keywords:
---

之前文档一直使用的是 vitepress 搭建的，体验感觉也挺好的，所以萌生了想移植到 vitepress 上去。为什么不是选择 vuepress，是因为 vitepress 更加轻量更快。

<!-- more -->

早在几个月前就完成了 hexo-theme-async 大部分功能的移植，但是因为在使用 vitepress 自定义加载数据出现了一些问题（[参考这里](https://github.com/vuejs/vitepress/issues/3185)），没有进行下去，想着等 vieptepres 从 rc 到正式发布会不会处理这个问题，最终 1.0 发版时这个问题还是存在，只好修改主题实现方式避免这个问题。

## 快速开始

### 创建一个新的博客

```bash
$ npm create async-theme@latest my-first-blog
```

### 运行查看效果

```bash
$ vitepress dev ./
```

## 地址

-   [文档地址](https://vitepress-theme-async.imalun.com/)
-   [源码地址](https://github.com/MaLuns/vitepress-theme-async)
-   [在线体验地址](https://stackblitz.com/edit/vitejs-vite-fwgwrx?embed=1&theme=dark&view=editor)

## 支持功能

基本上 UI 上的功能，已经基本完善实现了。一些插件类功能本身 vitepress 也支持，所以没有移植处理。

-   ✅ 语言切换
-   ✅ 主题模式
-   ✅ 搜索
-   ✅ 网站图标
-   ✅ 用户信息
-   ✅ 顶部导航
-   ✅ 侧栏
-   ✅ 横幅
-   ✅ 页脚
-   ✅ 固定按钮
-   ✅ 分页
-   ✅ 摘要
-   ✅ 打赏
-   ✅ 版权信息
-   ✅ 上下篇
-   ✅ 文章封面
-   ✅ 过期提醒
-   ✅ 友接页
-   ✅ 关于页
-   ✅ 归档页
-   ✅ 标签页
-   ✅ 分类页
-   ✅ 自定义插槽
-   ✅ 全局组件
-   ✅ 自定义图标
-   ✅ 自定义样式
-   ✅ 自定义组件
-   ✅ RSS 插件
