---
title: one-wallhaven 壁纸程序
comments: true
date: 2020-11-06 18:37:08
tags: [electron]
description:
categories: 创作类
keywords: 壁纸程序,electron
---

基于 Electron + vue  的一个壁纸程序

<!-- more -->

- gitee：https://gitee.com/ml13/wallhaven-electron
- github：https://github.com/MaLuns/wallhaven-electron

## 运行
```
# 安装依赖
yarn

# 运行开发模式
npm run serve:web
npm run serve:exe

# 打包安装文件 
npm run build:web
npm run build:exe

```

## 项目结构
```
- build 打包图标
- layout 前端文件
  - public
  - src
- src
  - main 主线程目录
  - renderer 渲染线程（前端打包输出目录）
```
## 截图
<img src="https://pan.bilnn.com/api/v3/file/sourcejump/Xm9Gtd/MwMX00DchbCDz3Wb_hv3ew**" alt="首页" />
<img src="https://pan.bilnn.com/api/v3/file/sourcejump/K59mHQ/xWd46Fcu7xNtcDpTQjNmcA**" alt="分类" />
<img src="https://pan.bilnn.com/api/v3/file/sourcejump/YdZXiv/kkjnhlZeH2P0XOPHaMgUYA**" alt="收藏" />
<img src="https://pan.bilnn.com/api/v3/file/sourcejump/B3P4U2/o8_yKHJCTDywb0bQ-VJinQ**" alt="查看" />
<img src="https://pan.bilnn.com/api/v3/file/sourcejump/Q29QFb/t-QYGpR2JC92tlyrSCAZRQ**" alt="下载" />