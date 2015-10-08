///<reference path="./d.ts" />

module ft {
    export var templateHelper:ITemplateViewHelper = new TemplateViewHelper();


    var localeFormatterCache = {};
    var templateFormatterChache = {};
    var expression = new ft.Expression();
    var dispatcher = new ft.EventDispatcher(templateHelper);
    var timers = {createDom: 0 , enter: 0, setData: 0, validate: 0};
    var counters = {createDom: 0 , enter: 0, setData: 0, validate: 0, validateState: 0, validateData: 0, validateApp: 0};

    setInterval(()=>console.log('Statistic timers', timers, ' counters ', counters), 5000);
    //console.log(dispatcher);

    function getFormatter(value:string, locale:string = 'en') {
        return templateFormatterChache[value] || compileFormatter(value, locale);
    }

    function compileFormatter(value:string, locale:string):Function {
        var mf = localeFormatterCache[locale] || (localeFormatterCache[locale] = new MessageFormat(this.locale));
        return (templateFormatterChache[value] = mf.compile(value));
    }

    function getTime():number {
        return (new Date()).getTime();
    }

    export class TemplateView extends fmvc.View implements ITemplateView {
        private _template:ITemplate;
        public _i18n:any; // i18n store

        private _parent:ITemplateView; // Parent View
        private _domDef:IDomDef; // Definition view related parent
        private _params:any; // Merged params from constructor and dom definition

        // Maps of created element
        private _treeElementMapByPath:{[path:string]:TreeElement};

        // Maps of current class values, by path and css name
        private _cssClassMap:{[pathAndCssClassName:string]:string} = {}; // map of component classes

        // Properties map
        private _prevDynamicProperiesMap = {};
        private _dynamicPropertiesMap = {};

        // Local handler
        private _localHandlers:any;

        // Local children stored by path of the container (view or dom element)
        private _dataChildren:{[path:string]:TemplateViewChildren};

        constructor(name:string, params?:ITemplateViewParams, template?:ITemplate) {
            super(name);
            this._template = template;
            this.setParameters(params);
        }

        get parent():ITemplateView {
            return this._parent;
        }

        set parent(value:ITemplateView) {
            this._parent = value;
        }

        get domDef():IDomDef {
            return this._domDef;
        }

        set domDef(value:IDomDef) {
            this._domDef = value;
        }

        get localDomDef():IDomDef {
            return this.getTemplate().domTree;
        }

        set i18n(value:any) {
           this._i18n = value;
        }

        get i18n():any {
            return this._i18n;
        }

        cleanParameters() {
            this._params = null;
        }

        setParameters(value:any) {
            this._params = _.defaults(this._params || {}, value);
        }

        applyParameters() {
            _.each(this._params, this.applyParameter, this);
        }

        applyParameter(value:any, key:string):void {
            var ctx = this.parent||this;
            switch (key) {
                case TemplateParams.setData:
                    this.data = this.getParameterValue(value, ctx);
                    break;
                case TemplateParams.setModel:
                    this.model = this.getParameterValue(value, ctx);
                    break;
                case TemplateParams.setStateSelected:
                    this.setState('selected', !!this.getParameterValue(value, ctx, this));
                    break;
                case TemplateParams.enableStateHandlers:
                    this.enableStateHandlers(value.split(','));
                    break;
                default:
                    // direct set parameters for root
                    if(key in this) {
                        if(_.isFunction(this[key])) this[key](value);
                        else this[key] = value;
                    }
                    else {
                        console.warn('Cant set template view parameter ', key);
                    }
                    break;
            }
        }

        getParameterValue(value:IExpressionName|any, ctx:ITemplateView, child:ITemplateView):any {
            if(child) ctx.ctx = child;
            return _.isObject(value)?ctx.getExpressionValue(value):value;
        }


        setTreeElementPath(path:string, value:TreeElement) {
            if (!this._treeElementMapByPath) this._treeElementMapByPath = {};
            this._treeElementMapByPath[path] = value;
        }

        isChangedDynamicProperty(name:string):boolean {
            var value = expression.getContextValue(name, this);
            var r = !(this._prevDynamicProperiesMap[name] === value);
            return r;
        }

        setDynamicProperty(name:string, value:string):void {
            this._dynamicPropertiesMap[name] = value;
        }

        createDom() {
            if(this._element) return;
            var start = getTime();
            var parentParams = this.domDef?this.domDef.params:null;
            var localParams = this.localDomDef?this.localDomDef.params:null;
            this.setParameters(_.extend({}, localParams, parentParams));

            var e = <TreeElement> templateHelper.createTreeObject(this._template.domTree, this);
            var element:HTMLElement = e instanceof TemplateView ? (<ITemplateView>e).getElement() : <HTMLElement>e;
            this.setElement(element);
            this.setTreeElementPath('0', this);
            counters.createDom++;
            timers.createDom += getTime()-start;
        }

        enter() {
            if (this.inDocument) {
                return console.warn('Error, try to re-enter ', this.name);
            }
            var start = getTime();
            super.enter();
            this.applyParameters();
            templateHelper.setDataTreeObject(this._template.domTree, this);
            counters.setData++;
            timers.setData += getTime() - start;

            templateHelper.enterTreeObject(this._template.domTree, this);
            this.invalidate(fmvc.InvalidateType.Data);
            this.invalidate(fmvc.InvalidateType.State);
            counters.enter++;
            timers.enter += getTime() - start;
        }

