---
title: 自建免费 Moe-Counter 计数器
comment: true
date: 2024-03-07 16:39:09
tags:
description: 手把手教你自建免费 Moe-Counter 计数器
categories:
keywords: 计数器，统计，moe-count
---

因为 Moe-Counter 经常会出现无法访问的情况，于是基于 vercel + mongodb 自建了个。

<!-- more -->

## 示例

使用方式也稍有修改，只需要在后面拼接自己唯一标识即可。

**https://counter.imalun.com/唯一标识?theme=对应主题**

#### asoul

![asoul](https://counter.imalun.com/demo?theme=asoul)

#### moebooru

![moebooru](https://counter.imalun.com/demo?theme=moebooru)

#### rule34

![Rule34](https://counter.imalun.com/demo?theme=rule34)

#### gelbooru

![Gelbooru](https://counter.imalun.com/demo?theme=gelbooru)

## 部署

如果有想自建的可以按照如下步骤搭建：

1. 申请 [MongoDB](https://www.mongodb.com/cloud/atlas/register) 账号
2. 创建免费 MongoDB 数据库，区域推荐选择 `AWS / N. Virginia (us-east-1)`
3. 在 Database Access 页面点击 Add New Database User 创建数据库用户，Authentication Method 选 Password，在 Password Authentication 下设置数据库用户名和密码，用户名和密码可包含数字和大小写字母，请勿包含特殊符号。点击 Database User Privileges 下方的 Add Built In Role，Select Role 选择 Atlas Admin，最后点击 Add User

4. 在 Network Access 页面点击 Add IP Address，Access List Entry 输入 `0.0.0.0/0`（允许所有 IP 地址的连接），点击 Confirm

5. 在 Database 页面点击 Connect，连接方式选择 Drivers，并记录数据库连接字符串，请将连接字符串中的 `<username>:<password>` 修改为刚刚创建的数据库 `用户名:密码`

6. 申请 [Vercel](https://vercel.com/signup) 账号
7. 点击以下按钮将 Moe-Counter-Vercel 一键部署到 Vercel<br>

[![Deploy](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MaLuns/moe-counter-vercel)

8. 进入 Settings - Environment Variables，添加环境变量 `MONGODB_PATH`，值为前面记录的数据库连接字符串

9. 进入 Deployments , 然后在任意一项后面点击更多（三个点） , 然后点击 Redeploy , 最后点击下面的 Redeploy
10. 进入 Overview，点击 Domains 下方的链接，如果环境配置正确，可以看到 默认计数器样式
