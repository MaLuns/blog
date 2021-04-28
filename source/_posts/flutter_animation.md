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
隐式动画简单来说就是我们只需要修改对应的属性，Flutter就是自己帮我们过渡动画，和css中过渡有点类似，当我们设置后transition后只需要更改对应的css属性就会自动过渡到新的值。Flutter 内置了一些常用的隐式动画，可以看到源码里都是对ImplicitlyAnimatedWidget的实现，如果需要我们也可以自己实现ImplicitlyAnimatedWidget来自定义隐式动画。 

### 内置隐式动画

看个使用例子
``` dart
// 首先我们在一个StatefulWidget定义 一个height和color
double heihgt = 100;
Color color = Colors.yellow[800];

// 在build 怎加一个隐式动画组建 AnimatedContainer，需要个Duration（动画执行时间），其他的参数和Container的基本一致
AnimatedContainer(
    duration: Duration(milliseconds: 500), 
    height: heihgt, // 使用我们定义好的值
    color: color,
    margin: EdgeInsets.all(8),
    child: Center(
        child: Text('AnimatedContainer',
            style: TextStyle(color: Colors.white, fontSize: 20),
        ),
    ),
)

// 在需要执行动画时候我们修改 height 和 color 值,就会看到 上边的组建会一边变高边过渡到蓝色上
setState(() {
    heihgt = 200;
    color = Colors.blue;
});

```
在Flutter内置的隐式动画组件中，一般都是AnimatedXxxxxx类似的，后面的Xxxxxx都能找到对应的组件。内置的有下面这些 AnimatedContainer、AnimatedPadding、AnimatedAlign、AnimatedPositioned、AnimatedOpacity、SliverAnimatedOpacity、AnimatedDefaultTextStyle、AnimatedPhysicalModel。这些隐式动画的使用和其Xxxxxx对应的属性基本一致，只需要额外的指定 duration 就可以了，当然也可以为动画指定动画曲线 curve。

### 自定义隐式动画
当这内置的满足不了你的时候，你也可以去实现一个隐式动画，只需要实现抽象类 ImplicitlyAnimatedWidget。实现自定义隐式动画仅需要重写build 和 forEachTween 就可以简单实现了。
``` dart
// 直接继承ImplicitlyAnimatedWidget 
class AnimatedDemo extends ImplicitlyAnimatedWidget {
  final Color color;
  final Widget child;
  final double height;

  AnimatedDemo({
    this.color,
    this.height,
    Curve curve = Curves.linear,
    this.child,
    @required Duration duration,
  }) : super(curve: curve, duration: duration);

  
  @override
  _AnimatedDemo createState() => _AnimatedDemo();
}
//因为ImplicitlyAnimatedWidget是继承 StatefulWidget 的，所以还需要继承他的状态类 （AnimatedWidgetBaseState 继承自 ImplicitlyAnimatedWidgetState）
class _AnimatedDemo extends AnimatedWidgetBaseState<AnimatedDemo> {
  ColorTween _color;
  Tween<double> _height;
 
  // 在动画执行时候会每一帧都调用 build
  @override
  Widget build(BuildContext context) {
    return Container(
      color: _color.evaluate(animation), //使用evaluate可以获取Tween当前帧的状态值
      height: _height.evaluate(animation),
      child: widget.child,
    );
  }

  //首次build和更新时候会调用，在这里设置动画需要的Tween的开始值和结束值
  @override
  void forEachTween(visitor) {
    //visitor 有三个参数（当前的tween，动画终止状态，一个回调函数（将第一次给定的值设置为Tween的开始值））
    _color = visitor(_color, widget.color, (value) => ColorTween(begin: value));// 这里value==首次widget.color的值
    _height = visitor(_height, widget.height, (value) => Tween<double>(begin: value));
  }
}
```

## 显示动画

## 交织动画

## Hero动画

## 自绘动画