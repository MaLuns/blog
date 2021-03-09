---
title: Vue 中的 mixin,component,render,hoc
comment: true
hash: 1614687985128
date: 2021-03-02 20:26:25
tags: [vue]
description: 
categories: 记录类
keywords:
---
在项目中,一般我们经常会基于一套现有组件库进行快速开发,但是现实中往往需要对组件库进行定制化改造二次封装

<!--more-->

## 混入(mixin)
vue 官方介绍
>混入 (mixin) 提供了一种非常灵活的方式，来分发 Vue 组件中的可复用功能。一个混入对象可以包含任意组件选项。当组件使用混入对象时，所有混入对象的选项将被“混合”进入该组件本身的选项。

简单来说就是将组件的对象的属性,方法,钩子函数等等进行提取封装,以便达到可以多出复用。来看一个简单例子

``` html
<template>
    <div>
        <el-table :v-loading='isLoading' :data="tableData" style="width: 100%"  ref="table">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="name" label="规则名称"></el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column prop="count" label="服务调用次数(万)"></el-table-column>
            <el-table-column prop="state" label="状态">
                <template slot-scope="{row}">
                    <span :class="['run-state',row.state]"></span>
                    {{ row.state=='close'?'关闭':'运行中' }}
                </template>
            </el-table-column>
            <el-table-column prop="time" label="上次调度时间"></el-table-column>
            <el-table-column label="操作">
                <template>
                    <el-button type="text">编辑</el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text">订阅警报</el-button>
                </template>
            </el-table-column>
        </el-table>
         <el-pagination :current-page.sync="page.pageIndex" :page-sizes="[20, 30, 40, 50]" @size-change="(e)=>page.pageSize=e" :total="total" layout="total, sizes, prev, pager, next, jumper"> </el-pagination>
    </div>
</template>
<script>
export default {
    data () {
        return {
            tableData:[],
            isLoading: false,
            total: 0,
            page: {
                pageSize: 20,
                pageIndex: 1
            }
        };
    },
    watch: {
        'page':{
            deep: true,
            immediate: true,
            handler(){
                this.getList()
            }
        }
    },
    methods: {
        getList(pageIndex = this.page.pageIndex,pageSize = this.page.pageSize){
            //获取列表数据
            this.isLoading = true;
            setTimeout(() => {
                this.tableData = MockData();
                this.total=300;
                this.isLoading = false;
            }, 2000);
        }
    }
};
</script>
```
上面是个常见报表分页使用场景,假如有很多个表报,那就需要写很多次分页的逻辑,正常开发中当然不可能这么处理的, 这种情况就可以使用mixins来提取分页的逻辑

``` js
// mixins.js
<script>
export default {
    data () {
        return {
            isLoading: false,
            total: 0,
            page: {
                pageSize: 20,
                pageIndex: 1
            }
        };
    },
    watch: {
        'page':{
            deep: true,
            immediate: true,
            handler(){
                this.getList()
            }
        }
    }
};
</script>
```
``` html
<template>
    <div>
        <el-table :v-loading='isLoading' :data="tableData" style="width: 100%"  ref="table">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="name" label="规则名称"></el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column prop="count" label="服务调用次数(万)"></el-table-column>
            <el-table-column prop="state" label="状态">
                <template slot-scope="{row}">
                    <span :class="['run-state',row.state]"></span>
                    {{ row.state=='close'?'关闭':'运行中' }}
                </template>
            </el-table-column>
            <el-table-column prop="time" label="上次调度时间"></el-table-column>
            <el-table-column label="操作">
                <template>
                    <el-button type="text">编辑</el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text">订阅警报</el-button>
                </template>
            </el-table-column>
        </el-table>
         <el-pagination :current-page.sync="page.pageIndex" :page-sizes="[20, 30, 40, 50]" @size-change="(e)=>page.pageSize=e" :total="page.total" layout="total, sizes, prev, pager, next, jumper"> </el-pagination>
    </div>
</template>
<script>
import PageMixins from "./mixins.js";
export default {
    mixins:[PageMixins],
    data () {
        return {
            tableData:[]
        };
    },
    methods: {
        getList(pageIndex = this.page.pageIndex,pageSize = this.page.pageSize){
            //获取列表数据
            this.isLoading = true;
            setTimeout(() => {
                this.tableData = MockData();
                this.total=300;
                this.isLoading = false;
            }, 2000);
        }
    }
};
</script>
```
这样就将分页的逻辑分离出来了,也可以被其他组件混入使用,大大的减少了代码量,当然mixin过度滥用也是存在缺点的

