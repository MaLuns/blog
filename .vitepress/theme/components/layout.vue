<script setup lang="ts">
import Theme from "vitepress-theme-async";
import Comment from "./comment.vue";
import { onMounted, watch } from 'vue'
import { useData, useRouter } from "vitepress";
import { DanMuKu } from '../libs/danmu';
import AddLinks from "./add-links.vue";

const router = useRouter()
const { frontmatter } = useData()
const { Layout } = Theme;

const config = {
    el: ".trm-banner",
    avatar: true,
    delayRange: 3000,
    speed: 120
}

let danmuku: DanMuKu;
const initTwikoo = async () => {
    danmuku?.reset()
    //@ts-ignore
    if (window.matchMedia('(min-width: 992px)').matches && window.twikoo && window.twikoo.getRecentComments) {
        const url = location.pathname
        //@ts-ignore
        const data = await twikoo.getRecentComments({
            envId: 'https://twikoo.imalun.com',
            urls: [location.pathname].filter(i => i !== '/'),
            pageSize: 30,
            includeReply: false
        }).then(function (res: any) {
            return url !== location.pathname ? [] : res.map((item: any) => ({
                id: item.id,
                url: item.url,
                text: item.commentText,
                avatar: item.avatar,
            }))
        })
        danmuku?.update(config).pushData(data)
    }
}

onMounted(() => {
    danmuku = new DanMuKu(config);
    watch(() => router.route.path, initTwikoo, { immediate: true })
})
</script>
<template>

    <Layout>
        <template #page-content-bottom>
            <Comment v-if="frontmatter.comments !== false" />
        </template>
        <template #links-list-before>
            <AddLinks></AddLinks>
        </template>
        <template #footer-content-after>
            <a href="https://blogscn.fun/" title="BLOGS·CN" target="_blank" rel="nofollow"> <img
                    src="https://photo.xiangming.site/img/blogscn.png" alt="本站已加入BLOGS·CN"
                    style="width:auto;height:15px;"> </a>
        </template>
    </Layout>
    <component :is="'script'" src="https://lib.baomitu.com/twikoo/1.6.39/twikoo.min.js" crossorigin="anonymous"
        @load="initTwikoo"></component>
</template>
