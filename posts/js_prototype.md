---
title: JavaScript中的 [[prototype]]、prototype、__proto__ 关系
date: 2020-03-03 10:16:09
tags: [JavaScript]
categories: 记录类
comments: true
keywords: js,原型对象,prototype,_proto,js继承机制
---
说到 prototype、\_\_proto\_\_ 首先就得去理解 JavaScript 语言的继承机制。在典型的面向对象的语言中，如C#，都存在类（class）的概念， 类就是对象的模板，对象就是类的实例。C# 中的 继承允许我们根据一个类来定义另一个类，这使得创建和维护应用程序变得更容易。同时也有利于重用代码和节省开发时间。在 JavaScript 是不存在 类 和 子类 概念的，全靠原型链的模式来实现继承 (后面出 class 在这基础上的语法糖)。

<!--more -->

这里举一个简单 C# 类和继承例子，一类 People，其中包含一个 Say 方法。另外两个类 Man 和 Woman 都继承 People 这个类，这样这两个子类都拥有了父类的 Say 方法，这是一个典型的继承。

``` C# 
//C# Code
using System;

namespace ConsoleApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Man man = new Man();
            man.Work();
            man.Say("累死爷了");

            Woman woman = new Woman();
            woman.Shop();
            woman.Say("花钱真爽");

            Console.Read();
        }
    }

    class People
    {
        public People()
        {

        }

        public void Say(string text)
        {
            Console.WriteLine(text);
        }
    }

    class Man : People
    {
        public void Work()
        {
            Console.WriteLine("工作工作.....赚钱赚钱...");
        }
    }

    class Woman : People
    {
        public void Shop()
        {
            Console.WriteLine("买买买.....");
        }
    }

}

```

# prototype 的由来 #

当初 JavaScript 之父在开发 JavaScript 的时候，觉得没有必要做的很复杂，只需要做些简单操作就可以了，所以没有引入类的概念。
在 JavaScript 中也是通过 new 生成一个对象实例的，例如在 C# 中生成一个对象实例会这样写 new People()，会调用类的构造函数。在 JavaScript 简化了这个操作，new 后面跟的不是类，而是构造函数。
用 JavaScript 来实现上面 C# 例子

``` js
var people = {
    Say:function(text){
        console.log(text)
    } 
}

function Man(){
    this.Work=function(){
        console.log("工作工作.....赚钱赚钱...");
    }
    this.Say=people.Say;
}

function Woman(){
    this.Shop=function(){
        console.log("买买买.....");
    }
    this.Say=people.Say;
}

var man = new Man();
man.Work();
man.Say("累死爷了");

var woman = new Woman();
woman.Shop();
woman.Say("花钱真爽");

```

但是用构造函数生成实例对象，有一个缺点，那就是无法共享属性和方法。

``` js
people.Say=function(){
    console.log("...")
}
 
man.Say("累死爷了"); //累死爷了
woman.Say("花钱真爽");//花钱真爽

var man2=new Man();
man2.Say();//...

man.Say=null;
woman.Say("花钱真爽");//花钱真爽

//这里即使修改了 people.Say 也不会对以生成实例有影响,修改一个也不会对另一个有影响,每个实例都是相互独立的
```

每一个实例对象，都有自己的属性和方法的副本。这不仅无法做到数据共享，也是极大的资源浪费。于是 JavaScript 之父 为了解决这个问题就在构造函数加入了个 prototype 属性。这个属性是一个对象(常称 原型对象)，把一些公用的属性和方法都放在这个对象里，一些是私有的就放在构造函数里。

实例对象被创建时候，会自动引用原型对象的属性和方法，这样实例对象属性就分为两种了，一种是构造函数里私有自己的，另一种则是来着引用 原型对象。一旦原型对象属性和方法修改后，实例的对象也会跟着变化。原型对象 不仅共享了数据，也减少了对资源的占用。

那么用 JS 来实现上面 C# 例子就可以这样写

``` js
var people = {
    Say:function(text){
        console.log(text)
    } 
}

function Man(){
    this.Work=function(){
        console.log("工作工作.....赚钱赚钱...");
    }
}

Man.prototype = people;

function Woman(){
    this.Shop=function(){
        console.log("买买买.....");
    }
}

Woman.prototype = people;

var man = new Man();
man.Work();
man.Say("累死爷了");

var woman = new Woman();
woman.Shop();
woman.Say("花钱真爽");

//这个时候加入个 people 在加入个 eat 方法, man 和 woman 实例对象也是可以使用的
people.Eat=function(){
     console.log("吃吃吃.....");
}

man.Eat();
woman.Eat();
```

# prototype 和 \_\_proto\_\_ 和  [[prototype]] 关系 #

JavaScript 中任意对象都有一个内置属性[[prototype]]，在 ES5 之前没有标准的方法访问这个内置属性，但是大多数浏览器都支持通过 \_\_proto\_\_ 来访问,

prototype 和 \_\_proto\_\_ 关系

![](/images/posts/js_prototype/proto.jpg)

>JavaScript 只有一种结构：对象。每个实例对象（ object ）都有一个私有属性（称之为 \_\_proto\_\_ ）指向它的构造函数的原型对象（ prototype ）。该原型对象也有一个自己的原型对象( \_\_proto\_\_ ) ，层层向上直到一个对象的原型对象为 null。根据定义，null 没有原型，并作为这个原型链中的最后一个环节。几乎所有 JavaScript 中的对象都是位于原型链顶端的 Object 的实例。

看文字可能会有点蒙,用上面例子来举例说明下

``` js
var people = {
    Say:function(text){
        console.log(text)
    } 
}

function Man(){}

Man.prototype = people;

var man = new Man();

/* man 是构造函数的原型对象是  Man.prototyp
   所以 man.__proto__ === Man.prototype */
console.log(man.__proto__ === Man.prototype && man.__proto__  === people) //true

/* Man 构造函数也是对象,也有自己的 __proto__ 属性
  而函数 Man 是由 Function 构造的 */
console.log(Man.__proto__ === Function.prototype)

/* Function 对象也有自己的 __proto__ 属性
   Function 是由 Function自己实例来的 */
console.log(Function.__proto__ === Function.prototype)

/* Object 和  Function 同理*/
console.log(Object.__proto__ === Function.prototype)
console.log(Object.__proto__ === Function.__proto__)

/* Function 的 原型对象 也有自己的 __proto__
   Function 的 原型对象 是由 Object 来的*/
console.log(Function.prototype.__proto__ === Object.prototype)

/* Object 的 原型对象 在最顶层 所以他的 __proto__ 为 null */
console.log(Object.prototype.__proto__ === null)
```


