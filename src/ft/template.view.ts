///<reference path="./d.ts" />

module ft {
    export var templateHelper:ITemplateViewHelper = new TemplateViewHelper();

    var localeFormatterCache = {};
    var templateFormatterChache = {};
    //var MessageFormat = exports?exports.MessageFormat:window.MessageFormat;

    function getFormatter(value:string, locale:string = 'en') {
        return  templateFormatterChache[value] || compileFormatter(value,locale);
    }

    function compileFormatter(value:string, locale:string):Function
    {
        var mf = localeFormatterCache[locale] || (localeFormatterCache[locale] = new MessageFormat(this.locale));
        return (templateFormatterChache[value] = mf.compile(value));
    }

    export class TemplateView extends fmvc.View implements ITemplateView {
        private _template:ITemplate;
        public _i18n:any;
        private _componentMapByPath;
        private _elementMapByPath;

        constructor(name:string, params?:ITemplateViewParams, template?:ITemplate) {
            super(name);
            this._template = template;
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

        getFormattedMessage(name:string, args:any):Function {
            var formattedTemplate:string =
                (this._template && this._template.i18n && this._template.i18n[name])?this._template.i18n[name]:null
            || (this._i18n && this._i18n[name])?this._i18n[name]:null;

            if(!formattedTemplate) return 'Error: not found';
            var formatter = getFormatter(formattedTemplate);
            return formatter(args);
        }

        eval(value:string):any {
            var r = eval(value);
            console.log('eval: ', value, ' = ',  r, ' instance', this);
            return r;
        }
    }




}
