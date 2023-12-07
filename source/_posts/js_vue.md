---
title: Vue2.x 响应式部分源码阅读记录
comments: true
date: 2020-03-06 20:38:27
tags: [vue]
categories: 记录类
keywords: vue,vue响应式,vue源码
---

之前也用了一段时间 Vue，对其用法也较为熟练了，但是对各种用法和各种 api 使用都是只知其然而不知其所以然。最近利用空闲时间尝试的去看看 Vue 的源码，以便更了解其具体原理实现，跟着学习学习。

<!--more -->

<!-- 之前一直对 Vue又几个困惑

- 传的 data 进去的 怎么就 变得 this.xxx 可以访问到了
- 如何实现数据劫持，监听数据的读写操作 ？
- 如何实现依赖缓存 ？ -->

## Proxy 对 data 代理  ##

传的 data 进去的为什么可以用 this.xxx 访问，而不需要 this.data.xxx 呢?

``` js 
// vue\src\core\instance\state.js

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

function initData (vm: Component) {
  let data = vm.$options.data
  //...
  const keys = Object.keys(data)
  //...
  let i = keys.length
  while (i--) {
    const key = keys[i]
    //....
     proxy(vm, `_data`, key)
  }

  observe(data, true /* asRootData */)
}

```
这段代码看起来还是很简单的，将 data 中得 key 遍历一遍，然后全部新增到实例上去，当我们访问修改 this.xxx 得时候，都是在访问修改 this._data.xxx

## observer 模块 ##
>模块源码路径 vue\src\core\observer

observer 模块可以说是 Vue 响应式得核心了，observer 模块主要是 Observer、Dep、Watcher这三个部分了
- **Observer** 观察者，对数据进行观察和依赖收集等
- **Dep** 是 Observer 和 Watcher 得一个桥梁，Observer 对数据进行响应式处理时候，会给每个属性生成一个 Dep 对象，然后通过调用 dep.depend() ，如果当前存在 Watcher 将当前 Dep 加入到 Watcher 中,然后在将 Watcher 添加到当前 Dep 中
- **Watcher** 订阅者，数据变化会收到通知，然后进行相关操作，例如视图更新等

关系如下 

```


      -------get 收集依赖--------   ----------- 订阅 -------------
      |                         |  |                            |
      |                         V  |                            |
------------                ------------                  -------------
| Obserser | ----  set ---->|    Dep   |------- 通知 ---->|  Watcher  |
------------                ------------                  -------------
                                                                |
                                                              update
                                                                |
                                                          -------------
                                                          |   View    |
                                                          -------------

```

### 1.Observer ###
initData() 方法调用了  observe(data, true /* asRootData */) 先来看下这个方法

``` js 
//对 value 进行观察处理
export function observe (value: any, asRootData: ?boolean): Observer | void {

  //判断处理 value 必须是对象 并且不能是 VNode
  if (!isObject(value) || value instanceof VNode) {
    return
  }

  let ob: Observer | void
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}

```

如果 data.\_\_ob\_\_ 已经存在直接返回，否则 new 一个新的 Observer 实例，下面是 Observer 类代码

``` js 
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    // 这个dep 在 value 的属性新增 删除时候会用到
    //value 如果是数组 也是通过 这里的进行 依赖收集更新的
    this.dep = new Dep() 
    this.vmCount = 0
    def(value, '__ob__', this)
    if (Array.isArray(value)) {

      //这里是对数组原型对象 拦截 处理
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }


      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}
```

在构造函数中，会给 value（data）增加 \_\_ob\_\_  (当前 Observer实例 ) 属性。如果 value 是数组，会调用 observeArray 对数组进行遍历，在调用 observe 方法对每个元素进行观察。如果是对象，调用 walk 遍历 value 去调用 defineReactive 去修改属性的 get/set。 

``` js 
//defineReactive 函数

export function defineReactive (
  obj: Object,
  key: string, //遍历的key
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {

  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false)  return
  

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  //如果 key 的值是 对象 的话，对其 value 也会进行响应处理
  let childOb = !shallow && observe(val)

  //为当前 key 添加get/set
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      
      if (Dep.target) {

        dep.depend() //对当前属性 进行依赖收集

        if (childOb) {
          //如果属性值是 对象 ，则对属性值本身进行依赖收集
          childOb.dep.depend()
          if (Array.isArray(value)) {
            //如果值是数组 对数组的每个元素进行依赖收集
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val

      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }

      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }

      //对新值 进行观察处理
      childOb = !shallow && observe(newVal)
      //通知 Watcher
      dep.notify()
    }
  })
}


function dependArray (value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}

```

