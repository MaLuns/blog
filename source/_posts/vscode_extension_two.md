---
title: vscode 插件开发指北 (二)
comment: true
hash: 1623932344116
date: 2021-06-17 20:19:04
tags: [vscode]
description:
categories: 记录类
keywords: [vscode插件开发,vscode]
---

接着上面的继续介绍一些常用的vscode 插件的配置和api。

<!-- more -->
## 插件配置
在configuration中配置的内容会暴露给用户，用户可以从“用户设置”和“工作区设置”中修改你暴露的选项。configuration是JSON格式的键值对，用户会在修改设置时获得对应的提示和更好的体验。
``` json
// package.json
{
    "contributes":{
        "configuration":{
            "type": "object",
            "title": "显示在配置页左侧标题",
            "properties": {
                "demo.showtick": {
                    "type": "boolean",
                    "default": false,
                    "description": "配置demo"
                }
            }
        }
    }
}
```
在插件内获取和修改当前插件配置
``` js
// 如果当前配置没有值 默认返回 undefined
const result = vscode.workspace.getConfiguration().get('demo.showtick');

// 修改配置 第三个参数如果传true 则修改全局配置，false只修改当前工作区配置
vscode.workspace.getConfiguration().update('demo.showtick', false, true);
```

## 打包发布
如果只是自己使用可以直接打包本地安装，发布到插件市场感觉创建发布前期还是有点繁琐的。
### 本地打包
**vsce** 是一个用于将插件发布到市场上的命令行工具。不论是本地打包还是要发布到插件市场都需要使用这个工具

首先安装vsce
``` 
npm install -g vsce
```
打包成vsix包
```
vsce package
```
### 发出插件市场
发布到插件市场有两种方式，一种是在vscode插件市场直接发布 vsix 包，另一种是直接使用vsce发布
#### 在插件市场发布

首先在 [插件市场](https://marketplace.visualstudio.com/VSCode) 登录你的账号，可以使用github账户或者 Microsoft账户登录
![](/images/posts/vscode_extension_two/20210623231124.png)
创建发布者（这里需要翻墙），这里发布者ID需要和插件package.json 的 publisher 保持一致。
![](/images/posts/vscode_extension_two/20210623230340.png)
![](/images/posts/vscode_extension_two/20210623230642.png)
上传vsix包文件
![](/images/posts/vscode_extension_two/20210623231651.png)
#### 使用vsce发布 
使用vsce发布首先需要 一个微软 **Azure** 账户，然后创建一个 **Azure DevOps**，然后在组织里创建发布 Token，然后就能使用vsce 发布插件。

首先打开 https://dev.azure.com，直接使用微软账户登录创建一个组织。按照步骤默认会创建一个以邮箱前缀为名的组织。
创建完后
![](/images/posts/vscode_extension_two/20210623232915.png)
创建tonken,然后将生成tonken保存下来
![](/images/posts/vscode_extension_two/20210623233248.png)
然后需要创建一个 publisher， 以前可以vsce直接创建 ，新的不在支持了，只能通过在上一种方式在网页创建了。
创建好后就可以在使用 vsce publish 命令发布插件，这个时候会提示需要 tonken，将刚刚生成复制上去。可以看到插件已经发布上去了。
![](/images/posts/vscode_extension_two/20210623234418.png)
### 发布注意事项
- README.md 文件默认会显示在插件主页，且里面连接需要是https的
- CHANGELOG.md 会显示在变更选项卡