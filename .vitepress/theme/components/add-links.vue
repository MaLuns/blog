<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue'

const data = reactive({
    desc: "",
    image: "",
    name: "",
    url: ""
})

const count = ref(0)

const addLinks = () => {
    const { desc, image, name, url } = data;
    if (/^https:\/\//g.test(image) && /^https:\/\//g.test(url) && desc && name) {
        fetch('https://api.imalun.com/api/links', {
            method: 'POST',
            body: JSON.stringify({ desc, image, name, url })
        }).then(res => res.json()).then(res => {
            if (res?.code === 0) {
                Object.assign(data, {
                    desc: "",
                    image: "",
                    name: "",
                    url: ""
                })
                alert('提交成功')
            } else {
                alert('提交失败')
            }
        }).catch(() => {
            alert('提交失败')
        })
    } else {
        alert('请填写完整信息')
    }
}

onMounted(() => {
    fetch('https://api.imalun.com/api/links/re-count',).then(res => res.json()).then(res => {
        if (res?.code === 0) {
            count.value = res.data.length
        }
    })
})
</script>
<template>
    <div class="trm-card trm-scroll-animation">
        <div class="link-push">
            <div>
                <p class="link-push-title">友链提交申请</p>
                <p>申请友链前，请将本站添加到您的友链中 <span v-if="count">({{ count }})</span></p>
            </div>
            <div class="trm-btn" :class="{ disabled: !data.desc || !data.image || !data.name || !data.url }" @click="addLinks">
                提交申请
            </div>
        </div>
        <div class="form-item">
            <input v-model.trim="data.name" type="text" placeholder="网站名称  eg: 白云苍狗">
        </div>
        <div class="form-item">
            <input v-model.trim="data.url" type="text" placeholder="网站链接  eg: https://www.imalun.com">
        </div>
        <div class="form-item">
            <input v-model.trim="data.image" type="text" placeholder="网站头像  eg: https://www.imalun.com/images/avatar.jpg?v=2">
        </div>
        <div class="form-item">
            <input v-model.trim="data.desc" type="text" placeholder="网站简介  eg: 醒，亦在人间；梦，亦在人间。">
        </div>

    </div>
</template>

<style scoped lang="less">
.link-push {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    &-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
    }

    .trm-btn {
        cursor: pointer;
    }

    .disabled {
        pointer-events: none;
        cursor: no-drop;
        opacity: .3;
    }
}

.form-item {
    input {
        width: 100%;
        box-sizing: border-box;
        display: block;
        width: 100%;
        height: 45px;
        border-radius: 6px;
        margin-bottom: 20px;
        border: 0;
        box-shadow: inset 0 0 4px -1px rgba(0, 0, 0, 0.15);
        background-color: var(--theme-bg2-color);
        padding: 0 20px;

        &:focus {
            outline: inherit;
        }
    }
}
</style>