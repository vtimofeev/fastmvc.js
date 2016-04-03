///<reference path='./d.ts'/>
module fmvc {
    export var InvalidateType = {
        Data: 1,
        App: 2,
        State: 4,
        Parent: 8,
        Children: 16,
        Template: 32,
        Theme: 64,
        I18n: 128,
        All: (1 | 2 | 4 | 8 | 16 | 32 | 64 | 128)
    };

    var ViewBindedMethods = {
        Validate: 'validate'
    };

    export var frameExecution:number = 0;
    var nextFrameHandlers:Function[] = [];
    var maxFrameCount:number = 5000;
    var waiting:boolean = false;
    var frameStep:number = 1;

    function requestFrameHandler() {
        if (waiting) return;
        waiting = true;
        window.requestAnimationFrame ? window.requestAnimationFrame(executeNextFrameHandlers) : setTimeout(executeNextFrameHandlers, 0);
    }

    export function nextFrameHandler(handler:Function, context:IView, ...params:any[]) {
        var result = ()=>handler.apply(context, params);
        nextFrameHandlers.push(result);
        requestFrameHandler();
    }

    function executeNextFrameHandlers(time:number):void {
        if (++frameExecution % frameStep === 0) {
            var executedHandlers = nextFrameHandlers.splice(0, maxFrameCount);
            _.each(executedHandlers, (v:Function, k:number)=>v());
        }
        waiting = false;
        if (nextFrameHandlers.length) requestFrameHandler();
    }


    export class View extends Notifier implements IView {
        protected _parent:IView;
        private _mediator:Mediator;

        private _model:Model<any>;
        private _data:any;

        private _states:{[name:string]:any} = {};

        private _invalidate:number = 0;
        private _isWaitingForValidate:boolean = false;
        private _inDocument:boolean = false;
        private _isDomCreated:boolean = false;

        protected _element:HTMLElement;
        private _binds:INotifier[];

        constructor(name:string) {
            super(name, TYPE_VIEW);
            _.bindAll(this, ViewBindedMethods.Validate);
        }

        get parent():IView {
            return this._parent;
        }

        set parent(value:IView) {
            this._parent = value;
        }

        public getElement():HTMLElement {
            return <HTMLElement> this._element;
        }

        public setElement(value:HTMLElement) {
            if (this._element) throw Error('Cant set element of the fmvc.View instance ' + this.name);
            this._element = value;
        }

        public setMediator(value:Mediator):IView {
            this._mediator = value;

            if(value) this.facade = value.facade;
            else this.facade = null;

            return this;
        }

        public set mediator(value:Mediator) {
            this.setMediator(value);
        }

        public get mediator():Mediator {
            return this._mediator;
        }

        public setStates(value:any):IView {
            _.each(value, this.setStateReverse, this);
            return this;
        }

        private setStateReverse(value:any, name:string):IView {
            this.setState(name, value);
            return this;
        }

        public setState(name:string, value:any):IView {
            if (this.disposed) return;

            var stateValue = this.getStateValue(name, value);
            if (this._states[name] === stateValue) return this;
            this._states[name] = stateValue;
            this.applyStateBinds(name, stateValue);
            this.invalidate(InvalidateType.State);
            return this;
        }

        protected applyStateBinds(name:string, value:any):void {

        }

        protected getStateValue(name:string, value:any):any {
            return value;
        }

        public getState(name:string):any {
            return this._states[name];
        }

        public get model():Model<any> {
            return this._model;
        }

        public set model(value:Model<any>) {
            this.setModel(value);
        }

        public set data(value:any) {
            this.setData(value);
        }

        public setData(value:any):IView {
            if (this.disposed) return this;
            if (this._data === value) return this;
            this._data = value;
            this.invalidate(InvalidateType.Data);
            return this;
        }

        public get data():any {
            return this._data;
        }

        public setModel(value:Model<any>):IView {
            if (this.disposed) return this;
            if (value != this._model) {
                if (this._model) this._model.unbind(this);
                if (value && value instanceof Model) value.bind(this, this.modelChangeHandler);
                this.setData(value ? value.data : null);
                this._model = value;
            }
            return this;
        }

        public get app():any {
            return (this._mediator && this._mediator.facade) ? this._mediator.facade.model : (this.parent ? this.parent.app : null);
        }

        public get inDocument():boolean {
            return this._inDocument;
        }

        public get isDomCreated():boolean {
            return this._isDomCreated;
        }

        public createDom():void {
            if (this._isDomCreated) return;
            this.beforeCreate();
            this.createDomImpl();
            this._isDomCreated = true;
            this.afterCreate();
        }

        protected createDomImpl() {
            this.setElement(document.createElement('div'));
        }

        public enter():void {
            if (this._inDocument) {
                throw new Error('Cant enter, it is in document');
            }
            this.enterImpl();
            this._inDocument = true;
            this.afterEnter();
        }

        protected enterImpl():void {
            if (this._model) this._model.bind(this, this.modelChangeHandler);
            if (this._binds) this._binds.forEach((v)=>v.bind(this, this.invalidateApp));
        }