        enableStateHandlers(value:string[]) {
            var stateHandlers = {
                hover: {
                    mouseover: ()=>this.setState('hover', true),
                    mouseout: ()=>this.setState('hover', false)
                },
                selected: {
                    click: ()=>this.setState('selected', !this.getState('selected'))
                }

            };
            _.each(value, (state:string)=>_.each(stateHandlers[state], (handler, event:string)=>this.on(event, handler), this), this);
        }

        exit() {
            if (!this.inDocument) {
               return console.warn('Error, try re-exit');
            }

            templateHelper.exitTreeObject(this._template.domTree, this);
            this.parent = null;
            this.domDef = null;
        }

        getTemplate():ITemplate {
            return this._template;
        }

        getDomDefinitionByPath(path:string):IDomDef {
            return this._template.pathMap[path];
        }

        getTreeElementByPath(value:string):TreeElement {
            return <TreeElement> this._treeElementMapByPath?this._treeElementMapByPath[value]:null;
        }

        getExpressionValue(ex:IExpressionName):any {
            var exObj:IExpression = this.getTemplate().expressionMap[ex.name];
            var result = expression.execute(exObj, this.getTemplate().expressionMap, this);
            return result;
        }

        getCssClassExpressionValue(ex:IExpressionName):any {
            var exObj:IExpression = this.getTemplate().expressionMap[ex.name];
            var result = expression.execute(exObj, this.getTemplate().expressionMap, this, true);
            return result;
        }

        getPathClassValue(path:string, name:string):string {
            return this._cssClassMap[path + '-' + name] || null;
        }

        setPathClassValue(path:string, name:string, value:string):void {
            this._cssClassMap[path + '-' + name] = value;
        }

        setTemplateElementProperty(name:string, value:TreeElement) {
            if (!this[name]) {
                this[name] = value;
                if (!value) delete this[name];
            } else {
                throw Error('Can not set name:' + name + ' property, cause it exist ' + this[name]);
            }
        }


        getChildrenViewByPath(path:string):TemplateViewChildren {
            return this._dataChildren ? this._dataChildren[path] : null;
        }

        setChildrenViewPath(path, children:TemplateViewChildren) {
            if (!this._dataChildren) this._dataChildren = {};
            this._dataChildren[path] = children;
        }

        getFormattedMessage(name:string, args:any):string {
            var formattedTemplate:string =
                (this._template && this._template.i18n && this._template.i18n[name]) ? this._template.i18n[name] : null
                || (this._i18n && this._i18n[name]) ? this._i18n[name] : null;

            if (!formattedTemplate) return 'Error: TemplateView.getFormattedMessage, formattedTemplate not found';
            var formatter = getFormatter(formattedTemplate);
            return formatter(args);
        }

        private canValidate(type?:number):boolean {
            var result:boolean = this.inDocument;
            return result;
        }

        validate():void {
            var start = getTime();
            if (!_.isEmpty(this._dynamicPropertiesMap)) {
                _.extend(this._prevDynamicProperiesMap, this._dynamicPropertiesMap);
                this._dynamicPropertiesMap = {};
            }

            templateHelper.createTreeObject(this._template.domTree, this);
            super.validate();

            var result = getTime()-start;
            counters.validate++;
            timers.validate+=result;
            //if (this.canValidate()) templateHelper.updateDynamicTree(this);
        }

        protected validateData():void {
            if(this.canValidate(fmvc.InvalidateType.Data)) {
                counters.validateData++;
                templateHelper.updateDynamicTree(this, 'data');
            }
        }

        protected validateState():void {
            if(this.canValidate(fmvc.InvalidateType.Data)) {
                counters.validateState++;
                templateHelper.updateDynamicTree(this, 'state');
            }
        }

        protected validateParent() {
        }

        protected validateChildren() {
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
            if (!this._localHandlers) this._localHandlers = {};
            if (path && !this._localHandlers[path]) this._localHandlers[path] = {};
            var handlers = this._localHandlers[path][event]?this._localHandlers[path][event]:[];
            handlers.push(handler);
            this._localHandlers[path][event] = handlers;
        }

        off(event, path = '0') {
            if (!path) path = '0';
            delete this._localHandlers[path][event];
        }

        trigger(e:ITreeEvent, path = '0') {
            var h = this._localHandlers ? this._localHandlers[path] : null;
            if (h && h[e.name]) {
                var handlers = h[e.name];
                _.each(handlers, (v)=>v.call(this, e), this);
            }
        }

        handleTreeEvent(e:ITreeEvent) {
            e.currentTarget = this;// previous dispatch
            e.depth--;

            if (!e.cancelled) this.trigger(e);// dispatch to this component(dynamic handlers);
            if (e.prevented && e.e) e.e.preventDefault();

            e.previousTarget = this;
        }

        // custom event this.send(name, data), send stateChange event
        dispatchTreeEvent(e:ITreeEvent) {
            e.target = this;
            e.def = e.def || this.localDomDef;
            templateHelper.dispatchTreeEventDown(e);
        }

        getCustomTreeEvent(name:string, data:any = null, depth:number = 1):ITreeEvent {
            return dispatcher.getCustomTreeEvent(name, data, this, depth);
        }

        internalHandler(type, e:any) {
            if(this.parent) this.parent.internalHandler(type, e);
        }

    }
}
