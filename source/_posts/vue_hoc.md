---
title: Vue 中的 mixin,component,render,hoc
comments: true
date: 2021-03-02 20:26:25
tags: [vue]
description: 
categories: 记录类
keywords: 高阶组件,hoc,mixin
---
在项目中，一般我们经常会基于一套现有组件库进行快速开发，但是现实中往往需要对组件库进行定制化改造二次封装

<!--more-->

## 混入(mixin)
vue 官方介绍
>混入 (mixin) 提供了一种非常灵活的方式，来分发 Vue 组件中的可复用功能。一个混入对象可以包含任意组件选项。当组件使用混入对象时，所有混入对象的选项将被“混合”进入该组件本身的选项。

简单来说就是将组件的对象的属性，方法，钩子函数等等进行提取封装，以便达到可以多出复用。来看一个简单例子

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
上面是个常见报表分页使用场景，假如有很多个表报，那就需要写很多次分页的逻辑，正常开发中当然不可能这么处理的，这种情况就可以使用 mixins 来提取分页的逻辑。

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
这样就将分页的逻辑分离出来了，也可以被其他组件混入使用，大大的减少了代码量，当然 mixin 过度滥用也是存在缺点的。

- 命名冲突
    使用 mixins 是将两个组件对象合并的，当两个组件属性名重复时候，vue 默认会将本地组件的属性覆盖 mixin 的，虽然 vue 提供了合并策略配置，但是同时存在多个 mixin 存在命名冲突时候就会变得处理起来非常麻烦了。
- 隐含的依赖关系
    很明显上面的组件是依赖于 mixin 的，这种情况会存在潜在问题。如果我们以后想重构一个组件，改变了 mixin 需要的变量的名称，就会影响现有的组件的使用了，而且当项目中使用了很多这个 mixin 的时候，就只能去手动搜索修改了，因为不知道哪些组件使用了这些 mixin。

## 组件封装
上面表格还有中处理方法，就是将 el-table 和 el-pagination 封装成一个组件去是使用，也能提高复用性。

### template封装
使用 template 创建组件，来对 el-table 进行二次封装满足上面需求，增加一个 total 参数
提供是一个分页改变事件，再把 m-table 的 $attrs 和 $listeners 绑定到 el-table 上，然后把 el-table 方法暴露出去，这样就可像使用 el-table 一样使用 m-table。
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
一般情况下这样使用 template 封装就满足了需求，但是总有些时候这样封装是满足不了需求的。比如现在 m-table 现在需要动态支持修改配置显示列，并且不希望修改 m-table 的基本使用方式， 这个时候就需要使用 render 了。

### render 函数
Vue 的模板实际上都会被编译成了渲染函数，render 函数有一个 createElement 参数，用来创建一个 VNode。

要满足上面的需求，首先是的获得 el-table 的插槽(slot)中的内容，根据插槽的内容生成每列信息，根据配置的信息动态创建插槽的内容就可以实现了。简单示例代码入下
``` html
<script>
import mSetting from './setting'
export default {
    components: { mSetting },
    name: 'm-table',
    data() {
        return {
            showTable: true,
            setShow: false,
            config: [],
            copySlots: [], // 展示solt数据
            page: {
                pageSize: 20,
                pageIndex: 1
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
    created() {
        this.initConfig()
    },
    render() {
        return (
            <div>
                <el-table ref="table" {...{ attrs: this.$attrs }} {...{ on: this.$listeners }}>
                    {
                        this.copySlots
                    }
                </el-table>
                {this.showTable ? (<el-pagination layout="total, sizes, prev, pager, next, jumper"
                    {...{
                        on: {
                            'size-change': (e) => this.page.pageSize = e,
                            'current-change': (e) => this.page.pageIndex = e
                        }
                    }}
                    {...{
                        attrs: {
                            'current-page': this.page.pageIndex,
                            'page-sizes': [20, 30, 40, 50],
                            'total': this.total
                        }
                    }}
                > </el-pagination>) : null}
                <m-setting  {...{
                    on: {
                        'update:show': e => this.setShow = e,
                        'change': this.initConfig
                    }
                }} show={this.setShow} config={this.config}></m-setting>
            </div >
        )
    },
    methods: {
        initConfig(config = []) {
            if (config.length === 0) {
                config = this.$slots.default
                    .filter(item => item.componentOptions && item.componentOptions.tag === "el-table-column")
                    .map(item => {
                        if (item.componentOptions.propsData.prop === 'index') {
                            if (!item.data.scopedSlots) {
                                item.data.scopedSlots = {};
                            }
                            item.data.scopedSlots.header = () => (
                                <i class="el-icon-s-tools" onClick={() => this.setShow = true} />
                            );
                        }
                        return { ...item.componentOptions.propsData };
                    })
                this.sourceConfig = JSON.parse(JSON.stringify(config))
                this.copySlots = this.$slots.default;
                this.sourceSlots = this.$slots.default;
            } else {
                let arr = []
                this.sourceSlots.forEach(item => {
                    let temp = config.find(subItem =>
                        (subItem.prop && subItem.prop === item.componentOptions.propsData.prop) ||
                        (subItem.type && subItem.type === item.componentOptions.propsData.type)
                    );
                    if (temp && temp.isShow) {
                        Object.assign(item.componentOptions.propsData, temp);
                        arr.push(item)
                    }
                })
                this.copySlots = arr;
                this.showTable = false
                this.$nextTick(() => {
                    this.showTable = true
                })
            }
            this.config = config;
        },
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

``` html
<template>
    <el-dialog title="表格设置" :visible.sync="shows" width="600px" size="small" :before-close="handleClose">
        <el-table :data="list" size='mini'>
            <el-table-column prop="showLabel" label="名称"></el-table-column>
            <el-table-column prop="label" label="显示名称">
                <template slot-scope="{row}">
                    <el-input size="mini" v-model="row.label"></el-input>
                </template>
            </el-table-column>
            <el-table-column prop="isShow" label="是否显示" width="100" align="center">
                <template slot-scope="{row}">
                    <el-switch v-model="row.isShow"></el-switch>
                </template>
            </el-table-column>
        </el-table>
        <span slot="footer" class="dialog-footer">
            <el-button @click="shows = false" size="small">取 消</el-button>
            <el-button type="primary" @click="handleClose()" size="small">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
export default {
    name: 'm-setting',
    data() {
        return {
            list: []
        };
    },
    computed: {
        shows: {
            get() {
                return this.show;
            },
            set() {
                this.$emit("update:show")
            }
        }
    },
    props: {
        show: {
            type: Boolean,
            required: true,
            default: false
        },
        config: {
            type: Array,
            default() {
                return []
            }
        }
    },
    created() {
        this.init()
    },
    methods: {
        init() {
            this.list = this.config.map(item => {
                return {
                    ...item,
                    showLabel: item.showLabel || item.label, // 名称
                    isShow: item.isShow || true // 是否显示
                }
            })
        },
        handleClose() {
            this.$emit('change', this.list);
            this.shows = false
        }
    }
};
</script>
```
这样就简单实现了可以动态显示列，而且不需要去修改原组件的使用方式了。
## hoc 高阶组件

[vue高阶组件可以参考这篇](http://hcysun.me/2018/01/05/%E6%8E%A2%E7%B4%A2Vue%E9%AB%98%E9%98%B6%E7%BB%84%E4%BB%B6/)