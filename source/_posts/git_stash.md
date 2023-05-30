---
title: git 中的 stash 
comments: true
date: 2020-08-13 20:07:05
tags: [git]
categories: 记录类
description:
keywords: git,存储,stash
---

当你 分支1 上修改了东西，你发现修改错了分支，你想将 分支1 上的修改移到 分支2 的时候会.亦或者你一分支1上修改了一半，这个时候需要切的其他分支改其他的时候.这个时候 stash 就排上用场了，stash 命令可用于临时保存和回复修改，可跨分支。

<!--more-->

- git stash [save message]

    保存，save为可选项，message为本次保存的注释

- git stash list

    所有保存的记录列表

- git stash pop stash@{num}

    恢复，num是可选项，通过git stash list可查看具体值。只能恢复一次

- git stash apply stash@{num}

    恢复，num是可选项，通过git stash list可查看具体值。可回复多次

- git stash drop stash@{num}

    删除某个保存，num是可选项，通过git stash list可查看具体值

- git stash clear

    删除所有保存

更多用法[参考](//git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E8%B4%AE%E8%97%8F%E4%B8%8E%E6%B8%85%E7%90%86)这里

使用例子
![](/images/posts/git_stash/20200824154456.jpg)

![](/images/posts/git_stash/20200824154701.jpg)
