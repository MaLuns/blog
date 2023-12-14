---
title: hexo-theme-async 使用指北
comment: true
date: 2022-09-07 15:29:25
tags: [hexo]
description:
categories: 记录类
keywords:
sticky: 1
---

![demo](https://hexo-theme-async.imalun.com/imgs/demo2.png)_预览图_

### 前提

本主题为 Hexo 主题，请确保您对 Hexo 已有基本了解 。详请参见 [Hexo 官网](https://hexo.io/)。

开始前，请确保您的 Hexo 初始化工作已经准备完成，请参考 [Hexo 安装](https://hexo.io/zh-cn/docs/)。本主题依赖于 **Node 14.x** 以上版本，请注意您本地 **Node** 环境。

### 主题安装

进入您的 Hexo 博客根目录，执行如下命令，安装主题：

{% tabs test1 %}

<!-- tab npm -->

```bash
npm i hexo-theme-async@latest
```

<!-- endtab -->

<!-- tab yarn -->

```bash
yarn add hexo-theme-async@latest
```

<!-- endtab -->

{% endtabs %}

如果您没有 **ejs** 与 **less** 的渲染器，请先安装：[hexo-renderer-ejs](https://github.com/hexojs/hexo-renderer-ejs) 和 [hexo-renderer-less](https://github.com/hexojs/hexo-renderer-less)。

{% tabs test2 %}

<!-- tab npm -->

```bash
npm install --save hexo-renderer-less hexo-renderer-ejs
```

<!-- endtab -->
<!-- tab yarn -->

```bash
yarn add -D hexo-renderer-less hexo-renderer-ejs
```

<!-- endtab -->

{% endtabs %}

### 启用主题

修改 Hexo 博客配置文件 `_config.yml`，到此运行起来就 Hexo-Theme-Async 主题就生效啦。

```yaml
# 将主题设置为 hexo-theme-async
theme: async
```

关于主题配置修改，可以参考 [hexo-theme-async 文档](https://hexo-theme-async.imalun.com/guide/config.html)

### 演示视频

-   安装
    -   [npm 安装演示](https://www.bilibili.com/video/BV1Cs4y1J7vv/)
    -   [下载到 themes 目录演示](https://www.bilibili.com/video/BV1mg4y137Zi/)
-   配置
    -   [常用配置演示](https://www.bilibili.com/video/BV1cm4y1z7tQ/)
    -   [主题自定义图标、自定义代码高亮演示](https://www.bilibili.com/video/BV1Da4y1M7UF/)
    -   [随机封面、友链页、相册页面配置演示](https://www.bilibili.com/video/BV1cs4y1m7RT/)
-   运行源码
    -   [hexo-theme-async 源码运行演示](https://www.bilibili.com/video/BV19L41127LH/)
-   在线体验
    -   [stackblitz](https://stackblitz.com/edit/node-tshsxq?embed=1&file=README.md)

安装示例视频，更多视频前往[这里](https://space.bilibili.com/12763040/channel/seriesdetail?sid=3170241)

<iframe src="//player.bilibili.com/player.html?aid=951750989&bvid=BV1Cs4y1J7vv&cid=1077514563&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="100%" height="500"> </iframe>