        public exit():void {
            this.beforeExit();
            this.exitImpl();
            this._inDocument = false;
            this.afterExit();
        }

        protected modelChangeHandler(e:IEvent) {
            this.setData(this.model.data);
            this.invalidateData(); //@todo check
            if (e && e.name === Event.Model.Disposed) this.dispose(); //@todo analyze
        }

        protected exitImpl():void {
            if (this._model) this._model.unbind(this);
            if (this._binds) this._binds.forEach((v)=>v.unbind(this));
        }

        public beforeCreate():void {
        }

        public afterCreate():void {
        }

        public beforeEnter():void {
        }

        public afterEnter():void {
        }

        public beforeExit():void {
        }

        public afterExit():void {
        }

        public afterRender():void {
        }

        public beforeUnrender():void {
        }


        public invalidate(value:number):void {
            this._invalidate = this._invalidate | value;
            if (!this._isWaitingForValidate) {
                this._isWaitingForValidate = true;
                nextFrameHandler(this.validate, this);
            }
        }

        public get isWaitingForValidate() {
            return this._isWaitingForValidate;
        }

        public invalidateData():void {
            this.invalidate(InvalidateType.Data);
        }

        public invalidateApp():void {
            this.invalidate(InvalidateType.App);
        }

        public invalidateAll():void {
            this.invalidate(InvalidateType.App | InvalidateType.Data | InvalidateType.State);
        }

        public validate():void {
            if (!this._inDocument || !this._invalidate) return;

            if (this._invalidate & InvalidateType.State) this.validateState();
            if (this._invalidate & InvalidateType.Data) this.validateData();
            if (this._invalidate & InvalidateType.App) this.validateApp();

            //if (this._invalidate & InvalidateType.Parent) this.validateParent();
            //if (this._invalidate & InvalidateType.Children) this.validateChildren();
            /*
             if(this._invalidate & InvalidateType.Template) this.validateTemplate();
             if(this._invalidate & InvalidateType.Theme) this.validateTheme();
             if(this._invalidate & InvalidateType.I18n) this.validateI18n();
             */
            this._invalidate = 0;
            this._isWaitingForValidate = false;
        }

        protected validateData():void {
        }

        protected validateState():void {
        }

        protected validateApp():void {
        }

        public render(parent:Element, replaced?:Element):IView {
            var requiredValidate:boolean = this.isDomCreated;
            this.createDom();
            this.enter();
            if(requiredValidate) this.invalidateAll();

            if (replaced) {
                parent.replaceChild(this.getElement(), replaced);
            }
            else {
                parent.appendChild(this.getElement());
            }

            this.afterRender();
            return this;
        }

        public unrender(replace?:Element):IView {
            this.exit();
            this.beforeUnrender();
            var parentElement = this.getElement().parentNode;
            if (!parentElement) return this;

            if (replace) {
                parentElement.replaceChild(replace, this.getElement());
            } else {
                parentElement.removeChild(this.getElement());
            }
            return this;

        }

        public dispose() {
            this.exit();
            this.unrender();
            super.dispose();

            // Clean refs
            this._states = null;
            this._parent = null;
            this._mediator = null;
            this._model = null;
            this._data = null;
            this._binds = null;
        }

        public sendEvent(name:string, data:any = null, sub:string = null, error:any = null, global:boolean = false):void {
            var e:IEvent = {name: name, data: data, global: global, target: this};
            if (this.mediator) this.mediator.internalHandler(e);
        }

        public log(...messages:any[]):View {
            if (this.mediator && this.mediator.facade) this.mediator.facade.logger.add(this.name, messages);
            return this;
        }

        protected unregisterBind(value:INotifier):void {
            var i:number = this._binds.indexOf(value);
            if (i > -1) this._binds.splice(i, 1);
            value.unbind(this);
        }

        protected registerBind(value:INotifier):void {
            if (!this._binds) this._binds = [];
            if (this._binds.indexOf(value) > -1) return;
            this._binds.push(value);
            if (this.inDocument) value.bind(this, this.invalidateApp);
        }
    }


    export interface IView extends INotifier {
        app:any;
        data:any;
        model:Model<any>;
        parent:IView;
        mediator:Mediator;
        inDocument:boolean;

        setMediator(value:Mediator):IView;
        setModel(value:Model<any>):IView;
        setData(value:any):IView;

        createDom():void;
        enter():void;
        exit():void;
        render(element:Element, replace?:Element):IView;
        unrender(replace?:Element):IView;

        getState(name:string):any;
        setState(name:string, value:any):void;
        setStates(value:any):IView; // Return generic type Template/View

        invalidate(value:number):void;
        invalidateData():void;
        invalidateApp():void;
        invalidateAll():void;

        validate():void;

        getElement():HTMLElement;
        setElement(value:HTMLElement):void;

        // overrides
        beforeCreate():void;
        afterCreate():void;
        beforeEnter():void;
        afterEnter():void;
        beforeExit():void;
        afterExit():void;
        afterRender():void;
        beforeUnrender():void;
    }
}
