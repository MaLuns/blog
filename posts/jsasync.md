---
title: 深入理解 JavaScript 事件（ 第1章 ）
date: 2019-12-28 10:16:09
tags: [JavaScript]
categories: 转载
comments: true
---

事件！事件到底是怎么工作的？JavaScrip t出现了多久，对 JavaScript 异步事件模型就迷惘了多久。迷惘导致 bug，bug 导致愤怒，然后尤达大师就会教我们如何如何......不过本质上，从概念上看，JavaScript事件模型既优雅又实用。一旦大家接受了这种语言的单线程设计，就会觉得 JavaScript 事件模型更像是一种功能，而不是一种局限。它意味着我们的代码是不可中断的，也意味着调度的事件会整整齐齐排好队，有条不紊地运行。本章将介绍JavaScript的异步机制，并破除一些常见的误解。我们会看到setTimeout 真正做了些什么。接着会讨论回调中抛出错误的处理。最后会奠定本书的主旨：为了清晰和可维护性，努力组织异步代码。
 <!-- more -->

## 事件的调度 ##
如果想让 JavaScript 中的某段代码将来再运行，可以将它放在回调中。回调就是一种普通函数，只不过它是传给像 setTimeout 这样的函数，或者绑定为像 document.onready 这样的属性。运行回调时，我们称已触发某事件（譬如延时结束或页面加载完毕）。当然，可怕的总是那些细节，哪怕是像 setTimeout 这样看起来很简单的东西。对 setTimeout 的描述通常像这样：

> 给定一个回调及n毫秒的延迟，setTimeout就会在n毫秒后运行该回调。

但是，正如我们将在这一节乃至这一章里看到的，以上描述存在严重缺陷。大多数情况下，该描述只能算接近正确，而在其他情况下则完全是谬误。要想真正理解 setTimeout，必须先大体理解 JavaScript 事件模型。

### 现在还是将来运行 ###

在探究setTimeout之前，先来看一个简单的例子。该情形常常会迷惑JavaScript新手，特别是那些刚刚从Java和Ruby等多线程语言迁移过来的新手

``` javascript
    for (var i = 1; i <= 3; i++) {   
        setTimeout(function(){ 
            console.log(i); 
        }, 0); 
    };
```

4 4 4 

大多数刚接触JavaScript语言的人都会认为以上循环会输出1，2，3，或者重复输出这3个数字，因为这里的3次延时都抢着要第一个触发（每次暂停都调度为0毫秒后到时）。

要理解为什么输出是4，4，4，需要知道以下3件事。

> 1: 这里只有一个名为i的变量，其作用域由声明语句var i定义（该声明语句在不经意间让i的作用域不是循环内部，而是扩散至蕴含循环的那个最内侧函数）。
> 2: 循环结束后，i===4一直递增，直到不再满足条件i<=3为止。
> 3: JavaScript事件处理器在线程空闲之前不会运行。


前两条还属于JavaScript 101的范畴，但第三个更像是一个“惊喜”。一开始使用JavaScript的时候，我也不太相信会这样。Java令我担心自己的代码随时会被中断。上百万种潜在的边界情况让我焦虑万分，我一直在想：“要是在这两行代码之间发生了什么稀奇古怪的事，会怎么样呢？”然后，终于有一天，我再也没有这样的担心了......

### 线程的阻塞 ###
下面这段代码打破了我对JavaScript事件的成见。

``` javascript
//EventModel/loopBlockingTimeout.js 
var start = new Date; 
setTimeout(function(){ 
     var end = new Date;  
    console.log('Time elapsed:', end - start, 'ms');
}, 500);

while (new Date - start < 1000) {

};
```

按照多线程的思维定势，我会预计500毫秒后计时函数就会运行。不过这要求中断欲持续整整一秒钟的循环。如果运行代码，会得到类似这样的结果：

Time elapsed: 1002ms

大家得到的数字可能会稍有不同，这是因为setTimeout和setIn- terval一样，  其计时精度要比我们的期望值差很多（请参阅1.2.2节）。不过，这个数字肯定至少是1000，因为setTimeout回调在while循环结束运行之前不可能被触发。

