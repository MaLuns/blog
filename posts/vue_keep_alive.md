---
title: keep-alive 与 router-view
comments: true
date: 2020-12-07 20:07:05
tags: [vue]
categories: 记录类
description:
keywords:
---

keep-alive 用于缓存不活动的组件实例，router-view 一个 functional 组件，渲染路径匹配到的视图组件。这里对两者结合使用时遇到几种情况做个简单记录
<!-- more -->

## keep-alive
属性：
- include - 字符串或正则表达式。只有名称匹配的组件会被缓存。
- exclude - 字符串或正则表达式。任何名称匹配的组件都不会被缓存。
- max - 数字。最多可以缓存多少组件实例。

缓存组件名为 a，b 的组件，排除组成名为 c 的
``` html
<keep-alive :include="['a','b']" :exclude="['c']" :max="5">
  <component :is="view"></component>
</keep-alive>
```
## 结合router-view使用

如果直接被包在 keep-alive 里面，所有路径匹配到的视图组件都会被缓存
``` html
<keep-alive>
   <router-view></router-view>
</keep-alive>
```
然后实现总是会有其他不同的需求的
- 比如只缓存某些组件
- 或者相同路由不同参数需要分开缓存
<!-- - 又或者不同路由使用相同组件一个缓存另一个不需要缓存 -->
- ...

### 缓存部分组件 

指定只缓存部分组件，相对来说比较简单。 可以在 router.meta 中增加需要缓存标识，然后使用
include 指定需要缓存组件

``` html
<template>
    <keep-alive :include="include">
        <router-view />
    </keep-alive>
</template>

<script>
    export default {
        data() {
            return {
                include: []
            }
        },
        watch: {
            $route(route) {
                let { meta } = route
                if (meta.cache && !this.include.includes(meta.name)) {
                    this.include.push(meta.name)
                }
            }
        }
    }
</script>

// route 路由数组
[{
    path: 'home',
    name: "home",
    meta:{
        name:'组件名称',
        cache:true  //设置需要缓存
    },
    component: () => import('@/views/home')
},{
    path: '/login',
    name: 'login',
    meta:{
        name:'组件名称',
        cache:true
    },
    component: () => import('@/views/login'),
}]
```
这种方式需要知道组件的 name，当项目较大时候，给路由匹配上对应组件 name 也是件挺繁琐的事。改进一下使用两个 router-view 组件，一个用 keep-alive 包裹进行缓存，一个不缓存。这样就不需要例举出需要被缓存组件名称

``` html
<template>
    <keep-alive>
        <router-view  v-if="$route.meta.cache" />
    </keep-alive>
</template>

<router-view v-if="!$route.meta.cache" />
```

### 相同路由不同参数
当有一个路由为 /params/:id ，打开 /params/1、/params/2 、/params/xxx 正常情况下 vue 会对其进行复用，但是有些时候我们需要对其分开缓存。 这个时候可以给 router-view 指定 key
``` html
<keep-alive>
   <router-view :key="$route.fullPath"></router-view>
</keep-alive>
```
$route.fullPath : 完成解析后的 URL，包含查询参数和 hash 的完整路径。所以每个路径都是唯一的，当然也可以指定其他的值，只需要保持唯一就可以了

<!-- ### 不同路由使用相同组件
当都需要缓存的时候，和正常情况一样处理就可以了。但是当一个需要缓存一个不需要缓存时候（没有的这么奇葩要求，但是被面试问答过） -->
