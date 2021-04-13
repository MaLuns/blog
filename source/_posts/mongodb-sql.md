---
title: mongodb语法与sql对比（一）
comment: true
hash: 1618316929927
date: 2021-04-13 20:28:49
tags: [mongodb]
description:
categories: 记录类
keywords:
---
事件！事件到底是怎么工作的？JavaScript出现了多久，对JavaScript异步事件模型就迷惘了多久。
 <!-- more -->

## 基本组成
在mongoDB中基本的概念是文档、集合、数据库，没有关系型数据库中表、行等这些概念的

|  mongoDB   | SQL  | 说明 |
|  --------  | --------  | --------  |
| database  | database | 数据库 |
| collection  | table | 集合/表 |
| document  | row | 文档/行 |
| field  | column | 域/字段 |
| index  | index | 索引 |
| 不支持 |table joins | 连表 |

mongoDB曾经是不支持连表的，在3.2以后版本增加了$lookup可以实现左连接 


## 创建,删除集合
``` javascript
// 查看集合
show collections

/// 集合名称，配置选项（可选）
db.createCollection('table_name', {
    //(可选）指定是否创建固定大小集合，如果是true 在达到最大值的时候会覆盖最早的文档
    capped: true ，
    //(可选）为固定集合指定一个最大大小
    size:1000000, 
    //(可选）指定固定集合中包含文档的最大数量
    max:100 
})

// 删除集合
db.table_name.drop()
```

## 新增

## 删除

## 查询

## 修改

## 常用操作符