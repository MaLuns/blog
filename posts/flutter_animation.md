---
title: Flutter 中的动画
comments: true
date: 2021-04-28 15:04:50
tags: [Flutter]
categories: 记录类
description:
keywords: flutter,animation
---
Flutter 中动画的创建有很多种， 需要根据具体的需求选择不同的动画。如果只是简单的布局等的动画直接使用最简单的隐式动画就可以了，因为隐式动画是由框架控制的，所以仅仅只需要更改变需要变化属性就可以了。如果你想自己控制动画的变换则需要使用显示动画，如果需要控制一些列动画组合时使用交织动画去控制。如果内置的满足不了需求的时候，还可以结合画布自绘动画。

<!--more-->

## 动画基础
Flutter 动画和其他平台动画原理也是一样的，都是在快速更改 UI 实现动画效果。在一个 Flutter 动画中主要包含 Animation（动画）、AnimationController（控制器）、Curve（速度曲线）、Animatable（动画取值范围）、Listeners （监听事件）、Ticker（帧）。
- Animation  一个抽象类是 Flutter 动画的核心类，主用于保存动画当前插值的和状态，在动画运行时会持续生成介于两个值之间的插入值。例如当宽从 100 变成 200，会在动画第一帧到最后一帧都会生成 100-200 区间的一个值，如果速度是匀速的，这个值就是匀速增加到 200。
- AnimationController  用来控制动画的状态启动、暂停、反向运行等， 是 Animation 的一个子类
- Curve  用来定义动画运动的是匀速运动还是匀加速等，和 css 中 animation-timing-function 类似
- Animatable 用于表明动画值范围值。可以通过调用 animate 方法，返回一个 Animation，常见的 Tween 系列的类都是对他的实现
- Listener 监听动画状态的变化
- Ticker 帧回调，在动画执行时候每一帧都会调用其回调，类似与 js 中的 requestAnimationFrame 

### 动画组成结构
![结构图](/images/posts/flutter_animation/gxt.png)
### 动画选择
![流程图](/images/posts/flutter_animation/lct.png)

<!-- Flutter 会用 AnimationController 控制执行状态，执行的时候会根据 Animatable，Curve 在每一帧都生成对应的中间插值，插值会保存在 Animation 中，我们 Animation 的插值我们就可以更新每一帧的画面，形成动画（Animation）。不管是隐式还是显示动画都是这样来处理动画的。 -->

## 隐式动画
隐式动画简单来说就是我们只需要修改对应的属性，Flutter 就是自己帮我们过渡动画，和 css 中过渡有点类似，当我们设置后 transition 后只需要更改对应的 css 属性就会自动过渡到新的值。Flutter 内置了一些常用的隐式动画，可以看到源码里都是对 ImplicitlyAnimatedWidget 的实现，如果需要我们也可以自己实现 ImplicitlyAnimatedWidget 来自定义隐式动画。 

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
在 Flutter 内置的隐式动画组件中，一般都是 AnimatedXxxxxx 类似的，后面的 Xxxxxx 都能找到对应的组件。内置的有下面这些 AnimatedContainer、AnimatedPadding、AnimatedAlign、AnimatedPositioned、AnimatedOpacity、SliverAnimatedOpacity、AnimatedDefaultTextStyle、AnimatedPhysicalModel。这些隐式动画的使用和其 Xxxxxx 对应的属性基本一致，只需要额外的指定 duration 就可以了，当然也可以为动画指定动画曲线 curve。

### 自定义隐式动画
当这内置的满足不了你的时候，你也可以去实现一个隐式动画，只需要实现抽象类 ImplicitlyAnimatedWidget。实现自定义隐式动画仅需要重写 build 和 forEachTween 就可以简单实现了。
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

我们可以去看 ImplicitlyAnimatedWidget 是如何控制动画的，在 ImplicitlyAnimatedWidgetState 中会看到其实里面定义了 AnimationController 控制动画。然后可以看到 didUpdateWidget 钩子函数中调用了  _controller.forward() 执行动画，当父 Widget 调用 setState 时候就会触发这个钩子函数的调用。

