---
title: vitepress 自定义主题教程
comment: true
date: 2024-09-23 13:15:57
tags: [vitepress, vite]
description:
categories: 创作类
keywords: [vitepress, vite, vitepress-theme, vitepress教程]
---

这篇文章是什么呢? 就是如题所述告诉你如何自定义极简的博客主题。

<!-- more -->

## 需求

### vitepress 是什么

VitePress 是一个静态站点生成器 (SSG)，专为构建快速、以内容为中心的站点而设计。简而言之，VitePress 获取用 Markdown 编写的内容，对其应用主题，并生成可以轻松部署到任何地方的静态 HTML 页面。

### 功能需求

首先确定我们开发一个主题需要哪些页面和功能，一个极简的博客可以只需要下面三个页面。加载文章数据生成首页，以及显示文章的详情页

- 首页
- 文章详情页
- 404 页

## 实现

需要注意的是 vitepress 自定义主题需要区分哪些是运行在 node 环境的，哪些是运行在 浏览器 上的。

只运行在 node 中的

- 配置文件 config.ts
- 构建是加载数据 `.data.js` 或 `.data.ts` 结尾文件

node 和 浏览器都会运行的

- SFC 文件，因为使用的 SSR 渲染，所有需要注意使用范围

原则上只在 Vue 组件的 beforeMount 或 mounted 钩子中访问浏览器或 DOM API。

### 自定义主题

vitepress 想要自定义主题，只需要在主题启动入口文件里申明使用自定义主题即可 ( `.vitepress/theme/index.js` 或 `.vitepress/theme/index.ts` 为主题入口文件)

```
.
│─ .vitepress
│  ├─ theme
│  │  └─ index.ts   # 主题入口
│  └─ config.ts     # 配置文件
│─ index.md
└─ package.json
```

在入口文件中导出根布局组件，`Layout.vue` 会替代 `vitepress` 默认主题进行页面的渲染，让我们从 `Layout.vue` 开始完善一个完整的主题吧。

```ts
// .vitepress/theme/index.ts

// 可以直接在主题入口导入 Vue 文件
import Layout from "./Layout.vue";
export default {
  Layout, // 每个页面的根布局组件
};
```

在开始之前，我们确定我们项目页面结构组成，暂定为如下目录结构，将文章集中放在 `_posts` 目录下

```
.
│─ .vitepress
│  ├─ theme
│  │  └─ index.ts   # 主题入口
│  └─ config.ts     # 配置文件
│─ _posts # 文章存放目录
│  ├─ xxxx.md
│  └─ xxxx.md
│─ index.md # 首页
└─ package.json
```

### 加载 \_posts 文章

首页里的内容除了通用的布局样式之外 (导航、侧栏、横幅、....) 主要的就是文章列表了，我们先来实现对 `_posts` 目录下文件加载和分页，以及文章置顶排序等实现。

在 vitepress 提供了构建是加载数据的钩子，我们可以自定义加载数，并且在页面中使用它。使用方式也很简单只需要文件 `.data.js` 或 `.data.ts` 结尾即可。

我们添加 `posts.data.ts` 文件，大致流程就是 读取文件 => 处理 frontmatter 参数、摘要、内容 => 对文章排序处理

需要注意的是: `.data.ts` 是运行在 node 环境下的，避免使用浏览器的 api

```ts
export default {
  watch: ["_posts/**/*.md"],
  // files 是一个所匹配文件的绝对路径的数组。
  load(files) {
    // 使用 vitepress 内置 渲染插件渲染 md 文件里提取摘要信息
    md = md || (await createMarkdownRenderer(config.srcDir, config.markdown, config.site.base, config.logger));
    const raw = [];
  },
};
```

通过 `fs` 读取文件内容和文件信息，以及文件信息(创建时间 和 修改时间)，可以将生成的文章信息缓存起来，通过判断 `mtimeMs` 是否变更来判单是否需要重新生成。

```ts
const { mtimeMs: timestamp, birthtimeMs } = fs.statSync(file);
const cached = cache.get(file);

if (cached && timestamp === cached.timestamp) {
  raw.push(cached.data);
  continue;
}
```

使用 `gray-matter` 库来提取 md 文件里的 YAML frontmatter 信息，在 `gray-matter` 里 `excerpt` 添加摘要生成函数。

```ts
const fileContent = fs.readFileSync(file, "utf-8");
let excerpt = "";
const { data: meta } = matter<string, any>(fileContent, {
  excerpt: ({ content }: matter.GrayMatterFile<string>) => {
    const reg = /<!--\s*more\s*-->/gs; //  将 <!-- more --> 前面内容视为摘要格式
    const rpt = reg.exec(content);
    excerpt = rpt ? content.substring(0, rpt.index) : "";
  },
});
```

获取文章创建时间，取值规则如下 md => git => file，先去 frontmatter 里声明时间，然后获取 git 提交时间，如果前面两个都没获取到则获取文件的时间。

frontmatter 和 文件创建时间 上面都以及获取到了接下来主要是获取 git 提交时间 ，主要是通过 `git log` 命令获取文件信息。

node 实现如下

