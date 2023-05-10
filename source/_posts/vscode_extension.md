---
title: VS Code 插件开发指北 (一)
comments: true
date: 2021-06-12 23:20:59
tags: [vscode]
description:
categories: 记录类
keywords: vscode插件,vscode教程
---
最近闲来无事，给公司框架做了开发代码片段提示和一些常用工具整合的插，在这里记录一下踩过的坑和一些常用的基本功能示例。
<!-- more -->
## 插件能做什么
因为 VS Code 是基于 Electron 的，所以一般 node 能做的一般基本上都是可以是现实。如果你想对 VS Code 做些个性化的配置，你可以开发自定义主题、图标主题、欢迎页面、自定义左侧的面板（例如资源管理器栏那种）等。你还可以自己定义命令、快捷键、自动补全、菜单等来提升你的开发效率。甚至你可以对现有语言做扩展或者定义新的语言的支持。

## 创建插件项目
首先安装官方的脚手架

```js
// 安装脚手架
npm install -g yo generator-code

// 创建项目
yo code 
// 会一路提示你 输入插件名 插件id 等等。根据需要填写
```
微软提供了两种方式去开发，一种是 JavaScript 和 TypeScript 去开发，可以根据自己的习惯选择。创建好后按 F5 会打开调试用的 VS Code 窗口来调试插件

使用 JavaScript 生成的项目结构，
├── .vscode
│   ├── launch.json     // 插件加载和调试的配置
│   └── tasks.json      // 配置TypeScript编译任务
├── .gitignore          // 忽略构建输出和node_modules文件
├── README.md           // 插件文档
├── CHANGELOG.md        // 插件更新日志
├── extension.ts        // 插件源代码
├── package.json        // 插件配置清单
├── jsconfig.json       // 

先看下入口文件，入口文件需要导出两个函数 activate 和 deactivate
``` js
//extension.js 文件

// 插件激活调用，也是插件的入口
function activate(context) {
    console.log('Congratulations, your extension "vscode-demo" is now active!');

    // 注册一个命令
    let disposable = vscode.commands.registerCommand('vscode-demo.helloWorld', function () {
        //命令触发是调用
        vscode.window.showInformationMessage('Hello World from vscode-demo!');
    });

    context.subscriptions.push(disposable);
}

// 插件销毁调用
function deactivate() {}

module.exports = {
    activate,
    deactivate
}
```

这个初始化插件项目，默认就是注册了个 hello world 命令，然后运行命令显示 hello world 的通知，按F5运行项目，在命令面板输入 hello world，可以看到右下角弹出通知
![项目结构](/images/posts/vscode_extension/20210615205632.png)
![项目结构](/images/posts/vscode_extension/20210615205655.png)

## 配置说明
vscode 插件的 package.json 是 npm 的一个超集，插件的图标、命令注册、菜单配置、语言注册、主题注册、代码片段等一系列的都需要在这个文件里配置。

``` json
// package.json

{
    "name": "vscode-demo",
    "displayName": "vscode-demo",
    "description": "",
    "version": "0.0.1",
    "publisher": "", //发布者id，后面会讲怎么发布到插件市场
    "engines": { //vscode 最低版本
        "vscode": "^1.57.0"
    },
    "categories": [ //插件市场的分类 可以设置成语言主题等其他类型
        "Other"
    ],
    "activationEvents": [ //扩展的激活事件
        "onCommand:vscode-demo.helloWorld", //调用命令时激活
        "onLanguage:python", //py时激活插件
        "workspaceContains:**/.editorconfig",// 文件夹打开时激活
        "onDebug",//调试前激活
        ...
        "*" //启动时候激活，使用这个不需要设置其他的
    ],
    "main": "./extension.js", //指定插件入口文件
    "icon": "", //插件图标
    "contributes": { //大部分的配置都要在这里配置
        "commands":[], //配置命令,如果需要暴露给用户使用的需要在这里配置
        "menus":[], //配置菜单
        "submenus":[], //配置子菜单会用到
        "languages": [], //配置语言
        "grammars":[], //为语言配置TextMate语法
        "keybindings":[], //配置快捷键
        "snippets":[], //配置代码片段
        "themes":[], //配置主题
        "views":[], //配置活动栏视图
        "viewsWelcome":[], //配置左侧视图欢迎页
        "viewsContainers":[], //配置视图容器
        "configuration":{},  //配置插件配置
        "configurationDefaults":{}, //配置插件默认配置
        "colors":{},
        "problemMatchers":{},
        "taskDefinitions":{},
        "typescriptServerPlugins":{}
    },
}
```

## 命令示例
一般提供给被人使用的功能都是通过命令注册，在命令的回调函数里处理相关功能逻辑，然后就可以在 VS Code 的命令面板调用相关命令。你也可以注册快捷键、菜单等和命令绑定在一起来触发命令。VS Code 内部含有大量和编辑器交互、控制UI、后台操作的内置命令给我们使用。

### 注册命令
vscode 在 commands 下提供了 **registerCommand** 和 **registerTextEditorCommand**用来注册命令，registerTextEditorCommand 注册的命令只会在编辑器激活的时候才调用。

``` javascript
// 在activate函数注册命令

context.subscriptions.push(
    // 第一个参数为命令ID,第二次参数命令回调函数
    vscode.commands.registerCommand('vscode-demo.currentText', function () {
        // 获取当前激活的编辑器
        let currentEditor = vscode.window.activeTextEditor; 
        // 获取编辑器选择的内容
        console.log(currentEditor.document.getText(currentEditor.selection));
    })
);
```

命令注册后默认是不会对外提供的，如果需要提供给用户使用还需要在 **package.json** 的 **contributes.commands** 添加相应配置

