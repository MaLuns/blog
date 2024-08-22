---
title: 小程序 swiper 性能优化
comment: true
date: 2022-12-28 13:22:09
tags:
description:
categories: 记录类
keywords: 微信小程序
toc: false
---
事情是这样的，我做了一个在线壁纸小程序，壁纸预览部分为了更好时使用体验，增加了类似于那些短视频上滑下滑快速切换壁纸预览的功能，为了避免重复造轮子直接使用了 swiper 来时实现滑动快速切换壁纸。
<!-- more -->

### 问题所在

当壁纸量比较多的时候，全部渲染成 swiper-item，会出现明显性能问题。还有个原因应该预览壁纸时加载的都是高清原图，直接全部加载出来，对性能也是很大一个浪费。图片的加可以通过设置 lazy-load 懒加载图片。

### 解决方案

解决方案也挺简单，直接使用分页去处理，比如有 200 项，但是我们一次只渲染 3 个 swiper-item，比如当前下标是 1（对应原列表下标1），当你下滑时新的下标就是 2（对应原列表下标2）了，这个时候就需要我们更新下标 0（对应原列表下标3），为当前项，对应原始列表中的下一个，上滑也是这样的逻辑，这样就保证每次滑洞都按照原始列表顺序显示的，但是实际页面只渲染 3 个 swiper-item，和虚拟列表原理类似。


官方提供了一个 [video-swiper](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/extended/component-plus/video-swiper.html) 组件，原理时类似的，只不过是给视频列表使用的，我们参考他的实现进行修改。

### 实现
假设我们的数据的为 list，实际渲染的数据为 swiperList，我们现在给他就固定 3 个 swiper-item，前后滑动的时候去替换数据，正向滑动的时候去替换滑动后的下一个数据，反向滑动的时候去替换滑动后的上一个数据，然后将 swiper 设置为可衔接滑动，这样保证一直可以循环滑动，然后更具滑动方向替换数据。

监听 swiper 的 bindchange 事件，可以获取到滑动后的 current，然后在 bindchange 事件里更新数据

滑动的方向判断

``` js 
// swiper 长度
const LEN = 3
const stateNum = current - this.data.swiperIndex
const state = [-1, LEN - 1].includes(stateNum) ? "Last" : "Next"
```

获取 swiperList 需要更新的下标

``` js
let updateIndex;
if (state === "Next") {
    updateIndex = current === (LEN - 1) ? 0 : current + 1
} else {
    updateIndex = current === 0 ? (LEN - 1) : current - 1
}
```

除了需要 swiperList 更新下标，还得记录对应 list 的下标

``` js
// 获取当前项对应 list 下标
const previewIndex = state === "Last" ? this.data.previewIndex - 1 : this.data.previewIndex + 1
```

然后据可以根据滑块方向和 previewIndex，就可以确定更新 swiperList 数据了

``` js
 this.setData({
    // 更新实际 list 下标
    previewIndex, 
    [`swiperList[${updateIndex}]`]: state === "Last" ? list[previewIndex - 1] : list[previewIndex + 1] 
})
// 记录 swiper 下标
this.data.swiperIndex = current
```

根据上面思路基本上可以解决 swiper 数据量大性能问题了，但是还存在一些问题。

- 滑块边界问题，list 数据也是有限的，也会滑到边界，需要对边界做一个判断处理
    
这个问题可以根据 previewIndex 下标去判断是否到达了边界，如果不需要无限加载数据，可以在达到边界时直接回弹静止滑块继续滚动，因为设置 swiper 为衔接滑动，达到边界时滑动时上一个或者下一个还是会显示有其他 swiper-item，所有需要我们添加一个空的 swiper-item 用来占位。如果时需要无限加载数据，可以在快到达边界时提前拉取数据，等拿到数据时继续下滑，否则反弹回去保持在最后一个。

- 当 previewIndex 不是通过滑块更新时候，比如直接从 0 跳到 5 会有默认滚动动画，导致体验很差

