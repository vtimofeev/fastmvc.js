///<reference path="./d.ts" />

module ft {
    export var templateHelper:ITemplateViewHelper = new TemplateViewHelper();

    var localeFormatterCache = {};
    var templateFormatterChache = {};

    var expression = new ft.Expression();

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
        private _componentMap;
        private _elementMap;
        private _classMap = {};
        private _prevDynamicProperiesMap = {};
        private _dynamicPropertiesMap = {};
        private _parent:TemplateView;
        private _extendTree:any = {};

        constructor(name:string, params?:ITemplateViewParams, template?:ITemplate) {
            super(name);
            this._template = template;
            params?_.each(params, this.setParameter, this):null;
        }

        setParameter(value:any, name:string):void {
            if(name in this) {
                _.isFunction(this[name])?this[name](value):this[name]=value;
            } else {
                console.warn('Cant set parameter, not found in ', name, ' param ', name);
            }
        }

        isChangedDynamicProperty(name:string):boolean {
            var value = expression.getContextValue(name,this);
            return !(this._prevDynamicProperiesMap[name] === value);
        }

        setDynamicProperty(name:string, value:string) {
            this._dynamicPropertiesMap[name] = value;
        }

        createDom() {
            var e = templateHelper.createTreeObject(this._template.domTree, this);
            templateHelper.setDataTreeObject(this._template.domTree, this);
            this.setElement(e);
        }

        getTemplate():ITemplate {
            return this._template;
        }

        getElementByPath(value:string):Element {
            return this._elementMap?this._elementMap[value]:null;
        }

        getComponentByPath(value:string):ITemplateView {
            return this._componentMap?this._componentMap[value]:null;
        }

        eval(value:string):any {
            return undefined;
        }

        getValue(value:any):any {
            return undefined;
        }

        getFormattedMessage(name:string, arguments:any[]):string {
            return undefined;
        }

        getExpressionValue(ex:IExpressionName):any {
            var exObj:IExpression = this.getTemplate().expressionMap[ex.name];
            var result = expression.execute(exObj, this.getTemplate().expressionMap, this);
            return result;
        }

        getClassExpressionValue(ex:IExpressionName):any {
            var exObj:IExpression = this.getTemplate().expressionMap[ex.name];
            var result = expression.execute(exObj, this.getTemplate().expressionMap, this, true);
            return result;
        }


        getPathClassValue(path, name):string {
            return this._classMap[path + '-' + name];
        }

        setPathClassValue(path, name, value):void {
            this._classMap[path + '-' + name] = value;
        }


        setTemplateElementProperty(name:string, value:TreeElement) {
            if(!this[name]) {
                this[name] = value;
                if(!value) delete this[name];
            } else {
                throw Error('Can not set name:' + name + ' property, cause it exist ' + this[name]);
            }
        }

        setPathOfCreatedElement(path:string,  value:TreeElement) {
            if('getElement' in value) {
                if(!this._componentMap) this._componentMap = {};
                this._componentMap[path] = value;
            }
            else {
                if(!this._elementMap) this._elementMap = {};
                this._elementMap[path] = value;
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
        private canValidate(type:number):boolean {
            var result = this.inDocument;
            //if(type===fmvc.InvalidateType.Data) result = result && !!this.data;
            return result;
        }

        protected validate() {
            if(!_.isEmpty(this._dynamicPropertiesMap)) {
                _.extend(this._prevDynamicProperiesMap, this._dynamicPropertiesMap);
                this._dynamicPropertiesMap = {};
            }
            super.validate();
            if(this.canValidate()) templateHelper.updateDynamicTree(this);
            //console.log('After validate: ', this);
        }



        protected validateRecreateTree() {
            //templateHelper.createTreeObject(this._template.domTree, this);
        }

        protected validateData():void {

            //if (this.canValidate(fmvc.InvalidateType.Data))
            //
        }

        eval(value:string):any {
            var r = eval(value);
            return r;
        }

        appendTo(value:ITemplateView|Element):TemplateView {
            if(value instanceof TemplateView) {
                value.append(this);
            }
            else {
                this.render(<Element> value);
            }
            return this;
        }

        append(value:TemplateView, ln?:string):TemplateView {
            value.parent = this;
            templateHelper.extendTree(value, ln, this);
            return this;
        }


    }




}