那么，如果setTimeout没有使用另一个线程，那它到底在做什么呢？

### 队列 ###
调用setTimeout的时候，会有一个延时事件排入队列。然后setTimeout调用之后的那行代码运行，接着是再下一行代码，直到再也没有任何代码。这时JavaScript虚拟机才会问：“队列里都有谁啊？”

如果队列中至少有一个事件适合于“触发”（就像1000毫秒之前设定好的那个为期500毫秒的延时事件），则虚拟机会挑选一个事件，并调用此事件的处理器（譬如传给setTimeout的那个函数）。事件处理器返回后，我们又回到队列处。

输入事件的工作方式完全一样：用户单击一个已附加有单击事件处理器的DOM（Document Object Model，文档对象模型）元素时，会有一个单击事件排入队列。但是，该单击事件处理器要等到当前所有正在运行的代码均已结束后（可能还要等其他此前已排队的事件也依次结束）才会执行。因此，使用JavaScript的那些网页一不小心就会变得毫无反应。你可能听过事件循环这个术语，它是用于描述队列工作方式的。所谓事件循环，就像代码从一个循环中不断取出而运行一样：

``` javascript
runYourScript();
while (atLeastOneEventIsQueued) { 
       fireNextQueuedEvent(); 
};
```

这隐含着一个意思，即触发的每个事件都会位于堆栈轨迹的底部。关于这一点，1.4节会进一步阐述。

事件的易调度性是JavaScript语言最大的特色之一。像setTimeout这样的异步函数只是简单地做延迟执行，而不是孵化新的线程。JavaScript代码永远不会被中断，这是因为代码在运行期间只需要排队事件即可，而这些事件在代码运行结束之前不会被触发。

下一节将更细致地考查异步JavaScript代码的构造块。

## 异步函数的类型 ##

每一种JavaScript环境都有自己的异步函数集。有些函数，如setTimeout和setInterval，是各种JavaScript环境普遍都有的。另一些函数则专属于某些浏览器或某几种服务器端框架。JavaScript环境提供的异步函数通常可以分为两大类：I/O函数和计时函数。如果想在应用中定义复杂的异步行为，就要使用这两类异步函数作为基本的构造块。

### 异步的I/O函数

创造Node.js，并不是为了人们能在服务器上运行JavaScript，仅仅是因为Ryan Dahl想要一个建立在某高级语言之上的事件驱动型服务器框架。JavaScript碰巧就是适合干这个的语言。为什么？因为JavaScript语言可以完美地实现非阻塞式I/O。

在其他语言中，一不小心就会“阻塞”应用（通常是运行循环）直到完成I/O请求为止。而在JavaScript中，这种阻塞方式几乎沦为无稽之谈。类似如下的循环将永远运行下去，不可能停下来。

``` js
var ajaxRequest = new XMLHttpRequest; 
ajaxRequest.open('GET', url); 
ajaxRequest.send(null); 
while (ajaxRequest.readyState === XMLHttpRequest.UNSENT) {  
     // readyState在循环返回之前不会有更改。
}; 
```

相反，我们需要附加一个事件处理器，随即返回事件队列。

``` js
var ajaxRequest = new XMLHttpRequest; 
ajaxRequest.open('GET', url);
ajaxRequest.send(null); 
ajaxRequest.onreadystatechange = function() {  
    // ... 
};
```

就是这么回事。不论是在等待用户的按键行为，还是在等待远程服务器的批量数据，所需要做的就是定义一个回调，除非JavaScript环境提供的某个同步I/O函数已经替我们完成了阻塞。

在浏览器端，Ajax方法有一个可设置为false的async选项（但永远、永远别这么做），这会挂起整个浏览器窗格直到收到应答为止。在Node.js中，同步的API方法在名称上会有明确的标示，譬如fs.readFileSync。编写短小的脚本时，这些同步方法会很方便。但是，如果所编写的应用需要处理并行的多个请求或多项操作，则应该避免使用它们。可在今天，还有哪个应用不是这样的呢？

