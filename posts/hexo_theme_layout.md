---
title: Hexo 主题开发之自定义模板
date: 2023-12-13 15:29:25
tags: [hexo]
description:
categories: 创作类
keywords: Hexo主题开发，hexo扩展
---

关于 Hexo 如何开发主题包的教程已经是大把的存在了，这里就不再赘述了。这篇文章主要讲的是作为一个主题的开发者，如何让你的主题具有更好的扩展性，在用户自定义修改主题后，能够更加平易升级主题。

<!--more -->

### 问题所在

Hexo 提供两种方式安装主题包：

-   直接在 **themes** 目录下直接存放主题包文件，这种方式用户可以很方便的魔改主题，但是魔改后升级主题会变得比较困难
-   通过 **npm** 安装主题包，这种方式更加方便用户升级主题，但是不易扩展现有的主题。

当用户想要自定义修改主题时，基本上只能通过第一种方式安装，且只能通过修改 **源代码** 形式去修改主题。这样带来的问题就是，当主题修复一些 bug 或者主题迭代 N 个版本后，用户想升级主题时就会变的比较麻烦。

有没有能让用户方便升级，又能提供一定个性化的能力的东西呢？答案是有的，那就是通过 **npm** 方式分发主题包，我们通过一些魔法，让其有一定的扩展能力，这篇文章就来讲解如何实现它。

### 模板

在 Hexo 中，主题的模板决定的网站页面程序的方式，当你不同页面结构很相似时候，可以通过布局（**Layout**）去复用相同的结构，而相似的部分可以抽离成通用局部模板，通过使用 **Partial** 去加载，以达到模板复用的效果。

这就是 Hexo 在开发主题处理模板复用的方式，可把一个个局部模板理解为一个个独立的组件，哪里需要是就在哪里加载它。如果说用户想替换某一个局部模板，我们可以让用户提供一个新的模板，然后去加载用户提供的模板，那是不是达到在用户不修改**源代码**情况下对主题进行个性话的扩展呢。

### Partial

要想知道 Hexo 是如果加载局部模板的，翻看下 Hexo 源码里 **Partial** 的实现（/plugins/helper/partial.js），可以看到是通过调用 **ctx.theme** 获取到对应的 **view**，接着调用 **render** 渲染的。

```js
const { dirname, join } = require("path");

module.exports = (ctx) =>
    function partial(name, locals, options = {}) {
        const viewDir = this.view_dir;
        const currentView = this.filename.substring(viewDir.length);
        const path = join(dirname(currentView), name); // 根据当前路径找到，局部模板路径
        const view = ctx.theme.getView(path) || ctx.theme.getView(name); // 根据路径去匹配 view
        const viewLocals = { layout: false };
        // Partial don't need layout
        viewLocals.layout = false;
        return view.renderSync(viewLocals);
    };
```

