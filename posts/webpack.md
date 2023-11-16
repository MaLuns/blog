---
title: 解读 webpack 打包后js
date: 2019-11-20 10:16:09
tags: [webpack]
categories: 记录类
comments: true
---

首先新建 index.js,a.js,b.js 三个文件,index.js 配置为入口,index.js 分别加载a.js,b.js文件, b.js加载a.js文件,js中代码如下
<!-- more -->

``` javascript
//index.js
require('./a.js')()
require('./b.js')
```

``` javascript
//a.js
console.log(1)
function test(){
    console.log(3)
}
module.exports = test
```

``` javascript
//b.js
console.log(2)
require('./a.js')()
```


对文件进行打包,打包结果如下

``` javascript 
/******/ (function(modules) { 
/******/ 	var installedModules = {}; //对模块进行缓存
/******/
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		if(installedModules[moduleId]) {//有缓存 直接返回 exports
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/                //加载模块
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 		module.l = true;
/******/ 		return module.exports; //返回 exports
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	return __webpack_require__(__webpack_require__.s = 1);//加载入口 并返回exports
/******/ })
/************************************************************************/
([
function(module, exports, __webpack_require__){
    "use strict";
        console.log(1);
        function test(){
            console.log(3)
        }
        module.exports = test
},
function(module, exports, __webpack_require__){
    "use strict";
        __webpack_require__(0)();
        __webpack_require__(2);
},
function(module, exports, __webpack_require__){
    "use strict";
        console.log(2)
        __webpack_require__(0)();
}])
```

> 可以看到 webpack 打包后js 是一个自执行匿名函数,而我们的所有模块被打包成了一个数组传入匿名函数中(modules),其中每个元素代表一个模块.然后通过  __webpack_require__(__webpack_require__.s = 1) 加载入口模块.调用 __webpack_require__ 方法会接收一个模块ID(对应数组下标),然后检查 installedModules 变量是否已存在对应模块,如果已存在会直接返回当前模块module.exports,否则会先去加载模块,再返回module.exports 

执行结果 1323
