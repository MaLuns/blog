---
title: Vue2.0 部分源码阅读记录
comment: true
date: 2020-03-06 20:38:27
tags:
categories: 记录类
photos: ['/images/js_vue_source_study_logo.png']
---

之前也用了一段时间Vue，对其用法也较为熟练了，但是对各种用法和各种api使用都是只知其然而不知其所以然。最近利用空闲时间尝试的去看看Vue的源码，以便更了解其具体原理实现，跟着学习学习。

<!--more -->

之前一直对Vue又几个困惑

- 传的data 进去的 怎么就 变得 this.xxx 可以访问到了
- 如何实现数据劫持，监听数据的读写操作 ？
- 如何实现依赖缓存 ？

## Proxy ##

``` js 

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}


function initData(){
    //....
     proxy(vm, `_data`, key)
}

```

## Observer ##

## Dep ## 

## Watcher ##