有些I/O函数既有同步效应，也有异步效应。举例来说，在现代浏览器中操纵DOM对象时，从脚本角度看，更改是即时生效的，但从视效角度看，在返回事件队列之前不会渲染这些DOM对象更改。这可以防止DOM对象被渲染成不一致的状态。

>console.log是异步的吗？

WebKit的console.log由于表现出异步行为而让很多开发者惊诧不已。在Chrome或Safari中，以下这段代码会在控制台记录{foo:bar}。

``` js
var obj = {};    
console.log(obj);    
obj.foo = 'bar';
```

怎么会这样？We b K i t的console.log并没有立即拍摄对象快照，相反，它只存储了一个指向对象的引用，然后在代码返回事件队列时才去拍摄快照。Node的console.log是另一回事，它是严格同步的，因此同样的代码输出的却为{}。

JavaScript采用了非阻塞式I/O，这对新手来说是最大的一个障碍，但这同样也是该语言的核心优势之一。有了非阻塞式I/O，就能自然而然地写出高效的基于事件的代码。

### 异步的计时函数 ###

我们已经看到，异步函数非常适合用于I/O操作，但有些时候，我们仅仅是因为需要异步而想要异步性。换句话说，我们想让一个函数在将来某个时刻再运行——这样的函数可能是为了作动画或模拟。基于时间的事件涉及两个著名的函数，即setTimeout与setInterval。遗憾的是，这两个著名的计时器函数都有自己的一些缺陷。正如我们在1.1.2节中看到的，其中有个缺陷是无法弥补的：当同一个JavaScript进程正运行着代码时，任何JavaScript计时函数都无法使其他代码运行起来。但是，即便容忍了这一局限性，setTimeout及setInterval的不确定性也会令人犯怵。下面是一个示例。

``` js
var fireCount = 0; 
var start = new Date; 
var timer = setInterval(function() {
     if (new Date-start > 1000) { 
            clearInterval(timer);     
            console.log(fireCount);   
            return;   
    }   
    fireCount++; 
}, 0);
```

如果使用setInterval调度事件且延迟设定为0毫秒，则会尽可能频繁地运行此事件，对吗？那么，在运行于高速英特尔i7处理器之上的现代浏览器中，此事件的触发频率到底如何呢？

大约为200次/秒。这是Chrome、Safari和Firefox等浏览器的平均值。在Node环境下，此事件的触发频率大约能达到1000次/秒。（若使用setTimeout来调度事件，重复这些实验也会得到类似的结果。）作为对比，如果将setInterval替换成简单的while循环，则在Chrome中此事件的触发频率将达到400万次/秒，而在Node中会达到500万次/秒

这是怎么回事？最后我们发现，setTimeout和setInterval就是想设计成慢吞吞的！事实上，HTML规范（这是所有主要浏览器都遵守的规范）推行的延时/时隔的最小值就是4毫秒！

那么，如果需要更细粒度的计时，该怎么办呢？有些运行时环境提供了备选方案。

>1: 在Node中，process.nextTick允许将事件调度成尽可能快地触发。对于笔者的系统，process.nextTick事件的触发频率可以超过10万次/秒。
>2: 一些现代浏览器（含IE9+）带有一个requestAnimationFrame函数。此函数有两个目标：一方面，它允许以60+帧/秒的速度运行JavaScript动画；另一方面，它又避免后台选项卡运行这些动画，从而节约CPU周期。在最新版的Chrome浏览器中，甚至能实现亚毫秒级的精度

尽管这些计时函数是异步JavaScript混饭吃的家伙什儿，但永远不要忘记，setTimeout和setInterval就是些不精确的计时工具。在Node中，如果只是想产生一个短时延迟，请使用process.nextTick。在浏览器端，请尝试使用垫片技术（shim）③：在支持requestAnimationFrame的浏览器中，推荐使用requestAnimationFrame；在不支持requestAnimationFrame的浏览器中，则退而使用setTimeout。

