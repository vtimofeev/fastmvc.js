declare var module:any;

module ft {

    export class VirtualClassList {
        classes:{[id:string]:boolean} = {};

        toggle(name:string, v:boolean) {
            if(!v) delete this.classes[name];
            else this.classes[name] = v;
        }
    }

    export class VirtualElement {

        private _type:number;
        private _tag:string;
        private _style:{[id:string]:string} = null;
        private _classList:VirtualClassList = null;
        attribute:{[id:string]:string} = null;
        children:VirtualElement[] = null;
        textContent:string = null;

        constructor(type:number, tag?:string, text?:string) {
            this._type = type;
            this._tag = tag;
            this.textContent = text;
        }

        public get outerHtml():string {
            var r = '';
            if(this._type === 1) r += this.openTag;
            if(this.children) r += this.innerHtml;
            if(this._type !== 1 && this.textContent) r+=this.textContent;
            if(this._type === 1) r += this.closeTag;
            return r;
        }

        public get innerHtml():string {
            var r = '';
            this.children.forEach((c)=>r +=c.outerHtml);
            return r;
        }

        public get openTag() {
            return '<' + this._tag + this.attrString() + this.classString() + this.styleString() + '>';
        }

        public get closeTag() {
            return '</' + this._tag + '>';
        }

        private attrString() {
            var r = '';
            if(!this.attribute) return r;
            for(var p in this.attribute) {
                r += ' ' + p + '="' + this.attribute[p] + '"'
            }
            return r;
        }

        private styleString() {
            var r = '';
            if(!this._style) return r;

            r += ' style="';
            for(var p in this._style) {
                r += p + ':' + this._style[p] + ';'
            }
            r += '"';
            return r;
        }

        private classString() {
            var r:string = '',
                n:string;
            if(!this._classList) return r;

            r += ' class="';
            var classes:any = this._classList.classes;
            for(n in classes) {
                if(classes[n] === true) r +=  n + ' ';
            }
            r += '"';
            return r;
        }

        public get style():{} {
            return this._style = this._style || {};
        }


        public get classList():ft.VirtualClassList {
            return this._classList ? this._classList : (this._classList = new VirtualClassList());
        }


        appendChild(v:VirtualElement) {
            if(!this.children) this.children = [];
            if(this.children.indexOf(v) === -1) this.children.push(v);
        }

        removeChild(v:VirtualElement) {
            var index = this.children.indexOf(v);
            if(index > -1) this.children.splice(index, 1);
        }

        replaceChild(n:VirtualElement, o:VirtualElement)
        {
            var index = this.children.indexOf(o);
            if(index > -1) this.children.splice(index, 1, n);
        }

        setAttribute(name:string, value:string)
        {
            if(!this.attribute) this.attribute = {};
            this.attribute[name] = value;
        }
    }

    export class VirtualDocument {
        createComment(text:string):VirtualElement {
            return new VirtualElement(8, null, text);
        }

        createTextNode(text:string):VirtualElement {
            return new VirtualElement(3, null, text);
        }

        createElement(name:string):VirtualElement {
            return new VirtualElement(1, name)
        }
    }

}


if(typeof module !== 'undefined') {
    module.exports = new ft.VirtualDocument();
}