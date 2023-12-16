---
title: hexo 在线编辑器
date: 2023-04-06 21:48:58
tags:
description:
categories: 创作类
keywords: hexo,hexo 编辑器
toc: false
---

开源了一款 Hexo 在线编辑器，提供在线编写 Hexo 方式。目前已实现对本地 Hexo 编辑维护

![Img](/images/posts/web_hexo_editor/hexo_editor_demo.png) _示例_

<!-- more -->

话不多说放链接：[在线地址](https://web-hexo-editor.imalun.com)、[Github 地址](https://github.com/MaLuns/hexo-editor)

### 实现大致原理

实现不算复杂，利用 FileSystemHandle 获取文件读写权限，就可以随心所欲操作 Hexo 文件了，就可对文件增删改了。

至于预览就更简单了，将 hexo-renderer 操作替换 markdown 渲染操作，实时渲染输出 HTML 就可以了，这些都有很多现成的案例。

需要更加完整支持 Hexo 在线编辑预览，还是有些细节需要调整的，比如需要支持配置预览样式，最好能和自己博客样式一致，还需要支持 Hexo Tag 等这些需要完善。

### 功能

以实现功能

- [x] 文章增删改和预览
- [x] 发布草稿、下架发布
- [x] Markdown 编辑、预览、格式化
- [x] front-matters 编辑
- [x] 图片粘贴、Markdown 语法提示、解析 HTML
- [x] 主题切换
- [x] 静态资源管理
- [x] 命令面板

计划实现

- [ ] 替换 markdown 渲染器（因为 Hexo 默认用 marked，结果 marked 渲染标记到具体行，比较麻烦，导致同步滚动还没实现）
- [ ] 搜索文章内容
- [ ] 支持图床
- [ ] Markdown 同步滚动
- [ ] 连接 Github 仓库，彻底在线维护 Hexo 博客
