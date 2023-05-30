---
title: 前端数组转树形结构
comments: true
date: 2021-10-28 20:08:29
tags: [JavaScript]
categories: 记录类
description:
keywords: 前端,js,tree
---
数组转树形结构这种情况还是很常见的，有时候后端就只给你一个数组，需要前端自己处理。一般情况下一个递归就搞定了，但是数据量很多的时候就有点 hot 不住了。
<!-- more -->
例如：
``` js
const list = [
  { id: '1', name: '节点1' },
  { id: '1_1', parentId: '1', name: '节点1-1' },
  { id: '1_1_1', parentId: '1_1', name: '节点1-1-1' },
  { id: '2', name: '节点2' },
  { id: '2_1', parentId: '2', name: '节点2-1' },
  ...
]
```
## 使用递归处理
遍历查找当前 parentId 的子级，然后在递归查找子级的子级。
``` js
const convertToTree = (list = [], parentId) => {
    const arr = []
    list.forEach((item) => {
        if (item.parentId === parentId) {
            arr.push({
                ...item,
                children: convertToTree(list, item.id)
            })
        }
    })
    return arr
}

convertToTree(list)
```
分析代码看到每一次 **convertToTree** 调用都是对 list 一次遍历，加上第一次调用，可以看出该实现的时间复杂度为 **O(n^2+n)**。

## 使用非递归实现

可以巧妙的应用了对象保存的是引用的特点，将id作为key 创建一个 map 去存储数据，然后根据 parentId 去找对应父级，添加到对应的 children 里面去。
``` js
const convertToTree = (list = []) => {
    const res = []

    let itemMap = {}
    list.forEach(item => {
        itemMap[item.id] = { ...item, children: [] }
    })

    list.forEach(item => {
        const treeItem = itemMap[item.id]; //获取当前项
        const pItem = itemMap[item.parentId]; // 获取父级

        if (pItem) {
            pItem.children.push(treeItem)
        } else {
            // 如果没有父级说明在顶层
            res.push(treeItem)
        }
    })
    return res
}

convertToTree(list)
```
可以看到我们只需要循环两次，其时间复杂度为 **O(2n)**，因为额外对数据进行一次存储想要的内存消耗会有一定增加。

还可以对上面进一步进行优化，可以在一个循环里解决，这样其时间复杂度为 **O(n)**。
``` js
const convertToTree = (list = []) => {
    const res = []

    let itemMap = {}
    list.forEach(item => {
        let id = item.id
        let pid = item.parentId

        if (!itemMap[id]) {
            itemMap[id] = {
                children: []
            }
        }

        itemMap[id] = {
            ...item,
            children: itemMap[id].children 
        }

        if (pid === undefined) {
            res.push(itemMap[id])
        } else {
            if (!itemMap[pid]) { // 没有父级 先创建一个
                itemMap[pid] = {
                    children: []
                }
            }
            itemMap[pid].children.push(itemMap[id])
        }
    })
    return res
}

convertToTree(list)
```
## 总结
从上面时间复杂度来看，随数据量增大的走势可以看出，当数据越来越大时，递归算法的耗时将远远大于非递归算法。有时候还是需要选择合适的算法来处理数据，会比你一时图个方便写的算法的性能有质的提升。