///<reference path="./d.ts" />

module ft {
    export var templateHelper:TemplateViewHelper = new TemplateViewHelper();
    export var expression = new ft.Expression();
    export var dispatcher = new ft.EventDispatcher(templateHelper);

    var localeFormatterCache = {};
    var templateFormatterChache = {};

    var timers = {createDom: 0, enter: 0, setData: 0, validate: 0};

    export var LifeState = {
        Init: 'init',
        Create: 'create',
        Active: 'active',
        Enter: 'enter',
        Exit: 'exit',
        Dispose: 'dispose'
    };

    export var State = {
        Selected: 'selected',
        Focused: 'focused',
        Hover: 'hover',
        HoverIndex: 'hoverIndex',
        Disabled: 'disabled',
        Value: 'value',
        Custom: 'custom',
        Type: 'type',
        Base: 'base',
        Life: 'life',
        CreateTime: 'createTime'
    };

    var TmplDict = {
        childrenDot: 'children.',
        stateDot: 'state.',
        on: 'on',
        createDelay: 'createDelay',
        class: 'class',
        ln: 'ln',
        mlink: 'mlink',
        if: 'if',
        outDot: 'out.'
    };

    export var FunctorType = {
        Create: 'create',
        Enter: 'enter',
        Exit: 'exit'
    };

    export var DynamicTreeGroup = {
        App: 'app',
        Data: 'data',
        State: 'state'
    };

    export var counters = {
        expression: 0,
        expressionEx: 0,
        expressionCtx: 0,
        multiExpression: 0,
        createDom: 0,
        enter: 0,
        setData: 0,
        validate: 0,
        validateState: 0,
        validateData: 0,
        validateApp: 0
    };

    setInterval(()=>console.log('Statistic timers', JSON.stringify(timers), ' counters ', JSON.stringify(counters), ' frames ', fmvc.frameExecution), 5000);

    function getFormatter(value:string, locale:string = 'en') {
        return templateFormatterChache[value] || compileFormatter(value, locale);
    }

    function compileFormatter(value:string, locale:string):Function {
        var mf = localeFormatterCache[locale] || (localeFormatterCache[locale] = new MessageFormat(this.locale));
        return (templateFormatterChache[value] = mf.compile(value));
    }

    function getTime():number {
        return +new Date();
    }

    export class TemplateView extends fmvc.View  {
        private _template:ITemplate;
        private _i18n:any;

        private _domDef:IDomDef; // Definition view related parent
        private _constructorParams:any; // Params added at template constructor
        protected _resultParams:any; // Merged params from constructor and dom definition
        private _stateBinds:any; // External binds

        // Maps of created element
        private _treeElementMapByPath:{[path:string]:TreeElement};

        // Maps of current class values, by path and css name
        private _cssClassMap:{[pathAndCssClassName:string]:string} = {}; // map of component classes

        // Properties map
        private _prevDynamicProperiesMap = {};
        private _dynamicPropertiesMap = {};
        private _bindedModels:fmvc.Model<any>[];

        // Local handler
        private _localHandlers:any;

        // Set special type of node, when component is created by TemplateViewChildren
        private _isChildren:boolean = false;

        // Local children stored by path of the container (view or dom element)
        private _dataChildren:{[path:string]:TemplateChildrenView};

        // Delays
        private _delays:any;

        constructor(name:string, params?:TemplateViewParams, template?:ITemplate) {
            super(name);
            this._template = template;
            this._constructorParams = params;
            this.getFilter.bind(this);
            this.life = LifeState.Init;
        }


        ////////////////////////////////////////////////////////////////
        // Internal
        ////////////////////////////////////////////////////////////////

        get globalPointer():PointerModel {
            return dispatcher.getPointer();
        }


        get globalKeyboard():KeyboardModel {
            return dispatcher.getKeyboard();
        }

        get domDef():IDomDef {
            return this._domDef;
        }

        set domDef(value:IDomDef) {
            this._domDef = value;
        }