Hexo 对文件处理分为两种，一种是 **source** 目录文件处理，一种是对主题包里文件处理。在辅助函数注册里可以看 **ctx** 其实就是 hexo 运行时的实例，上面的 **ctx.theme** 就是主题文件处理的 **Box**。通过 Hexo 提供 [api](https://hexo.io/zh-cn/api/themes) 可以看到，它不仅提供了 **getView**，还提供了 **setView**、**removeView** 方法。

然后翻看 setView 代码，可以看到当你重新设置一个新的 view 时，它会覆盖掉已有的 view。也就是说我们可以直接覆盖主题里的 **局部模板**

```js

  setView(path, data) {
    const ext = extname(path);
    const name = path.substring(0, path.length - ext.length);
    this.views[name] = this.views[name] || {};
    const views = this.views[name];

    views[ext] = new this.View(path, data);
  }

```

### 修改示例

以覆盖 hexo-theme-async 为示例，在生成前钩子 **generateBefore** 里，覆盖掉主题里默认的侧栏模板。

```js
hexo.on("generateBefore", () => {
    hexo.theme.setView("_partial/sidebar/index.ejs", "<div>111</div>");
});
```

运行起来会发现侧栏模板已经替换成我们写的 111 了。

![示例](/images/posts/hexo_theme_layout/image.png)

### 主题实现

通过上面方式确实可以达到覆盖主题默认模板能力，但是让用户直接修改会很不友好，需要自己去看主题中局部模板的路径信息，并且还需要自己编写加载文件内容，覆盖主题默认模板逻辑。

可以将这部分操作内置进入主题内处理，只需要让用户编写自己的模板，以及告诉我们需要替换对应模板即可。大致流程如下：

![demo](/images/posts/hexo_theme_layout/flow.png)

还可以提供默认配置，简化通过路径覆盖

![demo](/images/posts/hexo_theme_layout/flow2.png)

通过在配置中配置好主题中使用的局部模板，类似这样，将主题中使用的局部模板以配置形式展示。

```yaml
layout:
    path: layout
    # layout
    main: _partial/main
    header: _partial/header
    banner: _partial/banner
    sidebar: _partial/sidebar/index
    footer: _partial/footer
```

接着在加载局部模板时，直接读取配置的信息，当用户覆盖掉了 layout.header 时候，主题就会自动使用新的模板了。

```html
<%- partial(theme.layout.header) %>
```

### 模板加载实现

根据上面配置，约定 layout.path 配置指向目录为用存在模板目录，以便可以自定义存放路径。

```yaml
layout:
    path: layout
```

首先就是根据配置获取模板存在的绝对路径，可以根据 hexo 实例，获取到根目录，拼接出完整路径位置。

```js
const { resolve } = require("path");
const layoutDir = resolve(hexo.base_dir, hexo.theme.config.layout.path);
```

然后是对文件目录的监听，这个可以直接使用 hexo-fs ，避免安装额外的依赖包，提供了新增、删除、修改、文件夹变动的监听，可以针对不同事件做出不同操作。

```js
const { watch } = require("hexo-fs");

watch(layoutDir, {
    persistent: true,
    awaitWriteFinish: {
        stabilityThreshold: 200,
    },
}).then((watcher) => {
    watcher.on("add", (path) => /** 设置模板 */);
    watcher.on("change", (path) => /** 设置模板 */);
    watcher.on("unlink", (path) => /** 移除模板 */);
    watcher.on("addDir", (path) => /** 添加文件夹，递归遍历设置模板 */);
});
```

因为上面是通过配置去加载模板的，所有为了避免用户自定义的模板名称会与主题的模板名称冲突，导致覆盖了主题的模板，可以在使用时增加一个约定的前缀，避免重名，需要对设置模板进行简单封装。

```js
const setView = (fullpath) => {
    const path = "async" + fullpath.replace(layoutDir, ""); // 约定固定前缀为 async
    hexo.theme.setView(path, readFileSync(fullpath, { encoding: "utf8" }));
};
```

上面处理方式，用户自定义模板，可以正常加载使用的，但是当自定义的模板又引入了其他模板时会存在一个问题，在有的模板引擎中会出现路径不正常。通过查看 view 实例信息，可以看到其指向目录是在 node_modules，而实际上是存在根目录的。

![view](/images/posts/hexo_theme_layout/view.png)

翻看 view 源码可以看到 source 是获取的 this.\_theme.base ，而 this.\_theme.base 往上找就 theme_dir，也就是主题存放的目录，最后又通过 renderer.compile 设置模板渲染到，导致传入 path 不正确。

![view-code](/images/posts/hexo_theme_layout/view_code.png)

知道了原因我对上面代码进行修正，设置后重新获取到 view，然后手动根据路径信息。

```js
const setView = (fullpath) => {
    const path = "async" + fullpath.replace(layoutDir, ""); // 约定固定前缀为 async
    hexo.theme.setView(path, readFileSync(fullpath, { encoding: "utf8" }));

    const view = hexo.theme.getView(path);
    view.source = fullpath; // 修正原文件路径
    view._precompile(); // 重新调用渲染器的初始化
};
```

将上面操作，放置在在 Hexo 的 **generateBefore** 中：

```js
const { resolve } = require("path");
const { watch, readdirSync, statSync } = require("hexo-fs");

hexo.on("generateBefore", () => {
    const layoutDir = resolve(hexo.base_dir, hexo.theme.config.layout.path);

    const setView = (fullpath) => {
        const path = "async" + fullpath.replace(layoutDir, ""); // 约定固定前缀为 async
        hexo.theme.setView(path, readFileSync(fullpath, { encoding: "utf8" }));
        const view = hexo.theme.getView(path);
        view.source = fullpath; // 修正原文件路径
        view._precompile(); // 重新调用渲染器的初始化
    };

    watch(layoutDir, {
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 200,
        },
    }).then((watcher) => {
        watcher.on("add", (path) => setView(path));
        watcher.on("change", (path) => setView(path));
        watcher.on("unlink", (path) => {
            const path = "async" + path.replace(layoutDir, "");
            hexo.theme.removeView(path);
        });
        watcher.on("addDir", (path) => loadDir(path));
    });

    const loadDir = (base) => {
        let dirs = readdirSync(base);
        dirs.forEach((path) => {
            const fullpath = resolve(base, path);
            const stats = statSync(fullpath);
            if (stats.isDirectory()) {
                loadDir(fullpath);
            } else if (stats.isFile()) {
                setView(fullpath);
            }
        });
    };

    loadDir(layoutDir);
});
```

到此主要功能以及实现了，其他待优化项这里就不描述了，可以看看完整实现源码。

### 使用示例

以为 hexo-theme-async 为例，在根目录新建 layout 目录，再目录下添加 sidebar.ejs 文件，结构如下：

```txt 
┌── blog
│   └── layout
│          └── sidebar.ejs
│   └── scaffolds
│   └── source
│   └── themes
```

sidebar.ejs 添加一点内容

```html
<div>111</div>
```

在 \_config.async.yml 中修改 layout 配置，替换掉默认 sidebar 模板。

```yml
layout:
    sidebar: async/sidebar
```

运行起来后，可以看到效果和 [修改示例](#修改示例) 中的效果一样，但是简化了用户使用。

### 结语

通过上面方式，可以在使用 npm 安装主题时，也支持自定义替换部分区域，来个性化的目的，当主题版本迭代升级后，也更方便用户更新升级。

完整实现源码可以参考 [hexo-theme-async](https://github.com/MaLuns/hexo-theme-async/blob/dev/packages/hexo-theme-async/scripts/events/layout.js) 中源码。
