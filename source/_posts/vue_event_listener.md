---
title: 记一次在Vue中使用 addEventListener 的坑
comments: true
hash: 1611061392977
date: 2021-01-19 22:23:18
tags: [vue]
description:
categories: 记录类
keywords: vue,addEventListener
cover: https://images.unsplash.com/photo-1556244573-c3686c0f0e78?ixid=Mnw4OTgyNHwwfDF8c2VhcmNofDIwfHxjb2RlfGVufDB8fHx8MTY1MDEyNDk0Ng&ixlib=rb-1.2.1&w=750&dpi=2
---

最近遇到一个需求，需要在单击单元格的时候，编辑单元格。乍一看很简单嘛，监听单元格事件，然后记录点击的 rowIndex 和 prop，然后将对应的给成编辑状态。
<!--more-->
其中有一列时编辑时需要显示一个输入框，然后在线调取接口数据，然后有数据展示个 table 让选择，没数据弹出新增。直接把 el-input + el-popover + el-table 组合做个封装有数据 打开 popover 没数据 弹窗新增，上来就是一顿操作

``` html
<el-table @cell-click="handleCellClick" ...>
        <el-table-column prop="goodsName" width="55">
            <template scope="{row,$index}">
                <edit-popover  v-if="rowIndex===$index && cellPror===goodsName"></edit-popover>
                <span v-else>{{row.name}}</span>
            </template>
        <el-table-column>
        ...
</el-table>

<script>
export default {
    data(){
        return {
            rowIndex:-1,
            cellPror:null
        }
    },
    methods:{
        handleCellClick(){
            ... //省略具体逻辑

            this.rowIndex=rowIndex,
            this.cellPror=cellPror
        }
    }
}
</script>
```
edit-popover 内容，大致如下(省略具体逻辑)， 创建一个popover 然后在选择列和点击外面区域时候，关闭 popover。
```html
<template>
    <div @click.stop>
        <el-popover trigger="manual" v-model="visible">
            <el-table :data="gridData" @row-click="rowClick">
                <el-table-column width="150" property="date" label="日期"></el-table-column>
                <el-table-column width="100" property="name" label="姓名"></el-table-column>
                <el-table-column width="300" property="address" label="地址"></el-table-column>
            </el-table>
            <el-button slot="reference" @click="visible = !visible">手动激活</el-button>
        </el-popover>
    </div>
</template>

<script>
    export default {
        data(){
            return {
                visible:true
            }
        },
        mounted() {
            console.log('初始化')
            let func = function () {
                console.log('点击其他区域')
                this.visible=false;
            }
            document.addEventListener('click', func)

            this.$once("hook:beforeDestroy", function () {
                console.log('销毁')
                document.removeEventListener('click', func)
            });
        },
        methods:{
            rowClick(){
                //选择列 ... 省略其他逻辑
                this.visible=false;
            }
        }
    }
</script>

```
看起来一起都好，没啥问题。直接跑起来一看，然而并没有想象那样，点击出现编辑。
js 执行输入
``` js
//初始化
//点击其他区域
```
会发现怎么上来就执行了点击事件，明明时点击了 table 的 单元格 后才渲染的子组件，然后才监听的 document 的 click 事件的。，怎么子组件创建后，还监听到了之前事件， 打印事件对象也可一看到 事件的 target 也是 table 单元格元素。

一顿思索后，既然快了，那就给 document 延迟绑定 click 事件，再一试试，哦吼可以了。
``` js
setTimeout(() => {
    document.addEventListener('click', func)
    this.$once("hook:beforeDestroy", function () {
        console.log('销毁')
        document.removeEventListener('click', func)
    });     
}, 100);
```

准备就这里了事的时候，突然想起来这他妈是子组件渲染后，父组件点击事件才冒泡完成啊，直接改成捕获阶段监听就 Ok 了。
``` js
document.addEventListener('click', func,true)
this.$once("hook:beforeDestroy", function () {
    console.log('销毁')
    document.removeEventListener('click', func,true)
});
```
