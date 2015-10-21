///<reference path="./d.ts" />

module ft {
    export var templateHelper:ITemplateViewHelper = new TemplateViewHelper();

    var localeFormatterCache = {};
    var templateFormatterChache = {};
    export var expression = new ft.Expression();
    var dispatcher = new ft.EventDispatcher(templateHelper);
    var timers = {createDom: 0 , enter: 0, setData: 0, validate: 0};
    export var counters = {expression: 0, expressionEx: 0, expressionCtx: 0, multiExpression: 0, createDom: 0 , enter: 0, setData: 0, validate: 0, validateState: 0, validateData: 0, validateApp: 0};

    setInterval(()=>console.log('Statistic timers', JSON.stringify(timers), ' counters ', JSON.stringify(counters), ' frames ', fmvc.frameExecution), 5000);

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

        // Set special type of node, when component is created by TemplateViewChildren
        private _isChildren:boolean = false;

        // Local children stored by path of the container (view or dom element)
        private _dataChildren:{[path:string]:TemplateChildrenView};
        private _delays:any;
        private _delayStart:any = {};

        constructor(name:string, params?:ITemplateViewParams, template?:ITemplate) {
            super(name);
            this._template = template;
            var resultParams = _.extend({}, template.domTree.params, params);
            this.setParameters(resultParams);
            this.life = 'init';
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

        get isChildren():boolean {
            return this._isChildren;
        }

        set isChildren(value:boolean) {
            this._isChildren = value;
        }


        ////////////////////////////////////////////////////////////////        
        // States
        ////////////////////////////////////////////////////////////////

        // Состояние отвечающее за базовый класс
        get base():string {
            return this.getState('base');
        }
        set base(value:string) {
            this.setState('base', value);
        }

        // Состояние отвечающее за значение
        get value():any {
            return this.getState('value');
        }
        set value(value:any) {
            this.setState('value', value);
        }

        // Состояние кастомное
        get custom():any {
            return this.getState('custom');
        }
        set custom(value:any) {
            this.setState('custom', value);
        }

        // Состояние отвечающее за базовый класс
        get hover():string {
            return this.getState('hover');
        }
        set hover(value:string) {
            this.setState('hover', value);
        }

        // Состояние отвечающее за тип выбранный (лучше использовать от данных)
        get selected():boolean {
            return this.getState('selected');
        }
        set selected(value:boolean) {
            this.setState('selected', value);
        }

        // Состояние отвечает за наличие пользовательского фокуса
        get focused():boolean {
            return this.getState('focused');
        }
        set focused(value:boolean) {
            this.setState('focused', value);
        }

        // Состояние забокированный
        get disabled():boolean {
            return this.getState('disabled');
        }
        set disabled(value:boolean) {
            this.setState('disabled', value);
        }

        // state
        get life():any {
            return this.getState('life');
        }
        set life(value:any) {
            this.setState('life', value);
        }



        ////////////////////////////////////////////////////////////////        
        // States
        ////////////////////////////////////////////////////////////////
        cleanParameters() {
            this._params = null;
        }

        setParameters(value:any):any {
            this._params = _.defaults(this._params || {}, value);
        }

        getParameters():any {
            return this._params;
        }

        applyParameters() {
            _.each(this._params, this.applyParameter, this);
        }

        applyParameter(value:any, key:string):void {
            switch (key) {
                case TemplateParams.stateHandlers:
                    this.stateHandlers(_.isString(value)?(value.split(',')):value);
                    break;
                default:
                    // children of, skip
                    if(key.indexOf('children.') === 0) {
                        return;
                    }

                    // handlers, set handler
                    else if(key.indexOf('on') === 0) {
                        var t = this;
                        this.on(key.substring(2), _.isString(value)?(e)=>{ t.internalHandler(value,e); }:value);
                    }

                    // direct set states, values
                    else if(key in this) {
                        if(_.isFunction(this[key])) this[key](value);
                        else {
                            var value:any = this.getParameterValue(value, key, this);
                            //@todo check value type of states (boolean,number,...etc)
                            this[key] = value;
                        }
                    }

                    else {
                        console.warn('Apply: Cant set template view parameter ', key);
                    }
                    break;
            }
        }

        getParameterValue(value:IExpressionName|any, key:string):any {
            return _.isObject(value)?this.getExpressionValue(value):value;
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

        getDynamicProperty(name:string):void {
            return this._dynamicPropertiesMap[name];
        }


        createDom():void {
            if(this._element) return;
            this.life = 'create';
            var start = getTime();
            var parentParams = this.domDef?this.domDef.params:null;
            var localParams = this.localDomDef?this.localDomDef.params:null;

            // skip set params if children (it is set by ChildrenView)
            if(!this.isChildren) this.setParameters(_.extend({}, localParams, parentParams));

            this._delayStart['create'] = (new Date()).getTime();

            var e = <TreeElement> templateHelper.createTreeObject(this._template.domTree, this);

            var element:HTMLElement = e instanceof TemplateView ? (<ITemplateView>e).getElement() : <HTMLElement>e;
            this.setElement(element);
            this.setTreeElementPath('0', this);
            counters.createDom++;
            timers.createDom += getTime()-start;
        }

        enter():void {
            if (this.inDocument) {
                return console.warn('Error, try to re-enter ', this.name);
            }
            this.life = 'enter';

            var start = getTime();

            super.enter();
            this.applyParameters();

            templateHelper.enterTreeObject(this._template.domTree, this);
            //templateHelper.updateDynamicTree(this, 'state', 'state.life');
            this.invalidate(fmvc.InvalidateType.Data);
            this.invalidate(fmvc.InvalidateType.State);

            timers.enter += getTime() - start;
            counters.enter++;

            var t = this;
            setTimeout(()=>this.life = 'active', 50);
        }

        stateHandlers(value:string[]) {
            if(_.isString(value)) value = value.split(',');

            var stateHandlers = {
                hover: {
                    mouseover: this.mouseoverHandler,
                    mouseout: this.mouseoutHandler
                },
                selected: {
                    click: this.clickHandler
                }

            };
            _.each(value, (state:string)=>_.each(stateHandlers[state], (handler, event:string)=>this.on(event, handler), this), this);
        }

        private mouseoverHandler(e:ITreeEvent):void {
            if(!!this.getState('disabled')) return;
            this.setState('hover', true);
        }

        private mouseoutHandler(e:ITreeEvent):void {
            if(!!this.getState('disabled')) return;
            this.setState('hover', false);
        }

        private clickHandler(e:ITreeEvent):void {
            if(!!this.getState('disabled')) return;
            this.setState('selected', !this.getState('selected'));
        }

        exit() {
            if (!this.inDocument) {
               return console.warn('Error, try re-exit');
            }

            templateHelper.exitTreeObject(this._template.domTree, this);
            this.cleanDelays();
            this.parent = null;
            this.domDef = null;


            super.exit();

            this._cssClassMap = null;
            this._dynamicPropertiesMap = null;
            this._prevDynamicProperiesMap = null;
            this._localHandlers  = null;
            this._treeElementMapByPath = null;

            _.each(this._treeElementMapByPath, (v,k)=>delete this._treeElementMapByPath[k], this);
            this._i18n = null;
        }

        dispose() {
            super.dispose();
            this._params = null;
            this._template = null;
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

        public getExpressionByName(name:string):IExpression {
            var value = this._template.expressionMap?this._template.expressionMap[name]:null;
            value = value || (this.parent?this.parent.getExpressionByName(name):null);
            return value;
        }

        getExpressionValue(ex:IExpressionName):any {
            var exName = ex.name;
            if(this._dynamicPropertiesMap[exName]) return this._dynamicPropertiesMap[exName];
            var exObj:IExpression = this.getExpressionByName(exName);
            var result = this.executeExpression(exObj);
            this.setDynamicProperty(ex.name, result);
            return result;
        }

        protected executeExpression(value:IExpression):any {
            return expression.execute(value, /*this.getTemplate().expressionMap,*/ this);
        }

        getCssClassExpressionValue(ex:IExpressionName):any {
            var exObj:IExpression = this.getTemplate().expressionMap[ex.name];
            var result = expression.execute(exObj, /*this.getTemplate().expressionMap,*/ this, true);
            return result;
        }

        getPathClassValue(path:string, name:string):string {
            return this._cssClassMap[path + '-' + name] || null;
        }

        setPathClassValue(path:string, name:string, value:string):void {
            this._cssClassMap[path + '-' + name] = value;
        }

        setTreeElementLink(name:string, value:TreeElement):void {
            if (!this[name]) {
                this[name] = value;
                if (!value) {
                    delete this[name];
                }
            } else {
                throw Error('Can not set name:' + name + ' property, cause it exists ' + this[name]);
            }
        }

        getChildrenViewByPath(path:string):TemplateChildrenView {
            return this._dataChildren ? this._dataChildren[path] : null;
        }

        setChildrenViewPath(path, children:TemplateChildrenView) {
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
            if(!this.inDocument) return;
            var start = getTime();
            if (!_.isEmpty(this._dynamicPropertiesMap)) {
               _.extend(this._prevDynamicProperiesMap, this._dynamicPropertiesMap);
               this._dynamicPropertiesMap = {};
            }

            if(this._template.hasStates) templateHelper.createTreeObject(this._template.domTree, this);
            super.validate();

            var result = getTime()-start;
            counters.validate++;
            timers.validate+=result;
        }

        protected validateApp():void {
            if(this.canValidate(fmvc.InvalidateType.App)) {
                counters.validateApp++;
                templateHelper.updateDynamicTree(this, 'app');
            }
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

        on(event:string, handler, path:string = '0') {
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
                _.each(handlers, (v)=>{ v.call(this, e); e.executionHandlersCount++; }, this);
            }
        }

        handleTreeEvent(e:ITreeEvent) {
            e.currentTarget = this;// previous dispatch
            e.depth--;

            this.trigger(e);// dispatch to this component(dynamic handlers);
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
            console.log('Internal handler ... ', type, e);
            if(this.parent) this.parent.internalHandler(type, e);
        }

        isDelay(data:IDomDef, functor:string):boolean {
            var delayValue = Number(data.params[functor + 'Delay']);
            var result:boolean = ((new Date()).getTime() - this._delayStart[functor]) < delayValue;
            console.log('Is delay ' , data.path, result);
            return result;
        }

        setDelay(data:IDomDef, functor:string):void {
            if (!this._delays) this._delays = {};
            var delayName:string = data.path + ':' + functor;
            if (this._delays[delayName]) return;

            var delayValue = Number(data.params[functor + 'Delay'])
            var t = this;

            this._delays[delayName] = setTimeout(function() {
                if(!t.inDocument) return;
                switch (functor) {
                    case 'create':
                        templateHelper.createTreeObject(t.getDomDefinitionByPath(data.parentPath) || t.domDef, t);
                        templateHelper.enterTreeObject(t.getDomDefinitionByPath(data.parentPath) || t.domDef, t);
                        return;
                    case 'exit':
                        templateHelper.exitTreeObject(data, t);
                        return;
                }
            }, delayValue);
        }

        cleanDelays():void {
            _.each(this._delays, (v,k)=>clearTimeout(v));
        }
    }
}
