---
title: Flutter 常用小部件(一)
comments: true
date: 2021-01-08 22:23:18
tags: [Flutter]
description:
categories: 记录类
keywords: flutter,widget
---

Flutter 中所有的UI界面都是widget构建的。widget用来描述元素配置数据,然后会被渲染成对应UI界面。 当widget的状态修改时, 它会重新渲染UI。

<!--more-->

## widget 
Flutter 官网对 widget 描述
> Flutter从React中吸取灵感，通过现代化框架创建出精美的组件。它的核心思想是用widget来构建你的UI界面。 Widget描述了在当前的配置和状态下视图所应该呈现的样子。当widget的状态改变时，它会重新构建其描述（展示的 UI），框架则会对比前后变化的不同，以确定底层渲染树从一个状态转换到下一个状态所需的最小更改。

一个新的组件通常是继承 StatelessWidget 或 StatefulWidget
- StatelessWidget 是状态不可变的 widget， 其中的展示内容不会随着数据的变化而变化（非响应式）。
- StatefulWidget 可以进行状态管理， 数据更新， 页面中的内容可以随之变化（响应式）。

使用 StatefulWidget 时候， 对状态进行更改时候， 会触发 build 方法对组件进行重绘， 也会连同子组件的一起触发。当一个组件数据中途不需要更改的时候，尽可能的使用 StatelessWidget， 对性能有较好提升。或者将需要更新部分尽可能拆分成子节点。
## 基础 widget
### Text
Text使用还是比较常用的，用于显示简单样式文本。
``` dart
 Text(
    '要显示文本', 
    //style 设置文本样式
    style: TextStyle(
        color: Colors.blue,
        fontSize: 18.0,
        height: 1.2,  
    ),
    //textAlign 设置对齐方式
    //maxLines 最大行数
    //overflow 超出显示方式
    //softWrap 设置换行
 )
```
使用自定义字体
```yaml
# 定义好自定义字体文件 pubspec.yaml
flutter:
 - family: Mango
    fonts:
      - asset: asset/fonts/Mango-Regular-2.otf
```
``` dart
// 使用字体
Text(
    '自定义字体 hello Flutter',
    style: TextStyle(fontFamily: 'Mango', color: Colors.white),
    textAlign: TextAlign.center,
)
```
有时我们还会需要一段文本中，可能需要不同的字体样式。这个时候可以使用 Text.rich 或者 RichText
```dart
Text.rich(
    TextSpan(
        style: TextStyle(fontSize: 18, color: Colors.white),
        children: <TextSpan>[
            TextSpan(text: ' 天上'),
            TextSpan(text: ' 白玉京',style: TextStyle(fontWeight: FontWeight.bold,color: Colors.red,fontSize: 20,)),
            TextSpan(text: ' ，'),
            TextSpan(text: ' 十二楼五城。'),
            TextSpan(text: '仙人 ', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red, fontSize: 20)),
            TextSpan(text: '抚我顶，结发受长生。'),
        ],
    )
)
// 或者 两个效果是一样的 都是需要一个 InlineSpan 类型, maxLines,overflow等这些可以在外层设置, 单独样式在TextSpan的style设置
RichText(
    text: TextSpan(
        style: TextStyle(fontSize: 18, color: Colors.white),
        children: <TextSpan>[
            TextSpan(text: ' 天上'),
            TextSpan(text: ' 白玉京',style: TextStyle(fontWeight: FontWeight.bold,color: Colors.red,fontSize: 20,)),
            TextSpan(text: ' ，'),
            TextSpan(text: ' 十二楼五城。'),
            TextSpan(text: '仙人 ', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red, fontSize: 20)),
            TextSpan(text: '抚我顶，结发受长生。'),
        ],
    ),
)
```
### Button
Flutter 内置了很多按钮，Material 中大致分为 RawMaterialButton 和 IconButton 两类
``` dart
// RawMaterialButton 常见的有 RaisedButton / FlatButton / OutlineButton /FlatButton
RawMaterialButton({
    Key key,
    @required this.onPressed,
    this.onHighlightChanged,            // 高亮变化的回调
    this.textStyle,                     // 文字属性
    this.fillColor,                     // 填充颜色
    this.highlightColor,                // 背景高亮颜色
    this.splashColor,                   // 水波纹颜色
    this.elevation = 2.0,               // 阴影
    this.highlightElevation = 8.0,      // 高亮时阴影
    this.disabledElevation = 0.0,       // 不可点击时阴影
    this.padding = EdgeInsets.zero,     // 内容周围边距
    this.constraints = const BoxConstraints(minWidth: 88.0, minHeight: 36.0),   // 默认按钮尺寸
    this.shape = const RoundedRectangleBorder(),    // 形状样式
    this.animationDuration = kThemeChangeDuration,  // 动画效果持续时长
    this.clipBehavior = Clip.none,                  // 抗锯齿剪切效果
    MaterialTapTargetSize materialTapTargetSize,    // 点击目标的最小尺寸
    this.child,
})

//IconButton类型的按钮
// IconButton 常见的有 BackButton(返回上一个页面)/CloseButton(关闭当前页面)
IconButton({
    Key key,
    this.iconSize = 24.0,   // 图标大小
    this.padding = const EdgeInsets.all(8.0),   // 图标周围间距
    this.alignment = Alignment.center,          // 图标位置
    @required this.icon,    // 图标资源
    this.color,             // 图标颜色
    this.highlightColor,    // 点击高亮颜色
    this.splashColor,       // 水波纹颜色
    this.disabledColor,     // 不可点击时高亮颜色
    @required this.onPressed,
    this.tooltip            // 长按提示
})

// 其他按钮
//FloatingActionButton 悬浮
//TextButton 文本按钮
//CupertinoButton iOS风格按钮
```

