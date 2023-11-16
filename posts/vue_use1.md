---
title: vue 使用中的小技巧 （一）
comments: true
date: 2020-08-03 20:07:05
tags: [vue]
categories: 记录类
description:
keywords: vue,vue优化
---
在 vue 的使用过程中会遇到各种场景，当普通使用时觉得没什么，但是或许优化一下可以更高效更优美的进行开发。下面有一些我在日常开发的时候用到的小技巧

<!-- more -->

## data 和 Object.freeze
每个 Vue 实例都会代理其 data 对象里所有的属性，这些被代理的数据是响应式的，在其数据改变时视图也会随之更新。
在每个 vue 组件中都有一个 data 对象，不要把所有数据都放在 data 中。只把需要做响应式的数据放在 data 对象中；原因是：如果一个数据存在于 data 中，数据会被劫持，vue 会给数据添加一个 getter（获取数据），一个 setter（设置数据），性能不会高。
可以把一些不需要响应的数据直接放到实例上，而不是在 data 里

``` js
data(){
    // 不需要做响应的数据
    this.list=[...]

    return {
        list2:[...]
    }
}
```

> Object.freeze() 方法可以冻结一个对象。一个被冻结的对象再也不能被修改；冻结了一个对象则不能向这个对象添加新的属性，不能删除已有属性，不能修改该对象已有属性的可枚举性、可配置性、可写性，以及不能修改已有属性的值。此外，冻结一个对象后该对象的原型也不能被修改。freeze() 返回和传入的参数相同的对象

对于一些不需要响应列表数据，也可以用 Object.freeze() 处理
``` js
data(){
   return { 
        list: []
   }
},
created () {
    let listData = Object.freeze([
            { value: 1 },
            { value: 2 }
        ])
    // 冻结 listData 
    this.list = listData;

    // 界面不会有响应
    this.list[0].value = 100;

    // 下面两种做法，界面都会响应，只是冻结 listData 没有冻结 this.list
    this.list = [
        { value: 100 },
        { value: 200 }
    ];
    this.list = Object.freeze([
        { value: 100 },
        { value: 200 }
    ]);
}
```

## 优雅处理事件监听和移除

有时候我们会遇到这样的场景,需要自己去监听一些事件什么的，可能会像下面这个写，但是有时候可能因为 mounted 和 destroyed 不再一个位置啥的，导致忘记清除对事件监听。可以利用 hook 去监听钩子事件将它们写在一起

``` js
mounted() {
    window.addEventListener('resize', this.func)
},
destroyed() {
    window.removeEventListener('resize', this.func)
},
methods:{
    func(){

    }
}
```

更改后

``` js
mounted() {
    window.addEventListener('resize', this.func)
    this.$once("hook:beforeDestroy", ()=> {
        window.removeEventListener('resize', this.func)
    });
},
methods:{
    func(){

    }
}
```
## .sync 修饰符

在有些情况下，我们可能需要对一个 **prop** 进行“双向绑定”。 不幸的是，真正的双向绑定会带来维护上的问题，因为子组件可以修改父组件，且在父组件和子组件都没有明显的改动来源。这也是为什么我们推荐以 **update:myPropName** 的模式触发事件取而代之。举个例子，在一个包含 **show** prop 的假设的组件中，我们可以用以下方法表达对其赋新值的意图：

``` js
this.$emit('update:show', newShow)
```
父组件可以监听那个事件并根据需要更新一个本地的数据
``` js
<dialog  v-bind:title="show"  v-on:update:show="show = $event"></dialog>
```
使用 .sync 简写 
``` js
<dialog :title.sync="doc.title"></dialog>
```

## 属性事件传递

有时候需要对一些组件进行更高层次封装，例如有一个普通表格组件，需要实现能有行内编辑等一些功能时候，就需要对表格进行二次封装。像表格组件属性较多时，需要一个个去传递，非常不友好并且费时

``` js
<template>
  <BaseTable v-bind="$props" v-on="$listeners"> <!-- ... --> </BaseTable>
</template>

<script>
  import BaseTable from "./BaseTable";

  export default {
    components: {
      BaseTable
    }
  };
</script>
```
可以看到传递属性和事件的方便性，而不用一个个去传递,还有$attrs（props、class、style 除外的其他 attribute ）可以使用

## Watch的初始立即执行
当 watch 一个变量的时候，初始化时并不会执行，如下面的例子，你需要在 created 的时候手动调用一次。
``` js
created() {
  this.search();
},
watch: {
  searchText(){
    this.search()
  },
}
```
上面这样的做法可以使用，但很麻烦，我们可以添加 immediate 属性，这样初始化的时候就会自动触发(不用再写 created 去调用了)，然后上面的代码就能简化为
``` js
watch: {
  searchText: {
    handler(){
        this.search()
    },
    immediate: true
  }
}
```
