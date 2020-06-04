import css from './index.less'
import html from './index.html'
import Emoji from './emojis/index'
import { detect, createList, escape, unescape } from './libs/util'
import marked from 'marked';
import DOMPurify from 'dompurify';
import tcp from './libs/tcb'

class ComComment extends HTMLElement {

    constructor() {
        super()
        this.sending = false;
        this.dbs = new tcp('h-17b316', '6868595454')
        this.detect = detect();

        marked.setOptions({
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

    async render(shadowRoot = this.shadowRoot) {
        shadowRoot.innerHTML = `<style>${css}</style>${html}`
        await this.dbs._login();
        await this.dbs._init();
        this._event_init(shadowRoot)
        this._morelist()
    }

    async _morelist() {
        let { data } = await this.dbs.getComment();
        this.shadowRoot.querySelector(".list-content").appendChild(createList(data));
    }

    _event_init(shadowRoot = this.shadowRoot) {
        this.nick_input = shadowRoot.getElementById('nick');
        this.email_input = shadowRoot.getElementById('email');
        this.link_input = shadowRoot.getElementById('link');

        let textarea_hidden = this.textarea_hidden = shadowRoot.getElementById("content_hidden");
        this.textarea = shadowRoot.getElementById("textarea");
        this.sendBtn = shadowRoot.getElementById("send-btn");

        this.textarea.addEventListener('input', function () {
            textarea_hidden.innerHTML = DOMPurify.sanitize(marked(this.value));

            this.style.height = textarea_hidden.offsetHeight + 40 + 'px';
        })

        this.sendBtn.addEventListener('click', () => this._send())

    }

    connectedCallback() {
        let _vemojis = this._vemojis = this.shadowRoot.getElementById('emojis');
        let emojiData = Emoji.data;
        for (let key in emojiData) {
            if (emojiData.hasOwnProperty(key)) {
                (function (name, val) {
                    let _i = document.createElement('i')
                    _i.setAttribute('name', name)
                    _i.setAttribute('title', name)
                    _i.innerHTML = val;
                    _vemojis.appendChild(_i);
                })(key, emojiData[key])
            }
        }
    }


    _send() {
        if (!this.sending) {
            this.sending = false;
            let comment = this.textarea.value;
            let email = this.email_input.value;
            let nick = this.nick_input.value || 'Anonymous';

            if (comment == '') { this.textarea.focus(); return; }
            if (nick.length < 3) { this.nick_input.focus(); return; }
            if (email.length < 6 || email.indexOf('@') < 1 || email.indexOf('.') < 3) { this.email_input.focus(); return; }


            let { browser, version, os, osVersion } = this.detect;
            let parms = {
                ua: navigator.userAgent,
                browser: `${browser} ${version}`,
                os: `${os} ${osVersion}`,
                avatar: "https://gravatar.loli.net/avatar/d41d8cd98f00b204e9800998ecf8427e?d=mp&v=1.4.14",
                nick: DOMPurify.sanitize(nick),
                email: DOMPurify.sanitize(email),
                link: DOMPurify.sanitize(this.link_input.value),
                content: DOMPurify.sanitize(marked(comment)),
            }
            this.dbs.addComment(parms).then(res => {
                console.log(res)
                this.sending = false;
            })
        }
        /*  this.dispatchEvent(new CustomEvent('send', {
             detail: {
                 alterID: '',
                 ua: navigator.userAgent,
                 nick,
                 email,
                 link: this.link_input.value,
                 comment : marked(comment) 
             }
         })); */
    }
}

!customElements.get('com-comment') && customElements.define('com-comment', ComComment)
