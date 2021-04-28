---
title: Flutter 中的动画
comment: true
hash: 1619593490668
date: 2021-04-28 15:04:50
tags: [Flutter]
categories: 记录类
description:
keywords:
---
Flutter 中动画的创建有很多种, 需要根据具体的需求选择不同的动画。如果只是简单的布局等的动画直接使用最简单的隐式动画就可以了，因为隐式动画是由框架控制的，所以仅仅只需要更改变需要变化属性就可以了。如果你想自己控制动画的变换则需要使用显示动画，如果需要控制一些列动画组合时使用交织动画去控制。如果内置的满足不了需求的时候，还可以结合画布自绘动画。

<!--more-->
## 简介
Flutter动画和其他平台动画原理也是一样的，都是在快速更改UI实现动画效果。在一个Flutter动画中主要包含AnimationController（控制器）、Curve（速度曲线）、Animatable（动画取值范围）、Animation（动画）
- AnimationController  用来控制动画的状态启动、暂停、反向运行等
- Animation  用于保存动画当前值的和状态
- Animatable 用于表明动画值范围值，常见的Tween系列的类都是对他的实现
- Curve  用来定义动画运动的是匀速运动还是匀加速等，和 css 中 animation-timing-function 类似
 
## 隐式动画
Flutter 内置了一些常用的隐式动画，可以看到源码里都是对ImplicitlyAnimatedWidget的实现，如果需要我们也可以自己实现ImplicitlyAnimatedWidget来自定义隐式动画。

看个使用例子
``` dart
  double heihgt = 100;
  Color color = Colors.yellow[800];

 AnimatedContainer(
    duration: Duration(milliseconds: 500),
    height: heihgt,
    color: color,
    margin: EdgeInsets.all(8),
    child: Center(
        child: Text('AnimatedContainer',
            style: TextStyle(color: Colors.white, fontSize: 20),
        ),
    ),
)
```


## 显示动画

## 交织动画

## Hero动画

## 自绘动画