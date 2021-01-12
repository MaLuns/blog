---
title: flutter 常用组件
comment: true
hash: 1610115798728
date: 2021-01-08 22:23:18
tags: [flutter]
description:
categories: 记录类
keywords:
---

Flutter 中所有的UI界面都是widget构建的。widget用来描述元素配置数据,然后会被渲染成对应UI界面。 当widget的状态修改时, 它会重新渲染UI。

<!--more-->

## widget 
Flutter 官网对 widget 描述
> Flutter从React中吸取灵感，通过现代化框架创建出精美的组件。它的核心思想是用widget来构建你的UI界面。 Widget描述了在当前的配置和状态下视图所应该呈现的样子。当widget的状态改变时，它会重新构建其描述（展示的 UI），框架则会对比前后变化的不同，以确定底层渲染树从一个状态转换到下一个状态所需的最小更改。

一个新的组件通常是继承 StatelessWidget 或 StatefulWidget
- StatelessWidget 是状态不可变的widget, 其中的展示内容不会随着数据的变化而变化（非响应式）。
- StatefulWidget 可以进行状态管理, 数据更新, 页面中的内容可以随之变化（响应式）。

使用StatefulWidget时候, 对状态进行更改时候, 会触发 build 方法对组件进行重绘, 也会连同子组件的一起触发。当一个组件数据中途不需要更改的时候,尽可能的使用StatelessWidget, 对性能有较好提升。或者将需要更新部分尽可能拆分成子节点。
## 基础 widget
### Text
Text使用还是比较常用的,用于显示简单样式文本。
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
### Image
Image日常开发中的使用频率也非常高, Image可以加载本地,网络,缓存的图片。
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
使用内置图标,Flutter 内置提供了一套 material-icon 图标
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
### Tabs

## 布局类 widget
常用布局widget有 Row、Column、Flex、Warp、Flow、Stack、Positioned 等。

### 弹性布局
Flutter使用的Flex模型基本上跟传统的CSS类似。

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
在介绍Row和Colum时,如果子widget超出屏幕范围, 则会报溢出错误, 并不会自动换行。Flutter中提供了Wrap和Flow来支持溢出部分后会自动折行。
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
Flow布局需要一个FlowDelegate类型的delegate对象, 但是Flutter没有现成实现的类, 需要我们自己实现。
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
Stack结合Positioned进行叠层布局,和css中的绝对定位类似。Positioned组件通过left，top ，right，bottom四个方向上的属性值来决定其在Stack中的位置。

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

## 容器类型

