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
        All: (1 | 2 | 4 | 8 | 16| 32 | 64 | 128)
    };

    export var frameExecution:number = 0;
    var nextFrameHandlers:Function[] = [];
    var maxFrameCount:number = 1000;
    var waiting:boolean = false;
    var frameStep:number = 1;

    function requestFrameHandler() {
        if(waiting) return;
        waiting = true;
        window.requestAnimationFrame?window.requestAnimationFrame(executeNextFrameHandlers):setTimeout(executeNextFrameHandlers,0);
    }

    export function nextFrameHandler(handler:Function, context:IView, ...params:any[]) {
        var result = ()=>handler.apply(context, params);
        nextFrameHandlers.push(result);
        requestFrameHandler();
    }


    function executeNextFrameHandlers(time:number):void {
        if(++frameExecution%frameStep===0) {
            var executedHandlers = nextFrameHandlers.splice(0, maxFrameCount);
            _.each(executedHandlers, (v:Function, k:number)=>v());
        }
        waiting = false;
        if(nextFrameHandlers.length) requestFrameHandler();
    }


    export class View extends Notifier implements IView {
        private _parent:IView;
        private _mediator:Mediator;
        private _model:Model<any>;
        private _data:any;

        private _states:{[name:string]:any} = {};

        private _invalidate:number = 0;
        private _isWaitingForValidate:boolean = false;
        private _inDocument:boolean = false;
        private _element:HTMLElement;

        constructor(name:string) {
            super(name, TYPE_VIEW);
            _.bindAll(this, 'validate');
        }

        get parent():IView {
            return this._parent;
        }

        set parent(value:IView) {
            this._parent = value;
        }

        // Properties: mediator, data, model
        public getElement():HTMLElement {
            return <HTMLElement> this._element;
        }

        public setElement(value:HTMLElement) {
            if(this._element) throw Error('Cant set element of the fmvc.View instance ' + this.name);
            this._element = value;
        }

        public setMediator(value:Mediator):IView {
            this._mediator = value;
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
            if(this._states[name] === value) return this;
            this._states[name] = value;
            this.invalidate(InvalidateType.State);
            return this;
        }

        public getState(name:string):any {
            return this._states[name];
        }

        public set model(value:Model<any>) {
            this.setModel(value);
        }

        public set data(value:any) {
            this.setData(value);
        }

        public setData(value:any):IView {
            if(this._data === value) return this;
            this._data = value;
            this.invalidate(InvalidateType.Data);
            return this;
        }

        public get data():any {
            return this._data;
        }

        public get app():any {
            return (this._mediator&&this._mediator.facade)?this._mediator.facade.model:(this.parent?this.parent.app:null);
        }

        public setModel(value:Model<any>):IView {
            if(value != this._model) {
                if(this._model) this._model.unbind(this);
                this._model = value;
                if(value) this._model.bind(this, this.invalidateData);
                this.setData(value?value.data:null);
            }
            return this;
        }

        public get model():Model<any> {
            return this._model;
        }

        public get inDocument():boolean {
            return this._inDocument;
        }

        // events

        public getEventNameByDomEvent(e:any):string {
            return '';
        }

        public domHandler(e:any):void {
            this.sendEvent(this.getEventNameByDomEvent(e), e);
        }

        // lifecycle
        public createDom():void {
            this.setElement(document.createElement('div'));
        }

        public enter():void {
            if(this._inDocument) throw new Error('Cant enter, it is in document');
            this._inDocument = true;
            //this.invalidate(InvalidateType.Data | InvalidateType.Children);
        }

        public beforeEnter() {
        }

        public afterEnter() {
        }

        public beforeCreate() {
        }

        public afterCreate() {
        }

        public beforeExit() {
        }

        public afterExit() {
        }



        public exit():void {
            this._states = {};
            this._inDocument = false;
        }

        public get isWaitingForValidate() {
            return this._isWaitingForValidate;
        }

        public invalidate(value:number):void {
            this._invalidate = this._invalidate | value;
            if(!this._isWaitingForValidate) {
                this._isWaitingForValidate = true;
                //console.log('Invalidate... ', this.name);
                nextFrameHandler(this.validate, this);
            }
        }

        public invalidateData(e?:IEvent):void {
            this.invalidate(InvalidateType.Data);
            if(e && e.name === Event.Model.Disposed) this.dispose();
        }

        public invalidateApp():void {
            this.invalidate(InvalidateType.App);
        }

        public validate():void {
            if(!this.inDocument) return;
            if(!this._invalidate) return;

                if (this._invalidate & InvalidateType.Data) this.validateData();
                if (this._invalidate & InvalidateType.State) this.validateState();
                if (this._invalidate & InvalidateType.Parent) this.validateParent();
                if (this._invalidate & InvalidateType.Children) this.validateChildren();
                if (this._invalidate & InvalidateType.App) this.validateApp();
            /*
            if(this._invalidate & InvalidateType.Template) this.validateTemplate();
            if(this._invalidate & InvalidateType.Theme) this.validateTheme();
            if(this._invalidate & InvalidateType.I18n) this.validateI18n();
            */
            this._invalidate = 0;
            this._isWaitingForValidate = false;
        }

        //protected validateRecreateTree():void {}
        protected validateData():void {}
        protected validateState():void {}
        protected validateParent():void {}
        protected validateChildren():void {}
        protected validateApp():void {}
        protected validateTemplate():void {}

        public render(element:Element):IView {
            if(this._inDocument) throw 'Cant render view, it is in document';
            this.createDom();
            this.enter();
            element.appendChild(this.getElement());
            this.afterEnter();
            return this;
        }

        public unrender() {
            if(this.getElement().parentNode) this.getElement().parentNode.removeChild(this.getElement());
        }

        // Overrides of Notifier
        public dispose() {
            this.exit();
            this.unrender();
            super.dispose();
        }

        public sendEvent(name:string, data:any = null, sub:string = null, error:any = null, global:boolean = false):void {
            var e:IEvent = {name: name, data: data, global: global, target: this};
            if (this.mediator) this.mediator.internalHandler(e);
        }

        public log(...messages:any[]):View {
            if (this.mediator && this.mediator.facade) this.mediator.facade.logger.add(this.name, messages);
            return this;
        }
    }


    export interface IView extends INotifier {
        setModel(value:Model<any>):IView;
        app:any;
        data:any;
        model:Model<any>;
        parent:IView;
        mediator:Mediator;
        inDocument:boolean;

        setMediator(value:Mediator):IView;
        createDom():void;
        enter():void;
        exit():void;
        render(element:Element):IView;
        invalidate(value:number):void;
        validate():void;
        domHandler(e:any):void;

        getElement():HTMLElement;
        setElement(value:HTMLElement):void;
        
        // overrides start
        beforeCreate():void;
        afterCreate():void;
        beforeEnter():void;
        afterEnter():void;
        beforeExit():void;
        afterExit():void;
        // overrides end

        getState(name:string):any;
        setState(name:string, value:any):void;
        setStates(value:any):IView; // Return generic type Template/View
    }

}
