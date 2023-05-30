---
title: 打造自己的Vue组件文档生成工具
comments: true
date: 2021-07-29 10:44:00
tags: [vue]
categories: 记录类
keywords: vue,ast,文档生成
---

程序员最讨厌的两件事情，第一种是写文档，另一种是别人没有写文档。有没有直接根据 vue 组件生成文档的呢？当然是有的的。但第三方使用起来不一定能和现有项目结合使用，往往需要额外的注释用来标记提取信息。<!--more -->
使用第三方的一些比较常见问题
- 文档提取信息不全面，可能有些信息你需要提取但是它又不支持。这种情况下就只能修改三方的插件源码了。
- 需要额为的注释信息来标记，例如 **vuese** 需要给方法 打 **@vuese**、**@arg** 等标记来提供方法信息。

俗话说自己动手丰衣足食，打造自己的 vue 文档生成工具与自己项目结合使用。一个组件文档大致需要提供 **组件名称和描述(name)**、**组件属性(props)**、**组件方法(methods)**、**组件事件(event)**、**插槽(slot)** 这几个部分，以及还需要这个几个部分的注释组成生成描述信息。接下来一步步实现对着几个部分的提取实现。

##  解析.vue 文件

一般一个 .vue 文件分三个部分 **template**、**script**、**style**、**style**部分的内容我们不需要，我们需要分别提取出 **template** 和 **script** 内容。Vue官方开发了 **Vue-template-compiler** 库专门用于 Vue 解析，我们可以直接使用它来解析提取 .vue 文件， **Vue-template-compiler**  提供了一个 **parseComponent** 方法可以对原始的 Vue 文件进行处理。

``` js
const compiler = require('vue-template-compiler')
const result = compiler.parseComponent(vueStr, [options])

// parseComponent 返回  template、script、style内容，
export interface SFCDescriptor {
  template: SFCBlock | undefined;
  script: SFCBlock | undefined;
  styles: SFCBlock[];
  customBlocks: SFCBlock[];
}
```

拿到各个部分文本后，还需要将它转成 ast(抽象语法树)，**template** 部分内容可以直接使用 **Vue-template-compiler** 提供的 **compile** 方法直接生成ast， **script**部分需要借助其他的生成 ast了，这里使用 **babel** 的模块来处理 js 文本。

``` js
const compiler = require('vue-template-compiler')
//vueStr .vue 文件内容
const vue = compiler.parseComponent(vueStr)

//生成html部分的 ast 
let template = compiler.compile(vue.template.content, {
    preserveWhitespace: false,
    comments: true // 生成注释信息
})
```

使用 **@babel/parser**（Babel解析器,是Babel中使用的JavaScript解析器）来处理 js 文本内容。

``` js
const parse = require('@babel/parser');

//生成js部分的 ast
let jsAst = parse.parse(vue.script.content, {
    allowImportExportEverywhere: true 
})
```

## 提取文档信息