### Image
Image 日常开发中的使用频率也非常高，Image 可以加载本地，网络，缓存的图片。
```dart
// 本地加载图片 需要在 pubspec.yaml 添加图片资源
Image(
    image: AssetImage('asset/images/demo.png'), //本地图片
    // 在线图片
    // image: NetworkImage('https://dev-file.iviewui.com/ttkIjNPlVDuv4lUTvRX8GIlM2QqSe0jg/middle'),
    height: 100.0,
    width: 100.0,
    fit: BoxFit.fill, // 填充方式和Web上差不多
)
// Image 也提供了 Image.asset 和 Image.network 构造函数的快捷方式
```
### Icon
使用内置图标，Flutter 内置提供了一套 material-icon 图标
```dart 
//需要一个IconData类型图标数据
Icon(
    Icons.thirteen_mp, //material-icon 都定义在 Icons 类中
    size: 30,
    color: Colors.black,
)
```
使用自定义图标
- 下载好图标文件
- 加入在项目中
- 在pubspec.yaml中引入字体文件ttf(不同版本的flutter可能有差异)
``` yaml
#pubspec.yaml
flutter:
 fonts:
  - family: IconFont
    fonts:
      - asset: asset/fonts/iconfont.ttf
```
- 编写自定义 IconData 类型
``` dart
//IconFont:是引入时候设置字体名称,0xe611 为对应图标的Unicode
IconData li = IconData(0xe611, fontFamily: 'IconFont') // 设置自定义IconData
Icon(
    li,
    size: 30,
    color: Colors.black,
)
```

