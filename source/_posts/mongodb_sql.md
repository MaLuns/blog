---
title: MongoDB基础篇（一）
comment: true
hash: 1618316929927
date: 2021-04-13 20:28:49
tags: [MongoDB]
description:
categories: 记录类
keywords:
---
MongoDB 是一个介于关系数据库和非关系数据库之间的产品。面向文档的NoSQL的数据库，存储结构也非常自由，是类似json的bson格式，因此可以存储比较复杂的数据类型。其强大的查询语言几乎支持绝大部分关系数据的的查询的功能。
<!-- more -->

## 基本组成
在MongoDB中基本的概念是文档、集合、数据库，没有关系型数据库中表、行等这些概念的

|  MongoDB   | SQL  | 说明 |
|  --------  | --------  | --------  |
| database  | database | 数据库 |
| collection  | table | 集合/表 |
| document  | row | 文档/行 |
| field  | column | 域/字段 |
| index  | index | 索引 |
| 不支持 |table joins | 连表 |

MongoDB曾经是不支持连表的，在3.2以后版本增加了$lookup可以实现左连接 


## 集合
``` javascript
// 查看集合
show collections

/// 集合名称，配置选项（可选）
db.createCollection('table_name', {
    //(可选）指定是否创建固定大小集合，如果是true 在达到最大值的时候会覆盖最早的文档
    capped: true ,
    //(可选）为固定集合指定一个最大大小
    size:1000000, 
    //(可选）指定固定集合中包含文档的最大数量
    max:100 
    // 指定创建固定集合后,里面的文档不可以删除了,除非删除整个集合重新创建
})

// 删除集合
db.table_name.drop()
```

## 新增
MongoDB 提供了三个方法
- insert 插入单个或者多个
- insertOne 插入单个文档
- insertMany 插入多个文档

如果插入文档没有提供_id,MongoDB 会默认生成一个ObjectId的_id,
``` javascript
db.table_name.insert(
    [
        { title:'插入多个1' },
        { _id:'12312312', title:'插入多个2'}
    ],
    { // insertOne,insertMany也可以设置
        writeConcern: { // 写入策略
            w: 1,  // 0 不要求进行写入确认  1 要求进行写入确认  majority 要求已写入到副本集中的大多数服务器中 , 默认为1 
            j: false, // 如果为true，写入请求将等到日志同步完成后再返回,默认false
            wtimeout: 5000 // 超时时间
        },
        ordered: false // 指定是否有序插入默认为true
    }
)

// insertOne 配置没有 ordered
db.table_name.insertOne({
    title:'插入单个'
})

db.table_name.insertMany([
    { title:'插入多个1'},
    { _id:'12312312', title:'插入多个2'}
])
```
## 删除
删除也内部提供了三个方法
- remove  删除单个或者多个文档
- deleteOne 删除单个文档,3.2+ 提供的
- deleteMany 删除多个文档,3.2+ 提供的

``` javascript
db.table_name.remove(
    { // 指定过滤条件
        title: '插入多个1'
    },
    {// 配置,可忽略
        justOne: true,// 指定是否仅删除一个
        writeConcern:{},// 写入策略
        collation:{} // Collation允许根据语言指定自定义排序规则,低版本里默认是按字节对比的
    }
)
// 不指定条件,默认删除所有
db.table_name.remove({})

// deleteOne,deleteMany与remove 类似,去掉了justOne配置,增加了hint 指定索引
db.table_name.deleteOne({},{})
db.table_name.deleteMany({},{})

```

## 查询
查询也提供了单个和多个文档查询等
- find 查找集合中符合条件的所有记录
- findOne 查询单条