上面有两个地方有存在 Dep
- 一个是Observer 类 属性上有个 Dep ,这里主要是对数组（数组没有 get/set 不能像对象属性那样）和对象本身进行依赖收集和通知
![](/images/posts/js_vue/20200312225611.png)
![](/images/posts/js_vue/20200312225648.png)
- 一个是对属性 get/set 处理时候的 Dep ,这个主要是对象的属性进行依赖收集和通知

### 2.Dep ###
Dep 是 Observer 与 Watcher 桥梁，也可以认为 Dep 是服务于 Observer 的订阅系统。Watcher 订阅某个 Observer 的 Dep，当 Observer 观察的数据发生变化时，通过 Dep 通知各个已经订阅的 Watcher。

``` js
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = [] //Watcher实例
  }

  //接收的参数为Watcher实例，并把Watcher实例存入记录依赖的数组中
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  //与addSub对应，作用是将Watcher实例从记录依赖的数组中移除
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  //依赖收集
  depend () {
    if (Dep.target) { //存放当前Wather实例
      //将当前 Dep 存放到 Watcher（观察者） 中的依赖中
      Dep.target.addDep(this)
    }
  }

  //通知依赖数组中所有的watcher进行更新操作
  notify () {
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

Dep.target = null
const targetStack = []

export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}

```

### 3.Watcher ###

先看 Watcher 的构造函数

``` js
constructor( 
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean)
{
    ...

    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = noop
      }
    }

    this.value = this.lazy
      ? undefined
      : this.get()
}

```

expOrFn，对于初始化用来渲染视图的 watcher 来说，就是 render 方法，对于 computed 来说就是表达式，对于 watch 才是 key，而 getter 方法是用来取 value 的。最后调用了 get()方法


``` js

get () {
    //将Dep.target设置为当前watcher实例
    pushTarget(this)

    let value
    const vm = this.vm
    try {
      // 执行一次get 收集依赖
      value = this.getter.call(vm, vm) 
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps() //清楚依赖
    }
    return value
}

```
假如当前 Watcher 实例中 getter 是 render，当 render 遇到模板中的 {{xxx}} 表达式的时候，就是去读取 data.xxx，这个时候就触发 data.xxx 的 get 方法，这个时候 get 中会执行 Dep.depend(),而此时 Dep.target 就是当前 watcher ，然后调用 watcher.addDep()。也就将 data.xxx 与 当前 watcher 关联起来了

```js

//watcher 的其他方法

//接收参数dep(Dep实例)，让当前watcher订阅dep
addDep (dep: Dep) {
  const id = dep.id
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id)
    this.newDeps.push(dep)
    if (!this.depIds.has(id)) {
      //将watcher实例 也添加到 Dep实例中
      dep.addSub(this)
    }
  }
}

//清楚对dep的订阅信息
cleanupDeps () {
  
}

//立刻运行watcher或者将watcher加入队列中
update () {
  if (this.lazy) {
    this.dirty = true
  } else if (this.sync) {
    this.run()
  } else {
    queueWatcher(this)
  }
}

//运行watcher，调用this.get()求值，然后触发回调
run () {
  if (this.active) {
    const value = this.get()
    if (
      value !== this.value || isObject(value) || this.deep
    ) {
      const oldValue = this.value
      this.value = value
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue)
        } catch (e) {
          handleError(e, this.vm, `callback for watcher "${this.expression}"`)
        }
      } else {
        this.cb.call(this.vm, value, oldValue)
      }
    }
  }
}

//调用this.get()求值
evaluate () {
  this.value = this.get()
  this.dirty = false
}

//遍历this.deps，让当前watcher实例订阅所有dep
depend () {
  let i = this.deps.length
  while (i--) {
    this.deps[i].depend()
  }
}

//去除当前watcher实例所有的订阅
teardown () {
  if (this.active) {
    if (!this.vm._isBeingDestroyed) {
      remove(this.vm._watchers, this)
    }
    let i = this.deps.length
    while (i--) {
      this.deps[i].removeSub(this)
    }
    this.active = false
  }
}
```