## 显示动画
有时候有些动画需要们自己去控制动画的状态，而不是交给框架去处理，这时就需要我们自己去定义前面简介里提到的那几个动画要素了。

### 内置显示动画
在 Flutter 中内置的显示动画大部分都是 XxxxxxTransition 名称的，我们看个内置显示动画使用例子，RotationTransition 组件需要一个 turns（Animation\<double\>）参数,我们可以给它个AnimationController
``` dart 
// RotationTransition 参数
RotationTransition(
   turns: Animation<double>,
   child: ChildWidget(),
)

// AnimationController 参数
AnimationController(
  double? value, // 初始值
  this.duration, //动画时间
  this.reverseDuration, // 反向动画执行的时间
  this.debugLabel, 
  this.lowerBound = 0.0, //动画开始值
  this.upperBound = 1.0, //动画结束值
  this.animationBehavior = AnimationBehavior.normal,
  required TickerProvider vsync, //垂直同步，需要一个 Ticker ,Flutter 给我们提供了
)
```
使用 RotationTransition，可以看到一个红蓝渐变色方块旋转一周。
``` dart 
class RotationTransitionDemo extends StatefulWidget {
  @override
  _RotationTransitionDemoState createState() => _RotationTransitionDemoState();
}

class _RotationTransitionDemoState extends State<RotationTransitionDemo> with SingleTickerProviderStateMixin {
  AnimationController _controller;

  @override
  void initState() {
    super.initState();
    // 设置动画时间为1秒
    _controller = AnimationController(duration: Duration(milliseconds: 1000), vsync: this)
    ..addListener(() { // 监听动画的状态值发生变化
        print(_controller.value);
    })
    ..addStatusListener((status) { //监听动画状态
        // dismissed 动画在起始点停止
        // forward 动画正在正向执行
        // reverse 动画正在反向执行
        // completed 动画在终点停止
        print(status);
    })
    ..forward(); // 执行动画
    // 常用方法
    // forward() // 正向执行动画
    // reverse() 反向执行动画
    // repeat() 重复执行 可以传个参数 是否会反向运动
    // stop() 停止动画
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('RotationTransition'),
      ),
      body: Center(
        child: RotationTransition(
          turns: _controller, // 设置 Animation
          child: Container(
            height: 300,
            width: 300,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [Colors.red, Colors.blue]),
            ),
          ),
        ),
      ),
    );
  }
}
```

### 控制器补间和曲线
在控制器中我们可以看的动画开始值和结束值默认是 0.0 到 1.0，而且是 double 类型的。而实际动画中不可能只是 double 类型的，需要我们自己使用 Animatable 来指定补间范围值。
修改一下上面的代码
```dart
// 通过控制器的drive方法添加
 _controller = AnimationController(duration: Duration(milliseconds: 1000),vsync: this)
  ..drive(Tween(begin: 1, end: 4)) //使用Tween（Animatable的子类）指定补间范围

// 我也也可以是使用Animatable的animate方法添加到控制器
Tween(begin: 1, end: 4).animate(_controller);
// 这样写我们可以使用 chain() 叠加多个 Tween
Tween(begin: 1, end: 4)
.chain(CurveTween(curve: Curves.ease)) //叠加个曲线
.animate(_controller);
```
Flutter 已经内置帮我们实现了很多 Animatable，ColorTween、SizeTween、IntTween、StepTween 等等。


### 自定义显示动画
查看 RotationTransition 的源码，我们可以看到它是对的抽象类 AnimatedWidget 的实现，当内置的满足不了我们的时候，可以直接自己实现 AnimatedWidget 自定义显示动画。先来看看 AnimatedWidget 里面都有些啥。
``` dart 
// 只摘取主要的部分
abstract class AnimatedWidget extends StatefulWidget {

  const AnimatedWidget({ Key key,@required this.listenable,  }) : assert(listenable != null), super(key: key);

  @override
  _AnimatedState createState() => _AnimatedState();
}

class _AnimatedState extends State<AnimatedWidget> {
  @override
  void initState() {
    super.initState();
    widget.listenable.addListener(_handleChange);
  }

  void _handleChange() {
    setState(() {
      // 我们可以看到显示动画是通过控制器监听插值更改 setState 进行重绘。
    });
  }
}
```
接下来我自己继承 AnimatedWidget 实现一个自定义显示动画