```ts
import { spawnSync } from "node:child_process";

function getFileBirthTime(url: string) {
  try {
    // ct
    const infoStr = spawnSync("git", ["log", '--pretty="%ci"', url]).stdout?.toString().replace(/["']/g, "").trim();
    const timeList = infoStr.split("\n").filter((item) => Boolean(item.trim()));
    if (timeList.length > 0) {
      return new Date(timeList.pop()!).getTime();
    }
  } catch (error) {
    return undefined;
  }
}
```

渲染摘要信息 和 处理文件路径

```ts
let url = normalizePath(path.relative(config.srcDir, file));
url = config.rewrites.map[url] ?? url;
url = "/" + url.replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, config.cleanUrls ? "" : ".html");

const renderedExcerpt = excerpt ? md.render(excerpt) : void 0;
const data = {
  excerpt: renderedExcerpt,
  ...meta,
  url: withBase(config.site.base, url),
  filePath: slash(path.relative(config.srcDir, file)),
};
cache.set(file, { data, timestamp });
raw.push(data);
```

对生成数据进行排序并返回

```ts
return sortBy(raw, "-date");
```

### 页面布局

对文章的数据加载已经实现 ，在布局组件里直接导入 `post.data` 文件， `layout` 为 home 视为首页, 其他则为文章详情页面 。

```vue
<script setup lang="ts">
import { useData } from "vitepress";
import { data as allPosts } from "./post.data";
import { formatDate } from "./util/client";
const { page } = useData();
</script>

<template>
  <div v-if="page.isNotFound">404</div>
  <template v-else>
    <div v-if="page.frontmatter.layout === 'home'" class="post-list">
      <div v-for="item in allPosts" class="post-list-item">
        <a :href="item.url">
          <span>{{ item.title }}</span>
          <span>{{ formatDate(item.date, "YYYY-MM-dd") }}</span>
        </a>
      </div>
    </div>
    <template v-else>
      <div class="post-title">
        <div>{{ page.title }}</div>
        <a href="/">返回</a>
      </div>
      <div class="post-info">
        <Content />
      </div>
    </template>
  </template>
</template>
```

把所有页面逻辑都写在一个页面会难以维护 ，我们拆分一下

```vue
<template>
  <NotFoundPage v-if="page.isNotFound" />
  <template v-else>
    <HomePage v-if="page.frontmatter.layout === 'home'" />
    <PostPage v-else />
  </template>
</template>
```

### 实现分页

在 HomePage 对 allPost 实现前端分页，根据当前 currentPage 和 pageSize 将文章数组进行拆分

```ts
const currentPage = ref(1);
const pageSize = 3;

// 当前页显示 文章
const curPageList = computed(() => {
  const startIdx = (currentPage.value - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  return allPosts.slice(startIdx, endIdx);
});
```

根据当前页码信息，生成一个简易分页组件数据

```ts
// 页码生成
const pageList = computed(() => {
  const count = Math.ceil(allPosts.length / pageSize);
  if (count > 5) {
    const list = [1, currentPage.value - 1, currentPage.value, currentPage.value + 1, count].filter((i) => i > 0 && i <= count);
    return [...new Set(list)];
  } else {
    return new Array(count).fill(null).map((_v, i) => i + 1);
  }
});
```

将模板中遍历 allPosts 替换成 curPageList ，并渲染出页码信息，切换页码时候设置 `currentPage` 就可以了

### 自定义配置

在上面都是将一些信息写死在代码中的，`vitepress` 提供了注册配置方式的，我们可以将主题中的一些参数写入到配置中。

`.vitepress/config.ts` 是 vitepress 加载配置的文件, 我们要自定义主题所以不能在使用 `vitepress` 提供的 `defineConfig` 方法。

如果时仅仅自己使用，可以直接导出我们配置就可以了

```ts .vitepress/config.ts
import { UserConfig } from "vitepress";
const themeConfig = {};
export type ThemeConfig = typeof themeConfig;
export default {
  title: "vitepress-demo",
  description: "viteoress 自定义主题示例",
  themeConfig, // 这里将配置我们主题的配置
} as UserConfig<ThemeConfig>;
```

比如我们上面存在文章的目录、页码 等等都可以写在配置里, 以方便细粒度配置。

```ts
const themeConfig = {
  pageSize: 3,
  sort: "-date",
  postDir: "_posts",
};
```

在主题中可以通过 vitepress 提供 `useData` 使用

```ts
const { theme } = useData<ThemeConfig>();
```

如果我们需要将主题发布到 npm 供其他人使用，当主题更为复杂的时候，会有更多的配置，所有我们需要处理主题默认的配置 和 用户配置合并，提供的 `defineConfig` 方便用户的使用

```ts
import { mergeConfig as mergeViteConfig } from "vite";
import type { UserConfig } from "vitepress";

export const defineConfig = (config: UserConfig<ThemeConfig>) => {
  config = mergeConfig(defaultConfig, config);

  // 可以在这里处理一些 配置合并问题

  return config;
};
```

## 总结

本文中使用到的代码示例可以在 [stackblitz 上查看](https://stackblitz.com/edit/vite-5hwa5v?file=package.json)

一个复杂的主题当然还会有更多的共功能，页面中更良好的布局，那些都是在此基础上进行的扩展。

---

安利一下我写的 hexo 和 vitepress 主题

- [vitepress-theme-async](https://vitepress-theme-async.imalun.com)
- [hexo-theme-async](https://hexo-theme-async.imalun.com)
