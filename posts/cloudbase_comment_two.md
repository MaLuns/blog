---
title: 关于重写评论插件这件事
comments: true
date: 2022-02-11 10:28:39
tags: [node]
categories: 记录类
description: 
keywords: 云开发,CloudBase,BComments,评论插件
---

因为以前使用的评论插件存在很多 bug 和漏洞，但是也没啥人用，一直没有去修改，最近空闲时间比较多，所以准备对之前插件进行重构一番。原评论插件是使用原生 JS 编写 WebComponents 组件，感觉结构维护起来挺费力的(自己太菜)，决定使用 Vue3 构建 WebComponents 。

<!-- more -->

## 已支持功能
- 支持回复 
- 支持插入表情（可禁用）
- 支持 Ctrl + Enter 快捷回复
- 评论框内容实时保存草稿，刷新不会丢失
- 支持私密评论（可禁用）
- 隐私信息安全（通过云函数控制敏感字段（邮箱、IP、环境配置等）不会泄露）
- 支持人工审核模式
- 防 XSS 注入
- 支持限制每个 IP 每 10 分钟最多发表多少条评论
- 支持邮件提醒（访客和博主）, 可扩展三方通知方式
- 支持自定义“博主”标识文字
- 支持自定义通知邮件模板
- 支持自定义【昵称】【邮箱】【网址】必填 / 选填
- 支持自定义代码高亮主题
- 支持自定义配置主题 (使用css变量)
- 通过邮箱登录快捷回复管理
- 内嵌式管理面板，通过邮箱登录，可方便地查看评论、回复评论、删除评论、修改配置、站点统计信息

## 踩坑记录

### 组件样式问题
vue-loader 在 customElement 模式下，当使用子组件时候，并不会将子组件样式插入到 shadow-root 里，默认只有父组件的样式，需要我们自己处理下。[参考这里](https://www.imalun.com/vue_web_components)

### style和svg问题
直接使用打包后都是默认插入到 dom 里的，而没有插入到 customElement 需要我们对这里插入的数据进行一些处理。css 可以配合使用 to-string-loader 在挂载时候手工插入，svg 处理方法也类似这样。

### contenteditable 光标问题
使用 contenteditable 作为输入框时，当需要插入表情或者粘贴文本到光标处时候，需要存储光标信息，但是在 Can I Use 上看到 ShadowRoot Api: getSelection 的兼容性，可以看到除了 chromium 其他几乎都是不支持的。

### 弹出层问题
当在 customElement 里实现 Popover 组件，点击其他区域需要关闭弹出层时候，一般情况下我们都是判断当前点击事件触发对象 (target) 是不是我们 Popover 本身来决定我们是否关闭，但是当我们点击在 customElement 上时候 document 事件的 target 是自定义元素本身，不会到自定义元素内部去，所以我们需要在 customElement 和 document 都做一个监听。

### 跨 customElement 数据共享问题
在评论插件里，com-a(评论组件) 和 com-b(评论管理组件) 是使用的两个 **自定义元素**，但我们在 com-a 登录后，在使用 com-b 也需要有登录状态，这时候我们可能需要共享登录信息。

如果我们是用 js 去编写 customElement 去共享数据是很麻烦的事，还好在 vue3 还是比较好解决的，可以使用 **reactive** 去实现一个简易 store 去共享数据，实现一个 customElement 修改数据多个地方同时修改。

示例
``` js
const store = {
    state: {
        // 用户
        user: reactive({
            data: null
        }),
    }
}

export default store
```

### 给 customElement 添加方法
vue3 提供 **defineCustomElement** 是没有将可以将函数暴露到 customElement 上的，只能通过元素上的 **_instance** (vue创建 customElement 创建实例) 去调用，需要我们自己对 **defineCustomElement** 做下改造。[参考这里](https://www.imalun.com/vue_web_components)

## 总结
重构过程中，发现坑还是挺多的，还好大部分还是有解决方法的。重写服务端时候，发现腾讯云云开发的数据库文档还是挺坑的，一些 MongDB 操作在里面也没有，调试也很麻烦。