``` dart 
// 继承 AnimatedWidget
class OpacityAnimatedWidget extends AnimatedWidget {
  final Widget child;
  Animation<Color> colorAnimation;

  // AnimatedWidget 需要可传递一个 listenable 进去，我们可以传递个 AnimationController
  OpacityAnimatedWidget(listenable, {this.colorAnimation, this.child}) : super(listenable: listenable);

  @override
  Widget build(BuildContext context) {
    Animation<double> animation = listenable;
    return Opacity(
      opacity: animation.value,
      child: Container(
        color: colorAnimation.value,
        child: child,
      ),
    );
  }
}

// 使用 需要在状态类上 混入一个 SingleTickerProviderStateMixin
AnimationController _controller = AnimationController(duration: Duration(milliseconds: 1000), vsync: this); 

OpacityAnimatedWidget(
  Tween(begin: 1.0, end: .8).animate(_controller),
  colorAnimation: ColorTween(begin: Colors.red, end: Colors.blue).animate(_controller),
  child: Container(
    height: 300,
    width: 300,
  ),
)
```
Flutter 内部还提供了一个 AnimatedBuilder 帮助我们简化自定义动画。
``` dart
// 只需要三个三参数
AnimatedBuilder( 
  animation, // 一个listenable
  child,// 传入个子组件，非必填
  builder,// (BuildContext context, Widget child){}  这里的第二个参数 child ，就是上面传入的 child
  // 这么做的好处就是，动画执行的时候只会执行 builder ,如果一个动画只是包裹层需要执行动画，这个时候就可以把包裹的子组件 放到外面传进去
  // 这样就每次只需要 执行 builder 而方法第二个参数是传递进来的引用，所以可以避免每次都更新，减少开销
)
```

### 交织动画
官方是这么介绍的：交织动画是一个简单的概念：视觉变化是随着一系列的动作发生，而不是一次性的动作。动画可能是纯粹顺序的，一个改变随着一个改变发生，动画也可能是部分或者全部重叠的。动画也可能有间隙，没有变化发生。

简单点说就是一个动画可以分割成很多片段，每个片段都有不同的 Tween，看个使用示例
``` dart 
class StaggeredAnimationDemo extends StatefulWidget {
  @override
  _StaggeredAnimationDemoState createState() => _StaggeredAnimationDemoState();
}

class _StaggeredAnimationDemoState extends State<StaggeredAnimationDemo> with SingleTickerProviderStateMixin {
  AnimationController _controller;
  Animation<double> _height;
  Animation<Color> _color;
  Animation<double> _borderRadius;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: Duration(milliseconds: 5000), vsync: this);

    _height = Tween(begin: 50.0, end: 300.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Interval(0, 0.15), // Interval 范围必须是0-1 指定Tween在哪一段时间执行
      ),
    );

    _color = ColorTween(begin: Colors.red, end: Colors.blue).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Interval(0.1, 0.2),
      ),
    );

    _borderRadius = Tween(begin: 10.0, end: 150.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Interval(0.1, 0.25),
      ),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BasiceAppLayout(
      title: '交织动画',
      body: Center(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Container(
              height: _height.value,
              width: _height.value,
              decoration: BoxDecoration(
                color: _color.value,
                borderRadius: BorderRadius.circular(_borderRadius.value),
              ),
            );
          },
        ),
      ),
    );
  }
}
```

## Hero动画
Flutter 叫它主动画，用于不同页面之间切换时候动画，比如有一个商品列表，点击后跳到一个新的页面查看原图，就可以这个动画。使用也很简单，在不同页面使用 Hero 包裹需要动画组件，两个页面的 tag 需要甚至成一直，但是同一个页面需要保持唯一。

``` dart 
Hero(
  tag: "avatar", //唯一标记，前后两个路由页Hero的tag必须相同
  child: ChildWidget(),
)
```

<!-- ## 自绘动画 -->