<script setup lang="ts">
import { useRouter } from 'vitepress';
import { onMounted, watch } from 'vue'

const router = useRouter()

const initTwikoo = async () => {
    try {
        //@ts-ignore
        twikoo &&  twikoo.init({
            envId: "https://twikoo.imalun.com",
        }).then(function () {
            let container = document.querySelector('body>.tk-admin-container')
            if (container) container.remove()
            container = document.querySelector('.tk-admin-container')
            if (container) document.body.append(container)
        })


    } catch (e) { }
}


onMounted(() => {
    watch(() => router.route.path, () => setTimeout(initTwikoo, 1000))
})
</script>
<template>
    <div class="trm-card trm-scroll-animation comment-container">
        <div id="twikoo"></div>
        <component :is="'script'" src="https://lib.baomitu.com/twikoo/1.6.39/twikoo.min.js" crossorigin="anonymous"
            @load="initTwikoo"></component>
    </div>
</template>