import css from './index.less'
import html from './index.html'
/* import marked from 'marked' */
import Emoji from './emojis/index'

class ComComment extends HTMLElement {

    static get observedAttributes() { return ['atrid'] }



    get emojicnd() {
        return this.emojicnd
    }

    set emojicnd(value) {
        this.emojicnd = value;
    }

    constructor() {
        super()
        this.render(this.attachShadow({ mode: 'open' }))
    }

    render(shadowRoot = this.shadowRoot) {
        shadowRoot.innerHTML = `<style>${css}</style>${html}`
        this._event_init(shadowRoot)

        let a = this.shadowRoot.getElementById("huifu");
        let that = this;
        a.addEventListener('click', function (e) {
            this.parentElement.parentElement.appendChild(that.shadowRoot.getElementById("commentsss"))
        })
    }

    _event_init(shadowRoot = this.shadowRoot) {
        this.nick_input = shadowRoot.getElementById('nick');
        this.email_input = shadowRoot.getElementById('email');
        this.link_input = shadowRoot.getElementById('link');

        let textarea_hidden = this.textarea_hidden = shadowRoot.getElementById("content_hidden");
        this.textarea = shadowRoot.getElementById("textarea");
        this.sendBtn = shadowRoot.getElementById("send-btn");

        this.textarea.addEventListener('input', function () {
            textarea_hidden.innerHTML = this.value;
            this.style.height = textarea_hidden.offsetHeight + 40 + 'px';
        })

        this.sendBtn.addEventListener('click', () => {
            let comment = this.textarea.value;
            let email = this.email_input.value;
            let nick = this.nick_input.value || 'Anonymous';

            if (comment == '') {
                this.textarea.focus();
                return;
            }

            if (nick.length < 3) {
                this.nick_input.focus();
                return;
            }

            if (email.length < 6 || email.indexOf('@') < 1 || email.indexOf('.') < 3) {
                this.email_input.focus();
                return;
            }


            this.dispatchEvent(new CustomEvent('send', {
                detail: {
                    alterID: '',
                    ua: navigator.userAgent,
                    nick,
                    email,
                    link: this.link_input.value,
                    comment/* : marked(comment) */
                }
            }));
        })

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
}

!customElements.get('com-comment') && customElements.define('com-comment', ComComment)