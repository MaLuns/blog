---
title: css 实现网页灰度 
comments: true
date: 2020-04-04 20:38:27
tags: [css]
categories: 记录类
keywords: css,filter
---
今天为表达全国各族人民对抗击新冠肺炎疫情斗争牺牲烈士和逝世同胞的深切哀悼，各大网站也纷纷将界面弄成黑白以示哀悼。
<!--more -->
实现网页黑白办法其实很简单，只需要设置 filter 滤镜为 grayscale 就可以了。

``` css
    html{
         filter: grayscale(100%); 
        -webkit-filter: grayscale(100%); 
    }
```
常用几个值
grayscale ：将图像转换为灰度图像。
blur：可以实现高斯模糊效果。
Saturate ：设置饱和度。
Invert : 颜色反转。
Contrast  ：设置对比度。

<style>
    html{
         filter: grayscale(100%); 
        -webkit-filter: grayscale(100%); 
        -moz-filter: grayscale(100%); 
        -ms-filter: grayscale(100%); 
        -o-filter: grayscale(100%); 
        -webkit-filter: grayscale(1);
    }
</style>