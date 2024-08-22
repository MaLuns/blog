---
title: VS Code 插件开发指北 (二)
comments: true
date: 2021-06-17 20:19:04
tags: [vscode]
description:
categories: 记录类
keywords: vscode插件开发,vscode
---

接着上面的继续介绍一些常用的 VS Code 插件的配置和 API。

<!-- more -->
## 代码片段
在 package.json 增加 snippets 配置。
``` json
"snippets": [
    {
        "language": "vue", // 指定支持的语言
        "path": "./snippets/demo.json" // 文件路径
    },
]
```
在 snippets 文件夹下创建 demo.json 文件，代码格式如下
``` json
{
    "片段名称": {
        "prefix": "代码片段触发前缀",
        "body": [ "片段内容" ],
        "description": "代码片段描述"
    },
}

// 示例
{
    "selectCheckBox": {
        "prefix": "select-check-box",
        "body": [
            "<select-check-box v-model='${1:search.statusList}'  :sourceOpt='${2:statusOpt}' @change='${3:getList(1)}' title='${4:状态}'></select-check-box>"
        ],
        "description": "多选下拉框"
    }
}
```
片段中的 ${1:xxx} 是占位符，数字表示光标聚焦的顺序，1表示默认光标落在这里，按下回车或者tab跳到2的位置，以此类推，xxx 表示此位置的默认值，可省略，比如直接写$3。一个片段里可以设置多个相同的占位符，来同时修改多出占位处。片段中也是支持使用 VS Code 内置的很多变量的，比如可以根据获取当前选择的值(${TM_SELECTED_TEXT}) 填充到代码片段中。

占位符几种使用
- $1 只显示光标
- ${1:xxxx} 默认使用 xxx 填充
- ${1|a,b,c|} 当光标在此处时 提供 a,b,c 三个选择给选择
- ${1:${TM_SELECTED_TEXT}} 使用内置的变量占位


常用用的变量，[查看更多变量](https://code.visualstudio.com/docs/editor/variables-reference#_environment-variables)
- TM_SELECTED_TEXT当前选定的文本或空字符串
- TM_CURRENT_LINE当前行的内容
- TM_CURRENT_WORD光标下的单词或空字符串的内容
- TM_LINE_INDEX基于零索引的行号
- TM_LINE_NUMBER基于单索引的行号
- TM_FILENAME当前文档的文件名
- TM_FILENAME_BASE没有扩展名的当前文档的文件名
- TM_DIRECTORY当前文档的目录
- TM_FILEPATH当前文档的完整文件路径
- CLIPBOARD剪贴板的内容
- CURRENT_YEAR当前年份
- CURRENT_YEAR_SHORT当前年份的最后两位数字
- CURRENT_MONTH两个数字的月份（例如'02'）
- CURRENT_MONTH_NAME月份的全名（例如“七月”）
- CURRENT_MONTH_NAME_SHORT月份的简称（例如'Jul'）
- CURRENT_DATE每月的某一天
- CURRENT_DAY_NAME天的名称（例如'星期一'）
- CURRENT_DAY_NAME_SHORT当天的简称（例如'Mon'）
- CURRENT_HOUR 24小时制格式的当前小时
- CURRENT_MINUTE当前分钟
- CURRENT_SECOND当前秒

## 插件配置
在 configuration 中配置的内容会暴露给用户，用户可以从“用户设置”和“工作区设置”中修改你暴露的选项。configuration 是 JSON 格式的键值对，用户会在修改设置时获得对应的提示和更好的体验。
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
发布到插件市场有两种方式，一种是在 VS Code 插件市场直接发布 vsix 包，另一种是直接使用 vsce 发布
#### 在插件市场发布

首先在 [插件市场](https://marketplace.visualstudio.com/VSCode) 登录你的账号，可以使用 github 账户或者 Microsoft账户登录
![](/images/posts/vscode_extension_two/20210623231124.png)
创建发布者（这里需要翻墙），这里发布者 ID 需要和插件 package.json 的 publisher 保持一致。
![](/images/posts/vscode_extension_two/20210623230340.png)
![](/images/posts/vscode_extension_two/20210623230642.png)
上传vsix包文件
![](/images/posts/vscode_extension_two/20210623231651.png)
#### 使用vsce发布 
使用 vsce 发布首先需要 一个微软 **Azure** 账户，然后创建一个 **Azure DevOps**，然后在组织里创建发布 Token，然后就能使用 vsce 发布插件。

首先打开  [azure](https://dev.azure.com) ，直接使用微软账户登录创建一个组织。按照步骤默认会创建一个以邮箱前缀为名的组织。
创建完后
![](/images/posts/vscode_extension_two/20210623232915.png)
创建 tonken,然后将生成tonken保存下来
![](/images/posts/vscode_extension_two/20210623233248.png)
然后需要创建一个 publisher， 以前可以 vsce 直接创建 ，新的不在支持了，只能通过在上一种方式在网页创建了。
创建好后就可以在使用 vsce publish 命令发布插件，这个时候会提示需要 tonken，将刚刚生成复制上去。可以看到插件已经发布上去了。
![](/images/posts/vscode_extension_two/20210623234418.png)
### 发布注意事项
- README.md 文件默认会显示在插件主页，且里面连接需要是 https 的
- CHANGELOG.md 会显示在变更选项卡
