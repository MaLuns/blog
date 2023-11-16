---
title: Web Components
date: 2020-05-10 10:16:09
tags: [WebComponents]
categories: 记录类
comments: true
keywords: js组件,影子DOM,Shadow DOM,自定义元素,Custom elements,HTML模板
---
组件是前端的发展方向，现在流行的 React 和 Vue 都是组件框架。如今 Web Components 被越来越多的浏览器所支持，Web Components 或许是未来的方向。
<!-- more -->
Web Components 的组成主要是由这三种组成，它们可以封装自定义功能的元素，可以在你喜欢的任何地方重用，不必担心代码冲突。
- Custom elements（自定义元素）：允许自定义一个标签，以及一些操作，然后可以像普通标签一样使用它
- Shadow DOM（影子DOM）：可以对脚本和样式进行隔离，不用担心外部对其由影响
- HTML templates（HTML模板）：\<template\> 和 \<slot\> 元素使您可以编写不在呈现页面中显示的标记模板。然后它们可以作为自定义元素结构的基础被多次重用。

## 自定义元素 ##

CustomElementRegistry 接口的实例用来注册一个自定义元素，window.customElements 获取去到 CustomElementRegistry 实例。customElements.define() 方法用来注册一个 custom element，该方法接受以下参数：
- 表示所创建的元素名称的符合 DOMString 标准的字符串。注意，custom element 的名称不能是单个单词，且其中必须要有短横线。
- 用于定义元素行为的 类 。
- 可选参数，一个包含 extends 属性的配置对象，是可选参数。它指定了所创建的元素继承自哪个内置元素，可以继承任何内置元素。

像这样定义一个自定义元素\<user-p>，并且继承元素\<p>

``` js
customElements.define(
    'user-p', 
    class UserP extends HTMLParagraphElement {
        constructor() {
            // 必须首先调用父类构造方法
            super()
        }
    },
    {
        extends: 'p' 
    }
)
```
自定义元素的使用也分两种情况
一种是如果元素不继承其他内建 HTML 元素,只继承 HTMLElement，可以直接像普通标签一样使用
``` html
<user-p></user-p>
//或者这样
<script>
    document.createElement('user-p')
</script>
```
如果是继承了其他元素，比如像上面那个例子 HTMLParagraphElement 
``` html
<p is='user-p'></p>
//或者这样
<script>
    document.createElement('p',{is:'user-p'})
</script>
```
### 生命周期回调函数 ###
- connectedCallback：首次被插入文档DOM时，被调用。
- disconnectedCallback：从文档DOM中删除时，被调用。
- adoptedCallback：被移动到新的文档时，被调用。
- attributeChangedCallback:增加、删除、修改自身属性时，被调用。

如果需要在元素属性变化后，触发 attributeChangedCallback()回调函数，你必须监听这个属性。这可以通过定义 observedAttributes() get函数来实现，observedAttributes()函数体内包含一个 return 语句，返回一个数组，包含了需要监听的属性名称：
``` js
static get observedAttributes() {return ['name', 'style']; }
```

## Shadow DOM ##
Shadow DOM 可以将一个隐藏的、独立的 DOM 附加到一个元素上，可以将标记结构、样式和行为隐藏起来，并与页面上的其他代码相隔离，保证不同的部分不会混在一起，可使代码更加干净、整洁。
- Shadow host：一个常规 DOM 节点，Shadow DOM 会被附加到这个节点上。
- Shadow tree：Shadow DOM 内部的 DOM 树。
- Shadow boundary：Shadow DOM 结束的地方，也是常规 DOM 开始的地方。
- Shadow root: Shadow tree 的根节点。

像\<video>就是用 Shadow DOM 封装的

![](/images/posts/webcomponents/20200510202839.png)

### 自定义Shadow DOM ###
可以使用 Element.attachShadow() 方法来将一个 shadow root 附加到任何一个元素上,方法接受一个参数
```js
attachShadow 参数
{
    mode:'open'|'closed', 
    //open 表示外部可以访问根节点,例如 Element.shadowRoot 
    //closed 表示不允许外部访问

    delegatesFocus:true|false
    //焦点委托
}
```

简单例子

``` html
<style>
    .demo{
        color:red !important;
    }
    .test{
        font-size:20px;
    }
</style>
<div class='test'>
    <div id='demo'>
        你的浏览器不支持 Shadow DOM 
    </div>
</div>  
<script>
      let demo = document.getElementById('demo').attachShadow({ mode: 'open' })
      var style = document.createElement('style');
      style.textContent = `
      .demo {
          color: #38acfa;
      }
      :host{
          border:5px  dashed #3699ff;
      }
      :host-context(.test){
          background:#000;
      }
      :host(#demo){
          height:60px;
          margin: 20px;
      }`
      demo.innerHTML = '<div class="demo">自定义Shadow DOM</div>'
      demo.appendChild(style)
</script>

```
效果如下，可以看到外部样式是不会影响里面元素的，但是如果是样式是继承祖先元素的是会穿透进去的

