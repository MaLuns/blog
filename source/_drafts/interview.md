---
title: 前端面试记录
comment: true
date: 2022-04-13 17:24:41
tags:
description:
categories: 记录类
keywords: 面试题
---

今天接了个视频面试，没有提前看看面试题，结果一些基础东西回答东一点西一点的，看来还是需要看看题巩固下了😅。
<!--more-->

## CSS

**问：如何使用 Flex 实现三列列表，元素之间间隔 10px，但是两边不需要间距？**
首先想到的是设置 **flex-wrap: wrap** 让 flex 换行，然后设置元素 **margin: 0 5px**，然后去消除两边间距。后来想想其实陷入了个误区，其实只用设置中间元素就间距就行。

实现如下：

``` html
<div class="flex">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
</div>
```
``` css
.flex {
    display: flex;
    flex-wrap: wrap;
}

.flex div {
    height: 200px;
    background-color: #38acfa;
    margin: 5px 0;
    width: calc((100% - 20px) / 3);
}

.flex div:nth-child(3n-1) {
    margin: 5px 10px;
}
```

## JavaScript

**问：说出下面答应顺序(类似下面这种)？**
``` js
console.log(1);
new Promise(() => {
    console.log(2);
})

new Promise((resolve, reject) => {
    resolve(4);
    setTimeout(() => {
        console.log(6)
    });
}).then((val) => {
    console.log(val)

    new Promise((resolve, reject) => {
        console.log(8);
        resolve(9);
    }).then(console.log).then(() => {
        console.log(10);
    })
})

setTimeout(() => {
    console.log(5)

    new Promise((resolve, reject) => {
        resolve(11);
    }).then(console.log)
});
console.log(3);
```
一顿思索然后就把 setTimeout 和 Promise 顺序搞反了 😅。其实只需要知道在浏览器里宏任务和微任务执行顺序就很好理解这类型题目。

