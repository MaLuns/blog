
export default class ComIcon extends HTMLElement {

    static get observedAttributes() { return ['name', 'size', 'color', 'path'] }

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
        <style>
        :host{
            font-size:inherit;
            display:inline-block;
            transition:.3s;
        }
        .cg-icon {
            display:block;
            width: 1em;
            height: 1em;
            margin: auto;
            fill: currentColor;
            overflow: hidden;
            /*transition:inherit;*/
        }
        :host([spin]){
            animation: rotate 1.4s linear infinite;
        }
        @keyframes rotate{
            to{
                transform: rotate(360deg); 
            }
        }
        </style>
        <svg style='position: absolute; width: 0px; height: 0px; overflow: hidden;'>
            <symbol id="cg-warning-circle-fill" viewBox="0 0 1024 1024"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296z m32 440c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"></path></symbol>
            <symbol id="cg-info-circle-fill" viewBox="0 0 1024 1024"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272z m-32-344c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"></path></symbol>
            <symbol id="cg-close-circle-fill" viewBox="0 0 1024 1024"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m165.4 618.2l-66-0.3L512 563.4l-99.3 118.4-66.1 0.3c-4.4 0-8-3.5-8-8 0-1.9 0.7-3.7 1.9-5.2l130.1-155L340.5 359c-1.2-1.5-1.9-3.3-1.9-5.2 0-4.4 3.6-8 8-8l66.1 0.3L512 464.6l99.3-118.4 66-0.3c4.4 0 8 3.5 8 8 0 1.9-0.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"></path></symbol>
            <symbol id="cg-check-circle-fill" viewBox="0 0 1024 1024"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m193.5 301.7l-210.6 292c-12.7 17.7-39 17.7-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"></path></symbol>
        </svg>
        <svg class="cg-icon" id="icon" aria-hidden="true" viewBox="0 0 ${this.view} ${this.view}">
            ${this.path ? '<path id="path"></path>' : '<use id="use"></use>'}
        </svg>
        `
    }

    get view() {
        return this.getAttribute('view') || 1024;
    }

    get name() {
        return this.getAttribute('name');
    }

    get path() {
        return this.getAttribute('path') || '';
    }

    set name(value) {
        this.setAttribute('name', value);
    }

    set path(value) {
        this.setAttribute('path', value);
    }

    get size() {
        return this.getAttribute('size') || '';
    }

    get color() {
        return this.getAttribute('color') || '';
    }

    set size(value) {
        this.setAttribute('size', value);
    }

    set color(value) {
        this.setAttribute('color', value);
    }


    connectedCallback() {
        this.icon = this.shadowRoot.getElementById('icon');
        this.use = this.icon.querySelector('use');
        this.d = this.icon.querySelector('path');
        this.size && (this.size = this.size);
        this.color && (this.color = this.color);
        this.name && (this.name = this.name);
        this.path && (this.path = this.path);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == 'name' && this.use) {
            this.use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#cg-${newValue}`);
        }
        if (name == 'path' && this.d) {
            this.d.setAttribute("d", newValue);
        }
        if (name == 'color' && this.icon) {
            this.icon.style.color = newValue;
        }
        if (name == 'size' && this.icon) {
            this.icon.style.fontSize = newValue + 'px';
        }
    }
}

if (!customElements.get('com-icon')) {
    customElements.define('com-icon', ComIcon);
}
