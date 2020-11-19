import css from './index.less'
import html from './index.html'
/* import Emoji from './emojis/index' */
import { detect, createList, pathToData, escape, unescape } from './libs/util'
import marked from 'marked';
import DOMPurify from 'dompurify';
import tcp from './libs/tcb'
const hanabi = require('hanabi');

class ComComment extends HTMLElement {

    constructor() {
        super()
        this._commentList = [];
        this.sending = false;
        this.detect = detect();
        marked.setOptions({
            highlight: hanabi,
            gfm: true,
            tables: true,
            breaks: true,
            pedantic: false,
            sanitize: true,
            smartLists: true,
            smartypants: true
        });

        this.render(this.attachShadow({ mode: 'open' }))
    }

    /**
     * 生成dom
     * @param {*} shadowRoot 
     */
    render(shadowRoot = this.shadowRoot) {
        shadowRoot.innerHTML = `<style>${css}</style>${html}`
        this._event_init(shadowRoot)
    }

    /**
     * 事件绑定
     * @param {*} shadowRoot 
     */
    _event_init(shadowRoot = this.shadowRoot) {
        this.nick_input = shadowRoot.getElementById('nick');
        this.email_input = shadowRoot.getElementById('email');
        this.link_input = shadowRoot.getElementById('link');

        let textarea_hidden = this.textarea_hidden = shadowRoot.getElementById("content_hidden");
        this.textarea = shadowRoot.getElementById("textarea");
        this.sendBtn = shadowRoot.getElementById("send-btn");

        //输入
        this.textarea.addEventListener('input', function () {
            textarea_hidden.innerHTML = DOMPurify.sanitize(marked(this.value));
            this.style.height = textarea_hidden.offsetHeight + 50 + 'px';
        })

        //发送
        this.sendBtn.addEventListener('click', () => {
            let comment = this.textarea.value;
            let email = this.email_input.value;
            let nick = this.nick_input.value || 'Anonymous';
            let link = this.link_input.value;
            localStorage.setItem('comment_user_info', JSON.stringify({ nick, email, link }))
            let { browser, version, os, osVersion } = this.detect;

            if (comment == '') { this.textarea.focus(); return; }
            if (nick.length < 2) { this.nick_input.focus(); return; }
            if ((email.length < 6 || email.indexOf('@') < 1 || email.indexOf('.') < 3) && email.length > 0) { this.email_input.focus(); return; }

            let avatar = '';
            if (/^[1-9][0-9]{6,}@qq.com/.test(email)) {
                let qq = /^[1-9][0-9]{6,}/.exec(email)[0];
            }

            let parms = {
                url: location.pathname,
                ua: navigator.userAgent,
                browser: `${browser} ${version}`,
                os: `${os} ${osVersion}`,
                avatar,
                nick: DOMPurify.sanitize(nick),
                email: DOMPurify.sanitize(email),
                link: DOMPurify.sanitize(link),
                content: DOMPurify.sanitize(marked(comment)),
            }
            this._send(parms);
        });

        //回复
        shadowRoot.getElementById("list-content").addEventListener('click', (e) => {
            if (e.target.className == 'c-at') {
                e.target.parentElement.parentElement.querySelector('.list-edit').appendChild(shadowRoot.getElementById('c-comment'));
                let { topid, id, idxpath } = e.target.dataset;
                let { link = '', nick = '', id: atid = '' } = pathToData(this._commentList, idxpath, 'childer');
                this.atComment = {
                    topID: topid || id,
                    link,
                    nick,
                    id: atid
                }
            }
        })

        //取消
        shadowRoot.getElementById("close-btn").addEventListener('click', (e) => {
            this._cancel_reply()
        })

        shadowRoot.getElementById("loadmore").addEventListener('click', (e) => {
            this._morelist()
        })
    }

    /**
     * 加载完成
     */
    connectedCallback() {
        if (localStorage.getItem('comment_user_info')) {
            let { nick, email, link } = JSON.parse(localStorage.getItem('comment_user_info'))
            this.nick_input.value = nick == 'Anonymous' ? '' : nick;
            this.email_input.value = email;
            this.link_input.value = link;
        }
        this._init_tcb();
    }

    /**
     * 初始化tcb
     */
    async _init_tcb() {
        let env = this.getAttribute("env");
        let hash = this.getAttribute("hash")
        this._dbs = new tcp(env, hash)

        await this._dbs._init();
        this._morelist()
    }

    /**
     * 加载更改评论
     */
    async _morelist() {
        let shadowRoot = this.shadowRoot;
        let loading = shadowRoot.getElementById("loading");
        let loadmore = shadowRoot.getElementById("loadmore");
        loading.style.display = 'inline-block';
        loadmore.style.display = 'none';

        let data = await this._dbs.getComment();
        this._commentList = this._commentList.concat(data)

        this._listContent = this._listContent || this.shadowRoot.querySelector(".list-content");
        this._listContent.appendChild(createList(data));

        loading.style.display = 'none';
        if (data.length == 10) {
            loadmore.style.display = 'inline-block';
        } else {
            let h2 = document.createElement("h2");
            h2.innerHTML = '没有更多评论了~'
            this._listContent.appendChild(h2);
        }
    }

    /**
     * 发送信息
     * @param {*} parms 
     */
    async _send(parms) {
        if (!this.sending) {
            this.sending = true;

            parms.istop = !this.atComment;
            if (this.atComment) {
                parms.topID = this.atComment.topID
                parms.at = {
                    ...this.atComment
                }
            }
            let { result } = await this._dbs.addComment(parms);

            //生成dom
            if (result.success) {
                let param = { ...parms, ...result.data }
                if (!this.atComment) {
                    let con = this.shadowRoot.querySelector(".list-content");
                    let length = con.querySelectorAll('.item-top').length;
                    con.insertBefore(createList([param]), con.children[length])

                    this._commentList.splice(length, 0, param);

                } else {
                    let con = this.shadowRoot.querySelector("#quote" + this.atComment.topID);
                    param._idxpath = this.atComment.topID + ',' + con.children.length
                    con.appendChild(createList([param], this.atComment.topID))
                    let _com = this._commentList.find(item => item.id === this.atComment.topID)
                    if (_com) {
                        _com.childer = _com.childer || []
                        _com.childer.push(param);
                    }
                    this._cancel_reply()
                }
                this.textarea_hidden.innerHTML = ''
                this.textarea.value = ''
                this.textarea.style.height = '40px';

                console.log(param, '发送成功')
            }
            this.sending = false;

        }
    }

    _cancel_reply() {
        this.shadowRoot.appendChild(this.shadowRoot.getElementById('c-comment'));
        this.atComment = null
    }

}

!customElements.get('com-comment') && customElements.define('com-comment', ComComment)