<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1337 1080" width="100%" >
  <rect x="0" y="0" width="1337" height="1080" fill="#ffffff"></rect>
  <g stroke-linecap="round" transform="translate(570 10) rotate(0 120 50)">
    <path d="M3.2 -0.29 C69.71 1.32, 144.53 -1.17, 240.96 -3.23 M-0.44 1.07 C52.39 -0.7, 106.43 -1.29, 240.04 1.51 M239.03 -2.71 C239.24 27.76, 237.06 59.93, 242.86 99.52 M240.66 -1.69 C237.16 40.04, 238.41 78.31, 241.34 100.98 M241.11 98.09 C146.92 102.41, 57.57 100.46, 0.41 102.07 M239.94 98.91 C159.69 105.1, 80.39 103.32, -1.3 99.33 M-1.34 96.96 C3.63 62.23, 1.03 32.4, -1.96 -1.43 M1.32 99.27 C-0.4 68.68, 0.62 40.25, -1.52 0.96" stroke="#010101" stroke-width="1" fill="none"></path>
  </g>
  <g transform="translate(575 37.5) rotate(0 115 22.5)"><text x="115" y="32" font-family="Virgil, Segoe UI Emoji" font-size="36px" fill="#010101" text-anchor="middle" style="white-space: pre;" direction="ltr">宏任务</text></g>
  <g stroke-linecap="round">
    <g transform="translate(690 111) rotate(0 -1.9062701757416107 80.56367796391248)">
      <path d="M-0.09 0.85 C-0.28 27.28, -0.03 132.26, -0.2 158.42 M-3.58 -1.15 C-4.24 25.8, -2.55 135.28, -2.55 162.28" stroke="#010101" stroke-width="1" fill="none"></path>
    </g>
    <g transform="translate(690 111) rotate(0 -1.9062701757416107 80.56367796391248)">
      <path d="M-11.83 133.89 C-8.96 141.93, -6.32 154.51, 0.58 162.68 M-13.71 135.6 C-10.56 143.23, -3.56 153.9, -0.58 162.03" stroke="#010101" stroke-width="1" fill="none"></path>
    </g>
    <g transform="translate(690 111) rotate(0 -1.9062701757416107 80.56367796391248)">
      <path d="M8.7 133.72 C4.71 141.8, 0.5 154.44, 0.58 162.68 M6.81 135.43 C2.34 143.06, 1.73 153.8, -0.58 162.03" stroke="#010101" stroke-width="1" fill="none"></path>
    </g>
  </g>
  <g stroke-linecap="round" transform="translate(470 610) rotate(0 240 60)">
    <path d="M-1.05 -0.31 C164.77 -1.56, 330.78 -1.76, 478.55 0.33 M0.24 -0.79 C172.1 2.81, 345.56 2.18, 480.02 0.04 M481.67 -0.12 C479.2 24.92, 479.17 52.84, 476.21 123.75 M479.69 1.52 C479.72 38.82, 482.69 77.77, 480.32 119.23 M478.41 119.81 C317.33 119.98, 154.15 120.85, 0.39 119.34 M479.66 120.19 C348.48 117.03, 216.88 116.32, 0.4 120.17 M3.29 119.71 C-1.72 83.68, -2.54 43.59, 0.31 3.91 M-1.96 121.87 C-2.03 93.9, 1.13 69.06, 0.26 0.8" stroke="#010101" stroke-width="1" fill="none"></path>
  </g>
  <g transform="translate(475 625) rotate(0 235 45)"><text x="235" y="32" font-family="Virgil, Segoe UI Emoji" font-size="36px" fill="#010101" text-anchor="middle" style="white-space: pre;" direction="ltr">执行微任务，里面有微任务产</text><text x="235" y="77" font-family="Virgil, Segoe UI Emoji" font-size="36px" fill="#010101" text-anchor="middle" style="white-space: pre;" direction="ltr">生会继续执行</text></g>
  <g stroke-linecap="round" transform="translate(530 270) rotate(0 160 80)">
    <path d="M162.67 -0.12 C195.36 16.81, 231.04 35.96, 316.21 84.75 M160.69 1.52 C211.9 28.86, 266.38 55.16, 320.32 80.23 M316.34 80.57 C264.36 108.07, 208.47 136.77, 161.89 158.48 M319.22 81.44 C278.42 100.28, 235.38 120.36, 161.93 160.39 M164.29 159.71 C110.69 135.44, 60.79 107.84, 0.31 84.91 M159.04 161.87 C123.55 145.87, 91.27 130.06, 0.26 81.8 M0.3 78.62 C62.19 47.95, 129.47 16.78, 158.47 -0.46 M0.17 79.11 C60.5 45.8, 122.32 14.26, 159.13 -0.23" stroke="#010101" stroke-width="1" fill="none"></path>
  </g>
  <g transform="translate(535 327.5) rotate(0 155 22.5)"><text x="155" y="32" font-family="Virgil, Segoe UI Emoji" font-size="36px" fill="#010101" text-anchor="middle" style="white-space: pre;" direction="ltr">是否有微任务</text></g>
  <g stroke-linecap="round">
    <g transform="translate(691.6751695338637 429.55010332942015) rotate(0 -1.531027732677785 90.74479518074531)">
      <path d="M-1.68 1.89 C-1.75 32.27, -2.76 151.45, -2.82 181.04 M2.61 0.45 C2.28 30.03, -4.58 146.09, -5.67 176.35" stroke="#010101" stroke-width="1" fill="none"></path>
    </g>
    <g transform="translate(691.6751695338637 429.55010332942015) rotate(0 -1.531027732677785 90.74479518074531)">
      <path d="M-11.86 146.07 C-12.06 153.52, -12.41 159.56, -7.41 175.14 M-16.36 147.24 C-13.49 157.62, -10.52 165.93, -5.35 175.77" stroke="#010101" stroke-width="1" fill="none"></path>
    </g>
    <g transform="translate(691.6751695338637 429.55010332942015) rotate(0 -1.531027732677785 90.74479518074531)">
      <path d="M8.64 147.06 C4.05 154.05, -0.71 159.88, -7.41 175.14 M4.14 148.23 C0.94 158.11, -2.16 166.13, -5.35 175.77" stroke="#010101" stroke-width="1" fill="none"></path>
    </g>
  </g>
  <g stroke-linecap="round" transform="translate(570 970) rotate(0 120 50)">
    <path d="M-2.62 -0.33 C52.82 1.8, 108.69 1.41, 238.84 1.33 M-1.61 -0.91 C68.67 2.56, 140.92 2.71, 238.96 1.16 M236.51 -2 C240.85 26.07, 240.53 49.34, 239.76 101.44 M239.65 1.07 C237.45 22.27, 237.06 40.77, 240.47 100.02 M237.33 99.13 C149.53 95.53, 58.73 96.65, -0.15 100.79 M240.78 98.48 C165.06 95.69, 88.07 96.99, 1.41 100.92 M1.35 97.12 C-2.91 72.8, 2.29 41.32, -2.48 -2.93 M-1.94 99.34 C-1.77 65.35, 0.58 28.46, -1.61 1.73" stroke="#010101" stroke-width="1" fill="none"></path>
  </g>
  <g transform="translate(575 997.5) rotate(0 115 22.5)"><text x="115" y="32" font-family="Virgil, Segoe UI Emoji" font-size="36px" fill="#010101" text-anchor="middle" style="white-space: pre;" direction="ltr">浏览器渲染</text></g>
  <g stroke-linecap="round">
    <g transform="translate(690 731) rotate(0 0.9860309289023235 118.84293444115679)">
      <path d="M2.32 0.13 C2.34 40.14, -1.05 200.34, -1.74 239.95 M0.14 -2.27 C1.23 36.97, 3.08 195.49, 3.71 236" stroke="#010101" stroke-width="1" fill="none"></path>
    </g>
    <g transform="translate(690 731) rotate(0 0.9860309289023235 118.84293444115679)">
      <path d="M-6.75 205.47 C-1.67 211.7, -2.22 223.86, 0.22 234 M-5.63 207.84 C-2.38 215.19, -0.61 227.84, 3.37 237.08" stroke="#010101" stroke-width="1" fill="none"></path>
    </g>
    <g transform="translate(690 731) rotate(0 0.9860309289023235 118.84293444115679)">
      <path d="M13.77 205.19 C14.04 211.82, 8.69 224.05, 0.22 234 M14.89 207.56 C11.49 215.07, 6.6 227.81, 3.37 237.08" stroke="#010101" stroke-width="1" fill="none"></path>
    </g>
  </g>
  <g transform="translate(730 470) rotate(0 18.5 25.5)"><text x="18.5" y="38" font-family="Virgil, Segoe UI Emoji" font-size="36px" fill="#010101" text-anchor="middle" style="white-space: pre;" direction="ltr">有</text></g>
  <g stroke-linecap="round">
    <g transform="translate(849.1728389913155 351.5049613710494) rotate(0 180.8271611563838 330.50207458590285)">
      <path d="M-9.5 -1.5 C57.51 38.17, 400.53 130.07, 395.94 240.44 C391.35 350.8, 35.16 589.81, -37.01 660.68 M-5.71 3.85 C62.04 45.1, 406.4 133.53, 400.83 243.31 C395.25 353.09, 33.78 592.88, -39.17 662.51" stroke="#010101" stroke-width="1" fill="none"></path>
    </g>
    <g transform="translate(849.1728389913155 351.5049613710494) rotate(0 180.8271611563838 330.50207458590285)">
      <path d="M-25.67 632.93 C-30.23 644.13, -36.77 652.46, -35.41 663.3 M-22.62 635.33 C-31 645.42, -35.77 658.89, -37.73 663.55" stroke="#010101" stroke-width="1" fill="none"></path>
    </g>
    <g transform="translate(849.1728389913155 351.5049613710494) rotate(0 180.8271611563838 330.50207458590285)">
      <path d="M-12.88 648.98 C-21.93 654.66, -32.68 657.7, -35.41 663.3 M-9.83 651.38 C-23.48 654.89, -33.36 661.95, -37.73 663.55" stroke="#010101" stroke-width="1" fill="none"></path>
    </g>
  </g>
  <g transform="translate(1290 570) rotate(0 18.5 25.5)"><text x="18.5" y="38" font-family="Virgil, Segoe UI Emoji" font-size="36px" fill="#010101" text-anchor="middle" style="white-space: pre;" direction="ltr">否</text></g>
  <g stroke-linecap="round">
    <g transform="translate(651.879869120748 1004.9594971081597) rotate(0 -351.8798691228883 -474.95949710815967)">
      <path d="M-66.46 -0.22 C-161.93 -92.02, -637.02 -388.84, -639.29 -547.24 C-641.55 -705.64, -173.58 -883.23, -80.08 -950.61 M-61.88 5.04 C-157.67 -87.69, -638.42 -390.97, -641.88 -550.97 C-645.34 -710.97, -176.73 -887.32, -82.65 -954.96" stroke="#010101" stroke-width="1" fill="none"></path>
    </g>
    <g transform="translate(651.879869120748 1004.9594971081597) rotate(0 -351.8798691228883 -474.95949710815967)">
      <path d="M-105.09 -933.58 C-94.47 -940.28, -89.54 -943.43, -80.8 -953.85 M-104.04 -930.93 C-94.17 -941.64, -86.73 -951.69, -82.23 -953.68" stroke="#010101" stroke-width="1" fill="none"></path>
    </g>
    <g transform="translate(651.879869120748 1004.9594971081597) rotate(0 -351.8798691228883 -474.95949710815967)">
      <path d="M-114.74 -951.69 C-101.35 -953.62, -93.93 -952.08, -80.8 -953.85 M-113.69 -949.04 C-100.03 -952.63, -88.73 -955.44, -82.23 -953.68" stroke="#010101" stroke-width="1" fill="none"></path>
    </g>
  </g>
  <g transform="translate(50 450) rotate(0 126.5 25.5)"><text x="126.5" y="38" font-family="Virgil, Segoe UI Emoji" font-size="36px" fill="#010101" text-anchor="middle" style="white-space: pre;" direction="ltr">继续下一个循环</text></g>
