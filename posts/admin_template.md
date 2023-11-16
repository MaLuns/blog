---
title: 从零开始搭建一个后台模板
date: 2020-04-15 10:16:09
tags: [vue,vuex,vue-route,elemelt-ui]
categories: 创作类
comments: true
keywords: admin-template,vue,element,后台模板
---

闲来没事，又开始造轮子玩玩了，用vue + element-ui 撸个后台模板。

<!-- more -->

## 主要用的使用依赖 ##
- vue          
- vuex         
- vue-router   
- vue-i18n     
- axios        
- element-ui   
- nprogress    
- antv/g2      


## 项目结构 ##

```
┌── public                     
│   ├── index.html             // html模板
│   ├── favicon.ico            // favicon图标
│ 
├── src                        // 源代码
│   ├── api                    // 所有请求
│   ├── assets                 // 静态资源
│   ├── components             // 全局公用组件
│   ├── config                 // 配置文件
│   ├── libs                   // 全局公用方法
│   ├── locale                 // 国际化 
│   ├── mock                   // 模拟数据
│   ├── plugin                 // vue插件
│   ├── router                 // 路由
│   ├── store                  // 全局 store管理
│   ├── views                  // view
│   ├── App.vue                // 入口页面
│   ├── index.less             // 全局样式
│   ├── main.js                // 入口 加载组件 初始化等
│ 
├── vue.config.js              // vue-cli 配置
├── .gitignore                 // git 忽略项
└── package.json               // package.json

```


[演示地址](//ml13.gitee.io/admin-template)   [项目地址](//gitee.com/ml13/admin-template)

## 效果图 ##

![](/images/posts/admin_template/CEt1w5WJrs.gif)_示例_