这三个都是用来选定 宿主元素 的
- :host 当前 ShadowDOM 宿主元素
- :host() 在宿主元素上查找，比如上面的 :host(#demo) 就是当宿主元素 id='demo' 时候生效
- :host-context() 在当前 ShadowDOM 宿主元素的祖先节点中查找，比如 :host-context(.test) 可以一直往宿主元素祖先上找，符合就生效

<br>
<style>
    .demo{
        color:red !important;
    }
    .test{
        font-size:20px;
    }
</style>
<div class='test'>
    <div id='demo'>
        你的浏览器不支持 Shadow DOM 
    </div>
</div>  
<script>
      let demo = document.getElementById('demo').attachShadow({ mode: 'open' })
      var style = document.createElement('style');
      style.textContent = `
      .demo {
          color: #38acfa;
      }
      :host{
          border:5px  dashed #3699ff;
      }
      :host-context(.test){
          background:#000;
      }
      :host(#demo){
          height:60px;
          margin: 20px;
      }`
      demo.innerHTML = '<div class="demo">自定义Shadow DOM</div>'
      demo.appendChild(style)
</script>


## HTML模板 ##
template 主要作用就是避免重复去创建那些标签结构。比如当一个组件被重复使用时候，如果不用模板的话，会一遍又一遍的去创建组件类的标签结构，使用 template 这样会避免这样重复的创建标签结构。

template 不会再 DOM 上显示，举例：
``` html
<template id="my-template">
    <div>
        HTML 模板
    </div>
</template>
```
使用 js 去获取它

``` js
let template = document.getElementById('my-template');
document.body.appendChild(template.content);
```

## 组合使用 ##

``` html
<my-div image='/images/logo/admin_template.png'>
    <div slot='header'>Web Components</div>
    <div slot='footer'>
        slot footer
    </div>
</my-div>

<template id="my-template">
    <style>
        .card{
            padding: 10px 20px;
            box-shadow: 0 0 5px 0 #00000038;
            border-radius: 5px;
            display: inline-block;
        }
        ul {
            list-style: disc;
            padding-left: 1.5em;
        }
        li {
            height: 30px;
        }
        li+li {
            border-top: 1px solid #f1f1f1;
        }
        img{
            width:250px
        }
        .header{
            margin-bottom: 10px;
            border-bottom: 1px solid #f1f1f1;
        }
        .footer{
            margin-top: 10px;
            border-top: 1px solid #f1f1f1;
        }
    </style>
    <div class='card'>
        <div class='header'>
            <slot name='header'></slot>
        </div>
        <img>
        <div class='footer'>
            <slot name='footer'></slot>
        </div>
    </div>
</template>

<script>
    customElements.define('my-div',
        class extends HTMLElement {
            constructor() {
                super();
                let template = document.getElementById('my-template');
                let templateContent = template.content.cloneNode(true);

                const shadowRoot = this.attachShadow({ mode: 'open' })

                templateContent.querySelector('img').setAttribute('src', this.getAttribute('image'));
                shadowRoot.appendChild(templateContent);
            }
        })
</script>

```

<my-div image='/images/logo/web_conponents.png'>
    <div slot='header'>Web Components</div>
    <div slot='footer'>
        slot footer
    </div>
</my-div>

<template id="my-template">
    <style>
        .card{
            padding: 10px 20px;
            box-shadow: 0 0 5px 0 #00000038;
            border-radius: 5px;
            display: inline-block;
        }
        ul {
            list-style: disc;
            padding-left: 1.5em;
        }
        li {
            height: 30px;
        }
        li+li {
            border-top: 1px solid #f1f1f1;
        }
        img{
            width:250px
        }
        .header{
            margin-bottom: 10px;
            border-bottom: 1px solid #f1f1f1;
        }
        .footer{
            margin-top: 10px;
            border-top: 1px solid #f1f1f1;
        }
    </style>
    <div class='card'>
        <div class='header'>
            <slot name='header'></slot>
        </div>
        <img>
        <div class='footer'>
            <slot name='footer'></slot>
        </div>
    </div>
</template>

<script>
    customElements.define('my-div',
        class extends HTMLElement {
            constructor() {
                super();
                let template = document.getElementById('my-template');
                let templateContent = template.content.cloneNode(true);

                const shadowRoot = this.attachShadow({ mode: 'open' })

                templateContent.querySelector('img').setAttribute('src', this.getAttribute('image'));
                shadowRoot.appendChild(templateContent);
            }
        })
</script>