到这里，关于JavaScript基本异步函数的简要概览就结束了。但怎样才能知道一个函数到底何时异步呢？下一节中，我们在亲自编写异步函数的同时再思考这个问题

## 异步函数的编写 ##

JavaScript中的每个异步函数都构建在其他某个或某些异步函数之上。凡是异步函数，从上到下（一直到原生代码）都是异步的！

反之亦然：任何函数只要使用了异步的函数，就必须以异步的方式给出其操作结果。正如我们在1.1.2节学到的，JavaScript并没有提供一种机制以阻止函数在其异步操作结束之前返回。事实上，除非函数返回，否则不会触发任何异步事件。

本节将考察异步函数设计的一些常见模式。我们将看到有些函数如反复无常的小人，非得等到特定时候才下决心成为异步的。不过，我们先来精确地定义异步函数。

### 何时称函数为异步的 ###

异步函数这个术语有点名不副实：调用一个函数时，程序只在该函数返回之后才能继续。JavaScript写手如果称一个函数为“异步的”，其意思是这个函数会导致将来再运行另一个函数，后者取自于事件队列（若后面这个函数是作为参数传递给前者的，则称其为回调函数，简称为回调）  。于是，一个取用回调的异步函数永远都能通过以下测试

``` js
var functionHasReturned = false; 
asyncFunction(function() {  
     console.assert(functionHasReturned); 
}); 
functionHasReturned = true;
```

异步函数还涉及另一个术语，即非阻塞。非阻塞这个词强调了异步函数的高速度：异步MySQL数据库驱动程序做一个查询可能要花上一小时，但负责发送查询请求的那个函数却能以微秒级速度返回。这对于那些需要快速处理海量请求的网站服务器来说，绝对是个福音。

通常，那些取用回调的函数都会将其作为自己的最后一个参数。（可惜的是，老资格的setTimeout和setInterval都是这一约定的特例。）不过，有些异步函数也会间接取用回调，它们会返回Promise对象或使用PubSub模式。本书稍后就会介绍这些异步设计模式。

遗憾的是，要想确认某个函数异步与否，唯一的方法就是审查其源代码。有些同步函数却拥有看起来像是异步的API，这或者是因为它们将来可能会变成异步的，又或者是因为回调这种形式能方便地返回多个参数。一旦存疑，请别指望函数就是异步的。

### 间或异步的函数 ###

有些函数某些时候是异步的，但其他时候却不然。举个例子，jQuery的同名函数（通常记作$）可用于延迟函数直至DOM已经结束加载。但是，若DOM早已结束了加载，则不存在任何延迟，$的回调将会立即触发。

不注意的话，这种行为的不可预知性会带来很多麻烦。我曾经看到也犯过这样一个错误，即假定$会在已加载本页面其他脚本之后再运行一个函数。

``` js
// application.js 
$(function () {
    utils.log('Ready');
});

// utils.js 
window.utils = {
    log: function () {
        if (window.console)
            console.log.apply(console, arguments);
    }
};

<script src ＝"application.js" ></script >
<script src ＝"util.js" ></script >
```
这段代码运行得很好，但前提是浏览器并未从缓存中加载页面（这会导致DOM早在脚本运行之前就已加载就绪）。如果出现这种情况，传递给$的回调就会在设置utils.log之前运行，从而导致一个错误。（为了避免这种情况，应该采用一种更现代的管理客户端依赖性的方法。请参阅第6章。）

下面来看另一个例子。

### 缓存型异步函数 ###
间或异步的函数有一个常见变种是可缓存结果的异步请求类函数。举例来说，假设正在编写一个基于浏览器的计算器，它使用了网页Wo r k e r对象以单独开一个线程来进行计算。（第5章将介绍网页Worker对象的API。）主脚本看起来像这样：