        get localDomDef():IDomDef {
            return this.getTemplate()?this.getTemplate().domTree:null;
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

        protected getApplyValueFunctionOf(value:string) {
            var isModel = value.indexOf('.data') > -1,
                dataStartIndex = value.lastIndexOf('data.'),
                field = value.substring(dataStartIndex + 5),
                modelPath = value.substring(0, dataStartIndex - 1);

            if(isModel) {
                return new Function('v', ' (this.' + modelPath + ').changes = { ' + field + ': v}; ');
            }
            else {
                return new Function('v', ' this.' + value + '= v; this.invalidateData(); ');
            }
        }

        // Для связывания внутреннего состояния с внешними данными, используется внешний биндинг состояния
        protected applyStateBinds(name:string, value:any):void {
            //console.log('Apply state binds ', name, value, this._stateBinds , (this._stateBinds && this._stateBinds[name]) );
            if (!(this._stateBinds && this._stateBinds[name])) return;

                var bind = this._stateBinds[name],
                resultValue = bind.filters && bind.filters.length ? bind.filters.reduce( (m,v)=>(this.getFilter(v)(m)), value ) : value;


            bind.applyValue = bind.applyValue || this.getApplyValueFunctionOf(bind.model);
            //console.log('Prepare execution apply state value function ', bind.applyValue, this);
            bind.applyValue.call(this, resultValue);
        }

        // Проверяем типы данных приходящие в значении, если есть функция
        protected getStateValue(name:string, value:any):any {
            if (ft.TemplateApplyValueFunc[name]) {
                return ft.TemplateApplyValueFunc[name](value);
            } else {
                return value;
            }
        }

        // Состояние отвечающее за базовый класс
        get base():string {
            return this.getState(State.Base);
        }

        set base(value:string) {
            this.setState(State.Base, value);
        }

        // Состояние отвечающее за тип ( обычно ui компонента, например кнопка )
        get type():any {
            return this.getState(State.Type);
        }

        set type(value:any) {
            this.setState(State.Type, value);
        }

        // Состояние отвечающее за значение
        get value():any {
            return this.getState(State.Value);
        }

        set value(value:any) {
            this.setState(State.Value, value);
        }

        // Состояние кастомное
        get custom():any {
            return this.getState(State.Custom);
        }

        set custom(value:any) {
            this.setState(State.Custom, value);
        }

        // Состояние отвечающее за базовый класс
        get hover():string {
            return this.getState(State.Hover);
        }

        set hover(value:string) {
            this.setState(State.Hover, value);
        }

        // Состояние отвечающее за тип выбранный (лучше использовать от данных)
        get selected():boolean {
            return this.getState(State.Selected);
        }

        set selected(value:boolean) {
            this.setState(State.Selected, value);
        }

        // Состояние отвечает за наличие пользовательского фокуса
        get focused():boolean {
            return this.getState(State.Focused);
        }

        set focused(value:boolean) {
            this.setState(State.Focused, value);
        }

        // Состояние забокированный
        get disabled():boolean {
            return this.getState(State.Disabled);
        }

        set disabled(value:boolean) {
            this.setState(State.Disabled, value);
        }

        // Состояние жизненного цикла компонента
        get life():any {
            return this.getState(State.Life);
        }

        set life(value:any) {
            this.setState(State.Life, value);
        }

        // Состояние жизненного цикла компонента
        get createTime():number {
            return this.getState(State.CreateTime);
        }

        set createTime(value:number) {
            this.setState(State.CreateTime, value);
        }

        ////////////////////////////////////////////////////////////////
        // Parameters
        ////////////////////////////////////////////////////////////////

        setParameters(value:any):void {
            this._resultParams = _.defaults(this._resultParams || {}, value);
        }

        getParameters():any {
            return this._resultParams;
        }

        applyParameters():void {
            _.each(this._resultParams, this.applyParameter, this);
        }

        applyParameter(value:any, key:string):void {
            switch (key) {
                case TmplDict.if: // internal "include" parameters, used at createTree and validateTree
                case TmplDict.createDelay: // delay create dom
                case TmplDict.class: // child class
                case TmplDict.ln: // link
                    break;

                case TemplateParams.stateHandlers:
                    this.stateHandlers(_.isString(value) ? (value.split(',')) : value); //@todo move to parser+
                    break;
                default:
                    if (key.indexOf(TmplDict.childrenDot) === 0) { // children parameter, skip
                        return;
                    }
                    else if (key.indexOf(TmplDict.outDot) === 0) {
                        var binds = this._stateBinds || {},
                            state = key.substr(4),
                            valuePaths = value.split('|');

                        binds[state] = { model: valuePaths.shift(), filters: valuePaths };
                        this._stateBinds = binds;
                    }
                    else if (key.indexOf(TmplDict.stateDot) === 0) {
                        var state = key.substr(6);
                        this.bindParamStateExpression(value, state);
                        this.setState(state, this.getParameterValue(value, state));
                    }
                    else if (key.indexOf(TmplDict.on) === 0) { // handlers, set handler
                        var t = this;
                        //console.log('OnDot, ' , key, value);
                        this.on(key.substring(2), (_.isString(value) ? (e)=> {
                            t.internalHandler({type: value, data: e});
                        } : value));
                    }
                    else if (key in this) {
                        // direct set states, values
                        if (_.isFunction(this[key])) {
                            this[key](value);
                        }
                        else {
                            this.bindParamStateExpression(value, key);
                            this[key] = this.getParameterValue(value, key); //@todo check value type of states (boolean,number,..etc)
                        }
                    }
                    else {
                        console.warn(this.name + '.applyParameter: Cant set template view parameter, not found ', key);
                    }
                    break;
            }
        }

        bindParamStateExpression(value:IExpressionName|any, key:string ):any {
            if( value instanceof ExpressionName ) {
                var name = value.name,
                    context = value.context,
                    ex:IExpression = context.getExpressionByName(name),
                    model:fmvc.Model<any>;

                if(context !== this && ex.vars && ex.vars[0].indexOf('model') > -1) {

                    model = this.getModelByPath(ex.vars[0], context);

                    if(!model) return console.warn('Model ', ex.vars[0] , ' not found ');
                    model.bind(this, ()=>this.setState(key, this.getParameterValue(value, key), true) );

                    //console.log('add-state binding of ', this.name, ' of ', key, ex);
                    this._bindedModels = this._bindedModels || [];
                    this._bindedModels.push(model);
                }


            }
        }

        getParameterValue( value:IExpressionName|any):any {
            var r = value instanceof ExpressionName ? this.getExpressionValue(value) : value;
            return r;
        }

        ////////////////////////////////////////////////////////////////
        // Mappings
        ////////////////////////////////////////////////////////////////

        getTreeElementByPath(value:string):TreeElement {
            return <TreeElement> this._treeElementMapByPath ? this._treeElementMapByPath[value] : null;
        }

        setTreeElementPath(path:string, value:TreeElement) {
            if (!this._treeElementMapByPath) this._treeElementMapByPath = {};
            this._treeElementMapByPath[path] = value;
        }

        getPathClassValue(path:string, name:string):string {
            return this._cssClassMap[path + '-' + name] || null;
        }

        setPathClassValue(path:string, name:string, value:string):void {
            this._cssClassMap[path + '-' + name] = value;
        }

        getChildrenViewByPath(path:string):TemplateChildrenView {
            return this._dataChildren ? this._dataChildren[path] : null;
        }

        getDefaultChildrenView():TemplateChildrenView {
            return this._dataChildren ? _.values(this._dataChildren)[0] : null;
        }

        setChildrenViewPath(path, childrenView:TemplateChildrenView) {
            if (!this._dataChildren) this._dataChildren = {};
            this._dataChildren[path] = childrenView;
        }

        getDomDefinitionByPath(path:string):IDomDef {
            return this._template.pathMap[path];
        }

        getTemplate():ITemplate {
            return this._template;
        }


        ////////////////////////////////////////////////////////////////
        // Dynamic properties
        ////////////////////////////////////////////////////////////////

        getDynamicProperty(name:string):void {
            //console.log('Get dp ', name, this._dynamicPropertiesMap[name])
            return this._dynamicPropertiesMap[name];
        }

        isChangedDynamicProperty(name:string):boolean {

            var prevValue = this._prevDynamicProperiesMap[name],
                value = expression.getContextValue(name, this);

            //console.log('IsChanged ... ', name, value, prevValue);
            var r = !(prevValue === value);
            return r;
        }

        ////////////////////////////////////////////////////////////////
        // App models listeners
        ////////////////////////////////////////////////////////////////



        bindAppModelsFromExpressions():void {
            var name:string;

            for (name in this._template.expressionMap) {
                var ex:IExpression = this._template.expressionMap[name];
                if (ex.vars) ex.vars.forEach((v)=>( (v.indexOf('app.') === 0 || v.indexOf('facade.') === 0)? this.bindAppModelByVar(v) : null), this);
            }
        }

        getModelPath(value) {
            var modelPath = value.replace('facade.', 'app.').split('.');

            if(modelPath[modelPath.length-2] === 'data') modelPath.splice(modelPath.length-2,2);
            else if(modelPath[modelPath.length-1] === 'data') modelPath.splice(modelPath.length-1,1);
            else if(modelPath[modelPath.length-1] === 'count') modelPath.splice(modelPath.length-1,1);
            else if(modelPath[modelPath.length-1] === 'state') modelPath.splice(modelPath.length-1,1);
            else ;

            return modelPath.join('.')
        }

        getModelByPath(value, context?:any):fmvc.Model<any> {
            var getModelFncSrc = 'return this.' + this.getModelPath(value) + ';',
                model = (new Function(getModelFncSrc)).apply(context || this);

            return model;
        }

        bindAppModelByVar(value:string) {
            var model = this.getModelByPath(value);

            if(model instanceof fmvc.Model) {
                model.bind(this, this.invalidateApp);
                this._bindedModels = this._bindedModels || [];
                if(this._bindedModels.indexOf(model) === -1) this._bindedModels.push(model);
            }
        }

        unbindAppModelsFromExpressions() {
            this._bindedModels && this._bindedModels.forEach((v:fmvc.Model<any>)=>v.unbind(this), this);
        }

        ////////////////////////////////////////////////////////////////
        // Lifecycle: Create
        ////////////////////////////////////////////////////////////////

        beforeCreate() {
            this.life = LifeState.Create;
            this.setState(State.CreateTime, (new Date()).getTime());
            this.createParameters();
            this.applyParameters();
        }

        protected createDomImpl():void {
            if (this._element) return;
            var e = <TreeElement> templateHelper.createTree(this._template.domTree, this);
            var element:HTMLElement = e instanceof TemplateView ? (<TemplateView>e).getElement() : <HTMLElement>e;
            this.setElement(element);
            this.setTreeElementPath('0', this);
            counters.createDom++;
        }

        protected createParameters():void {
            var localParams = this.localDomDef ? this.localDomDef.params : null;
            if (this.isChildren) {
                this.setParameters(_.extend({}, localParams, this._constructorParams));
            } else {
                var parentParams = templateHelper.applyFirstContextToExpressionParameters(this.domDef ? this.domDef.params : null, this.parent);
                this.setParameters(_.extend({}, localParams, parentParams, this._constructorParams));
            }
        }

        ////////////////////////////////////////////////////////////////
        // Lifecycle: Enter
        ////////////////////////////////////////////////////////////////
        protected enterImpl():void {
            //console.log('Enter implementation for ', this.name);
            super.enterImpl();
            this.setState(State.CreateTime, (new Date()).getTime());
            this.life = LifeState.Enter;
            counters.enter++;
            templateHelper.enterTree(this._template.domTree, this);
            this.bindAppModelsFromExpressions();
            setTimeout(()=>this.life = LifeState.Active, 0);
        }

        ////////////////////////////////////////////////////////////////
        // Lifecycle: Exit
        ////////////////////////////////////////////////////////////////

        protected exitImpl():void {
            this.unbindAppModelsFromExpressions();
            templateHelper.exitTree(this._template.domTree, this);
            super.exitImpl();
            this.cleanDelays();
        }

        ////////////////////////////////////////////////////////////////
        // Lifecycle: Dispose
        ////////////////////////////////////////////////////////////////
        dispose() {
            super.dispose();

            this._domDef = null;
            this._cssClassMap = null;
            this._dynamicPropertiesMap = null;
            this._prevDynamicProperiesMap = null;
            this._localHandlers = null;
            this._treeElementMapByPath = null;

            _.each(this._resultParams, (v, k)=> {
                v.context = null;
                delete this._resultParams[k]
            });
            _.each(this._dataChildren, (v, k)=>delete this._dataChildren[k]);
            _.each(this._treeElementMapByPath, (v, k)=>delete this._treeElementMapByPath[k]);

            this._resultParams = null;
            this._template = null;
            this._i18n = null;
        }

        ////////////////////////////////////////////////////////////////
        // Validators override
        ////////////////////////////////////////////////////////////////

        protected canValidate(type?:number):boolean {
            var result:boolean = this.inDocument;
            return result;
        }

        public validate():void {
            if (!this.inDocument) return;

            var start = getTime();

            if (!_.isEmpty(this._dynamicPropertiesMap)) _.extend(this._prevDynamicProperiesMap, this._dynamicPropertiesMap);
            this._dynamicPropertiesMap = {};
            if (this._template && this._template.hasStates) templateHelper.validateTree(this._template.domTree, this);// templateHelper.createTreeObject(this._template.domTree, this);
            super.validate();

            var result = getTime() - start;
            counters.validate++;
            timers.validate += result;
        }

        protected validateApp():void {
            if (this.canValidate(fmvc.InvalidateType.App)) {
                counters.validateApp++;
                templateHelper.updateDynamicTree(this, DynamicTreeGroup.App);
            }
        }

        protected validateData():void {
            if (this.canValidate(fmvc.InvalidateType.Data)) {
                counters.validateData++;
                templateHelper.updateDynamicTree(this, DynamicTreeGroup.Data);
                templateHelper.updateDynamicTree(this, 'model');
            }
        }

        protected validateState():void {
            if (this.canValidate(fmvc.InvalidateType.State)) {
                counters.validateState++;
                templateHelper.updateDynamicTree(this, DynamicTreeGroup.State);
            }
        }

        ////////////////////////////////////////////////////////////////
        // Event maps (auto)
        ////////////////////////////////////////////////////////////////

        protected stateHandlers(value:string[]) {
            if (typeof value === 'string') value = value.split(',');

            var stateHandlers = {
                hover: {
                    pointerover: this.mouseoverHandler,
                    pointerout: this.mouseoutHandler
                },
                selected: {
                    action: this.clickHandler
                },
                focused: {
                    focus: this.focusHandler,
                    blur: this.blurHandler
                }
            };
            _.each(value, (state:string)=>_.each(stateHandlers[state], (handler, event:string)=>this.on(event, handler), this), this);
        }

        private focusHandler(e:ITreeEvent):void {
            if (!!this.getState(State.Disabled)) return;
            this.setState(State.Focused, true);
        }

        private blurHandler(e:ITreeEvent):void {
            if (!!this.getState(State.Disabled)) return;
            this.setState(State.Focused, false);
        }

        private mouseoverHandler(e:ITreeEvent):void {
            if (!!this.getState(State.Disabled)) return;
            this.setState(State.Hover, true);
        }

        private mouseoutHandler(e:ITreeEvent):void {
            if (!!this.getState(State.Disabled)) return;
            this.setState(State.Hover, false);
        }

        private clickHandler(e:ITreeEvent):void {
            if (!!this.getState(State.Disabled)) return;
            this.setState(State.Selected, !this.getState(State.Selected));
        }

        ////////////////////////////////////////////////////////////////
        // Events
        ////////////////////////////////////////////////////////////////

        public handleTreeEvent(e:ITreeEvent):void {
            //console.log('Handle tree event ... ', e);

            e.currentTarget = this;// previous dispatch
            e.depth--;

            this.trigger(e);// dispatch to this component(dynamic handlers);
            if (e.prevented && e.e) e.e.preventDefault();

            e.previousTarget = this;
        }

        protected trigger(e:ITreeEvent, path = '0'):void {
            //console.log('Trigger: ', e.type, this._localHandlers);
            var h = this._localHandlers ? this._localHandlers[path] : null;
            if (h && h[e.type]) {
                var handlers = h[e.type];
                _.each(handlers, (v)=> {
                    v.call(this, e);
                    e.executionHandlersCount++;
                }, this);
            }
        }

        public on(event:string, handler, path:string = '0') {
            if (!this._localHandlers) this._localHandlers = {};
            if (path && !this._localHandlers[path]) this._localHandlers[path] = {};
            var handlers = this._localHandlers[path][event] ? this._localHandlers[path][event] : [];
            handlers.push(handler);
            this._localHandlers[path][event] = handlers;
        }

        public off(event, path = '0') {
            if (!path) path = '0';
            delete this._localHandlers[path][event];
        }

        /*
        // custom event this.send(name, data), send stateChange event
        public dispatchTreeEvent(e:ITreeEvent):void {
            e.target = this;
            e.def = e.def || this.localDomDef;
            templateHelper.dispatchTreeEventDown(e);
        }
        */


        /*
        public getCustomTreeEvent(name:string, data:any = null, depth:number = 1):ITreeEvent {
            return dispatcher.getCustomTreeEvent(name, data, this, depth);
        }

        */

        protected internalHandlerImpl(e:fmvc.IEvent):void {
        }

        protected internalHandler(e:fmvc.IEvent|string):void {
            var event:fmvc.IEvent = <fmvc.IEvent> (typeof e === 'string'? {type: e} : e);
            !event.target && (event.target = this);

            this.internalHandlerImpl(event);

            if (this.mediator && this.mediator !== (this.parent && !!this.parent.mediator && this.parent.mediator) ) {
                this.mediator.internalHandler(event);
            }

            if (this.parent && this.parent.internalHandler) {
                this.parent.internalHandler(event);
            }
        }

        ////////////////////////////////////////////////////////////////
        // Expressions
        ////////////////////////////////////////////////////////////////


        public getExpressionByName(name:string):IExpression {
            var value = this._template.expressionMap ? this._template.expressionMap[name] : null;
            value = value || (this.parent ? this.parent.getExpressionByName(name) : null);
            return value;
        }

        public getExpressionValue(ex:IExpressionName):any {
            var exName = ex.name,
                context = ex.context || this,
                exObject,
                result;

            if (this._dynamicPropertiesMap[exName]) return this._dynamicPropertiesMap[exName];

            exObject = context.getExpressionByName(exName);
            result = expression.execute(exObject, context);
            //if( ex.context ) console.log('Get expression value: ', context.name, this.name, exObject.vars, ex);
            return result;
        }



        public getFilter(filter:string) {
            // filter can contain points 'i18n.common.text';
            var fnc = new Function('return this.' + filter + ';');
            return fnc.call(this) || (this.parent && this.parent.getFilter ? (<TemplateView>this.parent).getFilter(filter) : null);
        }


        public getCssClassExpressionValue(ex:IExpressionName):any {
            var exObj:IExpression = this.getExpressionByName(ex.name);
            var result = expression.execute(exObj, ex.context || this, true);
            return result;
        }

        ////////////////////////////////////////////////////////////////
        // Utils (message formatter)
        ////////////////////////////////////////////////////////////////

        getFormattedMessage(name:string, args:any):string {
            var formattedTemplate:string =
                (this._template && this._template.i18n && this._template.i18n[name]) ? this._template.i18n[name] : null
                || (this._i18n && this._i18n[name]) ? this._i18n[name] : null;

            if (!formattedTemplate) return 'Error: TemplateView.getFormattedMessage, formattedTemplate not found';
            var formatter = getFormatter(formattedTemplate);
            return formatter(args);
        }

        evalHandler(value:string, e:any):any { //@todo override to Function
            var r = null;
            try {
                r = eval(value);
            }
            catch (e) {
                r = '{' + value + '}';
            }
            return r;
        }

        ////////////////////////////////////////////////////////////////
        // Delay of creation tree elements
        ////////////////////////////////////////////////////////////////

        isDelay(data:IDomDef, functor:string):boolean {
            var result:boolean = false;
            if (functor === FunctorType.Create) {
                var delayValue:number = Number(data.params[functor + 'Delay']); //@todo apply types move to parser
                result = ((new Date()).getTime() - this.createTime) < delayValue;
            }
            return result;
        }

        setDelay(data:IDomDef, functor:string):void {
            var delayName:string = data.path + ':' + functor;
            if (!this._delays) this._delays = {};
            if (this._delays[delayName]) return; // next enter -> return

            var delayValue:number = Number(data.params[functor + 'Delay']) - ((new Date()).getTime() - this.createTime);
            var t = this;
            this._delays[delayName] = setTimeout(function delayedFunctor() { //@todo: step 2, switch anonymous to class methods
                if (!t.inDocument) return;
                switch (functor) {
                    case FunctorType.Create:
                        templateHelper.createTree(t.getDomDefinitionByPath(data.parentPath) || t.domDef, t);
                        templateHelper.enterTree(t.getDomDefinitionByPath(data.parentPath) || t.domDef, t);
                        return;
                }
            }, delayValue);
        }

        cleanDelays():void {
            _.each(this._delays, (v, k)=>clearTimeout(v));
        }
    }
}