- 命名冲突
    使用mixins是将两个组件对象合并的,当两个组件属性名重复时候,vue默认会将本地组件的属性覆盖mixin的,虽然vue提供了合并策略配置,但是同时存在多个mixin存在命名冲突时候就会变得处理起来非常麻烦了
- 隐含的依赖关系
    很明显上面的组件是依赖于mixin的,这种情况会存在潜在问题。如果我们以后想重构一个组件，改变了mixin需要的变量的名称，就会影响现有的组件的使用了,而且当项目中使用了很多这个mixin的时候,就只能去手动搜索修改了。因为不知道哪些组件使用了这些mixin

## 组件封装
上面表格还有中处理方法,就是将el-table和el-pagination封装成一个组件去是使用,也能提高复用性

### 使用template封装
将el-table进行二次封装,增加一个total参数,提供是一个分页改变事件,再把m-table的$attrs和$listeners 绑定到el-table上,然后把el-table 方法暴露出去,这样就可像使用 el-table 一样使用 m-table
``` html
<template>
    <div>
        <el-table ref="table" v-bind="$attrs" v-on="$listeners">
            <slot></slot>
        </el-table>
        <el-pagination :current-page.sync="page.pageIndex" :page-sizes="[20, 30, 40, 50]" @size-change="(e)=>page.pageSize=e" :total="total" layout="total, sizes, prev, pager, next, jumper"> </el-pagination>
    </div>
</template>

<script>
export default {
    name: 'm-table',
    data() {
        return {
            page: {
                pageSize: 20,
                pageIndex: 2
            }
        }
    },
    props: {
        total: {
            type: Number,
            default: 0
        }
    },
    watch: {
        page: {
            deep: true,
            handler: function () {
                this.$emit("page-chagne")
            }
        }
    },
    methods: {
        // 将el-table 方法暴露出去
        ...(() => {
            let methodsJson = {};
            ['reloadData', 'clearSelection', 'toggleRowSelection', 'toggleAllSelection', 'setCurrentRow', 'clearSort', 'clearFilter', 'doLayout', 'sort']
                .forEach(key => {
                    methodsJson = {
                        ...methodsJson, [key](...res) {
                            this.$refs['table'][key].apply(this, res);
                        }
                    };
                });
            return methodsJson;
        })()
    }
}
</script>
```
使用 m-table
``` html
 <m-table @page-chagne="GetTableDataList()" :total="page.total" :data="tableData">
    <el-table-column type="selection" width="55"></el-table-column>
    <el-table-column prop="name" label="规则名称"></el-table-column>
    <el-table-column prop="description" label="描述"></el-table-column>
    <el-table-column prop="count" label="服务调用次数(万)"></el-table-column>
    <el-table-column prop="state" label="状态">
        <template slot-scope="{row}">
            <span :class="['run-state',row.state]"></span>
            {{ row.state=='close'?'关闭':'运行中' }}
        </template>
    </el-table-column>
    <el-table-column prop="time" label="上次调度时间"></el-table-column>
    <el-table-column label="操作">
        <template>
            <el-button type="text">编辑</el-button>
            <el-divider direction="vertical"></el-divider>
            <el-button type="text">订阅警报</el-button>
        </template>
    </el-table-column>
</m-table>
```

## hoc