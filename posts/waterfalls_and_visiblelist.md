---
title: 瀑布流使用虚拟列表性能优化
comment: true
date: 2022-11-14 12:05:46
tags: [JavaScript]
description:
categories: 记录类
keywords:
---

瀑布流算是比较常见的布局了，一个般常见纵向瀑布流的交互，当我们滚动到底的时候加载下一页的数据追加到上去。因为一次加载的数据量不是很多，页面操作是也不会有太大的性能消耗。但是如果当你一直往下滚动加载，加载几十页的时候，就会开始感觉不那么流畅的，这是因为虽然每次操作的很少，但是页面的 DOM 越来越多，内存占用也会增大，而且发生重排重绘时候浏览器计算量耗时也会增大，就导致了慢慢不能那么流畅了。这个时候可以选择结合虚拟列表方式使用，虚拟列表本身就是用来解决超长列表时的处理方案。

<!--more-->

## 瀑布流

瀑布流的实现方式有很多种，大体分为：
- CSS： CSS 实现的有 multi-column、grid ，CSS 实现存在一定局限性，例如无法调整顺序，当元素高度差异较大时候不是很好处理各列间隔差等。
- JavaScript：JavaScript 实现的有 JavaScript + flex、JavaScript + position，JavaScript 实现兼容性较好，可控制性高。

因为我的瀑布流是可提前计算元素宽高，列数是动态的，所以采用了 JavaScript + position 来配合 虚拟列表 进行优化。


### js + flex 实现

如果你的瀑布流 列是固定，列宽不固定 的，使用 flex 是个很好选择，当你的容器宽度变话时候，每一列宽度会自适应，大致实现方式

将你的数据分为对应列数

``` js
let data1 = [], //第一列
    data2 = [], //第二列
    data3 = [], //第三列
    i = 0;

while (i < data.length) {
    data1.push(data[i++]);
    if (i < data.length) {
        data2.push(data[i++]);
    }
    if (i < data.length) {
        data3.push(data[i++]);
    }
}
```

然后将你的每列数据插入进去就可以了，设置 list 为 flex 容器，并设置主轴方向为 row

``` html
<div class="list">
    <!-- 第一列 -->
    <div class="column">
        <div class="item"></div>
        <!-- more items-->
    </div>
    <!-- 第二列 -->
    <div class="column">
        <div class="item"></div>
        <!-- more items-->
    </div>
    <!-- 第三列 -->
    <div class="column">
        <div class="item"></div>
        <!-- more items-->
    </div>
</div>
```

### js + position 实现

这种方式比较适合 列定宽，列数量不固定情况，而且最好能计算出每个元素的大小。

大致 HTML 结构如下：

``` html
<ul class="list">
    <li class="list-item"></li>
    <!-- more items-->
</ui>
<style>
    .list {
        position: relative;
    }

    .list-item {
        position: absolute;
        top: 0;
        left: 0;
    }
</style>
```
JavaScript 部分，首先需要获取 list 宽度，根据 list.width/列宽 计算出列的数量，然后根据列数量去分组数据和计算位置

``` js
// 以列宽为300 间隔为20 为例

let catchColumn = (Math.max(parseInt((dom.clientWidth + 20) / (300 + 20)), 1))

const toTwoDimensionalArray = (count) => {
    let list = []
    for (let index = 0; index < count; index++) {
        list.push([])
    }
    return list;
}

const minValIndex = (arr = []) => {
    let val = Math.min(...arr);
    return arr.findIndex(i => i === val)
}

// 缓存累计高度
let sumHeight = toTwoDimensionalArray(catchColumn)

data.forEach(item => {
    // 获取累计高度最小那列
    const minIndex = minValIndex(sumHeight)

    let width = 0 // 这里宽高更具需求计算出来
    let height = 0

	item._top = minIndex * (300 + 20) // 缓存位置信息，后面会用到
    item.style = {
        width: width + 'px',
        height: height + 'px',
        // 计算偏移位置
        transform: `translate(${minIndex * (300 + 20)}px, ${sumHeight[minIndex]}px)`
    }

    sumHeight[minIndex] = sumHeight[minIndex] + height + 20 
})
```

### 动态列数

可以使用 [ResizeObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/ResizeObserver)(现代浏览器兼容比较好了) 监听容器元素大小变化，当宽度变化时重新计算列数量，当列数量发生变化时重新计算每项的位置信息。

``` js
const observer = debounce((e) => {
    const column = updateVisibleContainerInfo(visibleContainer)
    if (column !== catchColumn) {
        catchColumn = column
        // 重新计算
        this.resetLayout()
    }
}, 300)

const resizeObserver = new ResizeObserver(e => observer(e));

// 开始监听
resizeObserver.observe(dom);
```

### 过渡动画

当列数量发生变化时候，元素项的位置很多都会发生变化，如下图，第 4 项的位置从第 3 列变到了第 4 项，如果不做处理会显得比较僵硬。

