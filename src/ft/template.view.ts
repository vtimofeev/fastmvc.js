///<reference path="./d.ts" />

module ft {
    export var templateHelper:ITemplateViewHelper = new TemplateViewHelper();

    var localeFormatterCache = {};
    var templateFormatterChache = {};
    var expression = new ft.Expression();
    var dispatcher = new ft.EventDispatcher(templateHelper.getIdMap());

    //console.log(dispatcher);

    function getFormatter(value:string, locale:string = 'en') {
        return templateFormatterChache[value] || compileFormatter(value, locale);
    }

    function compileFormatter(value:string, locale:string):Function {
        var mf = localeFormatterCache[locale] || (localeFormatterCache[locale] = new MessageFormat(this.locale));
        return (templateFormatterChache[value] = mf.compile(value));
    }



    export class TemplateView extends fmvc.View implements ITemplateView {
        private _template:ITemplate;
        public _i18n:any;

        private _componentMapByPath:any; // map of components by path
        private _elementMapByPath:any; // map of elements by path
        private _classMap:{[pathAndName:string]:string} = {}; // map of component classes

        private _prevDynamicProperiesMap = {};
        private _dynamicPropertiesMap = {};

        private _parent:ITemplateView;
        private _parentDomDef:IDomDef;

        //private _extendTree:any = {};
        private _dynamicHandlers:any;
        private _dataChildrenMap:{[path:string]:ITemplateView[]};

        constructor(name:string, params?:ITemplateViewParams, template?:ITemplate) {
            super(name);
            //console.log('Construct component: name,params,template ', name, params, template);
            this._template = template;
            params ? _.each(params, this.setParameter, this) : null;
        }

        get parent():ITemplateView {
            return this._parent;
        }

        set parent(value:ITemplateView) {
            this._parent = value;
        }

        get parentDomDef():IDomDef {
            return this._parentDomDef;
        }

        set parentDomDef(value:IDomDef) {
            this._parentDomDef = value;
        }

        setParameter(value:any, name:string):void {
            if (name in this) {
                _.isFunction(this[name]) ? this[name](value) : this[name] = value;
            } else {
                console.warn('Cant set parameter, not found in ', name, ' param ', name);
            }
        }

        isChangedDynamicProperty(name:string):boolean {
            var value = expression.getContextValue(name, this);
            return !(this._prevDynamicProperiesMap[name] === value);
        }

        setDynamicProperty(name:string, value:string):void {
            this._dynamicPropertiesMap[name] = value;
        }

        createDom() {
            var e = <TreeElement> templateHelper.createTreeObject(this._template.domTree, this);
            var element:HTMLElement = e instanceof TemplateView ? (<ITemplateView>e).getElement() : <HTMLElement>e;

            //templateHelper.setDataTreeObject(this._template.domTree, this);
            this.setElement(element);
        }

        enter() {
            if (this.inDocument) return console.warn('Error, try to reenter ', this.name);
            super.enter();
            var stateHandlers = {
                hover: {
                    mouseover: ()=>this.setState('hover', true),
                    mouseout: ()=>this.setState('hover', false)
                },
                selected: {
                    click: ()=>this.setState('selected', !this.getState('selected'))
                }
            };

            _.each(stateHandlers, (v:any, state:string)=>_.each(v, (handler, event:string)=>this.on(event, handler), this), this);
            templateHelper.enterTreeObject(this._template.domTree, this);
            templateHelper.setDataTreeObject(this._template.domTree, this);
        }

        exit() {
            super.exit();
            this.parent = null;
            this.parentDomDef = null;
        }

        getTemplate():ITemplate {
            return this._template;
        }

        getDomDefinitionByPath(path:string):IDomDef {
            var parts = (<string[]>path.split(',')).splice(1);
            return _.reduce(parts, (m:IDomDef, v:string)=>(m.children[Number(v)]), this.getTemplate().domTree);
        }

        getElementByPath(value:string):HTMLElement {
            return <HTMLElement> this._elementMapByPath ? this._elementMapByPath[value] : null;
        }

        getComponentByPath(value:string):ITemplateView {
            return this._componentMapByPath ? this._componentMapByPath[value] : null;
        }

        getExpressionValue(ex:IExpressionName):any {
            console.log('getExpressionValue, object, ex', ex);
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
            if (!this[name]) {
                this[name] = value;
                if (!value) delete this[name];
            } else {
                throw Error('Can not set name:' + name + ' property, cause it exist ' + this[name]);
            }
        }