``` js
var calculationCache = {},
    calculationCallbacks = {},
    mathWorker = new Worker('calculator.js');

mathWorker.addEventListener('message', function(e) { 
    var message = e.data;   
    calculationCache[message.formula] = message.result;   
    calculationCallbacks[message.formula](message.result); 
}); 

function runCalculation(formula, callback) { 
    if (formula in calculationCache) { 
        return callback(calculationCache[formula]);   
    };  
    
    if (formula in calculationCallbacks) {  
        return setTimeout(function() {       
            runCalculation(formula, callback);    
        }, 0);   
    };   

    mathWorker.postMessage(formula);   
    calculationCallbacks[formula] = callback; 
} 

```

在这里，当结果已经缓存时，runCalculation函数是同步的，否则就是异步的。
存在3种可能的情景。

1: 公式已经计算完成，于是结果位于calculationCache中。这种情况下，runCalculation是同步的。
2: 公式已经发送给Worker对象，但尚未收到结果。这种情况下，runCalculation设定了一个延时以便再次调用自身；重复这一过程直到结果位于calculationCache中为止。
3: 公式尚未发送给Worker对象。这种情况下，将会从Worker对象的'message'事件监听器激活回调。

请注意，在第2种和第3种情景中，我们按照两种不同的方式来等待任务的完成。这个例子写成这样，就是为了演示依据哪几种常见方式来等待某些东西发生改变（如缓存型计算公式的值）。是不是应该倾向于其中某种方式呢？我们接着往下看。

### 异步递归与回调存储 ###

在runCalculation函数中，为了等待Worker对象完成自己的工作，或者通过延时而重复相同的函数调用（即异步递归），或者简单地存储回调结果。

哪种方式更好呢？乍一看，只使用异步递归是最简单的，因为这里不再需要calculationCallbacks对象。出于这个目的，JavaScript新手常常会使用setTimeout，因为它很像线程型语言的风格。此程序的Java版本可能会有这样一个循环：

``` js
while (!calculationCache.get(formula)) {
     Thread.sleep(0); 
}; 
```

但是，延时并不是免费的午餐。大量延时的话，会造成巨大的计算荷载。异步递归有一点很可怕，即在等待任务完成期间，可触发之延时的次数是不受限的！此外，异步递归还毫无必要地复杂化了应用程序的事件结构。基于这些原因，应将异步递归视作一种“反模式”的方式。

在这个计算器例子中，为了避免异步递归，可以为每个公式存储一个回调数组。

```js
var calculationCache = {},     
    calculationCallbacks = {},     
    mathWorker = new Worker('calculator.js'); 

mathWorker.addEventListener('message', function(e) { 
    var message = e.data;   
    calculationCache[message.formula] = message.result;   
    calculationCallbacks[message.formula].forEach(function(callback) {     
        callback(message.result);   
    }); 
}); 

function runCalculation(formula, callback) {  
    if (formula in calculationCache) {
         return callback(calculationCache[formula]);   
    }; 

    if (formula in calculationCallbacks) { 
        return calculationCallbacks[formula].push(callback);   
    };   

    mathWorker.postMessage(formula);   
    calculationCallbacks[formula] = [callback]; 
} 
```

没有了延时，我们的代码要直观得多，也高效得多。

总的来说，请避免异步递归。仅当所采用的库提供了异步功能但没有提供任何形式的回调机制时，异步递归才有必要。如果真的遇到这种情况，要做的第一件事应该是为该库写一个补丁。或者，干脆找一个更好的库。

### 返值与回调的混搭 ###

在以上两种runCalculation实现中，有时会用到返值技术。这是出于简洁的目的而随意作出的选择。下面这行代码

``` js 
return callback(calculationCache[formula]);  
```

很容易即可改写成

``` js 
callback(calculationCache[formula]); 
return; 
```

这是因为并没有打算使用这个返值。这是JavaScript的一种普遍做法，而且通常无害。

不过，有些函数既返回有用的值，又要取用回调。这类情况下，切记回调有可能被同步调用（返值之前），也有可能被异步调用（返值之后）。永远不要定义一个潜在同步而返值却有可能用于回调的函数。举个例子，下面这个负责打开WebSocket连接以连至给定服务器的函数（使用缓存技术以确保每个服务器只有一个连接）就违反了上述规则。

