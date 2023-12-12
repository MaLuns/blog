---
title: 利用 GitHub Actions + Github Pages 实现博客自动部署
date: 2021-09-26 09:08:34
comments: true
tags: [github]
description: 
categories: 记录类
keywords: GitHub Actions,持续集成,CI
---
看看官方对GitHub Actions的介绍: GitHub Actions 帮助您自动完成软件开发周期内的任务。 GitHub Actions 是事件驱动的，意味着您可以在指定事件发生后运行一系列命令。 例如，每次有人为仓库创建拉取请求时，您都可以自动运行命令来执行软件测试脚本。

简单的说就是，GitHub 把持续集成系列操作步骤叫做 actions。比如抓取代码、运行测试、登录远程服务器，发布到第三方服务等等。可以看看官方的介绍，对[GitHub Actions](https://docs.github.com/cn/actions/learn-github-actions/introduction-to-github-actions)快速了解
<!--more -->

## Hexo 配置

Hexo 搭建使用可以去参看[hexo 文档](https://hexo.io/zh-cn/index.html)。

Github Pages 支持两种模式
- User or organization site: 新建一个 username.github.io 的仓库，每个用户只能建立一个。
- Project site: 在对应仓库 Setting => pages 进行配置，如果有多个需要配置独立域名。

Github Pages 的配置可以[参看这里](https://pages.github.com/)

我这里是使用 Project site 的搭建 Hexo 站点的。修改 **_config.yml** 下的 deploy 推送仓库地址，将其推送到 MalBlog/gh-pages 分支上去。
``` yml
deploy:
  type: 'git'
  repository: 
    github: git@github.com:MaLuns/MalBlog.git，gh-pages
  branch: master
```
在本地执行 **hexo generate** 和 **hexo deploy** 确保能正常生成和发布。

## GitHub Actions

我们希望当我们把博客源码推送到对应的仓库后，GitHub Actions 自动帮我们执行 **hexo generate**、**hexo deploy** 的生成和发布操作，完成博客的自动部署。首先在 项目根目录的 .github/workflows 下 新建一个 main.yml，每一个 .yml 文件就是一个 Action ， 一个 Action  相当于一个工作流 workflow，一个工作流可以有多个任务 job，每个任务可以分为几步 step。

第一步 我们配置工作流触发的时机
```yml
# 工作流名称
name: Hexo Deploy

# 工作流触发配置
on:
  # 当master分支有push事件时 触发工作流
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]
```
第二步 配置工作流中的 job

```yml
jons:
    # job1
    blog-cicd:
        # 任务名称
        name: Hexo blog build & deploy
        # 设置任务执行环境
        runs-on: ubuntu-latest # 使用最新的 Ubuntu 系统作为编译部署的环境

    # jon2 这里可以配置多个job
    job2:
```
第三步 实现任务步骤， 实现自动部署大致需要如下步骤
拉取博客源码=> 安装 Hexo 需要环境 => 安装源码依赖 => 构建博客源码 => 推送构建产物 

```yml
jons:
    blog-cicd:
        name: Hexo blog build & deploy
        runs-on: ubuntu-latest

    steps:
    # 使用 checkout@2 插件拉取代码
    - name: Checkout codes
      uses: actions/checkout@v2 
      with: 
        submodules: true

    # 使用 setup-node@v1 设置 node.js 环境
    - name: Setup node
      uses: actions/setup-node@v1
      with:
        node-version: '12.x'

    # 安装 Hexo 依赖
    - name: Install hexo dependencies
      env:
        #设置环境变量 仓库私钥， 用来在构建完成后 推送到仓库
        ACTION_DEPLOY_KEY: ${{ secrets.HEXO_DEPLOY_PRI }}
      # 设置 ssh 私钥， 下载 hexo-cli 脚手架及相关安装包， 
      run: |
        mkdir -p ~/.ssh/
        echo "$ACTION_DEPLOY_KEY" > ~/.ssh/id_rsa
        chmod 600 ~/.ssh/id_rsa
        ssh-keyscan github.com >> ~/.ssh/known_hosts
        git config --global user.email "userEmail"
        git config --global user.name "userName"
        npm install -g hexo-cli
        npm install

    # 构建博客源码 并 推送推送构建产物
    - name: Generate files
      run: |
        hexo clean
        hexo generate
        hexo deploy
```
Github 每个仓库都是可以设置 **Deploy keys** 的， 用来可以操作单个仓库的。我们需要生成一个 **SSH Key** ，将公钥添加到 Setting => Deploy 里， 将私钥 Setting => Secrets => Actions 里。这样就可以在 工作流中 **{{ secrets.XXXXX }}** 获取到 **Secrets** 配置变量。我这里使用名称是 **HEXO_DEPLOY_PRI** 。


## Git submodule

有时候使用了三方主题，需要更新时候，我们也希望能够自动更新上去，我们可以使用 **Git submodule** 来管理主题。
```shell
git submodule add <主题仓库地址> <主题存放路径>
```
修改工作流配置，在构建前先拉取子模块中的主题
```yml
# 最开始 git submodule update --recursive --remote 去拉取，发现一直更新不到最新的
# 然后使用 git pull 拉取发现有时候会出现冲突... 具体原因没找到， 所有就又用删除主题文件，重新 git clone 拉取方法
# 还是对子模块不够了解
- name: Generate files
    run: |
         cd ./themes/
        rm -r hexo-theme-text
        git clone https://github.com/MaLuns/hexo-theme-text.git
        cd ../../
        hexo clean
        hexo generate
        hexo deploy

# 后来发现 git chekout 也可以直接用
- name: Generate files
    run: |
        cd ./themes/hexo-theme-text
        git checkout -q master
        cd ../../
        hexo clean
        hexo generate
        hexo deploy
```

## 最后
这样基本上就实现了 Hexo 的自动部署和主题自动更新了， 加上使用 [github.dev](https://github.dev/) 就能实现只需要一个浏览器就能随时随地的写了， 不在需要本地配置搭建环境啦。