        setPathOfCreatedElement(path:string, value:TreeElement) {
            if ('getElement' in value) {
                if (!this._componentMapByPath) this._componentMapByPath = {};
                this._componentMapByPath[path] = value;
            }
            else {
                if (!this._elementMapByPath) this._elementMapByPath = {};
                this._elementMapByPath[path] = value;
            }
        }

        getDataChildrenByPath(path:string) {
            return this._dataChildrenMap ? this._dataChildrenMap[path] : null;
        }

        setDataChildrenByPath(path, children:ITemplateView[]) {
            if (!this._dataChildrenMap) this._dataChildrenMap = {};
            this._dataChildrenMap[path] = children;
        }

        getFormattedMessage(name:string, args:any):string {
            var formattedTemplate:string =
                (this._template && this._template.i18n && this._template.i18n[name]) ? this._template.i18n[name] : null
                || (this._i18n && this._i18n[name]) ? this._i18n[name] : null;

            if (!formattedTemplate) return 'Error: not found';
            var formatter = getFormatter(formattedTemplate);
            return formatter(args);
        }

        private canValidate(type?:number):boolean {
            var result = this.inDocument;
            // if(type===fmvc.InvalidateType.Data) result = result && !!this.data;
            return result;
        }

        validate():void {

            if (!_.isEmpty(this._dynamicPropertiesMap)) {
                _.extend(this._prevDynamicProperiesMap, this._dynamicPropertiesMap);
                this._dynamicPropertiesMap = {};
            }
            super.validate();
            //console.log('Update tree ', this.inDocument);
            if (this.canValidate()) templateHelper.updateDynamicTree(this);
        }


        protected validateRecreateTree() {
            //templateHelper.createTreeObject(this._template.domTree, this);
        }

        protected validateData():void {
            //if (this.canValidate(fmvc.InvalidateType.Data))
        }

        eval(value:string):any {
            var r = null;

            try {
                r = eval(value);
            }
            catch (e) {
                r = '{' + value + '}';
            }
            return r;
        }

        evalHandler(value:string, e:any):any {
            //console.log('event handler: ', value, e);
            var r = eval(value);
            return r;
        }


        appendTo(value:ITemplateView|Element):TemplateView {
            if (value instanceof TemplateView) {
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
            if (!this._dynamicHandlers) this._dynamicHandlers = {};
            if (path && !this._dynamicHandlers[path]) this._dynamicHandlers[path] = {};
            var handlers = this._dynamicHandlers[path][event]?this._dynamicHandlers[path][event]:[];
            handlers.push(handler);
            this._dynamicHandlers[path][event] = handlers;
        }

        off(event, path = '0') {
            if (!path) path = '0';
            delete this._dynamicHandlers[path][event];
        }

        trigger(e:ITreeEvent, path = '0') {
            var h = this._dynamicHandlers ? this._dynamicHandlers[path] : null;
            console.log('Trigger ', e.currentTarget?e.currentTarget.name:name, e, h);
            if (h && h[e.name]) {
                console.log('Has trigger ... ', h[e.name]);
                var handlers = h[e.name];
                _.each(handlers, (v)=>v.call(this, e), this);
            }
        }

        handleTreeEvent(e:ITreeEvent, path?:string) {
            //console.log('Handle tree event ... ', e);
            e.currentTarget = this;// previous dispatch
            e.depth--;


            templateHelper.dispatchTreeEvent(e, path);// dispatch to tree
            if (!e.cancelled) this.trigger(e);// dispatch to this component(dynamic handlers);
            if (e.prevented && e.e) e.e.preventDefault();

            e.previousTarget = this;
            if (e.depth > 0 && !e.cancelled) this.dispatchTreeEvent(e); // dispatch to parent
            else dispatcher.disposeEvent(e);
        }

        // custom event this.send(name, data), send stateChange event
        dispatchTreeEvent(e:ITreeEvent) {
            console.log('Try dispatch to parent tree event ...', this, this.parent);
            if (this.parent) this.parent.handleTreeEvent(e, this.parentDomDef?this.parentDomDef.path:null); // dispatch to parent
        }

        getCustomTreeEvent(name:string, data:any = null, depth:number = 1):ITreeEvent {
            return dispatcher.getCustomTreeEvent(name, data, this, depth);
        }

        sendTreeEvent(name:string, data?:any, depth?:number) {
            this.dispatchTreeEvent(this.getCustomTreeEvent(name, data, depth));
            this.sendEvent(name, data);
        }

        internalHandler(type, e:any) {
            console.log('Internal handler ', this, type, e);
            if(this.parent) this.parent.internalHandler(type, e);
        }
    }
}
