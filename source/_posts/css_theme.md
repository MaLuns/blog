---
title: css 实现换肤几种方式
comments: true
date: 2020-08-21 16:53:51
tags: [css]
categories: 记录类
description:
keywords: css,换肤
---

说起换肤功能，前端肯定不陌生，其实就是颜色值的更换，实现方式有很多，也各有优缺点。

<!--more-->

## 一、可供选择的换肤
对于只提供几种主题方案，让用户来选择的，一般就简单粗暴的写多套主题。
-  一个全局 class 控制样式切换，直接更改全局class

``` html
<body class='dark'></body>
```

- 使用js去修改 link 的 href

``` html
<link id='link_theme'  href="skin.css" rel="stylesheet" type="text/css"/>
<script>
    document.getElementById('link_theme').href='skin-dark.css'
</script>
```


## 二、动态色值换肤的实现

- 全局替换颜色值
可以参看 [Element-UI](https://elementui.github.io/theme-preview/#/zh-CN) 的换肤实现，就是先把样式中颜色全部替换后在塞到\<style\>标签里面。
- 使用 less 的 modifyVars 动态修改
modifyVars 方法是是基于 less 在浏览器中的编译来实现。所以在引入 less 文件的时候需要通过 link 方式引入，然后基于 less.js 中的方法来进行修改变量。

```less
// styles.less
@color: red;
.card {
    color: @color;
}
```
``` html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet/less" type="text/css" href="styles.less" />
    <script src="//cdn.jsdelivr.net/npm/less"></script>
</head>

<body>
    <div class="card">
        card
    </div>
    <button id="themeBtn">更改颜色</button>
</body>
<script>
    document.getElementById("themeBtn").addEventListener('click', function () {
        let color = '#' + Math.floor(Math.random() * 256 * 1000000000).toString(16).slice(0, 6)
        less.modifyVars({
            '@color': color
        }).then(() => {
            console.log(`color: ${color}F`);
        });
    })
</script>
```

- css 变量(var)

css 原生变量 [兼容性](https://www.caniuse.com/#search=--var),大部分主流浏览器还是支持的，而且主要是操作起来够简便。

定义变量
```css
// 加上前缀 -- 就可以了 
:root{
    --color:red;
}
//使用 当--color 不生效的时候会使用后面参数替代
body:{
    color:var(--color,#000)
}
```
使用 js 去修改
```js
// 获取根
let root = document.documentElement;
root.style.setProperty('--color', '#f00');
```

## 三、总结
如果需要动态替换颜色主题，使用第二种比较合适也方便.如果每套主题有很大差异性不仅仅只是颜色的替换，第一种的方式就好了很多，使用第二种就不太合适了.如果都需要满足也可以两种相结合使用。