``` json
// package.json
{
    "contributes": {
        "commands": [
            {
                "command": "vscode-demo.currentText",
                "title": "获取选择文本"
            }
        ]
    }
}
```

按住 F5 运行插件，在命令面板输入 *获取选择文本* ，会发现报错了。是因为 **activationEvents** 配置里只配置了 "onCommand:vscode-demo.helloWorld" 才会激活插件，我们需要把新加的命令也加入进去，或者改为 *

``` json
// package.json
{
    activationEvents: [ "*" ]
}
```

### 执行命令
在 commands 提供了 **executeCommand** API用来调用命令，可以使用它调用我们插件里的命令，也可以调用 VS Code 内置的命令。
使用示例
``` js
// 调用
vscode.commands.executeCommand('vscode-demo.helloWorld')
```

## 菜单示例
package.json 中的 **contributes.menus** 用来的配置菜单项，下面这些编辑器可以配置菜单的地方。

- 全局命令面板 - commandPalette
- 资源管理器上下文菜单 - explorer/context
- 编辑器上下文菜单 - editor/context
- 编辑器标题栏 - editor/title
- 编辑器标题上下文菜单 - editor/title/context
- 调试栈视图的上下文菜单 - debug/callstack/context
- 视图的标题菜单 - view/title
- 视图项的菜单 - view/item/context
- SCM 标题菜单 - scm/title
- SCM 资源组 - scm/resourceGroup/context
- SCM 资源 - scm/resource/context
- SCM 改变标题 - scm/change/title

配置菜单需要提供，选中菜单时执行的命令和菜单出现的条件。
``` json
{
    "command": "命令",
    "when": "条件",
    "alt": "可选命令",
    "group": "菜单分组",
    "submenu": "配置二级菜单",
    "icon": "图标"
}
```

###  控制命令面板的命令
默认情况下注册的命令都会显示在命令面板中，有时候需要更具条件显示，就可以在 **commandPalette** 配置指定命令然后通过 **when** 控制。
``` json
// package.json
{
    "contributes": {
        "commands": [
            {
                "command": "vscode-demo.currentText",
                "title": "获取选择文本"
            }
        ],
        "menus": {
            "commandPalette": [
                {
                    "command": "vscode-demo.currentText",
                    "title": "获取选择文本",
                    "when": "editorHasSelection" // 只有选择文本才显示
                }
            ]
        }
    },
}
```

### when 条件
when 提供的逻辑操作符有 ==、!=、||、&&、!、=\~(正则)、>、>=、<、<=、in 等操作符，和js的类似，多了一个 **=~** 符匹配正则。VS Code 还提供了很多上下文可以和这些操作符组合使用。[查看上下文详情](https://code.visualstudio.com/api/references/when-clause-contexts)
示例
```
"when":"resourceExtname != .js" //不是js文件时
"when":"editorHasSelection" //选择文本才显示
"when":"!editorHasSelection" //不选择文本才显示
```


### 配置多级菜单
使用 **submenu** 指定父级菜单的ID，**submenus** 配置父级菜单名称等信息。
``` json
{
    "contributes": {
        "menus": {
            "editor/context": [
                {
                    "command": "vscode-demo.currentText"
                },
                {
                    "submenu": "first.menu"
                }
            ],
            "first.menu": [
                {
                    "command": "vscode-demo.currentText"
                },
                {
                    "submenu": "two.menu"
                }
            ],
            "two.menu": [
                {
                    "command": "vscode-demo.currentText"
                }
            ],
        },
        "submenus": [
            {
                "id": "first.menu",
                "label": "一级菜单"
            },
            {
                "id": "two.menu",
                "label": "二级菜单"
            }
        ]
    },
}
```
![示例](/images/posts/vscode_extension/20210616211914.png)

### 分组排序
菜单项可以通过组来分类。根据下列默认规则，然后按照字母排序，

- 编辑器上下文菜单(editor/context)默认有这些分组：
    - navigation - navigation组始终在最上方。
    - 1_modification - 紧接上一个组，这个组包含可以修改你代码的命令。
    - 9_cutcopypaste - 然后是基础编辑命令。
    - z_commands - 最后一个分组则是命令面板入口。
- 资源管理器上下文菜单(explorer/context)默认有下列分组：
    - navigation - 在VS Code 中导航的相关命令。navigation 组始终在最上方。
    - 2_workspace - 和工作区操作相关的命令。
    - 3_compare - 比较文件和diff相关的命令。
    - 4_search - 在搜索视图中和搜索相关的命令。
    - 5_cutcopypaste - 和剪切、复制、粘贴文件相关的命令。
    - 7_modification - 修改文件的相关命令。
- 编辑器标签菜单默认有下列分组
    - 1_close - 和关闭编辑器相关的命令。
    - 3_preview - 和固定编辑器相关的命令。
- 编辑器标题栏(editor/title)的默认分组
    - 1_diff - 与使用差异编辑器相关的命令。
    - 3_open - 与打开编辑器相关的命令。
    - 5_close - 与关闭编辑器相关的命令。

组内的菜单顺序取决于标题或者序号属性。菜单的组内顺序由@<number>加到 group 值的后面得以确定：
``` json
"editor/title": [{
    "when": "editorHasSelection",
    "command": "extension.Command",
    "group": "myGroup@1"
}]
```

## 注册快捷键
快捷键还是比较简单的，Windows 和Linux 是 key 指定，macOS 使用 mac 指定的快捷键。
``` json
"contributes": {
    "keybindings": [{
        "command": "vscode-demo.currentText", //快捷键绑定命令
        "key": "ctrl+f1", 
        "mac": "cmd+f1",
        "when": "editorHasSelection" // 出现时机
    }]
}
```
设置好后，使用了对应命令的菜单项也会显示对应快捷键，如图所示
![示例](/images/posts/vscode_extension/20210616230737.png)