<p align="center">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 298" width="460" height="298">
	<rect x="0" y="0" width="460" height="298" fill="#ffffff">
	</rect>
	<g stroke-linecap="round" transform="translate(10 113) rotate(0 220 87.5)">
		<path d="M-0.49 0.17 C99.14 1.36, 198.27 0.42, 439.01 -0.6 M-0.08 -0.06 C124.83 -1.08, 249.03 -1.15, 439.88 -0.3 M441.52 -1.12 C441.14 56.74, 440.97 108.16, 440.42 174.59 M440.47 0.31 C441.08 41.11, 441.73 83.9, 439.17 175.32 M440.53 174.55 C306.2 173.35, 173.32 173.64, -0.03 175.37 M439.94 175.07 C325.72 174.97, 210.49 174.53, 0.34 174.72 M-1.31 173.92 C-1.32 128.03, -0.73 80.94, -0.75 0.21 M-0.02 174.92 C-0.93 132.04, -1.82 87, 0.93 0.03" stroke="#000000" stroke-width="2" fill="none">
		</path>
	</g>
	<g stroke-linecap="round" transform="translate(19 10) rotate(0 46 58.5)">
		<path d="M0.34 0.61 C36.77 1.67, 70.84 -1.52, 90.79 -0.34 M-0.11 0.63 C19.8 0.16, 39.54 -0.08, 91.41 0.15 M90.88 1.39 C93.57 34.66, 89.93 67.3, 91.59 115.77 M92.31 -0.64 C92.08 46.58, 93.12 92.3, 92.32 117.02 M91.09 115.47 C68.38 116.27, 45.77 117.43, 0.74 116.21 M92.14 117.51 C58.99 116, 24.94 117.57, -0.57 116.74 M-1.08 115.01 C0.47 84.99, 1.3 55.04, 0.21 -1.01 M-0.08 117.12 C-0.38 74.15, -1.73 33.8, 0.03 0.41" stroke="#c92a2a" stroke-width="1" fill="none">
		</path>
	</g>
	<g stroke-linecap="round" transform="translate(125 11.5) rotate(0 46 86.5)">
		<path d="M0.61 0.84 C24.89 -1.19, 45.37 -1.36, 91.66 -1.68 M0.63 -0.07 C31.97 -0.1, 63.69 -0.48, 92.15 -0.14 M93.39 1.68 C94.53 48.35, 93.73 100.21, 90.77 174.96 M91.36 -0.63 C92.84 62.73, 91.99 124.94, 92.02 172.52 M90.47 172.58 C69.22 172.76, 48.83 173.32, -0.79 174.21 M92.51 173.17 C63.97 172.42, 38.41 172.56, -0.26 172.62 M-1.99 173.94 C-0.26 115.9, 0.39 55.47, -1.01 1.19 M0.12 173.73 C-0.74 104.14, 0.97 36.58, 0.41 0.42" stroke="#c92a2a" stroke-width="1" fill="none">
		</path>
	</g>
	<g stroke-linecap="round" transform="translate(230 14.5) rotate(0 46 46.5)">
		<path d="M0.84 1.22 C22.02 -2.25, 44.91 -0.62, 90.32 0.95 M-0.07 0.01 C25.86 -0.81, 51.54 -0.43, 91.86 -0.09 M93.68 1.22 C89.52 35.39, 91.07 68.71, 93.96 94.2 M91.37 0.02 C92.71 31.48, 92.61 64.64, 91.52 92.34 M91.58 91.79 C59.74 92.25, 27.87 91.5, 1.21 92.9 M92.17 92.1 C64.74 94.15, 38.33 93.21, -0.38 93.4 M0.94 91.6 C2.28 70.46, 0.71 48.42, 1.19 1.89 M0.73 92.22 C-0.56 66.24, 0.1 38.04, 0.42 -0.53" stroke="#364fc7" stroke-width="1" fill="none">
		</path>
	</g>
	<g stroke-linecap="round" transform="translate(344 15.5) rotate(0 46 58.5)">
		<path d="M-1.03 -1.97 C29.22 -0.9, 59.17 0.39, 91.67 -0.23 M91.58 -0.47 C90.73 42.75, 91.63 84.72, 93.52 115.88 M90.04 117.42 C57.59 116.33, 25.96 118.76, 0.95 117.63 M0.84 115.34 C1.37 89.38, -0.22 60.36, 1.05 -0.91" stroke="#c92a2a" stroke-width="4.5" fill="none" stroke-dasharray="8 12">
		</path>
	</g>
	<g transform="translate(61.5 56) rotate(0 3.5 12.5)">
		<text x="3.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
			1
		</text>
	</g>
	<g transform="translate(163 85.5) rotate(0 8 12.5)">
		<text x="8" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
			2
		</text>
	</g>
	<g transform="translate(268 48.5) rotate(0 8 12.5)">
		<text x="8" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#364fc7" text-anchor="middle" style="white-space: pre;" direction="ltr">
			3
		</text>
	</g>
	<g transform="translate(382.5 61.5) rotate(0 7.5 12.5)">
		<text x="7.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
			4
		</text>
	</g>
	<g stroke-linecap="round" transform="translate(232.5 129.75) rotate(0 46 58.5)">
		<path d="M0.1 -0.36 C35.38 -0.89, 70.24 0.22, 93.8 0.98 M0.7 0.69 C34.69 -0.96, 68.87 -1.35, 91.53 0.38 M93.77 -1.89 C91.58 30.33, 93.21 60.5, 91.19 117.89 M91.77 0.37 C90.74 34.26, 90.78 69.6, 92.47 116.82 M91.36 118.13 C65.56 115.98, 43.28 118.35, -1.28 115.14 M91.17 117.69 C58.79 117.86, 25.56 117.87, -0.5 117.24 M1.32 116.16 C-0.3 78.71, 0.11 38.79, -0.99 -1.08 M0.19 116.09 C1.6 91.53, -0.11 65.64, 0.55 -0.81" stroke="#c92a2a" stroke-width="1" fill="none">
		</path>
	</g>
	<g transform="translate(271 175.75) rotate(0 7.5 12.5)">
		<text x="7.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
			4
		</text>
	</g>
</svg>
</p>

好在我们使用了 transform（也是为什么不使用 top、left 原因，transform 动画性能更高） 进行位置偏移，可以直接使用 transition 过渡。

``` css
.list-item {
    position: absolute;
    top: 0;
    left: 0;
    transition: transform .5s ease-in-out;
}
```

## 使用虚拟列表

### 瀑布流存在的问题

很多虚拟列表的都是使用的单列定高使用方式，但是瀑布流使用虚拟列表方式有点不同，瀑布流存在多列且时是错位的。所以常规 length*height 为列表总高度，根据 scrollTop/height 来确定下标方式就行不通了，这个时候高度需要根据瀑布流高度动态决定了，可显示元素也不能通过 starindex-endindex 去截取显示了。

如下图：蓝色框的元素是不应该显示的，只有与可视区域存在交叉的元素才应该显示

