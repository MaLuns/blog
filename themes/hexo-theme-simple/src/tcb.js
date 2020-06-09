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

/**
 * cloudbase 计数
 */
class TcbUtil {
    constructor(env) {
        if (!env) {
            console.error("未设置CloudBase环境id:env");
            return;
        }
        this.env = env;
    }

    async init() {
        let tcb = await TcbLoader();
        this.app = tcb.init({ env: this.env });
        let auth = this.app.auth({ persistence: "local" });
        if (!auth.hasLoginState()) {
            await auth.anonymousAuthProvider().signIn()
        }
        this.getCount();
    }

    /**
     * 记录访问次数
     */
    async addCount() {
        await this.app.callFunction({
            name: 'addCount',
            data: { url: location.pathname }
        })
    }

    /**
     * 获取当前页面访问次数
     */
    async getCount() {
        let res = await this.app.callFunction({
            name: 'getCount',
            data: { url: location.pathname }
        })

        document.getElementById('cloudbsae-count').innerHTML = res;
        return res;
    }
}


/* document.on */