### AppBar
AppBar 是一个顶端导航栏 
```dart
 AppBar({
    this.leading, //左侧按钮 可以自定义,在其他页时候 回显示返回按钮
    this.automaticallyImplyLeading = true,//leading为null，是否自动实现默认的leading按钮
    this.title, // 标题,是一个Widget
    this.actions, //  一个Widget列表,显示在右侧,
    this.flexibleSpace,//显示在 AppBar 下方的控件，高度和 AppBar 高度一样 可是定制些特殊效果
    this.bottom,// 一个PreferredSizeWidget,可以用来放TabBar
    this.elevation,//控件的 z 坐标顺序 为0可以隐藏阴影
    this.shadowColor,// 阴影颜色
    this.shape,
    this.backgroundColor, // 背景色
    this.brightness, //设置状态栏颜色 light:文字是黑色 dark:文字是白色
    this.iconTheme,//
    this.actionsIconTheme,
    this.textTheme, //文字样式
    this.primary = true, //为false时候会在屏幕顶部,不保留状态栏
    this.centerTitle, //标题是否居中显示
    this.excludeHeaderSemantics = false,
    this.titleSpacing = NavigationToolbar.kMiddleSpacing, //水平标题间距
    this.toolbarOpacity = 1.0,//透明度
    this.bottomOpacity = 1.0,//透明度
    this.toolbarHeight, //高度
    this.leadingWidth,// 左侧按钮宽度
})

//示例
AppBar(
    automaticallyImplyLeading: false,
    title: Text("去掉阴影和左侧默认按钮"),
    elevation: 0.0,
    actions: [
        IconButton(
            icon: Icon(Icons.search, color: Colors.white),
            onPressed: null,
        ),
    ],
)

// 示例AppBar+TabBar
DefaultTabController(
    length: 2,
    child: Scaffold(
        appBar: AppBar(
                automaticallyImplyLeading: false,
                title: Text("AppBar+TabBar"),
                centerTitle: true,
                elevation: 0.0,
                bottom: TabBar(
                    unselectedLabelColor: Colors.white60,
                    indicatorColor: Colors.white,
                    indicatorSize: TabBarIndicatorSize.label,
                    indicatorWeight: 2.0,
                    tabs: <Widget>[
                        Tab(text: 'tab1'),
                        Tab(text: 'tab2'),
                    ],
                ),
            ),
        body: TabBarView(
            children: [
                Container(
                    color: Colors.black12,
                    child: Center(child: Text('tab1')),
                ),
                Container(
                    color: Colors.yellow[50],
                    child: Center(child: Text('tab2')),
                ),
            ],
        ),
    ),
)
```
<!-- ### Tabs -->

## 布局类 widget
常用布局 widget 有 Row、Column、Flex、Warp、Flow、Stack、Positioned 等。

### 弹性布局
Flutter 使用的 Flex 模型基本上跟 CSS 类似。

``` dart
//Row
Row(
    // 主轴对齐方式(水平方向)
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    //CrossAxisAlignment 负轴(垂直方向)
    children: [
        Text(" Row1 "),
        Text(" Row2 "),
        // 占用剩余空间
        Expanded(
            flex: 1, // 设置占比
            child: Text(" Row3 "),
        ),
        Expanded(
            flex: 2,
            child: Text(" Row4 "),
        ),
    ],
)

//Column
Column(
    // 主轴对齐方式(垂直方向)
    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
     //CrossAxisAlignment 负轴(水平方向)
    children: List.generate(3, (e) {
        return Container(
            margin: EdgeInsets.symmetric(vertical: 8),
            height: 50,
            color: Colors.black12,
            child: Center(
                child: Text('Column'),
            ),
        );
    }).toList(),
)

//Flex 与 Column,Row 使用方式类似
 Flex(
    //设置方向 水平和垂直
    direction: Axis.vertical,
    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
    children: List.generate(3, (e) {
        return Container(
            margin: EdgeInsets.symmetric(vertical: 8),
            height: 50,
            color: Colors.black12,
            child: Center(
            child: Text('vertical'),
            ),
        );
    }).toList(),
)
```

### 流式布局
在介绍 Row 和 Colum 时，如果子 widget 超出屏幕范围， 则会报溢出错误， 并不会自动换行。Flutter 中提供了 Wrap 和 Flow 来支持溢出部分后会自动折行。
``` dart 
// Wrap 的示例
Wrap(
    spacing: 8.0, // 主轴(水平)方向间距
    runSpacing: 4.0, // 纵轴（垂直）方向间距
    alignment: WrapAlignment.center, //沿主轴方向居中
    //runAlignment 纵轴方向的对齐方式
    children: List.generate(12, (e) {
        return Container(
            decoration: BoxDecoration(
                color: Color(0xff38acfa),
                borderRadius: BorderRadius.circular(5),
            ),
            padding: EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            child: Text('tag$e', style: TextStyle(color: Colors.white)),
        );
    }).toList(),
)
```
Flow 布局需要一个 FlowDelegate 类型的 delegate 对象， 但是 Flutter 没有现成实现的类， 需要我们自己实现。
``` dart
//继承FlowDelegate   只需要实现paintChildren 和 shouldRepaint
class TestFlowDelegate extends FlowDelegate {

  // 用来绘制子组件
  @override
  void paintChildren(FlowPaintingContext context) {
    //FlowPaintingContext 绘制上下文信息
    // size 父组件大小
    // childCount 子组件个数
    // getChildSize 获取子组件大小
    // paintChild 绘制子组件

    for (int i = 0; i < context.childCount; i++) {
      //paintChild 三个参数 一个指定第几个子组件 一个表示位置信息 一个是透明度
      context.paintChild(i, transform: Matrix4.translationValues(i * 20.0, i * 20.0, 0.0), opacity: 0.6);
    }
  }
    
  @override
  bool shouldRepaint(FlowDelegate oldDelegate) {
    return oldDelegate != this;
  }
}

Flow(
  delegate: TestFlowDelegate(),
  children: List.generate(9, (index) {
      return Container(width: 80.0, height: 80.0, color: Colors.red[index * 100]);
  }).toList(),
)
```