<p align="center">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 353 758.5" width="353" height="758.5">
	<rect x="0" y="0" width="353" height="758.5" fill="#ffffff">
	</rect>
	<g stroke-linecap="round" transform="translate(10 117) rotate(0 166.5 250)">
		<path d="M0.72 1 C85.82 -0.51, 171.42 0.26, 333.25 0 M0.35 -0.53 C86.39 -0.22, 172.88 0.54, 332.59 -0.65 M333.72 -0.59 C331.75 138.3, 331.35 276.01, 333.39 499.35 M333.05 0.37 C331.22 121.97, 331.11 243.44, 333.2 499.61 M332.83 500.47 C221.23 497.05, 106.02 496.84, -0.33 499.21 M333.04 500.64 C253.92 500.48, 175.76 501.12, 0.15 499.67 M-0.64 500.38 C-1.44 333.69, -1.78 166.77, -0.16 -0.42 M-0.32 500.39 C1.58 380.41, 1.74 260.88, -0.19 -0.11" stroke="#000000" stroke-width="2" fill="none">
		</path>
	</g>
	<g stroke-linecap="round" transform="translate(22 10) rotate(0 46 58.49999999999999)">
		<path d="M-1.06 -0.78 C31.6 -1.8, 68.39 -0.16, 90.86 0.72 M-0.27 -0.87 C31.57 -0.47, 62.36 -0.61, 91.06 0.06 M90.59 -0.72 C93.57 23.14, 92.92 48.07, 90.1 118.2 M92.59 0.64 C91.54 25.79, 91.84 48.77, 91.4 117.78 M91.63 117.89 C60.19 117.86, 32.15 118.89, 0.85 116.53 M92 116.75 C66.12 117.09, 41.53 116.61, 0.03 116.45 M-1.92 116.26 C0.71 74.42, -0.38 29.15, -1.19 0.01 M-0.27 116.88 C1.29 85.59, -0.09 54.8, 1 0.84" stroke="#c92a2a" stroke-width="1" fill="none">
		</path>
	</g>
	<g stroke-linecap="round" transform="translate(128 11.5) rotate(0 46 86.5)">
		<path d="M0.85 1.5 C26.04 1.21, 56.87 -0.75, 90.53 -0.61 M0.28 -0.1 C20.66 -0.77, 43.28 0.39, 91.41 -0.74 M90.36 1.13 C94.56 36.23, 91.37 72.5, 90.09 173.74 M92.89 0.38 C92.22 62.29, 91.71 123.93, 91.61 172.56 M91.14 173.54 C61.97 173.1, 32.44 173.8, 1.55 172.93 M92.45 172.99 C57.7 172.47, 22.59 172.26, 0.83 172.24 M1.63 171.19 C-1.73 134.92, -0.06 94.82, 0.92 1.1 M-0.33 172.76 C-1 136.8, -0.94 102.31, 0.87 0.64" stroke="#c92a2a" stroke-width="1" fill="none">
		</path>
	</g>
	<g stroke-linecap="round" transform="translate(233 14.5) rotate(0 46 46.49999999999999)">
		<path d="M1.5 -1.92 C34.3 0.56, 66.3 -1.85, 91.39 -1.4 M-0.1 -0.5 C35 0.7, 71.41 -0.85, 91.26 -0.87 M93.13 1.57 C90.61 31.6, 90.05 64.54, 92.74 94.22 M92.38 -0.15 C92.31 29.22, 91.53 59.37, 91.56 93.19 M92.54 92.29 C57.05 91.69, 21.9 94.16, -0.07 94.44 M91.99 92.93 C70.3 92.46, 48.32 94.24, -0.76 92.3 M-1.81 92.05 C1 61.66, 0.7 29.8, 1.1 -1.86 M-0.24 93.39 C-0.67 58.1, 0.62 23.18, 0.64 -0.54" stroke="#364fc7" stroke-width="1" fill="none">
		</path>
	</g>
	<g stroke-linecap="round" transform="translate(23 143.5) rotate(0 46 58.5)">
		<path d="M-0.16 1.91 C26.05 0.41, 48.97 1.49, 90.17 -1.4 M0.92 0.77 C26.78 -0.71, 53.96 0.27, 92.13 -0.34 M93.12 -0.54 C90.67 25.41, 89.85 54.4, 93.25 118.3 M92.52 1 C92.11 26.6, 92.41 53.9, 91.76 116.57 M92.4 116.38 C60.05 117.38, 32.44 118.87, 0.83 117.28 M91.77 116.5 C71.51 116.15, 52.53 115.85, -0.4 117.31 M-0.92 118.5 C0.74 89.1, 1.33 61.5, 1.99 0.49 M0.75 117.4 C0.41 87.58, 1.55 58.47, -0.01 -0.67" stroke="#c92a2a" stroke-width="1" fill="none">
		</path>
	</g>
	<g stroke-linecap="round" transform="translate(235 137.5) rotate(0 46 58.5)">
		<path d="M-0.69 -1.37 C32.19 0.55, 67.17 -0.66, 91.16 -1.7 M0.65 -0.73 C20.23 -0.89, 40.43 0.42, 91.79 0.1 M91.14 0.57 C92.73 38.01, 93.44 71.56, 90.28 116.5 M92.14 -0.86 C93.09 39.99, 92.35 80.06, 91.19 116.41 M92.62 115.77 C65.3 117.48, 37.88 118.13, 0.68 116.99 M92.24 116.5 C57.79 116.93, 25.79 118.32, -0.44 116.84 M-1.35 118.8 C-1.39 72.23, -0.63 30.25, -0.54 -1.07 M0.64 116.73 C0.24 87.22, 0.82 58.36, -0.39 -0.67" stroke="#c92a2a" stroke-width="1" fill="none">
		</path>
	</g>
	<g stroke-linecap="round" transform="translate(130 200.5) rotate(0 46 58.5)">
		<path d="M-0.81 0.62 C20.98 0.72, 45.28 -0.11, 93.5 0.68 M1 0.24 C27.03 -0.85, 54.07 0.63, 92.4 -0.44 M91.99 -1.35 C94.61 31.82, 91.23 65.8, 91.64 116.46 M91.05 0.64 C91.13 28.53, 90.81 57.97, 91.72 116.61 M92.58 116.45 C72.28 116.64, 49.65 115.97, -1.97 115.48 M91.14 117.5 C67.24 115.93, 40.92 116.91, -0.89 116.82 M-1.9 117.01 C-0.78 72.29, -0.77 27.7, -0.11 -0.07 M-0.48 117.72 C1.8 74.6, 1.55 32.84, -0.35 0.6" stroke="#c92a2a" stroke-width="1" fill="none">
		</path>
	</g>
	<g transform="translate(64.5 56) rotate(0 3.5 12.5)">
		<text x="3.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
			1
		</text>
	</g>
	<g transform="translate(166 85.5) rotate(0 8 12.5)">
		<text x="8" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
			2
		</text>
	</g>
	<g transform="translate(271 48.5) rotate(0 8 12.5)">
		<text x="8" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#364fc7" text-anchor="middle" style="white-space: pre;" direction="ltr">
			3
		</text>
	</g>
	<g transform="translate(273.5 183.5) rotate(0 7.5 12.5)">
		<text x="7.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
			4
		</text>
	</g>
	<g transform="translate(62 189.5) rotate(0 7 12.5)">
		<text x="7" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
			5
		</text>
	</g>
	<g transform="translate(168.5 246.5) rotate(0 7.5 12.5)">
		<text x="7.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
			6
		</text>
	</g>
	<g stroke-linecap="round" transform="translate(22 283.5) rotate(0 46 58.5)">
		<path d="M-0.78 -0.59 C27.23 -0.65, 50.86 1.22, 91.41 0.37 M0.65 -0.88 C35.95 1.84, 70.95 1.2, 92.81 -0.47 M92.88 1.93 C93.54 24.45, 90.38 49.64, 92.62 117.53 M92.13 0.54 C93.6 38.02, 92.98 74.92, 92.32 116.73 M93.95 117.64 C73.79 117.41, 52.17 115.06, -0.16 117.48 M91.88 117.62 C58.53 116.44, 24.3 116.06, 0.44 117.84 M0.08 115.29 C2.68 92.32, 2.36 63.06, -0.71 1.62 M0.25 116.01 C-0.09 88.67, -1.08 57.96, -0.9 -0.7" stroke="#c92a2a" stroke-width="1" fill="none">
		</path>
	</g>
	<g transform="translate(59.5 329.5) rotate(0 8.5 12.5)">
		<text x="8.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
			8
		</text>
	</g>
	<g stroke-linecap="round" transform="translate(130 341.5) rotate(0 46 58.5)">
		<path d="M1 -0.59 C32.65 2.4, 64.71 -1.19, 93.3 -1.76 M0.32 0.81 C33.12 -1.25, 67.48 -0.82, 92.44 0.96 M93.09 0.62 C92.64 42.41, 93.54 84.48, 92.26 118.08 M92.26 0.32 C92.53 43.1, 91.96 87.36, 92.98 117.32 M90.59 116.84 C58.51 118.16, 24.11 115.78, -0.24 118.24 M91.49 117.44 C57.61 117.08, 20.63 117.77, 0.04 116.14 M-1.46 116.29 C0.71 71.41, 0.36 28.31, 0.49 -1.98 M-0.73 116.1 C-1.66 74.26, -0.99 31.55, -0.82 0.7" stroke="#c92a2a" stroke-width="1" fill="none">
		</path>
	</g>
	<g transform="translate(169 387.5) rotate(0 7 12.5)">
		<text x="7" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
			9
		</text>
	</g>
	<g stroke-linecap="round" transform="translate(239 402.5) rotate(0 46 58.5)">
		<path d="M-1.91 1.3 C27.56 1.23, 60.57 0.64, 92.63 1.61 M-0.49 0.44 C24.23 0.31, 46.63 -1.27, 92.54 0.31 M92.43 0.26 C93.31 39.73, 93.59 76.7, 92.52 117.64 M91.42 0.98 C91.3 32.62, 91.45 63.53, 91.3 116.92 M91.07 116.76 C63.44 118.68, 32.12 118.84, -1.02 117.88 M91.93 117.04 C55.82 116.98, 22.12 116.82, -0.73 116.65 M0.46 117.49 C-1.39 73.71, 2.24 27.13, -1.46 -1.8 M0.11 116.18 C0.66 90.47, 0.18 62.67, -0.63 -0.42" stroke="#c92a2a" stroke-width="1" fill="none">
		</path>
	</g>
	<g transform="translate(274.5 448.5) rotate(0 10.5 12.5)">
		<text x="10.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
			10
		</text>
	</g>
	<g stroke-linecap="round" transform="translate(236 269.5) rotate(0 46 58.5)">
		<path d="M0.71 0.63 C21.11 -1.83, 37.16 -0.28, 91.01 0.88 M-0.99 0.54 C36.77 0.19, 73.11 0.64, 92.21 0.13 M92.27 0.52 C93.52 40.89, 91.15 81.19, 90.84 118.95 M91.68 -0.7 C92.73 39.09, 93.54 77.72, 91.54 116.88 M93.83 115.98 C59.56 118.55, 23.85 115.06, -0.13 117.08 M92.65 116.27 C71.92 118.53, 52.04 118.36, 0.23 117.25 M-0.67 115.54 C-2.57 92.09, -0.69 69.9, 0.22 -1.65 M-0.43 116.37 C-0.92 74.02, -1.25 30.48, 0 -0.28" stroke="#c92a2a" stroke-width="1" fill="none">
		</path>
	</g>
	<g transform="translate(275.5 315.5) rotate(0 6.5 12.5)">
		<text x="6.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
			7
		</text>
	</g>
	<g stroke-linecap="round" transform="translate(132 481.5) rotate(0 46 58.5)">
		<path d="M-0.09 -0.12 C23.71 2.13, 48.58 -0.79, 90.97 -0.22 M0.86 -0.96 C20.51 0.59, 39.63 0.54, 92.21 0.07 M93.37 0.43 C90.65 34.55, 93.85 64.72, 91.87 116.49 M91.38 0.78 C91.26 30.42, 91.17 58.57, 91.8 117.59 M93.23 116.33 C63.71 114.95, 37.3 114.96, 0.33 116.58 M92.29 117.23 C55.88 116.15, 17.81 116.14, 0.34 117.36 M1.21 117.27 C0.07 78.92, 1.26 42.55, 0.64 0.41 M-0.61 116.09 C0.66 75.16, 0.77 33.51, 0.21 0.86" stroke="#c92a2a" stroke-width="1" fill="none">
		</path>
	</g>
	<g transform="translate(167 527.5) rotate(0 11 12.5)">
		<text x="11" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
			12
		</text>
	</g>
	<g stroke-linecap="round" transform="translate(27 424.5) rotate(0 46 58.5)">
		<path d="M-1.07 -1.03 C24.24 -1.65, 47.55 0.29, 93.72 -1.92 M0.63 0.21 C36.37 -0.64, 73.15 -1.15, 92.68 0.21 M90.95 -0.13 C92.46 22.58, 92.47 48.66, 90.76 118.55 M91.28 -0.2 C93.5 29.99, 92.52 59.61, 92.62 116.67 M90.18 117.33 C64.28 119.8, 36.51 117.1, 0.57 117.46 M91.46 117.34 C58.76 116.52, 24 117.36, 0.61 117.13 M-1.43 117.64 C1.33 88.17, 0.63 58.67, -1.22 -1.82 M0.48 117.21 C0.68 76.25, -0.98 35.79, -0.77 0.36" stroke="#c92a2a" stroke-width="1" fill="none">
		</path>
	</g>
	<g transform="translate(66.5 470.5) rotate(0 6.5 12.5)">
		<text x="6.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
			11
		</text>
	</g>
	<g stroke-linecap="round" transform="translate(29 558.5) rotate(0 46 58.5)">
		<path d="M1.81 0.03 C26.11 -2.26, 50.27 0.03, 92.69 -0.1 M-0.15 0.34 C30.65 -0.24, 59.96 -1.21, 92.97 -0.02 M91.82 1.12 C91.64 36.32, 91.7 75.52, 90.33 115.01 M92.13 0.61 C92.27 26.43, 92.61 54.51, 91.26 117.8 M91.96 117.34 C55.06 118.72, 18.7 116.9, 0.17 116.84 M92.42 116.04 C71.88 116.65, 53.23 117.9, 0.19 117.61 M0.06 115.34 C-0.02 78.36, 2.75 40.99, 0.23 -1.36 M-0.56 117.48 C-0.12 71.64, -0.45 24.91, 0.53 -0.14" stroke="#c92a2a" stroke-width="1" fill="none">
		</path>
	</g>
	<g stroke-linecap="round" transform="translate(241 544.5) rotate(0 46 58.5)">
		<path d="M-0.92 -1.7 C33.69 1.69, 65.55 2.11, 92.57 -1.76 M-0.52 -0.11 C33.19 1.17, 64.77 0.08, 92.94 0.81 M93.66 1.44 C92.34 35.96, 92.41 71.36, 92.77 118.36 M91.64 -0.63 C92.16 30.78, 92.24 61.78, 91.58 117.18 M93.34 116.25 C66.7 115.43, 39.37 118.67, 1.23 116.18 M91.34 116.92 C73.62 116.56, 52.63 116.57, -0.68 116.14 M1.81 118.41 C1.49 76.26, 1.67 32.91, 0.23 -1.96 M-0.6 117.22 C-0.29 92.07, -0.06 69.28, -0.44 0.17" stroke="#c92a2a" stroke-width="1" fill="none">
		</path>
	</g>
	<g transform="translate(276.5 590.5) rotate(0 10.5 12.5)">
		<text x="10.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
			13
		</text>
	</g>
	<g stroke-linecap="round" transform="translate(134 631.5) rotate(0 46 58.5)">
		<path d="M-0.46 1.74 C25.38 -0.13, 46.51 2.25, 92.99 -1.32 M-0.72 -0.88 C26.22 -0.04, 54.35 0.01, 92.26 0.91 M92.72 -0.77 C92.54 41.38, 90.45 85.81, 92.21 115.79 M91.43 0.63 C90.62 37.79, 90.4 76, 92.03 116.12 M92 115.94 C67.24 118.96, 43.06 117.38, 0.31 116.54 M92.21 116.33 C72.71 117.24, 51.65 116.22, -0.83 117.88 M-0.29 118.94 C-1.61 68.79, 0.3 23.59, -1.8 -1.35 M0.13 116.21 C-0.88 81.19, -0.34 43.61, 0.78 -0.05" stroke="#364fc7" stroke-width="1" fill="none">
		</path>
	</g>
	<g transform="translate(170 677.5) rotate(0 10 12.5)">
		<text x="10" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#364fc7" text-anchor="middle" style="white-space: pre;" direction="ltr">
			15
		</text>
	</g>
	<g transform="translate(68 569) rotate(0 10 12.5)">
		<text x="0" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#1864ab" text-anchor="start" style="white-space: pre;" direction="ltr">
			14
		</text>
	</g>
