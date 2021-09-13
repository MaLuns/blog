export default class tcbComment {

    constructor(env, hash) {
        if (!env) {
            console.error("未设置CloudBase环境id:env");
            return;
        }
        if (!hash) {
            console.error("未设置当前Comment的hash值");
            return;
        }
        this.env = env;
        this.skip = 1
        this.hash = hash;
    }

    /**
     * 初始化
     */
    async _init() {
        let tcb = await TcbLoader()
        this.app = tcb.init({ env: this.env });
        let auth = this.app.auth({
            persistence: "local"
        });
        if (!auth.hasLoginState()) {
            await auth.anonymousAuthProvider().signIn()
        }

        await this.getArticleID(this.hash)
    }

    //获取
    async getArticleID(hash) {
        let res = await this.app.callFunction({
            name: 'getArticleID',
            data: {
                hash,
                url: location.pathname,
                title: document.title
            }
        })
        let { result: { success, data } } = res;
        if (success) {
            this.articleID = data;
        }
    }

    //获取评论列表
    async getComment() {
        let res = await this.app.callFunction({
            name: 'getComments',
            data: {
                pagesize: this.skip++,
                articleID: this.articleID
            }
        })
        return res.result;
    }

    //新增
    async addComment(parm) {
        let res = await this.app.callFunction({
            name: 'addComment',
            data: {
                articleID: this.articleID,
                ...parm
            }
        })
        return res;
    }
}

/**
* 加载tcb-js-jdk
*/
const TcbLoader = function (v = '1.6.0') {
    return new Promise((resolve, reject) => {
        if (window.tcb) {
            resolve(window.tcb)
        } else {
            var script = document.createElement('script')
            script.type = 'text/javascript'
            script.async = true
            script.src = `//imgcache.qq.com/qcloud/tcbjs/${v}/tcb.js`
            script.onerror = reject
            script.onload = () => resolve(window.tcb)
            document.head.appendChild(script)
        }
    })
}