### 叠层布局
Stack 结合 Positioned 进行叠层布局，和 css 中的绝对定位类似。Positioned 组件通过 left，top ，right，bottom 四个方向上的属性值来决定其在 Stack 中的位置。

``` dart
Stack(
    children: <Widget>[
        Container(
            child: Text("Stack", style: TextStyle(color: Colors.white),
            color: Colors.red,
        ),
        Positioned(
            left: 18.0,
            top: 80,
            child: Text("I am Jack"),
        ),
        Positioned(
            right: 36.0,
            bottom: 200,
            child: Text("Your friend"),
        )
    ],
)
```
### 对齐和相对定位
Align 组件可以调整子组件位置，同过一个 AlignmentGeometry 类型的值，表示子组件在父组件中的起始位
```dart
Container(
  height: 120.0,
  width: 120.0,
  color: Colors.blue[50],
  child: Align(
    alignment: Alignment.topRight, //Alignment 一个AlignmentGeometry的实现类
    child: Text('topRight'),
  ),
)
```
```
Alignment 对应坐标系,
topRight对应着(-1,-1),中心坐标center就是(0,0),

  -1,-1        1,-1
    -------------
    |           |
    |           |
    |    0,0    |
    |           |
    |           |
    -------------
  -1,1          1,1

自定义时候对应公式  x,y 就是上面对应坐标值,  childWidth childHeight 容器宽高
(Alignment.x*childWidth/2+childWidth/2, Alignment.y*childHeight/2+childHeight/2)

Alignment(2,0.0) =>  180,60
```

## 容器类型
### Container
Container 是一个组合类容器的组装的多功能容器。了解一个 Container 其他也就很清楚了
```dart
Container({
    Key key,
    this.alignment, //对齐方式  =>对应 Align


    this.padding, // 内间距，是个 EdgeInsetsGeometry 抽象类  =>对应  Padding 
    // FLutter 提供了是个 EdgeInsetsGeometry 实现类 EdgeInsets，提供了下面四个方法
    // fromLTRB(double left， double top，double right， double bottom)：分别指定四个方向的填充。
    // all(double value) : 所有方向均使用相同数值的填充。
    // only({left， top， right ，bottom })：可以设置具体某个方向的填充(可以同时指定多个方向)。
    // symmetric({ vertical， horizontal })：用于设置对称方向的填充，vertical 指 top 和 bottom，horizontal 指 left 和 right。

    this.color, //背景色
    this.decoration,  // 背景装饰，设置了decoration，外面的color属性将不可用，需要在decoration内设置   =>对应  DecoratedBox
    this.foregroundDecoration,// 前景装饰
    // DecoratedBox 提供的样式属性
    // color, //背景颜色
    // image,//背景图片
    // border, //边框
    // borderRadius, //圆角
    // boxShadow, //阴影,可以指定多个
    // gradient, //渐变
    // backgroundBlendMode, //背景混合模式
    // shape //形状
    

    double width, // 宽度
    double height,// 高度
    BoxConstraints constraints, //设置限制 =>对应  ConstrainedBox，与其相反的是 UnconstrainedBox(取消限制)
    // ConstrainedBox 提供属性 都是double类型
    // minWidth //最小宽度
    // maxWidth //最大宽度
    // minHeight//最小高度
    // maxHeight//最大高度

    this.margin, // 外间距 和padding 使用方式一样
    this.transform, //变形 需要一个Matrix4类,具体可以看Matrix4源码,提供了很多不同变形构造方法 =>对应 Transform 
    this.child,
    this.clipBehavior = Clip.none,
})
```
### 其他容器类
 - SizedBox 固定宽高
 - AspectRatio 宽高比
 - UnconstrainedBox 取消限制