``` js
var webSocketCache = {}; 
function openWebSocket(serverAddress, callback) { 
    var socket; 
    if (serverAddress in webSocketCache) {     
        socket = webSocketCache[serverAddress]; 
        if (socket.readyState === WebSocket.OPEN) {       
            callback();     
        } else {       
            socket.onopen = _.compose(callback, socket.onopen);    
        };   
    } else {     
        socket = new WebSocket(serverAddress);     
        webSocketCache[serverAddress] = socket;
        socket.onopen = callback;   
    };  

    return socket; 
}; 
```

（这段代码依赖于Underscore.js库。_.compose定义的这个新函数既运行了callback，又运行了初始的socket.onopen回调。）这段代码的问题在于，如果套接字已经缓存且打开，则会在函数返值之前就运行回调，这会使以下代码崩溃。

```js
var socket = openWebSocket(url, function() {   
    socket.send('Hello, server!'); 
});
```

怎么解决呢？将回调封装在setTimeout中即可。

```js
if (socket.readyState === WebSocket.OPEN) {   
    setTimeout(callback, 0);
 } else {  
     // ... 
}
```

这里使用延时会让人感觉是在东拼西凑，但这总比API自相矛盾要好得多。

在本节中，我们看到了一些编写异步函数的最佳实践。请勿依赖那些看似始终异步的函数，除非已经阅读其源代码。请避免使用计时器方法来等待某个会变化的东西。如果同一个函数既返值又运行回调，则请确保回调在返值之后才运行。

一次消化这些信息确实太多了一点，不过，编写好的异步函数确实是写出优秀JavaScript代码的关键所在。

## 异步错误的处理 ##

像很多时髦的语言一样，JavaScript也允许抛出异常，随后再用一个try/catch语句块捕获。如果抛出的异常未被捕获，大多数JavaScript环境都会提供一个有用的堆栈轨迹。举个例子，下面这段代码由于'{'为无效JSON对象而抛出异常。

```js
//EventModel/stackTrace.js 
function JSONToObject(jsonStr) { 
    return JSON.parse(jsonStr);
} 
var obj = JSONToObject('{');  

SyntaxError: Unexpected end of input     
    at Object.parse (native)     
    at JSONToObject (/AsyncJS/stackTrace.js:2:15)     
    at Object.<anonymous> (/AsyncJS/stackTrace.js:4:11) 
```

堆栈轨迹不仅告诉我们哪里抛出了错误，而且说明了最初出错的地方：第4行代码。遗憾的是，自顶向下地跟踪异步错误起源并不都这么直截了当。在本节中，我们会看到为什么throw很少用作回调内错误处理的正确工具，还会了解如何设计异步API以绕开这一局限。

### 回调内抛出的错误 ###

如果从异步回调中抛出错误，会发生什么事？让我们先来做个测试。

```js
//EventModel/nestedErrors.js 
setTimeout(function A() {   
    setTimeout(function B() { 
        setTimeout(function C() { 
            throw new Error('Something terrible has happened!');     
        }, 0);   
    }, 0); 
}, 0); 
```

上述应用的结果是一条极其简短的堆栈轨迹。

```
Error: Something terrible has happened!     
    at Timer.C (/AsyncJS/nestedErrors.js:4:13) 
```

等等，A和B发生了什么事？为什么它们没有出现在堆栈轨迹中？这是因为运行C的时候，A和B并不在内存堆栈里。这3个函数都是从事件队列直接运行的。

基于同样的理由，利用try/catch语句块并不能捕获从异步回调中抛出的错误。下面进行演示。

```js
try {   
    setTimeout(function() {
         throw new Error('Catch me if you can!');   
    }, 0); 
} catch (e) {  
    console.error(e);
} 
```