</svg>

宏任务：

- setTimeout
- setInterval
- setImmediate
- I/O
- UI render

微任务：

- process.nextTick
- Promise.then
- Async/Await(promise)
- MutationObserver

再来看上面题目：
``` js
// 这里同步执行
console.log(1);

new Promise(() => {
    // Promise 这里还是同步执行的
    console.log(2);
})

new Promise((resolve, reject) => {
    resolve(4);
    // 创建第一个宏任务
    setTimeout(() => {
        console.log(6)
    });
}).then((val) => { // 创建第一个微任务
    console.log(val)

    new Promise((resolve, reject) => {
        console.log(8);
        
        resolve(9);
    }).then(console.log) // 创建第二个微任务
      .then(() => { // 创建第三个微任务
        console.log(10);
    })
})

// 创建第二位宏任务
setTimeout(() => {
    console.log(5)

    new Promise((resolve, reject) => { 
        resolve(11); 
    }).then(console.log) // 在第二个宏任务，创建的第一个微任务
});

// 同步执行
console.log(3);
```
首先执行最外层 同步代码块 => 然后执行第一个微任务 => 然后在第一个微任务里产生了第 2、3 微任务，只需执行两个 => 没有微任务后开始下一个循环，开始执行第一个宏任务 => 第一个宏任务执行完，没有微任务，开始执行第二个宏任务 => 然后第二个宏任务执行完了，开始执行里面创建微任务 => 结束。
打印结果为：【1，2，3】，【4，8，9，10】，【6】，【5，11】
<br>

