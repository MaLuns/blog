import './com-tips.js';
import './com-button.js';

export default class ComInput extends HTMLElement {

    static get observedAttributes() { return ['label','disabled','pattern','required','readonly','placeholder'] }

    constructor({multi}={}) {
        super();
        this.multi = multi;
        this.$customValidity = null;
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
        <style>
        :host{
            box-sizing:border-box;
            display:inline-block;
            border:1px solid var(--borderColor,rgba(0,0,0,.2));
            border-radius:var(--borderRadius,.25em);
            line-height: 1.8;
            transition:border-color .3s,box-shadow .3s;
            padding: .25em .625em;
            color: var(--fontColor,#333);
            font-size: 14px;
        }
        :host(:focus-within){
            /*box-shadow: 0 0 10px rgba(0,0,0,0.1);*/
        }
        :host([block]){
            display:block
        }
        com-tips[show=show]{
            color:var(--errorColor,#f4615c);
        }
        :host([invalid]){
            --themeColor:var(--errorColor,#f4615c);
            border-color:var(--errorColor,#f4615c);
        }
        :host([invalid]) com-icon{
            color:var(--errorColor,#f4615c);
        }
        :host(:focus-within:not([disabled])),:host(:not([disabled]):hover){
            border-color:var(--themeColor,#15bbf2);
        }
        :host([disabled]){ 
            opacity:.8;
            cursor:not-allowed; 
        }
        :host([disabled]) com-tips{
            pointer-events:none;
            background:rgba(0,0,0,.1);
        }
        :host([label]) .input::placeholder{
            color:transparent;
        }
        :host .input::placeholder{
            color:#999;
        }
        :host(com-textarea){
            line-height:1.5;
            padding-right:.25em;
        }
        com-tips{  
            display:flex;
            width: 100%;
            height: 100%;
            align-items:center;
            margin:-.25em -.625em;
            padding:.25em .625em;
            font-family:inherit;
            transition:.3s background-color;
        }
        :host(com-textarea) com-tips{
            margin-right:-.25em;
            padding-right:.25em;
            align-items:flex-start;
        }
        .input{
            padding:0;
            text-align: inherit;
            color:currentColor;
            border:0;
            outline:0;
            line-height: inherit;
            font-size:inherit;
            font-family:inherit;
            flex:1;
            min-width: 0;
            -webkit-appearance: none;
            -moz-appearance: textfield;
            background: none;
            overflow-x: hidden;
            transition: color .3s;
            animation: removeBg 0s forwards;
        }
        :host(com-textarea) .input{
            margin:0;
        }
        input[type="number"]::-webkit-inner-spin-button{
            display:none;
        }
        ::-moz-focus-inner,::-moz-focus-outer{
            border:0;
            outline : 0;
        }
        :host([showtips]){
            pointer-events:all;
        }
        .input-label{
            pointer-events:none;
            margin-left:-0.14em;
            position:absolute;
            transition: transform .3s, color .3s, background-color .3s;
            transform-origin: left;
            padding:0 0.14em;
            color:#999;
        }
        .input:not(:placeholder-shown) ~ .input-label,
        .input:focus ~ .input-label{
            transform: translateY( calc( -50% - 0.43em ) ) scale(0.8);
            background:#fff;
        }
        .input:-moz-ui-invalid{
            box-shadow:none;
        }
        .input::-ms-reveal{
            display:none;
        }
        .icon-pre{
            display:flex;
            margin-right:0.25em;
            color:#999;
        }
        :host(com-textarea) .icon-pre{
            height:1.5em;
        }
        .btn-right{
            width:2em;
            height:2em;
            margin:-.25em -.5em -.25em .25em;
            padding:0;
            color:#999;
            font-size:inherit;
        }
        .btn-number{
            display:flex;
            flex-direction:column;
            width:1.5em;
            visibility:hidden;
            transition:0s;
        }
        .btn-number com-button{
            display: flex;
            color: #999;
            border-radius:0;
            width:100%;
            flex:1;
            padding:0;
            font-size:.8em;
            transition:.2s;
        }

        .btn-number com-button:hover{
            flex:1.5;
        }

        com-button:not([disabled]):hover,com-button:not([disabled]):focus-within{
            color:var(--themeColor,#15bbf2);
        }

        :host(:focus-within:not([disabled])) .icon-pre,:host(:not([disabled]):hover) .icon-pre,:host(:not([disabled]):hover) .input-label,:host(:focus-within:not([disabled])) .input-label{
            color:var(--themeColor,#15bbf2);
        }

        :host(:focus-within:not([disabled])) .btn-number,:host(:not([disabled]):hover) .btn-number{
            visibility:visible;
        }
        @keyframes removeBg{
            to{
                background:transparent;
            }
        }
        </style>
        <com-tips id="input-con" dir="${this.errordir}" type="error">
            ${
                this.icon?
                '<com-icon class="icon-pre" name='+this.icon+'></com-icon>'
                :
                ''
            }
            <${multi?'textarea':'input'} id="input" name="${this.name}" class="input" ${this.type === 'number'?'min="'+this.min+'" max="'+this.max+'" step="'+this.step+'"':""} value="${this.defaultvalue}" type="${this.typeMap(this.type)}" placeholder="${this.placeholder}" minlength="${this.minlength}" rows="${this.rows}" maxlength="${this.maxlength}">${multi?'</textarea>':''}
            <slot></slot>
            ${
                this.label&&!this.icon?
                '<label class="input-label">'+this.label+'</label>'
                :
                ''
            }
            ${
                this.type === 'password'&&!multi?
                '<com-button id="btn-pass" class="btn-right" icon="eye-close" type="flat" shape="circle"></com-button>'
                :
                ''
            }
            ${
                this.type === 'search'&&!multi?
                '<com-button id="btn-search" class="btn-right" icon="search" type="flat" shape="circle"></com-button>'
                :
                ''
            }
            ${
                this.type === 'number'&&!multi?
                '<div class="btn-right btn-number"><com-button id="btn-add" icon="up" type="flat"></com-button><com-button id="btn-sub" icon="down" type="flat"></com-button></div>'
                :
                ''
            }
        </com-tips>
        `
    }

    checkValidity(){
        if(this.novalidate||this.disabled||this.form&&this.form.novalidate){
            return true;
        }
        if(this.validity){
            this.inputCon.show = false;
            this.invalid = false;
            return true;
        }else{
            this.input.focus();
            this.inputCon.show = 'show';
            this.invalid = true;
            if(this.input.validity.valueMissing){
                this.inputCon.tips = this.input.validationMessage;
            }else{
                if(!this.customValidity.method(this)){
                    this.inputCon.tips = this.customValidity.tips;
                }else{
                    this.inputCon.tips = this.errortips||this.input.validationMessage;
                }
            }
            return false;
        }
    }
    
    connectedCallback() {
        this.form = this.closest('com-form');
        this.input = this.shadowRoot.getElementById('input');
        this.inputCon = this.shadowRoot.getElementById('input-con');
        this.input.addEventListener('input',(ev)=>{
            ev.stopPropagation();
            this.checkValidity();
            if(this.debounce){
                this.timer && clearTimeout(this.timer);
                this.timer = setTimeout(()=>{
                    this.dispatchEvent(new CustomEvent('input',{
                        detail:{
                            value:this.value
                        }
                    }));
                },this.debounce)
            }else{
                this.dispatchEvent(new CustomEvent('input',{
                    detail:{
                        value:this.value
                    }
                }));
            }
        })
        this.input.addEventListener('change',()=>{
            this.dispatchEvent(new CustomEvent('change',{
                detail:{
                    value:this.value
                }
            }));
        })
        this.input.addEventListener('focus',(ev)=>{
            this.checkValidity();
        })
        this.input.addEventListener('keydown',(ev)=>{
            switch (ev.keyCode) {
                case 13://Enter
                    this.dispatchEvent(new CustomEvent('submit',{
                        detail:{
                            value:this.value
                        }
                    }));
                    break;
                default:
                    break;
            }
        })
        if(!this.multi){
            this.btnPass = this.shadowRoot.getElementById('btn-pass');
            this.btnAdd = this.shadowRoot.getElementById('btn-add');
            this.btnSub = this.shadowRoot.getElementById('btn-sub');
            this.btnSearch = this.shadowRoot.getElementById('btn-search');
            if(this.btnSearch){
                this.btnSearch.addEventListener('click',()=>{
                    this.dispatchEvent(new CustomEvent('submit',{
                        detail:{
                            value:this.value
                        }
                    }));
                })
            }
            if(this.btnPass){
                this.btnPass.addEventListener('click',()=>{
                    this.password = !this.password;
                    if(this.password){
                        this.input.setAttribute('type','text');
                        this.btnPass.icon = 'eye';
                    }else{
                        this.input.setAttribute('type','password');
                        this.btnPass.icon = 'eye-close';
                    }
                    this.input.focus();
                })
            }
            if(this.btnAdd){
                this.btnAdd.addEventListener('click',()=>{
                    if(this.value-this.max<0){
                        this.value = Number(this.value)+Number(this.step);
                        this.dispatchEvent(new CustomEvent('change',{
                            detail:{
                                value:this.value
                            }
                        }));
                    }
                })
            }
            if(this.btnSub){
                this.btnSub.addEventListener('click',()=>{
                    if(this.value-this.min>0){
                        this.value = Number(this.value)-Number(this.step);
                        this.dispatchEvent(new CustomEvent('change',{
                            detail:{
                                value:this.value
                            }
                        }));
                    }
                })
            }
            this.pattern = this.pattern;
        }
        this.disabled = this.disabled;
        this.required = this.required;
        this.readonly = this.readonly;
    }

    typeMap(type) {
        switch (type) {
            case 'password':
            case 'number':
            case 'email':
            case 'tel':
            case 'url':
                break;
            default:
                type = 'text'
                break;
        }
        return type;
    }

    focus() {
        this.input.focus();
    }

    reset() {
        this.input.value = this.defaultvalue;
        this.inputCon.show = false;
        this.invalid = false;
    }

    get customValidity() {
        return this.$customValidity||{
            method:()=>true
        };
    }

    get value() {
        return this.input.value;
    }

    get debounce() {
        return this.getAttribute('debounce');
    }

    get novalidate() {
        return this.getAttribute('novalidate')!==null;
    }

    get name() {
        return this.getAttribute('name')||'';
    }

    get invalid() {
        return this.getAttribute('invalid')!==null;
    }

    get readonly() {
        return this.getAttribute('readonly')!==null;
    }

    get validity() {
        return this.input.checkValidity()&&this.customValidity.method(this);
    }

    get errordir() {
        return this.getAttribute('errordir')||'top';
    }

    get defaultvalue() {
        return this.getAttribute('defaultvalue')||'';
    }
    get rows() {
        return this.getAttribute('rows')||3;
    }

    get icon() {
        return this.getAttribute('icon');
    }

    get type() {
        return this.getAttribute('type');
    }

    get disabled() {
        return this.getAttribute('disabled')!==null;
    }

    get label() {
        return this.getAttribute('label')||'';
    }

    get placeholder() {
        return this.getAttribute('placeholder')||this.label;
    }

    get min() {
        return this.getAttribute('min')||0;
    }

    get max() {
        return this.getAttribute('max')||Infinity;
    }

    get minlength() {
        return this.getAttribute('minlength')||'';
    }

    get maxlength() {
        return this.getAttribute('maxlength')||'';
    }

    get step() {
        return this.getAttribute('step')||1;
    }

    get required() {
        return this.getAttribute('required')!==null;
    }

    get pattern() {
        return this.getAttribute('pattern');
    }

    get errortips() {
        return this.getAttribute('errortips');
    }

    set disabled(value) {
        if(value===null||value===false){
            this.removeAttribute('disabled');
        }else{
            this.setAttribute('disabled', '');
        }
    }

    set required(value) {
        if(value===null||value===false){
            this.removeAttribute('required');
        }else{
            this.setAttribute('required', '');
        }
    }

    set readonly(value) {
        if(value===null||value===false){
            this.removeAttribute('readonly');
        }else{
            this.setAttribute('readonly', '');
        }
    }

    set invalid(value) {
        if(value===null||value===false){
            this.removeAttribute('invalid');
        }else{
            this.setAttribute('invalid', '');
        }
    }

    set pattern(value) {
        if(value===null||value===false){
            this.removeAttribute('pattern');
        }else{
            this.setAttribute('pattern', value);
        }
    }

    set label(value) {
        this.setAttribute('label', value);
    }

    set icon(value) {
        this.setAttribute('icon', value);
    }

    set placeholder(value) {
        this.setAttribute('placeholder', value);
    }
    
    set customValidity(object) {
        this.$customValidity = object;
    }

    set novalidate(value) {
        if(value===null||value===false){
            this.removeAttribute('novalidate');
        }else{
            this.setAttribute('novalidate', '');
        }
    }

    set value(value) {
        this.input.value = value;
        /*
        this.checkValidity();
        this.dispatchEvent(new CustomEvent('change',{
            detail:{
                value:this.value
            }
        }));
        */
    }

    attributeChangedCallback (name, oldValue, newValue) {
        if(name == 'disabled' && this.input){
            if(newValue!==null){
                this.input.parentNode.setAttribute('tabindex', '-1');
            }else{
                this.input.parentNode.removeAttribute('tabindex');
            }
        }
        if(name == 'pattern' && this.input){
            if(newValue!==null){
                this.input.setAttribute('pattern', newValue);
            }else{
                this.input.removeAttribute('pattern');
            }
        }
        if(name == 'placeholder' && this.input){
            if(newValue!==null){
                this.input.setAttribute('placeholder', newValue);
            }else{
                this.input.removeAttribute('placeholder');
            }
        }
        if(name == 'required' && this.input){
            if(newValue!==null){
                this.input.setAttribute('required', 'required');
            }else{
                this.input.removeAttribute('required');
            }
        }
        if(name == 'readonly' && this.input){
            if(newValue!==null){
                this.input.setAttribute('readonly', 'readonly');
            }else{
                this.input.removeAttribute('readonly');
            }
        }
    }
    
}

class ComTextarea extends ComInput {
    constructor() {
        super({multi:true});
    }
}

if(!customElements.get('com-input')){
    customElements.define('com-input', ComInput);
}
if(!customElements.get('com-textarea')){
    customElements.define('com-textarea', ComTextarea);
}

class ComInputGroup extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
        <style>
        :host {
            display:flex;
        }
        ::slotted(:not(:first-child):not(:last-child)){
            border-radius:0;
        }
        ::slotted(*){
            margin:0!important;
        }
        ::slotted(:not(:first-child)){
            margin-left:-1px!important;
        }
        ::slotted(:first-child){
            border-top-right-radius: 0;
            border-bottom-right-radius: 0px;
        }
        ::slotted(:last-child){
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }
        </style>
        <slot></slot>
        `
    }
}

if(!customElements.get('com-input-group')){
    customElements.define('com-input-group', ComInputGroup);
}