看到这里的问题了吗？这里的try/catch语句块只捕获setTimeout函数自身内部发生的那些错误。因为setTimeout异步地运行其回调，所以即使延时设置为0，回调抛出的错误也会直接流向应用程序的未捕获异常处理器（请参阅1.4.2节）

总的来说，取用异步回调的函数即使包装上try/catch语句块，也只是无用之举。（特例是，该异步函数确实是在同步地做某些事且容易出错。例如，Node的fs.watch(file,callback)就是这样一个函数，它在目标文件不存在时会抛出一个错误。）正因为此，Node.js中的回调几乎总是接受一个错误作为其首个参数，这样就允许回调自己来决定如何处理这个错误。举个例子，下面这个Node应用尝试异步地读取一个文件，还负责记录下任何错误（如“文件不存在”）。

```js
//EventModel/readFile.js 
var fs = require('fs'); 
fs.readFile('fhgwgdz.txt', function(err, data) { 
    if (err) { 
        return console.error(err);   
    };   
    console.log(data.toString('utf8')); 
}); 
```

客户端JavaScript库的一致性要稍微差些，不过最常见的模式是，针对成败这两种情形各规定一个单独的回调。jQuery的Ajax方法就遵循了这个模式。

```js
$.get('/data', {  
     success: successHandler,   
     failure: failureHandler }); 
```
不管API形态像什么，始终要记住的是，只能在回调内部处理源于回调的异步错误。异步尤达大师会说：“做，或者不做，没有试试看一说。”

### 未捕获异常的处理 ###
如果是从回调中抛出异常的，则由那个调用了回调的人负责捕获该异常。但如果异常从未被捕获，又会怎么样？这时，不同的JavaScript图环境有着不同的游戏规则......

1.在浏览器环境中现代浏览器会在开发人员控制台显示那些未捕获的异常，接着返回事件队列。要想修改这种行为，可以给window.onerror附加一个处理器。如果windows.onerror处理器返回true，则能阻止浏览器的默认错误处理行为。

```js
window.onerror = function(err) { 
    return true;  
    //彻底忽略所有错误
}; 
```

在成品应用中，会考虑某种JavaScript错误处理服务，譬如Errorception①。Errorception提供了一个现成的windows.onerror处理器，它向应用服务器报告所有未捕获的异常，接着应用服务器发送消息通知我们。

2.在Node.js环境中在Node环境中，window.onerror的类似物就是process对象的uncaughtException事件。正常情况下，Node应用会因未捕获的异常而立即退出。但只要至少还有一个uncaughtException事件处理器，Node应用就会直接返回事件队列。

```js
process.on('uncaughtException', function(err) {   
    console.error(err);  
    //避免了关停的命运！
}); 
```

但是，自Node  0.8.4起，uncaughtException事件就被废弃了。据其文档所言，对异常处理而言，uncaughtException是一种非常粗暴的机制，它在将来可能会被放弃......

>请勿使用uncaughtException，而应使用Domain对象。Domain对象又是什么？你可能会这样问。

Domain对象是事件化对象（第2章会详细讨论），它将throw转化为'error'事件。下面是一个例子。

```js
//EventModel/domainThrow.js 
var myDomain = require('domain').create();
myDomain.run(function () {
    setTimeout(function () {
        throw new Error('Listen to me!')
    }, 50);
});
myDomain.on('error', function (err) {
    console.log('Error ignored!');
}); 
```

源于延时事件的throw只是简单地触发了Domain对象的错误处理器。 
Error ignored!   
很奇妙，是不是？Domain对象让throw语句生动了很多。遗憾的是，仅在Node  0.8+环境中才能使用Domain对象；在我写作本书时，Domain对象仍被视作试验性的特性。更多信息请参阅Node文档。②不管在浏览器端还是服务器端，全局的异常处理器都应被视作最后一根救命稻草。请仅在调试时才使用它。

### 抛出还是不抛出 ###
遇到错误时，最简单的解决方法就是抛出这个错误。在Node代码中，大家会经常看到类似这样的回调：

``` js
function(err) {
    if (err) throw err;   // ... 
}
```