**问：值类型和引用类型区别？和存储地方？**
值类型：占用空间固定，保存在栈中，保存与复制的是值本身。
引用类型：占用空间不固定，保存在堆中，保存与复制的是指向对象的一个指针。
<br>

**问：对象里的属性是值类型？它是存在哪里的？**
忘了。
<br>

**问：JS 为什么精度问题？你是怎么解决的？**
js 使用的是 IEEE 二进制浮点数算术标准 IEEE 754，精度只有64位。比如 0.1 和 0.2 转为二进制是无穷尽的，做了截断处理，然后在转换为十进制时就丢失了精度。

在工作时使用三方插件解决的，简单使用时候放大倍数后，在计算，对结果在缩小。
<br>

**问：浅拷贝和深拷贝区别？你怎么实现的？**
拷贝值和拷贝地址区别，利用递归实现。
<br>

**问：节流和防抖是什么？一般用在什么地方？**
节流: n 秒内只运行一次，若在 n 秒内重复触发，只有一次生效
防抖: n 秒后在执行该事件，若在 n 秒内被重复触发，则重新计时

举了浏览器滚动事件例子：
节流: 添加一个定时任务，再次触发时，如果定时任务没执行，跳过当次调用。
防抖: 添加一个定时任务，如果再次触发时，定时任务没执行，则清空定时任务，重新创建定时任务。
<br>