这个解决方式是在非滑动更新时候，先将动画时间 duration 设置为 0 ，去掉动画，然后在更新下标和恢复动画。

``` js
this.setData({ duration: 0 }, () => {
    this.setData({
        previewIndex: previewIndex,
        swiperIndex: swiperIndex,
        swiperList: swiperList,
        duration: 500
    })
})
```

### 代码实现

相对完整的代码实现

``` html
<swiper vertical="{{true}}" duration="{{duration}}" current="{{swiperIndex}}" circular="{{circular}}" bindchange="handleChangeBigImage">
    <swiper-item wx:for="{{swiperList}}" wx:key="index">
        <block wx:if="{{item.type==='placeholder'}}">
            <view class="placeholder-view"></view>
        </block>
        <block wx:else>
            <image show-menu-by-longpress lazy-load mode="aspectFill" src="{{item.path}}"></image>
        </block>
    </swiper-item>
</swiper>
```

``` ts
// swiper 长度
const LEN = 3
const SwiperPlaceholder = { type: "placeholder" }
type State = "Next" | "Last"

Component({
  properties: {
    list: {
      type: Array,
      value: [] as Array<ImageItem>
    },
    index: {
      type: Number,
      value: 0
    }
  },
  data: {
    // 当前元素下标
    previewIndex: 0,
    // swiper 切换
    circular: true,
    duration: 300,
    swiperIndex: 1, // 当前 swiper 下标
    swiperList: <Array<ImageItem>>[],
  },
  observers: {
    'index,list': function (index, list) {
      if (list.length && list[index]) {
        this._initSwiper(index, list)
      }
    },
  },
  methods: {
    // 切换 swiper
    handleChangeBigImage(e: WechatMiniprogram.SwiperChange) {
      const { current, source } = e.detail
      if (source !== "touch") return;

      const state = this._getSlideState(current, this.data.swiperIndex)
      const previewIndex = state === "Last" ? this.data.previewIndex - 1 : this.data.previewIndex + 1
      const currentItem = this.data.swiperList[current]

      // 到达了边界时，反弹回去
      if (currentItem.type === "placeholder") {
        this.setData({
          swiperIndex: this.data.swiperIndex
        })
        return
      }

      this.setData({
        previewIndex,
        [`swiperList[${this._updateUpdateIndex(current, state)}]`]: this._getUpdateSwiperItem(previewIndex, state),
      })

      this.data.swiperIndex = current
    },
    // 初始化 Swiper 模式
    _initSwiper(index: number, list: Array<ImageItem>, cb?: Function) {
      this.setData({ duration: 0 }, () => {
        let swiperIndex = 1
        let swiperList: Array<ImageItem> = []

        swiperList.push(list[index - 1] || SwiperPlaceholder)
        swiperList.push(list[index] || SwiperPlaceholder)
        swiperList.push(list[index + 1] || SwiperPlaceholder)

        this.setData({
          previewIndex: index,
          swiperIndex,
          swiperList,
          duration: 500,
          isHide: false
        }, () => {
          if (cb) cb()
        })
      })
    },
    // 获取滚动状态
    _getSlideState(current: number, lastCurrent: number): State {
      const state = current - lastCurrent
      return [-1, LEN - 1].includes(state) ? "Last" : "Next"
    },
    // 获取需要更新下标
    _updateUpdateIndex(current: number, type: State) {
      if (type === "Next") {
        return current === (LEN - 1) ? 0 : current + 1
      } else {
        return current === 0 ? (LEN - 1) : current - 1
      }
    },
    // 获取需要更新数据
    _getUpdateSwiperItem(index: number, type: State) {
      const list = this.data.list
      let item
      if (type === "Last") {
        item = list[index - 1]
      } else {
        item = list[index + 1]
      }
      // 到达边界时 返回填充元素
      if (!item) {
        item = SwiperPlaceholder
      }
      return item
    }
  }
})
```