### 常用条件使用方式
find传入两个参数，一个指定查询条件文档，一个指定字段
``` javascript
// 语法
// projection 可选，不指定projection默认查所有
db.collection.find(query, projection)

// 增加几条示例数据
[
    { title: "插入多个1", status: "A", obj: { statue:1,title:'A' }, arr: [ { statue:1,title:'A' } ] },
    { title: "插入多个2", status: "A", obj: { statue:9,title:'A' }, arr: [ { statue:9,title:'A' },{ statue:1,title:'A' } ] },
    { title: "插入多个3", status: "A", obj: { statue:9,title:'C' }, arr: [ { statue:9,title:'C' },{ statue:1,title:'A' } ] }
]

// 普通查询
db.table_name.find({ title:"插入多个1" })
```
查询数组中嵌套文档
``` javascript
// 查询 arr 数组, 查询条件里的结构顺序必须和存储的保持一直， 如果是 arr:{ title:'A'，statue:1 } 则查询不出来
db.table_name.find({ 
    arr:{ 
        statue:1,
        title:'A'
    } 
})
// arr 数组中对象字段作为条件
db.table_name.find({ 
    'arr.statue': 9 
})
// 使用多个字段作为条件的时候，看的上面的可能会联想到这写。 实际上这样会把第2，3条都查询出来，这样实际是查询 statue为9和title为A的，但是并不需要是同一个文档里
db.table_name.find({ 
    'arr.statue': 9 ,
    'arr.title': 'A' 
})
// 想要使用一个文档中多个字段 需要使用 运算符 $elemMatch
db.table_name.find({
  arr:{
    $elemMatch:{
      title:"A",
      statue: 1
    }
  }
})
```
查询嵌套的文档
``` javascript
// 这样写 和数组一样，都是完全匹配一致
db.table_name.find({
  obj:{
    statue:1,
    title:'A'
  }
})
// 指定文档字段
db.table_name.find({
 'obj.statue':1
})
```
### 指定返回字段
默认情况下，MongoDB中的查询返回匹配文档中的所有字段,可以配置一个projection 文档以指定或限制要返回的字段。

``` javascript
// 示例数据结构
{ title: "插入多个1", status: "A", obj: { statue:1,title:'A' }, arr: [ { statue:1,title:'A' } ] }

db.table_name.find({ title:'插入多个1' })
// 类似sql的
select * from table_name where title='插入多个1'

// 指定返回字段
db.table_name.find({ title:'插入多个1' },{ title: 1,staus:1  })  // 1 代表返回字段, 0 代表过滤的字段
// 类似sql的
select _id,title,staus from table_name where title='插入多个1'
// _id MongoDB是默认指定返回的,如果想要不返回 可以指定 { _id:0 }

// 指定嵌套文档返回字段  4.4以后版本,还可以直接嵌套使用 { title: 1,obj:{ statue:1  } }
// 嵌套的数组和嵌套文档操作一致
db.table_name.find({ title:'插入多个1' },{ title: 1,'obj.statue': 1, 'arr.title': 1 }) 
// 返回结果
{  title: "插入多个1", obj: { statue:1 }, arr: [{ title:1 }]}

// 利用运算符 数组指定数据 $slice 返回数组最后一个
db.table_name.find({ title:'插入多个1' },{ title: 1,'obj.statue': 1, arr: { $slice: -1 } }) 
```
使用查询运算符和映射运算符，还能实现更为复杂的条件过滤和字段匹配
## 更新
MongoDB中更新文档，需要与更新运算符结合使用来修改字段值。
提供的更新方法
- update 更新或替换单个或者多个文档
- updateOne 更新单个文档
- updateMany 更新多个文档
- replaceOne 替换单个文档 
基本使用方式
``` javascript
// 增加几条示例数据
[
    { title: "插入多个1", status: "A", obj: { statue:1,title:'A' }, arr: [ { statue:1,title:'A' } ] },
    { title: "插入多个2", status: "B", obj: { statue:9,title:'A' }, arr: [ { statue:9,title:'A' },{ statue:1,title:'A' } ] },
    { title: "插入多个3", status: "C", obj: { statue:9,title:'C' }, arr: [ { statue:9,title:'C' },{ statue:1,title:'A' } ] }
]

// 语法 
db.table_name.update('查询条件','更新管道','设置')

// 替换查询的整个文档
db.table_name.update({ title:'插入多个1' },{ status:'D' })
// 更新指定字段
db.table_name.update(
    { title:'插入多个1' },
    { 
        $set:{
            status:'D' 
        }
    },
    {
        multi: true ,// 默认false, 是否更新多条
        upsert: true,// 默认fals, 如果不存在文档这新增一条
    }
)

// 修改嵌套数组字段
db.table_name.update({
  title: "插入多个1",
  "arr.statue": 1 
},
{
  "$set": {
    //"arr.0.statue": 3 // 修改第1条
    "arr.$.statue": 3 // 单个修改需要指定数组条件
    //"arr.$[].statue": 3 //修改多个
  }
})
```

## 常用运算符