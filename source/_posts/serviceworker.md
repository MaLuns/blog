---
title:  使用 Service Worker 给博客进行缓存
comment: true
hash: 1592321991597
date: 2020-06-16 23:39:51
tags: [js]
categories: 记录类
description:
keywords:
headerbg: [https://w.wallhaven.cc/full/ne/wallhaven-ne9gpw.png,'#dedede']
---

Service Workers 本质上充当Web应用程序与浏览器之间的代理服务器，也可以在网络可用时作为浏览器和网络间的代理。它们旨在（除其他之外）使得能够创建有效的离线体验，拦截网络请求并基于网络是否可用以及更新的资源是否驻留在服务器上来采取适当的动作。他们还允许访问推送通知和后台同步API。

<!-- more -->

## 需要注意点

- 需要通过 HTTPS 来访问你的页面 — 出于安全原因，Service Workers 要求必须在 HTTPS 下才能运行。为了便于本地开发，localhost 也被浏览器认为是安全源。
- Service Worker 线程运行的是js，有着独立的js环境，不能直接操作DOM树，但可以通过postMessage与其服务的前端页面通信。
- Service Worker 服务的不是单个页面，它服务的是当前网络path下所有的页面，只要当前path 的Service Worker被安装，用户访问当前path下的任意页面均会启动该Service Worker。当一段时间没有事件过来，浏览器会自动停止Service Worker来节约资源，所以Service Worker线程中不能保存需要持久化的信息。
- Service Worker 安装是在后台悄悄执行，更新也是如此。每次新唤起Service Worker线程，它都会去检查Service Worker脚本是否有更新，如有一个字节的变化，它都会新起一个Service Worker线程类似于安装一样去安装新的Service Worker脚本，当旧的Service Worker所服务的页面都关闭后，新的Service Worker便会生效。

## ServiceWorkerContainer

ServiceWorkerContainer 接口为 service worker提供一个容器般的功能，包括对service worker的注册，卸载 ，更新和访问service worker的状态，以及他们的注册者
可以通过 window.navigator.serviceWorker  获取一个  ServiceWorkerContainer 对象。[查看更多](https://developer.mozilla.org/zh-CN/docs/Web/API/ServiceWorker) ServiceWorkerContainer 使用方法

## sw-toolbox

示例
``` js
    if("serviceWorker" in navigator){
        navigator.serviceWorker.register('/sw.js').then(function () {
            navigator.serviceWorker.controller ? 
            console.log("Assets cached by the controlling service worker.") : 
            console.log("Please reload this page to allow the service worker to handle network operations.")
        }).catch(function (e) {
            console.log("ERROR: " + e)
        })
    }
```