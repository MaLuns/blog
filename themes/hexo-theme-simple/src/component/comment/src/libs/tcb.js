/* import * as tcb from 'tcb-js-sdk';
 */
export default class tcbComment {

    constructor(env, hash) {
        if (!env) {
            return;
        }
        let app =
            this.app = window.tcb.init({ env });
        this.limit = 50
        this.skip = 0
        this.hash = hash;

      /*   this._login() */


    }

    async _init() {
        await this.getArticle(this.hash)
            .then(({ data }) => {
                if (data.length === 0) {
                    this.initArticle({ hash }).then(({ id }) => { this.articleID = id; })
                } else {
                    let { _id, hash } = data[0]
                    this.articleID = _id;
                }
            })
    }

    //登录
    async _login() {
        console.log(1)
        let auth = this.app.auth();
        await auth.anonymousAuthProvider().signIn()
        let db = this.db = this.app.database();
        this._ = db.command;
        this.comments = db.collection("comments");
        this.article = db.collection("article");
    }

    //初始化评论
    initArticle(parm) {
        return this.article.add({
            "date": new Date(),
            "url": "",
            "hash": "",
            "title": "",
            ...parm
        })
    }

    //获取
    getArticle(hash) {
        return this.article.where({ hash }).get();
    }

    removeMover() {
        this.comments.remove().then(res => {
            console.log(res)
        })
    }

    //获取评论列表
    getComment() {
        return this.comments.where({ id: this.articleID }).skip(this.skip++ * this.limit).limit(this.limit).orderBy("date", "desc").get()
    }

    //
    addComment(parm) {
        return this.comments.add({
            id: this.articleID,
            date: new Date(),
            ...parm
        })
    }

}