通过上一步的文件解析工作，我们成功获取到了 Vue 的模板 ast 和 script 中的 js 的 ast，下一步我们就可以从中获取我们想要的信息了。这里需要使用到 **@babel/traverse** 这个工具，用来遍历 js ast 的节点工具。可以在这里查看 [ast](https://astexplorer.net/) 的生成内容，方便查看各种节点信息。

``` js
const traverse = require('@babel/traverse');
traverse.default(jsAst, {
  enter(path){ // 开始

  },
  // 支持自定义节点 比如当节点类型 为 ExportDefaultDeclaration 时掉这个方法
  ExportDefaultDeclaration(){

  }
})
```

### 提取组件名称、描述、props、methods、model

**export default** 生成的对应节点类型是 ExportDefaultDeclaration，**declaration** 属性就是对应的组件的 options 了，遍历 declaration 的属性可以获取到 **name**、**props**、**methods**、**model** 等节点信息。

![ast](/images/posts/vue_docs/pic_1627612369570.png)_AST_

示例 

``` js
let componentInfo = {}
traverse.default(jsAst, {
  ExportDefaultDeclaration(path){
    path.node.declaration.properties.forEach(item => {
        switch (item.key.name) {
            case 'props':
                componentInfo.props = extractProps(item) // 提取 props
                break;
            case 'methods':
                componentInfo.methods = extractMethods(item)  // 提取 methods
                break
            case 'name':
                componentInfo.name = item.value.value // 获取组件名称
                break
            case 'model':
                componentInfo.model = extractModel(item)  // 提取 model
                break
            default:
                break;
        }
    });
  }
})
```

#### 提取描述

js 中注释分为单行和多行两种，生成 ast 也会生成不同类型的，可以看下面例子。

``` js
/** 
 * 多行备注
 * 用来上传文档信息
 */
// 单行备注
export default {
}
// 结尾注释
```

可以看到会 CommentBlock、 CommentLine 两种类型的节点，还有头部的会放在 leadingComments 里，底部的注释在 trailingComments 里。

![ast](/images/posts/vue_docs/pic_1627613208799.png)_AST_

一般会把组件描述注释放在 **export default**  上面，简单提取注释信息

``` js
// ExportDefaultDeclaration 插入如下代码 
if (path.node.leadingComments) {
    componentInfo.desc = path.node.leadingComments.map(item => {
        if (item.type === 'CommentLine') {
            return item.value.trim()
        } else {
            return item.value.split('\n').map(item => item.replace(/[\s\*]/g, '')).filter(Boolean)
        }
    }).toString()
}
```

#### 提取 methods
因为 **methods** 中的注释需要额外描述 出参、入参等信息需要额外处理，jsdoc 注释规范使用还是比较大众的，这里根据需要自己定义提取规则，还需要提取 **async** 用来标识是否是异步函数。

``` js
/**
 * 方法描述
 * @param {Bool} type 参数描述
 * @returns 返回值描述
 */
```

#### 提取 props
props 的提取需要区分下面几种情况，default 和 validator 还是提取还是有点麻烦的，validator 校验还可以通过注释简单描述来提取，但是 default 就不好处理了。

``` js
{
    propA: Number, // 只有类型
    propB: [String, Number], // 只有类型但是支持多种
    propC: { 
      type: String,
      required: true
    },
    propD: {
      type: Number,
      default: 100 // 带有默认值 
    },
    propE: {
      type: Object,
      default () { // 默认值 需要函数返回
        return { message: 'hello' }
      }
    },
    propF: {
      default: function () { // 默认值 需要函数返回 和上面的 default 的 ast 节点类型是不同的
        return { message: 'hello' }
      }
      validator: function (value) { // 校验
        return ['success', 'warning', 'danger'].indexOf(value) !== -1
      }
    }
}
```

我这里对 default 处理是借助 **@babel/generator** 将 default 转换代码， 通过 eval 转成函数调用返回会默认值。types 是 **@babel/types** 模块，用来判断节点类型的。

``` js
// 获取Props默认值
function getDefaultVal (node) {
    if (types.isRegExpLiteral(node) || types.isBooleanLiteral(node) || types.isNumericLiteral(node) || types.isStringLiteral(node)) {
        return node.value
    } else if (types.isFunctionExpression(node) || types.isArrowFunctionExpression(node) || types.isObjectMethod(node)) {
        try {
            let code = generate.default(types.isObjectMethod(node) ? node.body : node).code
            let fun = eval(**0,${types.isObjectMethod(node) ? 'function ()' : ''} ${code}**)
            return JSON.stringify(fun())
        } catch (error) {
        }
    }
}
```

#### 提取 model
这个比较简单，直接获取就可以了。

### 提取组件Events

组件的事件没法直接获取到对应节点，只能通过 **$emit()** 方法来定位事件位置，在 **traverse** 中可以使用 **MemberExpress**(复杂类型节点)，然后通过节点上的属性名是否是 **$emit** 判断是否是事件。

![$emit](/images/posts/vue_docs/pic_1627615451450.png)_事件生成的AST_

可以看到事件名称在 **MemberExpress** 父级上的 **arguments** 里，而备注则在更上一层的里。

``` js
const extractEvents = (path) => {
    // 第一个元素是事件名称
    const eventName = path.parent.arguments[0]; 
    let comments = path.parentPath.parent.leadingComments
    return {
        name: eventName.value,
        desc: comments ? comments.map(item => item.value.trim()).toString() : '——'
    }
}

MemberExpression (path) {
    // 判断是不是event
    if (path.node.property.name === '$emit') {
        let event = extractEvents(path)
        !componentInfo.events && (componentInfo.events = {});
        if (componentInfo.events[event.name]) {
            componentInfo.events[event.name].desc = event.desc ? event.desc : componentInfo.events[event.name].desc
        } else {
            componentInfo.events[event.name] = event
        }
    }
}
```

在成功获取到 Events 后，那么结合 Events、Props、Model，就可以进一步的判断属性是否支持 **.sync** 和 **v-model**。

### 提取组件Slots

首先需要写一个对 Vue 模板的 ast 遍历的函数，**Vue-template-compiler** 没有提供类似于 **@babel/traverse** 用来 遍历 ast 的。

简单实现个遍历模板抽象树函数
``` js
const traverserTemplateAst = (ast, visitor = {}) => {
    function traverseArray (array, parent) {
        array.forEach(child => {
            traverseNode(child, parent);
        });
    }

    function traverseNode (node, parent) {
        visitor.enter && visitor.enter(node, parent);
        visitor[node.tag] && visitor[node.tag](node, parent);
        node.children && traverseArray(node.children, node);
        visitor.exit && visitor.exit(node, parent);
    }

    traverseNode(ast, null);
}
```

Vue 模板的 ast 的结构还是比较清晰的，没有 js ast 那么多的类型，只需要区分不同 tag 就可以了。注释会单独一个节点，所以在查找 slot 节点时候，还需要去找它上一个相邻节点，判断是否是注释。

![slot](/images/posts/vue_docs/pic_1627623837793.png)

``` js
traverserTemplateAst(template.ast, {
    slot (node, parent) {
        !componentInfo.slots && (componentInfo.slots = {})
        // 获取节点位置
        let index = parent.children.findIndex(item => item === node)
        let desc = '无描述', name = '-';
        if (index > 0) {
            let tag = parent.children[index - 1]
            // isComment 判断是否是 注释
            if (tag.isComment) {
                desc = tag.text.trim()
            }
        }
        if (node.slotName) name = node.attrsMap.name
        componentInfo.slots[name] = {
            name,
            desc
        }
    }
})
```

## 结语

到这里简单的实现了自动化生成 Vue 组件信息了，当然还有几种情况还没有考虑进去，例如事件 **$emit** 在 **template** 中，**slot** 在 **render** 函数中时候的情，不过提取这部分实现也是大同小异的了。可以在 [这里查看](//github.com/MaLuns/generate-vue-docs) 本文源码。