</svg>
</p>


### 可视元素判定

先来看下面图，当元素完全不在可视区域时候就视为当前元素不需要显示，只有与可视区域存在交叉或被包含时候视为需要显示。

<p align="center">
	<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 543 688.2044864933938" width="543" height="688.2044864933938">
		<rect x="0" y="0" width="543" height="688.2044864933938" fill="#ffffff">
		</rect>
		<g stroke-linecap="round" transform="translate(131.5 160) rotate(0 166.5 165)">
			<path d="M0.24 0.87 C123.88 0.38, 245 0.23, 333.59 -0.63 M0.33 -0.24 C91.33 1.23, 182.61 1.05, 333.53 0.44 M332.71 0.36 C334.02 131.26, 334.08 262.73, 333.44 329.43 M332.73 -0.55 C331.42 104.57, 332.58 208.14, 332.71 330.48 M333.66 330.41 C261.8 332.32, 189.92 331.22, 0.11 328.77 M332.9 330.29 C219.76 331.08, 108.19 330.97, 0.25 329.34 M1.29 329.08 C-0.24 224.07, -1.91 117.31, 0.65 1.27 M0.12 329.96 C1.08 251.48, 1.35 173.06, 0.12 -0.13" stroke="#000000" stroke-width="2" fill="none">
			</path>
		</g>
		<g stroke-linecap="round" transform="translate(143.5 10) rotate(0 46 58.49999999999999)">
			<path d="M1.28 1.63 C19.47 -0.96, 38.05 0.71, 91.07 -0.51 M91.28 -0.33 C93.59 38.93, 93.06 81.02, 93.28 118.93 M92.53 116.37 C59.12 116.25, 26.55 117.45, -0.84 117.32 M-1.62 115.19 C1.37 88.48, -0.83 55.93, 1.4 -1.7" stroke="#364fc7" stroke-width="1.5" fill="none" stroke-dasharray="8 9">
			</path>
		</g>
		<g stroke-linecap="round" transform="translate(249.5 11.5) rotate(0 46 86.5)">
			<path d="M1.63 0.65 C27.02 -0.17, 56.51 -1.52, 91.49 0.79 M-0.17 0.95 C24.8 1.01, 51.19 0.97, 92.96 0.65 M91.37 0.67 C91.08 38.12, 92.27 72.12, 92.32 172.15 M91.09 0.37 C92.12 41.76, 90.9 85.68, 91.15 172.24 M92.63 173.64 C56.95 172.29, 21.57 171.46, 0.77 172.29 M91.23 172.91 C60.69 173.15, 27.94 172.42, 0.21 173.31 M0.65 173.07 C-3.41 105.29, -0.68 41.62, -1.26 -1.19 M-0.37 172.63 C-0.28 124.36, -0.11 76.74, 0.33 0.72" stroke="#c92a2a" stroke-width="1" fill="none">
			</path>
		</g>
		<g stroke-linecap="round" transform="translate(354.5 14.5) rotate(0 46 46.49999999999999)">
			<path d="M0.65 -0.8 C29.62 0.12, 57.47 -1.26, 92.79 -0.52 M93.89 -0.8 C93.03 33.92, 92.95 66.67, 93.29 91.22 M92.67 92.45 C67.99 93.35, 39.86 93.03, -0.85 91.91 M0.73 94.59 C-0.71 67.9, 2.16 42.79, -1.52 1.67" stroke="#364fc7" stroke-width="1.5" fill="none" stroke-dasharray="8 9">
			</path>
		</g>
		<g stroke-linecap="round" transform="translate(144.5 143.5) rotate(0 46 58.5)">
			<path d="M-0.8 0.42 C34.36 -1.23, 66.48 0.49, 91.48 0.96 M-0.4 0.68 C25.07 -0.23, 49.54 -0.22, 91.11 -0.21 M91.45 1.64 C92.27 37.35, 91.95 75.53, 90.91 116.22 M92.8 -0.73 C90.52 26.31, 90.09 50.46, 92.84 117.49 M92.25 116.02 C61.78 115.48, 32 116.59, 1 116.7 M92.91 116.76 C60.88 115.95, 29.22 117.23, 0.85 117.94 M-1.78 115.91 C0.57 91.61, -1.64 61.3, -0.45 0.34 M0.01 116.4 C0.62 82.43, 0.77 48.94, 0.77 0.48" stroke="#c92a2a" stroke-width="1" fill="none">
			</path>
		</g>
		<g stroke-linecap="round" transform="translate(356.5 137.5) rotate(0 46 58.5)">
			<path d="M0.42 0.87 C34.17 -0.14, 70.98 -0.15, 92.96 -0.72 M0.68 0.78 C26.71 1.33, 52.79 -0.52, 91.79 0.26 M93.64 0.64 C91.55 31.72, 91.54 61.71, 91.22 115.38 M91.27 -0.42 C93.13 23.66, 91.67 49.86, 92.49 117.3 M91.02 117.16 C59.69 117.88, 30.3 118.12, -0.3 117.85 M91.76 117.37 C70.56 118.05, 51.36 118.69, 0.94 116.33 M-1.09 117.95 C1.82 76.82, -1.23 38.71, 0.34 -0.12 M-0.6 117.18 C0.25 86.62, 1.15 56.33, 0.48 0.64" stroke="#c92a2a" stroke-width="1" fill="none">
			</path>
		</g>
		<g stroke-linecap="round" transform="translate(251.5 200.5) rotate(0 46 58.5)">
			<path d="M0.87 -0.93 C30.07 0.6, 60.63 0.77, 91.28 -0.33 M0.78 0.64 C37.27 0.02, 71.72 -0.84, 92.26 -0.32 M92.64 -0.84 C92 38.14, 90.59 77.2, 90.38 115.19 M91.58 0.7 C92.08 38.63, 93.77 79.26, 92.3 117.31 M92.16 115.18 C62.23 115.84, 31.93 116.24, 0.85 115.45 M92.37 116.03 C65.4 117.09, 39.22 117.73, -0.67 117.33 M0.95 118.86 C-0.22 80.31, 0.59 46.34, -0.12 -0.75 M0.18 116.82 C0.32 86.92, 0.76 55.89, 0.64 -0.76" stroke="#c92a2a" stroke-width="1" fill="none">
			</path>
		</g>
		<g transform="translate(186 56) rotate(0 3.5 12.5)">
			<text x="3.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#364fc7" text-anchor="middle" style="white-space: pre;" direction="ltr">
				1
			</text>
		</g>
		<g transform="translate(287.5 85.5) rotate(0 8 12.5)">
			<text x="8" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
				2
			</text>
		</g>
		<g transform="translate(392.5 48.5) rotate(0 8 12.5)">
			<text x="8" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#364fc7" text-anchor="middle" style="white-space: pre;" direction="ltr">
				3
			</text>
		</g>
		<g transform="translate(395 183.5) rotate(0 7.5 12.5)">
			<text x="7.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
				4
			</text>
		</g>
		<g transform="translate(183.5 189.5) rotate(0 7 12.5)">
			<text x="7" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
				5
			</text>
		</g>
		<g transform="translate(290 246.5) rotate(0 7.5 12.5)">
			<text x="7.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
				6
			</text>
		</g>
		<g stroke-linecap="round" transform="translate(143.5 283.5) rotate(0 46 58.5)">
			<path d="M-0.33 1.89 C24.4 1.69, 51.96 1.61, 93.93 1.29 M-0.32 0.33 C19.12 0.58, 39.12 -0.66, 92.16 -0.43 M90.19 0.73 C93.13 27.27, 90.69 58.87, 90.3 115.48 M92.31 0.32 C92.69 44.4, 92.65 88.87, 92.38 116.65 M90.45 116.83 C61.6 116.92, 28.32 115.45, 0.42 117.61 M92.33 117.03 C55.68 115.84, 21.62 117.31, -0.63 116.41 M-0.75 116.26 C-0.18 83.32, 0.16 51.66, 0.67 1.44 M-0.76 117.71 C-0.41 72.95, 0.1 29.7, -0.27 -0.63" stroke="#c92a2a" stroke-width="1" fill="none">
			</path>
		</g>
		<g transform="translate(181 329.5) rotate(0 8.5 12.5)">
			<text x="8.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
				8
			</text>
		</g>
		<g stroke-linecap="round" transform="translate(251.5 341.5) rotate(0 46 58.5)">
			<path d="M-0.8 1.36 C25.84 0.41, 50.5 0.42, 90.22 -0.42 M-0.28 0.82 C30.35 -0.73, 60.22 -0.73, 91.46 -0.39 M93.59 -1.46 C90.09 27.01, 89.24 49.7, 93.67 117.97 M92.12 -0.49 C92.45 37.73, 92.75 76.93, 92.5 116.85 M93.81 116.53 C61.25 114.99, 29.43 117.53, 1.7 118.89 M91.11 116.45 C71.04 117.96, 48.51 116.44, -0.22 117.17 M0.03 115.8 C0.8 82.24, 1.11 49.66, 1.54 0.96 M0.15 117.07 C1.55 75.31, 0.62 31.12, -0.92 0.03" stroke="#c92a2a" stroke-width="1" fill="none">
			</path>
		</g>
		<g transform="translate(290.5 387.5) rotate(0 7 12.5)">
			<text x="7" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
				9
			</text>
		</g>
		<g stroke-linecap="round" transform="translate(360.5 402.5) rotate(0 46 58.5)">
			<path d="M1.56 1.28 C38.23 0.67, 70.83 -1.05, 92.53 -0.63 M0.32 -0.42 C30.82 -1.18, 60.78 -1.15, 91.19 -0.91 M91.15 1.4 C91.23 37.87, 94.61 79.74, 92.61 117.63 M92.08 -0.91 C92.53 38.48, 92.65 77.51, 92.42 116.23 M92.75 115.07 C65.61 117.4, 40.07 118.67, -1.34 117.65 M92.48 117.93 C63.46 115.9, 35.94 116.67, -0.06 116.63 M0.37 116.63 C0.65 87.65, 1.53 56.37, 1.29 -1.53 M0.66 117.94 C-0.45 72.99, -1.1 30.27, 0.48 0.92" stroke="#c92a2a" stroke-width="1" fill="none">
			</path>
		</g>
		<g transform="translate(396 448.5) rotate(0 10.5 12.5)">
			<text x="10.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
				10
			</text>
		</g>
		<g stroke-linecap="round" transform="translate(357.5 269.5) rotate(0 46 58.5)">
			<path d="M1.93 1.29 C32.09 -1.01, 68.27 -1.22, 92.67 -0.55 M0.16 -0.43 C34.6 -0.01, 69.47 -0.52, 92.37 0.8 M90.3 -1.52 C93.18 27.52, 92.11 53.73, 92.64 117.25 M92.38 -0.35 C92.6 29.19, 92.52 57.9, 91.91 117.91 M92.42 117.61 C68.27 118, 39.8 116.76, 0.07 115.22 M91.37 116.41 C69.19 118.03, 46.77 117.48, -0.37 117.01 M0.67 118.44 C1.33 89.86, 1.07 59.27, 1.42 0.3 M-0.27 116.37 C-1.69 81.11, -0.29 46.1, 0.96 0.17" stroke="#c92a2a" stroke-width="1" fill="none">
			</path>
		</g>
		<g transform="translate(397 315.5) rotate(0 6.5 12.5)">
			<text x="6.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
				7
			</text>
		</g>
		<g stroke-linecap="round" transform="translate(253.5 481.5) rotate(0 46 58.5)">
			<path d="M-1.78 -0.42 C34.03 -1.23, 67.67 -1.15, 93.64 0.64 M-0.54 -0.39 C22.93 -0.51, 47.85 1.19, 91.27 -0.42 M93.67 0.97 C91.61 43.94, 91.64 86.86, 91.02 117.16 M92.5 -0.15 C92.87 23.7, 92.36 49.86, 91.76 117.37 M93.7 118.89 C71.96 117.94, 54.67 115.5, -1.09 117.95 M91.78 117.17 C55.77 116.08, 19.3 116.47, -0.6 117.18 M1.54 117.96 C0.89 82.51, 1.02 51.38, 0.14 1.32 M-0.92 117.03 C0.8 71.86, 1.28 25.05, 0.07 0.74" stroke="#c92a2a" stroke-width="1" fill="none">
			</path>
		</g>
		<g transform="translate(288.5 527.5) rotate(0 11 12.5)">
			<text x="11" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
				12
			</text>
		</g>
		<g stroke-linecap="round" transform="translate(148.5 424.5) rotate(0 46 58.5)">
			<path d="M0.53 -0.63 C34.21 -0.36, 68.73 0.84, 91.16 0.32 M-0.81 -0.91 C24.04 1.16, 46.63 -0.06, 92.7 -0.85 M92.61 0.63 C93.62 26.46, 91.99 52.58, 90.18 117.77 M92.42 -0.77 C92.5 31.87, 92.35 62.3, 91.03 117.21 M90.66 117.65 C61.65 116.09, 30.07 118.82, 1.86 115.74 M91.94 116.63 C69.5 117.17, 47.14 117.34, -0.18 117.33 M1.29 115.47 C0.51 73.76, -0.76 31.24, 1.87 -0.55 M0.48 117.92 C2.04 89.45, 1.14 62.3, -0.87 -0.81" stroke="#c92a2a" stroke-width="1" fill="none">
			</path>
		</g>
		<g transform="translate(188 470.5) rotate(0 6.5 12.5)">
			<text x="6.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#c92a2a" text-anchor="middle" style="white-space: pre;" direction="ltr">
				11
			</text>
		</g>
		<g stroke-linecap="round" transform="translate(150.5 558.5) rotate(0 46 58.5)">
			<path d="M0.67 -0.55 C27.29 0.93, 50.46 0.61, 91.15 -1.09 M92.73 1.59 C89.59 29.67, 92.45 59.33, 90.48 118.67 M92.64 117.25 C58.94 117.45, 26.03 118.06, -0.71 118 M-0.17 118.81 C-0.97 84.42, -2.43 50.77, 0.61 1.7" stroke="#364fc7" stroke-width="1.5" fill="none" stroke-dasharray="8 9">
			</path>
		</g>
		<g stroke-linecap="round" transform="translate(362.5 544.5) rotate(0 46 58.5)">
			<path d="M1.64 0.64 C23.85 0.58, 48.53 -0.83, 91.22 -1.62 M90.54 -0.85 C93.83 22.81, 90.91 50.69, 92.97 117.61 M91.02 117.16 C59.69 117.88, 30.3 118.12, -0.3 117.85 M-0.47 117.75 C-1.83 91.39, 0.71 66.63, 1.89 -1.34" stroke="#364fc7" stroke-width="1.5" fill="none" stroke-dasharray="8 9">
			</path>
		</g>
		<g transform="translate(398 590.5) rotate(0 10.5 12.5)">
			<text x="10.5" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#364fc7" text-anchor="middle" style="white-space: pre;" direction="ltr">
				13
			</text>
		</g>
		<g transform="translate(184.5 603) rotate(0 10 12.5)">
			<text x="0" y="18" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#1864ab" text-anchor="start" style="white-space: pre;" direction="ltr">
				14
			</text>
		</g>
		<g stroke-linecap="round">
			<g transform="translate(487.1804903262407 12.750000000000014) rotate(0 3.6758362127011424 72.03529622842932)">
				<path d="M1.35 0.68 C3.65 11.83, 13.85 44.93, 12.72 68.64 C11.58 92.36, -3.16 130.51, -5.45 142.96 M-1.36 -1.42 C0.73 10.1, 10.6 48.01, 10.89 72.49 C11.18 96.98, 3.48 133.32, 0.38 145.49" stroke="#e67700" stroke-width="1" fill="none">
				</path>
			</g>
		</g>
		<g stroke-linecap="round">
			<g transform="translate(117.53441886727751 157.75) rotate(0 -10.223491209581084 166.2962683300674)">
				<path d="M0.05 2.79 C-3.09 27.9, -20.26 97.29, -20.73 151.57 C-21.2 205.85, -5.76 298.74, -2.79 328.47 M-3.37 1.84 C-6.76 26.14, -24.26 93.14, -23.23 147.96 C-22.19 202.78, -0.45 299.99, 2.82 330.75" stroke="#2b8a3e" stroke-width="1" fill="none">
				</path>
			</g>
		</g>
		<g transform="translate(511 10.75) rotate(0 11 70)">
			<text x="0" y="21" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#e67700" text-anchor="start" style="white-space: pre;" direction="ltr">
				已
			</text>
			<text x="0" y="49" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#e67700" text-anchor="start" style="white-space: pre;" direction="ltr">
				滚
			</text>
			<text x="0" y="77" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#e67700" text-anchor="start" style="white-space: pre;" direction="ltr">
				动
			</text>
			<text x="0" y="105" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#e67700" text-anchor="start" style="white-space: pre;" direction="ltr">
				高
			</text>
			<text x="0" y="133" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#e67700" text-anchor="start" style="white-space: pre;" direction="ltr">
				度
			</text>
		</g>
		<g transform="translate(68 242.75) rotate(0 10 65)">
			<text x="0" y="19" font-family="Virgil, Segoe UI Emoji" font-size="17.647058823529395px" fill="#2b8a3e" text-anchor="start" style="white-space: pre;" direction="ltr">
				可
			</text>
			<text x="0" y="45" font-family="Virgil, Segoe UI Emoji" font-size="17.647058823529395px" fill="#2b8a3e" text-anchor="start" style="white-space: pre;" direction="ltr">
				视
			</text>
			<text x="0" y="71" font-family="Virgil, Segoe UI Emoji" font-size="17.647058823529395px" fill="#2b8a3e" text-anchor="start" style="white-space: pre;" direction="ltr">
				区
			</text>
			<text x="0" y="97" font-family="Virgil, Segoe UI Emoji" font-size="17.647058823529395px" fill="#2b8a3e" text-anchor="start" style="white-space: pre;" direction="ltr">
				高
			</text>
			<text x="0" y="123" font-family="Virgil, Segoe UI Emoji" font-size="17.647058823529395px" fill="#2b8a3e" text-anchor="start" style="white-space: pre;" direction="ltr">
				度
			</text>
		</g>
		<g stroke-linecap="round">
			<g transform="translate(126 10.75) rotate(0 -41.557524843499436 334.64067246239637)">
				<path d="M-2.22 2.78 C-15.51 51.66, -82.99 184.74, -82.27 295.52 C-81.55 406.3, -11.85 606.05, 2.08 667.45 M1.78 1.83 C-11.78 49.64, -85.13 180.83, -85.2 291.06 C-85.26 401.3, -13.23 600.77, 1.4 663.26" stroke="#5f3dc4" stroke-width="1" fill="none">
				</path>
			</g>
		</g>
		<g transform="translate(10 218.75) rotate(0 11 84)">
			<text x="0" y="21" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#5f3dc4" text-anchor="start" style="white-space: pre;" direction="ltr">
				瀑
			</text>
			<text x="0" y="49" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#5f3dc4" text-anchor="start" style="white-space: pre;" direction="ltr">
				布
			</text>
			<text x="0" y="77" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#5f3dc4" text-anchor="start" style="white-space: pre;" direction="ltr">
				流
			</text>
			<text x="0" y="105" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#5f3dc4" text-anchor="start" style="white-space: pre;" direction="ltr">
				总
			</text>
			<text x="0" y="133" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#5f3dc4" text-anchor="start" style="white-space: pre;" direction="ltr">
				高
			</text>
			<text x="0" y="161" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#5f3dc4" text-anchor="start" style="white-space: pre;" direction="ltr">
				度
			</text>
		</g>
	</svg>
