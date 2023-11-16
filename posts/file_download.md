---
title: Electron 的断点续下载
comments: true
date: 2020-10-08 10:48:03
tags: [vue, electron]
description:
categories: 记录类
keywords: electron,断点下载
---
最近用 Electron 做了个壁纸程序，需要断点续下载，在这里记录一下。<!-- more -->

## HTTP断点下载相关的报文

- Accept-Ranges 
  告诉客户端服务器是否支持断点续传，服务器返回
- Content-Range
  在HTTP协议中，响应首部 Content-Range 显示的是一个数据片段在整个文件中的位置。
- ETag 
  资源标识 非必须 服务器返回
- Last-Modified 
  资源最后一次更新的时间 非必须 服务器返回
```
//响应示例 
accept-ranges: bytes
Content-Range: bytes 200-1000/67589 // 返回文件 200字节到1000字节 的数据，总文件大小67589字节
etag: "5f0dce96-48e"
last-modified: Tue, 14 Jul 2020 15:26:14 GMT
```
- Range
  请求头设置 Range，指定服务器返回指定区域内容，如果不设置 Range 会返回整个文件。服务器片段返回状态码是 206，请求的范围如果无效状态码会是 416，全部返回状态码是 200。
```
//示例 
Range: bytes=0-499 表示第 0-499 字节范围的内容 
Range: bytes=500-999 表示第 500-999 字节范围的内容 
Range: bytes=-500 表示最后 500 字节的内容 
Range: bytes=500- 表示从第 500 字节开始到文件结束部分的内容 
Range: bytes=0-0,-1 表示第一个和最后一个字节 
Range: bytes=500-600,601-999 同时指定几个范围
```

## Electron 断点续下载方式

- 使用 Chromium 的下载功能，在主进程里监听 will-download 事件去处理
- 使用 Electron 的net模块或者 Node.js 的 http/https 模块自己创建请求，记录已下载位置

### 使用 Chromium 的下载
可以在渲染进程中和网页一样进行触发下载（例如a标签），也可以在主进程中使用 BrowserWindow.webContents 或 session 的 downloadURL触发下载。

``` js
//示例

//使用窗体 创建下载事件和监听
let win = new BrowserWindow()
win.webContents.downloadURL(url)
win.webContents.session.on('will-download', (event,  downloadItem, webContents) => {
 event.preventDefault()//可以阻止下载
 //downloadItem 下载项目的 EventEmitter
})

//或者 使用默认session对象。
session.defaultSession.downloadURL(url)
session.defaultSession.on('will-download', (event,  downloadItem, webContents) => {

})
```
然后可以 will-download 事件中的 downloadItem 实例去存储下载信息。等待程序再次启动时通过 session.createInterruptedDownload 恢复上一次的下载
大致流程。
![](/images/posts/onewallhaven/down.png)
``` js
//一个简易示例
let cacheItem = {}
session.defaultSession.on('will-download', (e, item) => {
    const url = item.getURL()
    
    // 获取文件的总大小
    const totalBytes = item.getTotalBytes();
    // 设置下载路径
    const filePath = path.join(app.getPath("downloads"), item.getFilename());
    item.setSavePath(filePath);

    // 缓存downitem 将这些信息保存下来，
    cacheItem.path = item.getSavePath();//图片地址
    cacheItem.eTag = item.getETag();//资源标识
    cacheItem.urlChain = item.getURLChain();//地址
    cacheItem.length = totalBytes//资源大小
    cacheItem.lastModified = item.getLastModifiedTime()//资源最后一次更新的时间
    cacheItem.startTime = item.getStartTime();

    let lastBytes = 0;

    // 监听下载过程，计算并设置进度条进度
    item.on('updated', (event, state) => {
        if (state === 'interrupted') {
            console.log('下载已经中断，可以恢复')
        } else if (state === 'progressing') {
            if (item.isPaused()) {
                console.log('暂停下载')
            } else {
                let offset = item.getReceivedBytes();
                cacheItem.speedBytes = offset - lastBytes;//下载速度
                cacheItem.offset = offset//已经下载
                lastBytes = offset
                console.log('下载中')
            }
        }
    })

    // 
    item.once('done', (event, state) => {
        if (state === 'interrupted') {
            console.log('下载已经中断，无法恢复')
        }
        else if (state === 'cancelle') {
            console.log('下载取消')
        }
        else {
            console.log('下载完成')
        }
    })

    //是否可恢复下载
    if (item.canResume) {
        item.resume()
    }
})
//程序关闭时将 cacheItem 存储下载

// ===> 程序 再次打开时

// 将上面存储cacheItem信息读取出来 恢复下载
session.defaultSession.createInterruptedDownload({
    path, 
    urlChain, 
    offset, // 下载断点开始位置
    length, 
    lastModified, //
    eTag, // 
    startTime
})
```

需要注意的一个地方是，Electron 会在程序退出时候删除我们下载一般的文件，我目前处理方案是在 程序退出时，将所有还没有下载完成文件复制一份，等下次继续下载时候还原回去。

相关的文档地址 [BrowserWindow](https://www.electronjs.org/docs/api/browser-window)  ,[Session](https://www.electronjs.org/docs/api/session) , [webContents](https://www.electronjs.org/docs/api/web-contents), [DownloadItem](https://www.electronjs.org/docs/api/download-item)

### 创建请求实现续下载
大致上和上面是差不多的，记录已下载文件信息，再次请求时候设置从指定位置开始请求数据。