## 浏览器、HTTP

**问：301，304 分别代表什么？**
没想起 304 状态码。

- 301：转发或重定向
- 304：未修改，说明无需再次传输请求的内容，也就是说可以使用缓存的内容
<br>

**问：webSocket，http 区别？**
只知道 HTTP 是单向的，WebSocket 是双向的。

相同点：

- 都是基于TCP的应用层协议。
- 都使用Request/Response模型进行连接的建立。
- 在连接的建立过程中对错误的处理方式相同，在这个阶段WebSocket可能返回和HTTP相同的返回码。
- 都可以在网络中传输数据。

不同点：

- WebSocket使用HTTP来建立连接，但是定义了一系列新的header域，这些域在HTTP中并不会使用。
- WebSocket的连接不能通过中间人来转发，它必须是一个直接连接。
- WebSocket连接建立之后，通信双方都可以在任何时刻向另一方发送数据。
- WebSocket连接建立之后，数据的传输使用帧来传递，不再需要Request消息。
- WebSocket的数据帧有序。##使用WebSocket，而不是用Socket的原因：
- 因为整个浏览器都不支持直接调用系统底层的 Socket，基于浏览器的 Web 自然无法调用，只能使用封装的高级协议方案 —— WebSocket

<br>

**问：Cookie、 LocalStorage 与 SessionStorage 区别和使用场景？**
localStorage 和 sessionStorage 基本是一致的，除了生命周期不一致。前者永久保存，后者只在当前会话下生效。
Cookie 一般是后端生成的，可设置有效期、是否可读等。


## Vue

**问：vue2.x响应原理？**
vue2.x 把对象 get set 进行劫持，通过发布订阅模式进行依赖收集管理，对数组方法进行重写。
vue3 使用代理。
<br>

**问：v-if - v-show区别？**
vif 根据条件渲染，v-show 都渲染根据 display:none 来显示。
<br>

**问：平时写过哪些指令？**
拖拽、复制粘贴、高度自适应等等。
<br>

**问：父子组件和跨组件之间通信？**
props、$emit、使用事件总栈、全局状态、vuex等等。
<br>

**问：平时是Vue中有哪些性能优化？**
长列表使用虚拟滚动减少渲染节点、将没必要数据冻结或者不挂在到 data 上减少依赖收集、减小组件颗粒度方便跟小颗粒度更新组件等等。
<br>

**问：VNode的作用？**
实际上它只是一层对真实 DOM 的抽象，以 JavaScript 对象 (VNode 节点) 作为基础的树，用对象的属性来描述节点，最终可以通过一系列操作使这棵树映射到真实环境上。当需要更新 DOM  时候通过 diff 算法找出差异部分进行更新。
因为 VNode 只是一个普通 JavaScript 对象，所以当应用到非 Web 平台时，可以通过 VNode 进行解析映射到其他平台视图上。
<br>

**问：new Vue() 中做了哪些操作？**
源码太久以前看的了，没想起来具体操作了，只记得 初始化生命周期、初始化事件中心、初始化渲染、初始化data、在解析模版时做依赖收集、执行钩子函数之类的。