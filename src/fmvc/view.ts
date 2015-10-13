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

    var nextFrameHandlers:Function[] = [];
    export function nextFrameHandler(handler:Function, context:IView, ...params:any[]) {
        var result = ()=>handler.apply(context, params);
        nextFrameHandlers.push(result);
        if(nextFrameHandlers.length === 1) window.requestAnimationFrame?window.requestAnimationFrame(executeNextFrameHandlers):setTimeout(executeNextFrameHandlers,0);
    }
    function executeNextFrameHandlers(time:number):void {
        var executedHandlers = nextFrameHandlers;
        nextFrameHandlers = [];
        _.each(executedHandlers,(v:Function, k:number)=>v());
    }


    export class View extends Notifier implements IView {
        private _mediator:Mediator;
        private _model:fmvc.Model;
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
            //console.log('Get state ', name, ' states ' , this._states, ' r ', (this._states[name] || null));
            return this._states[name];
        }

        public set model(value:Model) {
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
            return (this._mediator && this._mediator.facade)?this._mediator.facade.model:null;
        }


        public setModel(value:Model):IView {
            if(value != this._model) {
                this._model = value;
                this._model.bind(this, this.invalidateData);
                this.setData(value?value.data:null);
            }
            return this;
        }

        public get model():Model {
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
                nextFrameHandler(this.validate, this);
            }
        }

        public invalidateData():void {
            this.invalidate(InvalidateType.Data);
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
            element.appendChild(this.getElement());
            this.enter();
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
        setModel(value:Model):IView;
        data:any;
        model:Model;
        setMediator(value:Mediator):IView;
        mediator:Mediator;

        createDom():void;
        enter():void;
        exit():void;
        render(element:Element):IView;
        invalidate(value:number):void;
        validate():void;
        domHandler(e:any):void;

        getElement():HTMLElement;
        setElement(value:HTMLElement):void;

        getState(name:string):any;
        setState(name:string, value:any):void;
        setStates(value:any):IView; // Return generic type Template/View
    }

}
