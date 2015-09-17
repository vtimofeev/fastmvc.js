///<reference path="./d.ts" />

module ft {
    export var templateHelper:ITemplateViewHelper = new TemplateViewHelper();

    var localeFormatterCache = {};
    var templateFormatterChache = {};
    var expression = new ft.Expression();
    var dispatcher = new ft.EventDispatcher(templateHelper.idMap);
    console.log(dispatcher);

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
        private _parent:ITemplateView;
        private _extendTree:any = {};
        private _dynamicHandlers:any;

        constructor(name:string, params?:ITemplateViewParams, template?:ITemplate) {
            super(name);
            this._template = template;
            params?_.each(params, this.setParameter, this):null;
        }

        get parent():ITemplateView {
            return this._parent;
        }

        set parent(value:ITemplateView) {
            this._parent = value;
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

        setDynamicProperty(name:string, value:string):void {
            this._dynamicPropertiesMap[name] = value;
        }

        createDom() {
            var e = templateHelper.createTreeObject(this._template.domTree, this);
            templateHelper.setDataTreeObject(this._template.domTree, this);
            this.setElement(e);
        }

        enter() {
            var stateHandlers = {
                hover: {
                    mouseover: ()=>this.setState('hover', true),
                    mouseout: ()=>this.setState('hover', false)
                },
                selected: {
                    click: ()=>this.setState('selected', !this.getState('selected'))
                }
            };

            _.each(stateHandlers, (v:any, state:string)=>_.each(v, (handler, event:string)=>this.on(event,handler), this), this);
        }

        getTemplate():ITemplate {
            return this._template;
        }

        getElementByPath(value:string):HTMLElement {
            return <HTMLElement> this._elementMap?this._elementMap[value]:null;
        }

        getComponentByPath(value:string):ITemplateView {
            return this._componentMap?this._componentMap[value]:null;
        }

        getValue(value:any):any {
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

        getPathClassValue(path:string, name:string):string {
            return this._classMap[path + '-' + name] || null;
        }

        setPathClassValue(path:string, name:string, value:string):void {
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

        getFormattedMessage(name:string, args:any):string {
            var formattedTemplate:string =
                (this._template && this._template.i18n && this._template.i18n[name])?this._template.i18n[name]:null
            || (this._i18n && this._i18n[name])?this._i18n[name]:null;

            if(!formattedTemplate) return 'Error: not found';
            var formatter = getFormatter(formattedTemplate);
            return formatter(args);
        }
        private canValidate(type?:number):boolean {
            var result = this.inDocument;
            // if(type===fmvc.InvalidateType.Data) result = result && !!this.data;
            return result;
        }

        validate() {
            if(!_.isEmpty(this._dynamicPropertiesMap)) {
                _.extend(this._prevDynamicProperiesMap, this._dynamicPropertiesMap);
                this._dynamicPropertiesMap = {};
            }
            super.validate();
            if(this.canValidate()) templateHelper.updateDynamicTree(this);
        }


        protected validateRecreateTree() {
            //templateHelper.createTreeObject(this._template.domTree, this);
        }

        protected validateData():void {
            //if (this.canValidate(fmvc.InvalidateType.Data))
        }

        eval(value:string):any {
            var r = eval(value);
            return r;
        }

        evalHandler(value:string, e:any):any {
            console.log('event handler: ', value, e);
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

        append(value:ITemplateView, ln?:string):TemplateView {
            value.parent = this;
            templateHelper.extendTree(value, ln, this);
            return this;
        }

        on(event, handler, path = '0') {
            if(!this._dynamicHandlers) this._dynamicHandlers = {};
            if(path && !this._dynamicHandlers[path]) this._dynamicHandlers[path] = {};
            this._dynamicHandlers[path][event] = handler;
        }

        off(event, path = '0') {
            if(!path) path = '0';
            delete this._dynamicHandlers[path][event];
        }

        trigger(e:ITreeEvent, path = '0') {
            var h = this._dynamicHandlers?this._dynamicHandlers[path]:null;
            console.log('Trigger ', e, h);
            if(h&&h[e.name]) h[e.name].call(this, e);
        }

        handleTreeEvent(e:ITreeEvent) {
            e.currentTarget = this;// previous dispatch
            e.depth--;

            templateHelper.dispatchTreeEvent(e);// dispatch to tree
            if(!e.cancelled) this.trigger(e);// dispatch to this component(dynamic handlers);
            if(e.prevented && e.e) e.e.preventDefault();

            e.previousTarget = this;
            if(e.depth > 0 && !e.cancelled && this.parent) this.dispatchTreeEvent(e); // dispatch to parent
            else dispatcher.disposeEvent(e);
        }

        // custom event this.send(name, data), send stateChange event
        dispatchTreeEvent(e:ITreeEvent) {
            if(this.parent) this.parent.handleTreeEvent(e); // dispatch to parent
        }

        getCustomTreeEvent(name:string, data:any = null, depth:number = 1):ITreeEvent {
            return dispatcher.getCustomTreeEvent(name, data, this, depth);
        }

        sendTreeEvent(name:string, data?:any, depth?:number) {
            this.dispatchTreeEvent(this.getCustomTreeEvent(name, data, depth));
            this.sendEvent(name, data);
        }

        internalHandler(type, e:any) {
            console.log('Internal handler ', type, e);
        }
    }
}