在第4章中，我们会经常沿用这一做法。但是，在成品应用中，允许例行的异常及致命的错误像踢皮球一样踢给全局处理器，这是不可接受的。回调中的throw相当于JavaScript写手在说“现在我还不想考虑这个”。

如果抛出那些自己知道肯定会被捕获的异常呢？这种做法同样凶险万分。2011年，Isaac Schlueter（npm的开发者，在任的Node开发负责人）就主张try/catch是一种“反模式”的方式。
>try/catch只是包装着漂亮花括弧的goto语句。一旦跑去处理错误，就无法回到中断之处继续向下执行。更糟糕的是，通过throw语句的代码，完全不知道自己会跳到什么地方。返回错误码的时候，就相当于正在履行合约。抛出错误的时候，就好像在说，“我知道我正在和你说话，但我现在不想搭理你，我要先找你老板谈谈”，这太粗俗无礼了。如果不是什么紧急情况，请别这么做；如果确实是紧急情况，则应该直接崩溃掉。

Schlueter提倡完全将throw用作断言似的构造结构，作为一种挂起应用的方式——当应用在做完全没预料到的事时，即挂起应用。Node社区主要遵循这一建议，尽管这种情况可能会随着Domain对象的出现而改变。

那么，关于异步错误的处理，目前的最佳实践是什么呢？我认为应该听从Schlueter的建议：如果想让整个应用停止工作，请勇往直前地大胆使用throw。否则，请认真考虑一下应该如何处理错误。是想给用户显示一条出错消息吗？是想重试请求吗？还是想唱一曲“雏菊铃之歌”？那就这么处理吧，只是请尽可能地靠近错误源头。

## 嵌套式回调的解嵌套 ##

JavaScript中最常见的反模式做法是，回调内部再嵌套回调。还记得前言里提到的金字塔厄运吗？我们先来看一个具体的例子，你也可能在Node服务器上看到过类似的代码。

```js
function checkPassword(username, passwordGuess, callback) {
    var queryStr = 'SELECT * FROM user WHERE username = ?';
    db.query(queryStr, username,
        function (err, result) {
            if (err) throw err; 
            hash(passwordGuess,function (passwordGuessHash) {
                    callback(passwordGuessHash === result['password_hash']);
            });
        });
} 
```

这里定义了一个异步函数checkPassword，它触发了另一个异步函数db.query，而后者又可能触发另外一个异步函数hash。（在之前，无法确认这些函数是否真的异步，但这里的几个函数理应如此。）

这段代码有什么问题呢？目前为止，没有任何问题。它能用，而且简洁明了。但是，如果试图向其添加新特性，它就会变得毛里毛躁、险象环生，比如去处理那个数据库错误，而不是抛出错误（请参阅1.4.3节）、记录尝试访问数据库的次数、阻塞访问数据库，等等。

嵌套式回调诱惑我们通过添加更多代码来添加更多特性，而不是将这些特性实现为可管理、可重用的代码片段。checkPassword有一种可以避免出现上述苗头的等价实现方式，如下：

```js
function checkPassword(username, passwordGuess, callback) {
    var passwordHash; var queryStr = 'SELECT * FROM user WHERE username = ?';
    db.query(qyeryStr, username, queryCallback);

    function queryCallback(err, result) {
        if (err) throw err; passwordHash = result['password_hash'];
        hash(passwordGuess, hashCallback);
    }

    function hashCallback(passwordGuessHash) {
        callback(passwordHash === passwordGuessHash);
    }
}
```

这种写法更啰嗦一些，但读起来更清晰，也更容易扩展。由于这里赋予了异步结果（即passwordHash）更宽广的作用域，所以获得了更大的灵活性。
按照惯例，请避免两层以上的函数嵌套。关键是找到一种在激活异步调用之函数的外部存储异步结果的方式，这样回调本身就没有必要再嵌套了。

如果这样听起来有点诘聱难懂，请别担心。我们在后续几章中会看到大量的异步事件例子，那里的异步事件顺序运行且没有嵌套式事件处理器。