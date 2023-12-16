---
title: 2023年，还在手动发布 npm 包？
date: 2023-02-10 10:50:55
tags: [npm]
categories: 创作类
keywords: npm,npm pushlish,github actions,release
toc: false
---

还在手动 **npm publish** 发布 **npm** ？ 还在手动更新版本创建发布 **Github Release** ？还在手动添加 **Changelog**？是时候利用  **CI/CD** 解放双手啦。常见的 **CI/CD** 有很多，比如 Jenkins、GitLab CI、CircleCI 、Github Actions 等。本文主要是通过 **Github Actions** 来自动化处理 **npm** 包管理。

## Github Actions 
**GitHub Actions** 距离推出已经好几年了，相信小伙伴们没用过，也听说过。**GitHub Actions** 不仅仅是能自动执行生成、测试和部署操作，还允许您在存储库中发生其他事件时运行工作流程。 例如，您可以运行工作流程，以便在有人在您的存储库中创建新问题时自动添加相应的标签。而且 GitHub 提供 Linux、Windows 和 macOS 多种虚拟机来运行工作流程，可以更具项目选择合适的虚拟机环境。

**GitHub Actions** 其实主要步骤只有两个，**event** (事件触发时机)、**jobs**（工作流程）。如果还不熟悉 **GitHub Actions**，可以[参考文档](https://docs.github.com/zh/actions)对其大致使用有个了解。

## 发布 Npm 
在本地发布 npm 包都是本地打包成组件后，登录 npm 账号运行 npm publish 发布。使用 **GitHub Actions** 来发布 **npm** 可以使用 **Npm Access Tokens**，可以更据需要分配 **Tokens** 权限，不需要使用账号密码登录。

### Github Actions 发布 Npm

首先需要确定你工作流触发时机，这个需要根据你个人习惯决定。

举例：

{% tabs test1 %}
<!-- tab tag -->
推送 Tag 时触发
``` yaml
on:
  push:
    tags:
      - "v*"
```
<!-- endtab -->

<!-- tab branches -->
仅在 master 推送时触发
``` yaml
on:
  push:
    branches: [master]
```
<!-- endtab -->

<!-- tab paths -->
仅在 master 推送时，且 docs 下文件修改时触发，更多可以[参考文档](https://docs.github.com/zh/actions/using-workflows/events-that-trigger-workflows)
``` yaml
on:
  push:
    branches: [master]
    paths:
      - 'docs/**'
```
<!-- endtab -->
{% endtabs %}

本文就以为推送 Tag 触发为例：

在你项目下添加 **.github\workflows\publish.yml** 文件，内容如下

``` yaml
name: NPM Publish
on:
  push:
    tags:
      - "v*"
```
#### 代码拉取和Node配置
在 **jobs** 添加一个名为 **build** 的 job，配置 **build** 的环境和拉取代码。**runs-on: ubuntu-latest** 配置虚拟机为 **ubuntu**，使用官方提取代码拉取和 配置 Node 的 Actions，更多 [官方提供 Actions](https://github.com/actions)

``` yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2   # 拉取代码
      - uses: actions/setup-node@v3 # 设置 Node 版本
        with:
          node-version: 16
          registry-url: 'https://registry.npmjs.org'
          cache: yarn
```
#### 配置环境密钥
添加环境变量，在你项目 => Settings => Secrets and variables => Actions 中 添加你的密钥，名称随意取，密钥值为你上面生成的 **Npm Access Tokens**。

例如：
Name => NPM_TOKEN
Secret => 你的 **Npm Access Tokens**


#### 发布 Npm

**build** 的 job 中，添加发布 Npm 操作，利用 NPM_TOKEN 发布 npm 包
``` yaml
    steps:
      - name: Npm Publish
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```
到此时，当你推送一个以 v开头 tag 到仓库时，就会执行这个 publish.yml，这个 Action 会将当前仓库发布到 Npm 了。

当然你的包可能还需要执行一些构建操作等等，你可以在 **run** 里执行多条命令

``` yaml
run: |
    npm run build
    #...更多操作
    npm publish
```

### 区分 Beta 和 latest

默认情况下 **npm publish** 发布时正式包，如果需要测试包需要执行 **npm publish --tag beta**。利用 git tag 我们可以将 v1.0.2 格式发为正式包，将 v1.0.2-beta.1 格式发布测试包。

修改 publish 流程，**Github Action** 支持 **if** 操作，并不支持 **else**，只能通过如下模拟 **if else** 操作。

``` yaml
    steps:
      - name: Beta Publish
        if: ${{ contains(github.ref,'beta') }}
        run: npm publish --tag beta
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Publish
        if: ${{ !contains(github.ref,'beta') }}
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 根据 Tag 更新版本号
为例避免每次修改 package.json 中版本，我们可以根据 tag 来修改 package.json 中版本，因为上面配置 node 环境，可以直接执行 node 代码，我们直接添加一个 publish.js 文件，去修改 package.json 中 version 。

``` js 
const fs = require('fs')
const path = require('path')

if (process.env.RELEASE_VERSION) {
    const version = process.env.RELEASE_VERSION.split('/').reverse()[0]
    console.log('当前版本：', version);
    const pkg = require('./package.json')
    pkg.version = version.replace('v', '')
    fs.writeFileSync(path.resolve(__dirname, './package.json'), JSON.stringify(pkg, null, 4), 'utf-8')
}
```

修改 publish 流程，在发布前修改版本，并将 github.ref 添加环境变量 RELEASE_VERSION

``` yaml
    steps:
      - name: Build
        run: node ./publish
        env:
          RELEASE_VERSION: ${{ github.ref }}
```

### 创建发布 Github Release
官方 **actions/create-release** 不在维护，推荐如下 Actions，可以结合需要选择，你也可以去前往 [marketplace](https://github.com/marketplace) 选择更多 Actions。

* [elgohr/Github-Release-Action](https://github.com/elgohr/Github-Release-Action)
* [marvinpinto/action-automatic-releases](https://github.com/marvinpinto/action-automatic-releases)
* [softprops/action-gh-release](https://github.com/softprops/action-gh-release)
* [ncipollo/release-action](https://github.com/ncipollo/release-action)


很多创建 **Release** 的 **Actions**，并不会将你的提交自动生成发版说明，所以我编写了一个发布 **Release** 的 **Actions**，具体实现参考 [MaLuns/add-release](https://github.com/MaLuns/add-release) 以满足我的需求。Github 为我们提供 [**actions/toolkit**](https://github.com/actions/toolkit) 帮助我们简化了很多操作。

简单描述如何实现：

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 730.4648101751317 852.9999999999993" filter="invert(93%) hue-rotate(180deg)">

  <defs>
    <style class="style-fonts">
      @font-face {
        font-family: "Virgil";
        src: url("https://excalidraw.com/Virgil.woff2");
      }
      @font-face {
        font-family: "Cascadia";
        src: url("https://excalidraw.com/Cascadia.woff2");
      }
    </style>
  </defs>
  <g stroke-linecap="round" transform="translate(10 10) rotate(0 139.5 27.5)"><path d="M13.75 0 M13.75 0 C109.38 -2.41, 205.68 1.99, 265.25 0 M13.75 0 C70.18 2.36, 124.81 0.97, 265.25 0 M265.25 0 C273.89 1.09, 281.74 7.28, 279 13.75 M265.25 0 C277.97 4.59, 274.44 8.78, 279 13.75 M279 13.75 C276.09 18.18, 279.75 24.18, 279 41.25 M279 13.75 C277.83 23.76, 280.05 32.76, 279 41.25 M279 41.25 C280.53 49.75, 271.57 52.1, 265.25 55 M279 41.25 C276.2 54.43, 269.9 58.1, 265.25 55 M265.25 55 C209.34 55.8, 147.98 55.99, 13.75 55 M265.25 55 C169.39 56.68, 70.38 55.24, 13.75 55 M13.75 55 C8.57 51.9, -0.4 48.89, 0 41.25 M13.75 55 C7.04 56.87, -3.65 50.34, 0 41.25 M0 41.25 C0.8 31.53, 3.38 23.71, 0 13.75 M0 41.25 C-1.05 30.71, 0.18 22.03, 0 13.75 M0 13.75 C-0.72 6.24, 2.74 3.88, 13.75 0 M0 13.75 C4.5 8.33, 4.37 -1.58, 13.75 0" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g transform="translate(28.5 27.5) rotate(0 121 10)"><text x="121" y="14" font-family="Virgil, Segoe UI Emoji" font-size="16px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">从当前位置开始分页获取提交记录</text></g><g stroke-linecap="round" transform="translate(70.88888888888926 119.11111111111086) rotate(0 87 27.5)"><path d="M13.75 0 M13.75 0 C70.27 -1.27, 132.16 -5.78, 160.25 0 M13.75 0 C49.11 3.38, 82.62 0.94, 160.25 0 M160.25 0 C172.31 1.56, 177.77 6.12, 174 13.75 M160.25 0 C168.65 -3.27, 170.67 1.79, 174 13.75 M174 13.75 C170.69 27.99, 173.48 37.63, 174 41.25 M174 13.75 C175.49 23.48, 174.56 32.65, 174 41.25 M174 41.25 C174.25 47.02, 166.12 58.98, 160.25 55 M174 41.25 C170.43 49.95, 167.66 57.46, 160.25 55 M160.25 55 C108.89 54.23, 59.37 55.65, 13.75 55 M160.25 55 C126.86 53.71, 92.28 51.97, 13.75 55 M13.75 55 C4.11 55.89, 2.76 49.69, 0 41.25 M13.75 55 C6.49 52.89, 4.47 54.92, 0 41.25 M0 41.25 C-2.82 31.53, 2.41 23.49, 0 13.75 M0 41.25 C-0.4 35.03, -0.56 28.24, 0 13.75 M0 13.75 C-2.36 7.79, 4.22 1.59, 13.75 0 M0 13.75 C3.15 8.94, 5.15 2.29, 13.75 0" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g transform="translate(101.38888888888926 137.11111111111086) rotate(0 56.5 9.5)"><text x="56.5" y="15" font-family="Cascadia, Segoe UI Emoji" font-size="16px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">获取所有 tags</text></g><g stroke-linecap="round"><g transform="translate(150.88997153960383 67.18500722316435) rotate(0 -2.375925603429664 26.98165787361677)"><path d="M-1.36 1.74 C-3.05 10.23, -6.88 42.36, -7.85 50.27 M3.1 0.21 C2.04 9.22, -2.05 45.19, -2.81 53.75" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g transform="translate(150.88997153960383 67.18500722316435) rotate(0 -2.375925603429664 26.98165787361677)"><path d="M-6.52 25.54 C-7.15 35.91, -6.31 49.69, -6.21 57.11 M-9.03 28.39 C-6.66 37.72, -6.6 43.18, -3.49 52.44" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g transform="translate(150.88997153960383 67.18500722316435) rotate(0 -2.375925603429664 26.98165787361677)"><path d="M10.78 27.32 C3.54 36.85, -2.23 49.95, -6.21 57.11 M8.26 30.18 C5.44 38.84, 0.29 43.76, -3.49 52.44" stroke="#c92a2a" stroke-width="1" fill="none"/></g></g><mask/><g stroke-linecap="round" transform="translate(76.88888888888852 359.55555555555543) rotate(0 81.00000000000003 26)"><path d="M13 0 M13 0 C48.15 0.59, 83.48 -1.4, 149 0 M13 0 C65.81 -1.5, 120.05 -1.13, 149 0 M149 0 C156.96 3.43, 160.63 2.94, 162 13 M149 0 C155.72 3.81, 163.79 6.52, 162 13 M162 13 C164.97 21.93, 165.32 33.71, 162 39 M162 13 C164.16 18.66, 162.04 22.96, 162 39 M162 39 C165.01 45.04, 159.76 50.22, 149 52 M162 39 C158.91 43.92, 155.83 52.56, 149 52 M149 52 C114.38 51.99, 76.13 50.26, 13 52 M149 52 C111.19 51.86, 73.18 49.38, 13 52 M13 52 C7.36 54.09, 3.81 48.54, 0 39 M13 52 C8.37 50.93, 2.61 49.39, 0 39 M0 39 C-1.37 29.54, -3.76 16.5, 0 13 M0 39 C-1.16 33.31, -0.27 25.99, 0 13 M0 13 C1.34 5.4, 4.26 0.12, 13 0 M0 13 C2.13 1.13, 6.08 -3.88, 13 0" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g transform="translate(108.88888888888857 376.05555555555543) rotate(0 49 9.5)"><text x="49" y="15" font-family="Cascadia, Segoe UI Emoji" font-size="16px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">循环读取记录</text></g><g stroke-linecap="round"><g transform="translate(153.3959809829115 291.96031746031736) rotate(0 -0.3315164564070301 34.81390687762939)"><path d="M-1.1 1.87 C-1.35 13.84, -1.54 58.15, -1.67 69.21 M3.5 0.42 C2.86 11.92, -2.91 55.14, -4.16 65.69" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g transform="translate(153.3959809829115 291.96031746031736) rotate(0 -0.3315164564070301 34.81390687762939)"><path d="M-8.15 35.78 C-5.5 44.13, -4.91 50.69, -0.7 68.1 M-12.33 36.4 C-8.54 41.49, -7.37 47.65, -4.34 66.81" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g transform="translate(153.3959809829115 291.96031746031736) rotate(0 -0.3315164564070301 34.81390687762939)"><path d="M12.21 38.34 C8.95 45.78, 3.58 51.59, -0.7 68.1 M8.04 38.96 C7.36 43.64, 4.02 49.23, -4.34 66.81" stroke="#c92a2a" stroke-width="1" fill="none"/></g></g><mask/><g stroke-linecap="round" transform="translate(44.6666666666664 485.7777777777778) rotate(0 115.5 39)"><path d="M145 10 M145 10 C162.03 19.72, 175.77 22.64, 202 30 M145 10 C159.69 16.01, 180.29 22.75, 202 30 M202 30 C229.68 38.79, 234.91 36.37, 202 50 M202 30 C234.35 42.28, 233.99 37.91, 202 50 M202 50 C192.22 56.54, 175.36 56.51, 145 68 M202 50 C188.07 54.67, 172.39 58.19, 145 68 M145 68 C115.61 78.88, 117.97 79.22, 87 68 M145 68 C113.83 80.47, 118.56 74.15, 87 68 M87 68 C71.29 61.04, 60.56 59.32, 29 50 M87 68 C74.64 64.74, 64.44 62.94, 29 50 M29 50 C-3.74 39.97, -2.56 38.48, 29 30 M29 50 C-0.37 39.37, 0.33 35.89, 29 30 M29 30 C50.44 21.61, 67.95 19.5, 87 10 M29 30 C39.74 28.07, 53.86 23.06, 87 10 M87 10 C117.55 -3.73, 116.15 -0.35, 145 10 M87 10 C117.11 0.05, 111.75 1.9, 145 10" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g transform="translate(103.6666666666664 515.2777777777778) rotate(0 56.5 9.5)"><text x="56.5" y="15" font-family="Cascadia, Segoe UI Emoji" font-size="16px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">是否是 tag 处</text></g><g stroke-linecap="round"><g transform="translate(149.86229137715839 412.9312169312168) rotate(0 4.208753635864298 44.00826718116923)"><path d="M1.74 2.04 C2.05 16.64, 3.37 73.22, 4.27 87.33 M-0.76 0.69 C0.16 14.55, 8.15 69.98, 9.18 83.55" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g transform="translate(149.86229137715839 412.9312169312168) rotate(0 4.208753635864298 44.00826718116923)"><path d="M-1.29 52.77 C4.13 67.04, 8.41 74.67, 7.63 79.71 M-2.42 55.64 C-2.41 61.14, 1.58 70.44, 9.2 82.95" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g transform="translate(149.86229137715839 412.9312169312168) rotate(0 4.208753635864298 44.00826718116923)"><path d="M19.1 50.44 C16.66 65.86, 13.09 74.39, 7.63 79.71 M17.97 53.31 C13.25 59.65, 12.55 69.49, 9.2 82.95" stroke="#c92a2a" stroke-width="1" fill="none"/></g></g><mask/><g mask="url(#mask-lviM0Dprq1R14gecoqO6G)" stroke-linecap="round"><g transform="translate(166.8423381162429 563.3610819644362) rotate(0 -0.029376666403038598 53.384134448982536)"><path d="M0.06 2.21 C0.81 19.68, 2.3 86.2, 3.29 102.65 M-3.35 0.94 C-2.86 19.01, -0.44 88.88, 1.06 105.83" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g transform="translate(166.8423381162429 563.3610819644362) rotate(0 -0.029376666403038598 53.384134448982536)"><path d="M-7.63 78.3 C-9.36 89.25, -8.79 91.6, -1.31 103.66 M-12.18 79.05 C-6.4 85.8, -5.97 92.15, -0.21 106.83" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g transform="translate(166.8423381162429 563.3610819644362) rotate(0 -0.029376666403038598 53.384134448982536)"><path d="M12.86 77.13 C5.84 88.39, 1.15 91.04, -1.31 103.66 M8.31 77.88 C9.45 84.56, 5.22 91.18, -0.21 106.83" stroke="#c92a2a" stroke-width="1" fill="none"/></g></g><mask id="mask-lviM0Dprq1R14gecoqO6G"><rect x="0" y="0" fill="#fff" width="270.10521586848984" height="766.8482905982908"/><rect x="159.47377699236642" y="605.6046862813637" fill="#000" width="18" height="19" opacity="1"/></mask><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(159.47377699236642 605.6046862813635) rotate(0 7.339184457473436 11.140530132055233)"><text x="9" y="15" font-family="Cascadia, Segoe UI Emoji" font-size="16px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">是</text></g><g mask="url(#mask-dn1DNiDydmoukLwp9itsL)" stroke-linecap="round"><g transform="translate(272.9215136092465 524.3635848425745) rotate(0 93.08055415379027 2.589871462680776)"><path d="M-2.42 0.27 C29.3 1.24, 156.92 6.29, 188.59 7.23 M1.45 -2.05 C33.19 -1.97, 156.82 2.91, 187.66 3.39" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g transform="translate(272.9215136092465 524.3635848425745) rotate(0 93.08055415379027 2.589871462680776)"><path d="M159.57 16.3 C168.89 13.09, 173.73 7.2, 190.18 3.32 M157.45 12.33 C169.03 10.09, 179.3 6.48, 188.03 3.06" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g transform="translate(272.9215136092465 524.3635848425745) rotate(0 93.08055415379027 2.589871462680776)"><path d="M160.16 -4.22 C169.55 -2.58, 174.25 -3.64, 190.18 3.32 M158.04 -8.18 C169.25 -2.93, 179.3 0.95, 188.03 3.06" stroke="#c92a2a" stroke-width="1" fill="none"/></g></g><mask id="mask-dn1DNiDydmoukLwp9itsL"><rect x="0" y="0" fill="#fff" width="559.084892031994" height="629.4457914278037"/><rect x="357.0032028206201" y="517.4046881351887" fill="#000" width="18" height="19" opacity="1"/></mask><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(357.00320282062034 517.4046881351892) rotate(0 8.99886494241656 9.548768170066296)"><text x="9" y="15" font-family="Cascadia, Segoe UI Emoji" font-size="16px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">否</text></g><g stroke-linecap="round" transform="translate(409.9999999999998 321.33333333333326) rotate(0 111.50000000000006 54.5)"><path d="M140 13.75 M140 13.75 C157.74 27.59, 177.39 33.69, 195 41.25 M140 13.75 C155.68 22.1, 172.88 29.02, 195 41.25 M195 41.25 C223.92 57.76, 223.16 52.04, 195 68.75 M195 41.25 C221.74 55.91, 221.28 54.16, 195 68.75 M195 68.75 C174.48 77.98, 156.9 89.76, 140 95.25 M195 68.75 C176.24 79.02, 157.82 86.35, 140 95.25 M140 95.25 C115.54 111.32, 113.06 111.06, 84 95.25 M140 95.25 C110.54 112.93, 109.07 112.88, 84 95.25 M84 95.25 C72.36 88.5, 55.7 82.61, 28 68.75 M84 95.25 C71.99 87.21, 57.91 82.69, 28 68.75 M28 68.75 C-3.55 52.86, 2.53 52.47, 28 41.25 M28 68.75 C-1.04 54.5, -3.77 51.3, 28 41.25 M28 41.25 C47.04 32.45, 64.14 19.94, 84 13.75 M28 41.25 C41.45 36.17, 49.87 29.58, 84 13.75 M84 13.75 C115.99 -3.48, 108.31 3.81, 140 13.75 M84 13.75 C114.89 2.11, 113.09 -1.44, 140 13.75" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g transform="translate(440.4999999999998 366.33333333333326) rotate(0 81.00000000000006 9.5)"><text x="81" y="15" font-family="Cascadia, Segoe UI Emoji" font-size="16px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">此页记录是否循环完成</text></g><g mask="url(#mask-xcMQVAjcvj1r3ryoOnPyv)" stroke-linecap="round"><g stroke-opacity="0.8" fill-opacity="0.8" transform="translate(520.0171788653535 317.97819876515473) rotate(0 1.0365626996742208 -65.70638529036205)"><path d="M-0.93 1.37 C-0.81 -8.92, 2.85 -38.98, 2.72 -60.51 C2.59 -82.04, -1.62 -116.07, -1.71 -127.79 M3.76 -0.35 C3.35 -10.26, 0.6 -34.72, 0.61 -56.79 C0.61 -78.86, 3.29 -120.7, 3.78 -132.79" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.8" fill-opacity="0.8" transform="translate(520.0171788653535 317.97819876515473) rotate(0 1.0365626996742208 -65.70638529036205)"><path d="M14.55 -103.79 C9.29 -118.36, 7.19 -123.42, 0.85 -131.58 M12.36 -105.03 C12.28 -112.11, 9.44 -115.41, 5.29 -131.94" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.8" fill-opacity="0.8" transform="translate(520.0171788653535 317.97819876515473) rotate(0 1.0365626996742208 -65.70638529036205)"><path d="M-5.95 -104.84 C-3.57 -118.88, 1.95 -123.56, 0.85 -131.58 M-8.13 -106.09 C-3.76 -112.82, -2.15 -115.89, 5.29 -131.94" stroke="#c92a2a" stroke-width="1" fill="none"/></g></g><mask id="mask-xcMQVAjcvj1r3ryoOnPyv"><rect x="0" y="0" fill="#fff" width="622.5158286778401" height="546.75576390573"/><rect x="513.5158286778401" y="247.80329352153376" fill="#000" width="18" height="19" opacity="1"/></mask><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(513.51582867784 247.80329352153376) rotate(0 7.537912887187588 4.4685199532589195)"><text x="9" y="15" font-family="Cascadia, Segoe UI Emoji" font-size="16px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">是</text></g><g stroke-opacity="0.9" fill-opacity="0.9" stroke-linecap="round" transform="translate(56.5555555555552 673.4444444444446) rotate(0 113.5 24.5)"><path d="M12.25 0 M12.25 0 C80.56 1.92, 153.89 -1.93, 214.75 0 M12.25 0 C53.14 1.75, 95.9 2.73, 214.75 0 M214.75 0 C223.7 3.04, 227.3 7.2, 227 12.25 M214.75 0 C219.49 -0.15, 223.59 0.92, 227 12.25 M227 12.25 C223.82 18.43, 225.57 28.52, 227 36.75 M227 12.25 C226.67 21.57, 227.76 28.71, 227 36.75 M227 36.75 C226.75 46.38, 220.69 52.67, 214.75 49 M227 36.75 C227.84 48.84, 227.08 50.17, 214.75 49 M214.75 49 C163.88 47.29, 109.37 51.41, 12.25 49 M214.75 49 C166.16 52.94, 117.26 51.83, 12.25 49 M12.25 49 C7.93 47.41, -3.81 48.45, 0 36.75 M12.25 49 C1.79 52.1, -0.76 40.84, 0 36.75 M0 36.75 C-2.28 29.8, -1.8 17.06, 0 12.25 M0 36.75 C0.07 32.46, -0.16 24.17, 0 12.25 M0 12.25 C2.11 5.72, 6.43 3.54, 12.25 0 M0 12.25 C-3.71 2.03, 0.2 2.71, 12.25 0" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(73.5555555555552 688.4444444444439) rotate(0 96.5 9.500000000000114)"><text x="96.5" y="15" font-family="Cascadia, Segoe UI Emoji" font-size="16px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">处理两个 tag 间提交记录</text></g><g stroke-opacity="0.9" fill-opacity="0.9" stroke-linecap="round" transform="translate(461.33333333333326 496.8888888888887) rotate(0 77.00000000000006 27)"><path d="M13.5 0 M13.5 0 C52.54 4.63, 87.08 -1.09, 140.5 0 M13.5 0 C54.78 -0.19, 94.59 -1.46, 140.5 0 M140.5 0 C151.16 2.05, 156.62 7.43, 154 13.5 M140.5 0 C148.78 -4.53, 156.9 4.74, 154 13.5 M154 13.5 C153.67 23.76, 154.01 32.17, 154 40.5 M154 13.5 C153.69 20.03, 155.09 29.48, 154 40.5 M154 40.5 C151.9 48.31, 152.42 55.48, 140.5 54 M154 40.5 C158.58 47.05, 149.9 53.28, 140.5 54 M140.5 54 C92.73 56.56, 44.57 55.85, 13.5 54 M140.5 54 C99.1 54.72, 59.62 55.8, 13.5 54 M13.5 54 C3.64 51.47, 3.88 52.76, 0 40.5 M13.5 54 C3.28 52.41, 2.77 48.88, 0 40.5 M0 40.5 C-3.41 27.56, 0.43 19.97, 0 13.5 M0 40.5 C-1.74 30.09, -0.98 21.58, 0 13.5 M0 13.5 C1.34 3.46, 1.46 -3.49, 13.5 0 M0 13.5 C3.03 0.45, 6.07 3.66, 13.5 0" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(489.33333333333326 514.3888888888887) rotate(0 49 9.5)"><text x="49" y="15" font-family="Cascadia, Segoe UI Emoji" font-size="16px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">存储这条记录</text></g><g stroke-linecap="round"><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(526.9611864061793 495.7777777777774) rotate(0 -1.730755265804703 -32.76731269019899)"><path d="M-0.27 -1.78 C0.12 -13.72, 0 -58.07, 0.41 -68.95 M-3.87 3.42 C-3.72 -6.97, -2.95 -54.93, -2.15 -66.12" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(526.9611864061793 495.7777777777774) rotate(0 -1.730755265804703 -32.76731269019899)"><path d="M4.46 -38.39 C2.26 -42.51, 2.85 -47.14, -2.9 -66.91 M5.96 -39.49 C3.91 -47.53, 2.07 -55.37, -2.97 -67.2" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(526.9611864061793 495.7777777777774) rotate(0 -1.730755265804703 -32.76731269019899)"><path d="M-16.05 -39.19 C-13.51 -43.08, -8.2 -47.53, -2.9 -66.91 M-14.55 -40.29 C-9.93 -47.81, -5.1 -55.39, -2.97 -67.2" stroke="#c92a2a" stroke-width="1" fill="none"/></g></g><mask/><g stroke-linecap="round" transform="translate(54.3888888888884 232.99999999999932) rotate(0 98.49999999999997 28.5)"><path d="M14.25 0 M14.25 0 C78.38 -3.38, 134.75 -2.41, 182.75 0 M14.25 0 C64.81 3.59, 113.9 1.23, 182.75 0 M182.75 0 C195.67 0.21, 196.9 6.13, 197 14.25 M182.75 0 C188.16 -3.7, 200.62 2.08, 197 14.25 M197 14.25 C196.7 21.46, 196.24 27.54, 197 42.75 M197 14.25 C197.4 24.64, 198.76 34.94, 197 42.75 M197 42.75 C195.52 51.97, 194.74 61, 182.75 57 M197 42.75 C198.44 53.95, 194.09 52.48, 182.75 57 M182.75 57 C141.09 58.76, 94.28 58.09, 14.25 57 M182.75 57 C116.66 53.79, 53.06 54.36, 14.25 57 M14.25 57 C2.51 55.22, 0.37 55.7, 0 42.75 M14.25 57 C7.7 60.72, -2.38 49.94, 0 42.75 M0 42.75 C1.61 35.14, 2.81 28.04, 0 14.25 M0 42.75 C2.18 33.07, -1.43 23.87, 0 14.25 M0 14.25 C3.61 2.93, 4.27 -2.51, 14.25 0 M0 14.25 C1.43 6.72, 3.94 -0.41, 14.25 0" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g transform="translate(87.88888888888835 251.99999999999932) rotate(0 65 9.5)"><text x="65" y="15" font-family="Cascadia, Segoe UI Emoji" font-size="16px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">循环当页提交记录</text></g><g stroke-linecap="round"><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(154.8206469186399 177.6770234674325) rotate(0 0.3185349686685299 26.076701043304183)"><path d="M-0.13 -0.37 C0.98 8.05, 3.6 42.58, 4.29 51.5 M-3.65 -3.04 C-2.45 5.79, 2.27 46.6, 3.46 55.2" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(154.8206469186399 177.6770234674325) rotate(0 0.3185349686685299 26.076701043304183)"><path d="M-8.78 36.03 C-5.42 40.54, -0.57 38.94, -0.26 51.91 M-8.41 33.47 C-5.2 39.99, -0.84 45.72, 4.37 56.78" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(154.8206469186399 177.6770234674325) rotate(0 0.3185349686685299 26.076701043304183)"><path d="M8.66 33.86 C8.31 38.81, 9.42 37.68, -0.26 51.91 M9.04 31.3 C6.57 38.21, 5.28 44.64, 4.37 56.78" stroke="#c92a2a" stroke-width="1" fill="none"/></g></g><mask/><g mask="url(#mask-B-XvH6s17K3nnXY-_28km)" stroke-linecap="round"><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(412.44444444444423 375.7777777777774) rotate(0 -83.27295419193706 3.372453728701089)"><path d="M-2.06 1.1 C-29.78 1.95, -138.77 6.19, -166.13 7.52 M2.02 -0.78 C-26.13 0.44, -140.18 2.16, -168.57 3.13" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(412.44444444444423 375.7777777777774) rotate(0 -83.27295419193706 3.372453728701089)"><path d="M-139.06 -8.31 C-147.4 -5.49, -153.74 1.12, -171.09 3.37 M-140.15 -7.35 C-151.03 -3.83, -162.8 1.33, -169.1 2.37" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(412.44444444444423 375.7777777777774) rotate(0 -83.27295419193706 3.372453728701089)"><path d="M-138.58 12.2 C-147.42 8.7, -153.9 9.01, -171.09 3.37 M-139.67 13.17 C-150.65 8.7, -162.6 5.87, -169.1 2.37" stroke="#c92a2a" stroke-width="1" fill="none"/></g></g><mask id="mask-B-XvH6s17K3nnXY-_28km"><rect x="0" y="0" fill="#fff" width="678.2125603864733" height="482.1529406001787"/><rect x="320.56038647342984" y="369.465359188978" fill="#000" width="18" height="19" opacity="1"/></mask><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(320.56038647342973 369.465359188978) rotate(0 8.611103779077439 9.684872317500435)"><text x="9" y="15" font-family="Cascadia, Segoe UI Emoji" font-size="16px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">否</text></g><g stroke-linecap="round"><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(169.11111111111074 386.88888888888846) rotate(0 0.1255754212662623 0.5311599435285643)"><path d="M-1.94 -2.01 C-1.84 -1.87, 1.06 2.74, 0.96 2.71 M2.2 3.07 C1.98 2.33, -0.87 -0.27, -0.76 -0.83" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(169.11111111111074 386.88888888888846) rotate(0 0.1255754212662623 0.5311599435285643)"><path d="M-0.76 -0.83 C-0.76 -0.83, -0.76 -0.83, -0.76 -0.83 M-0.76 -0.83 C-0.76 -0.83, -0.76 -0.83, -0.76 -0.83" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(169.11111111111074 386.88888888888846) rotate(0 0.1255754212662623 0.5311599435285643)"><path d="M-0.76 -0.83 C-0.76 -0.83, -0.76 -0.83, -0.76 -0.83 M-0.76 -0.83 C-0.76 -0.83, -0.76 -0.83, -0.76 -0.83" stroke="#c92a2a" stroke-width="1" fill="none"/></g></g><mask/><g stroke-opacity="0.9" fill-opacity="0.9" stroke-linecap="round" transform="translate(420.11111111111074 99.3333333333328) rotate(0 94.5 46)"><path d="M118.75 11.75 M118.75 11.75 C135.03 21.3, 149.19 30.6, 165.25 35.25 M118.75 11.75 C134.18 19.84, 152.05 28.4, 165.25 35.25 M165.25 35.25 C187.48 45.81, 185.7 50.8, 165.25 58.75 M165.25 35.25 C190 47.22, 186.22 49.04, 165.25 58.75 M165.25 58.75 C151.54 67.12, 132.58 74.51, 118.75 80.25 M165.25 58.75 C154.75 64.96, 145.4 68.12, 118.75 80.25 M118.75 80.25 C94.28 92.54, 93.31 91.04, 71.25 80.25 M118.75 80.25 C92.74 93.24, 95.8 87.97, 71.25 80.25 M71.25 80.25 C57.4 74.18, 42.08 68.79, 23.75 58.75 M71.25 80.25 C59.29 75.01, 48.22 72.31, 23.75 58.75 M23.75 58.75 C0.68 45.28, 0.96 49.41, 23.75 35.25 M23.75 58.75 C-4.55 48.6, -0.31 50.72, 23.75 35.25 M23.75 35.25 C39.63 30.01, 56.54 22.76, 71.25 11.75 M23.75 35.25 C36.36 27.73, 51.16 22.03, 71.25 11.75 M71.25 11.75 C91.68 2.98, 95.92 -3.26, 118.75 11.75 M71.25 11.75 C95.13 -0.89, 98.93 3.17, 118.75 11.75" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(465.61111111111074 135.8333333333328) rotate(0 49 9.5)"><text x="49" y="15" font-family="Cascadia, Segoe UI Emoji" font-size="16px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">是否还有下页</text></g><g mask="url(#mask-AIvfQd-vju-X_S_dSBPaU)" stroke-linecap="round"><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(516.8888888888886 100.22222222222172) rotate(0 -110.21043321811385 -31.322581191467634)"><path d="M1.95 1.23 C-0.98 -8.31, 20.56 -46.86, -17.4 -57.53 C-55.37 -68.2, -191.2 -61.99, -225.85 -62.8 M-0.44 -0.57 C-3.62 -9.58, 17.79 -43.72, -18.83 -53.77 C-55.45 -63.82, -185.69 -59.69, -220.13 -60.85" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(516.8888888888886 100.22222222222172) rotate(0 -110.21043321811385 -31.322581191467634)"><path d="M-190.16 -68.91 C-200.21 -70.48, -212.25 -66.55, -222.62 -59.3 M-191.22 -72.17 C-201.37 -66.88, -209.77 -66.92, -220.04 -62.38" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(516.8888888888886 100.22222222222172) rotate(0 -110.21043321811385 -31.322581191467634)"><path d="M-190.22 -48.39 C-200.21 -56.23, -212.23 -58.58, -222.62 -59.3 M-191.28 -51.65 C-201.7 -52.2, -210.09 -58.07, -220.04 -62.38" stroke="#c92a2a" stroke-width="1" fill="none"/></g></g><mask id="mask-AIvfQd-vju-X_S_dSBPaU"><rect x="0" y="0" fill="#fff" width="840.670309653916" height="260.8790323125929"/><rect x="488.99999999999955" y="32.944444444444116" fill="#000" width="18" height="19" opacity="1"/></mask><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(488.9999999999998 32.944444444444116) rotate(0 -82.32154432922493 35.95519658630997)"><text x="9" y="15" font-family="Cascadia, Segoe UI Emoji" font-size="16px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">是</text></g><g mask="url(#mask-CU9fllVOFQ9hv_BUEtdnP)" stroke-linecap="round"><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(709.111111111111 149.11111111111086) rotate(0 -203.9724014016603 284.3480313714674)"><path d="M1.47 1.85 C-4.03 88.31, 40.45 427.87, -29.35 519.32 C-99.15 610.77, -352.88 545.12, -417.34 550.53 M5.34 0.38 C-0.48 86.08, 39.39 423.61, -31.38 515.78 C-102.15 607.95, -355.35 546.88, -419.3 553.39" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(709.111111111111 149.11111111111086) rotate(0 -203.9724014016603 284.3480313714674)"><path d="M-387.86 545.53 C-394.94 546.53, -407.83 550.69, -418.15 553.4 M-390.49 546.44 C-396.9 545.93, -404.31 547.57, -418.86 552.24" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(709.111111111111 149.11111111111086) rotate(0 -203.9724014016603 284.3480313714674)"><path d="M-389.19 566.01 C-395.97 561.09, -408.47 559.31, -418.15 553.4 M-391.83 566.92 C-398.26 561.38, -405.35 557.96, -418.86 552.24" stroke="#c92a2a" stroke-width="1" fill="none"/></g></g><mask id="mask-CU9fllVOFQ9hv_BUEtdnP"><rect x="0" y="0" fill="#fff" width="1230.1111111111109" height="800.1111111111109"/><rect x="670.3788246397446" y="656.2208126174994" fill="#000" width="18" height="19" opacity="1"/></mask><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(670.3788246397444 656.2208126174996) rotate(0 -165.24011493029383 -222.76167013492136)"><text x="9" y="15" font-family="Cascadia, Segoe UI Emoji" font-size="16px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">否</text></g><g stroke-linecap="round"><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(602.4444444444442 144.6666666666663) rotate(0 53.916350204956984 1.7562233025888645)"><path d="M-1.22 -0.92 C16.39 -0.04, 86.37 6.44, 104.07 7.41 M3.31 -3.89 C21.9 -4.1, 91.13 0.98, 109.06 2.8" stroke="#c92a2a" stroke-width="1" fill="none"/></g></g><mask/><g stroke-opacity="0.9" fill-opacity="0.9" stroke-linecap="round" transform="translate(54.666666666666515 787.9999999999993) rotate(0 107 27.5)"><path d="M13.75 0 M13.75 0 C87.52 5.11, 154.72 3.57, 200.25 0 M13.75 0 C69.94 -1.17, 120.39 -0.6, 200.25 0 M200.25 0 C207.03 2.66, 217.32 4.98, 214 13.75 M200.25 0 C206.48 -0.5, 217.78 5.61, 214 13.75 M214 13.75 C214.97 21.16, 215.94 34.85, 214 41.25 M214 13.75 C213.24 21.11, 214.99 24.12, 214 41.25 M214 41.25 C216.9 51.08, 208.54 54.2, 200.25 55 M214 41.25 C210.64 51.13, 211.66 58.98, 200.25 55 M200.25 55 C158.88 49.84, 117.18 48.88, 13.75 55 M200.25 55 C160.04 55.32, 124.45 55.88, 13.75 55 M13.75 55 C8.02 51.2, 2.47 48.84, 0 41.25 M13.75 55 C0.75 54.33, 1.13 47.7, 0 41.25 M0 41.25 C3.44 35.46, 4.34 28.78, 0 13.75 M0 41.25 C0.1 31.79, -0.96 26.01, 0 13.75 M0 13.75 C0.83 6.06, 2.07 -2.08, 13.75 0 M0 13.75 C1.75 7.83, 1.69 -3.8, 13.75 0" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(66.66666666666652 805.9999999999993) rotate(0 95 9.5)"><text x="95" y="15" font-family="Cascadia, Segoe UI Emoji" font-size="16px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">根据规则，将记录生成 MD</text></g><g stroke-linecap="round"><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(165.71746592082616 725.503082527672) rotate(0 -0.7108549617225322 28.413311323170547)"><path d="M0.43 1.36 C0.75 10.84, 1.42 45.89, 1.35 54.82 M-2.78 -0.36 C-2.56 9.57, 0.17 47.65, 0.43 57.19" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(165.71746592082616 725.503082527672) rotate(0 -0.7108549617225322 28.413311323170547)"><path d="M-8.78 34.34 C-11.31 39.76, -7.97 44.68, -1.84 55.08 M-10.46 29.37 C-8.94 38.42, -5.93 44.32, -1.48 58.42" stroke="#c92a2a" stroke-width="1" fill="none"/></g><g stroke-opacity="0.9" fill-opacity="0.9" transform="translate(165.71746592082616 725.503082527672) rotate(0 -0.7108549617225322 28.413311323170547)"><path d="M10.74 33.32 C2.73 39.09, 0.6 44.29, -1.84 55.08 M9.06 28.35 C6.28 37.32, 5.01 43.44, -1.48 58.42" stroke="#c92a2a" stroke-width="1" fill="none"/></g>
  </g>
  <mask/>
</svg>

编写完自定义 Actions 后，使用自定义 Actions。

``` yaml
    steps:
      - name: Release
        uses: MaLuns/add-release@指定版本
        with:
          files: Demo.zip
          generate_by_commit: true
```

效果图：

![效果图](https://github.com/MaLuns/add-release/blob/master/demo/demo.png?raw=true)

到此，一个根据 Git tag 自动发布 Npm 和 Release 的工作流编写完成了。你还可以在结合 Github Pages、Vercel 等同时自动化部署你的 Npm 包的文档和示例站点等。