</p>

因为上面瀑布流的实现采用的是 position 定位的，所以我们完全能知道所有元素距离顶部的距离，很容易计算出与可视区域交叉位置。

**元素偏移位置 < 滚动高度+可视区域高度  && 元素偏移位置 + 元素高度 > 滚动高度**

如果只渲染可视区域范围，滚动时候会存在白屏再出现，可视适当的扩大渲染区域，例如把上一屏和下一屏都算进来，进行预先渲染。

``` js
const top = scrollTop - clientHeight
const bottom = scrollTop + clientHeight * 2
const visibleList = data.filter(item => item._top + item.height > top && item._top < bottom)
```

然后通过监听滚动事件，根据滚动位置去处理筛选数。这里会存在一个隐藏性能问题，当滚动加载数据比较多的时候，滚动事件触发也是比较快的，每一次都进行一次遍历，也是比较消耗性能的。可以适当控制一下事件触发频率，当然这也只是治标不治本，归根倒是查询显示元素方法问题。

**标记下标**
应为列表数据的 _top 值是从小到大正序的，所以我们可以标记在可视区元素的下标，当发生滚动的时候，我们直接从标记下标开始查找，根据滚动分几种情况来判断。
1> 如果滚动后，标记下标元素还在可视范围内，可以直接从标记下标二分查找，往上往下找直到不符合条件就停止。
2>  如果滚动后，标记下标元素不在可视范围内，根据滚动方向往上或者往下去查找。这个时候存在两种情况，一种是滚动幅度比较小，直接根据当前下标往上或者往下找。当用户拖动滚动条滚动幅度特别大的时候，可以将下标往上或者往下偏移，偏移量根据 **滚动高度/预估平均高度*列数** 去估算一个，然后在根据这个预估下标进行查找。找到后然后缓存一个新的下标。

### 抖动问题

我们 absolute 定位会撑开容器高度，但是滚动时候还是会存在抖动问题，我们可以自定义一个元素高度去撑开，这个元素高度也就是我们之前计算的每一列累计高度 sumHeight 中最大的那个了。

### 过渡动画问题

当列宽发生变化时，元素位置发生了变化，在可视区域的元素也发生了变化，有些元素可能之前并没有渲染，所以使用上面 CSS 会存在新出现元素不会产生过渡动画。好在我们能够很清楚的知道元素原位置信息和新的位置信息，我们可以利用 **FLIP** 来处理这动画，很容易控制元素过渡变化，如果有些元素之前不存在，就没有原位置信息，我们可以在可视范围内给他随机生成一个位置进行过渡，保证每一个元素都有个过渡效果避免僵硬。

## 总结

上面情况仅仅是针对动态列数量，又能计算出高度情况下优化，可能业务中也是可能存在每项高度是动态的，这个时候可以采用预估元素高度在渲染后缓存大小位置等信息，或者离屏渲染等方案解决做出进一步的优化处理。