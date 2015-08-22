///<reference path="./d.ts" />

module ft {
    export var templateHelper:ITemplateViewHelper = new TemplateViewHelper();

    export class TemplateView extends fmvc.View implements ITemplateView {
        private _template:ITemplate;
        private _componentMapByPath;
        private _elementMapByPath;

        constructor(name:string, params?:ITemplateViewParams, template?:ITemplate) {
            super(name);
        }

        createDom() {
            var e = templateHelper.createTreeObject(this._template.domTree, this);
            this.setElement(e);
        }

        getTemplate():ITemplate {
            return this._template;
        }

        getElementByPath(value:string):Element {
            return this._elementMapByPath?this._elementMapByPath[value]:null;
        }

        getComponentByPath(value:string):ITemplateView {
            return this._componentMapByPath?this._componentMapByPath[value]:null;
        }


        setTemplateElementProperty(name:string, value:TreeElement) {
            if(!this[name]) {
                this[name] = value;
                if(!value) delete this[name];
            } else {
                throw Error('Cant set ' + name + ' property, cause it exist ' + this[name]);
            }
        }

        setPathOfCreatedElement(path:string,  value:TreeElement) {
            if(_.isElement(value)) {
                if(!this._elementMapByPath) this._elementMapByPath = {};
                this._elementMapByPath[path] = value;
            }
            else {
                if(!this._componentMapByPath) this._componentMapByPath = {};
                this._componentMapByPath[path] = value;
            }
        }
    }




}
