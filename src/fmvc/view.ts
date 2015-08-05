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

    export class View extends Notifier implements IView {
        private _mediator:Mediator;
        private _model:fmvc.Model;
        private _data:any;

        private _states:{[name:string]:any};

        private _invalidate:number = 0;
        private _isWaitingForValidate:boolean = false;
        private _inDocument:boolean = false;
        private _element:Element;

        constructor(name:string) {
            super(name, TYPE_VIEW);
            _.bindAll(this, 'validate');
        }

        // Properties: mediator, data, model

        public getElement():Element {
            return this._element;
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

        public setData(value:any):IView {
            this._data = value;
            return this;
        }

        public get data():any {
            return this._data;
        }

        public setModel(value:Model):IView {
            this._model = value;
            this.setData(value?value.data:null);
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
            this._element = document.createElement('div');
        }

        public enter():void {
            if(this._inDocument) throw new Error('Cant enter, it is in document');
            this._inDocument = true;
            this.invalidate(InvalidateType.Data | InvalidateType.Children);
        }

        public exit():void {
            this._inDocument = false;
        }

        public get isWaitingForValidate() {
            return this._isWaitingForValidate;
        }

        public invalidate(value:number):void {
            this._invalidate = this._invalidate | value;

            if(!this._isWaitingForValidate) {
                this._isWaitingForValidate = true;
                setTimeout(this.validate, 0);
            }
        }

        public validate():void {
            if(this._invalidate & InvalidateType.Data) this.validateData();
            if(this._invalidate & InvalidateType.State) this.validateState();
            if(this._invalidate & InvalidateType.Parent) this.validateParent();
            if(this._invalidate & InvalidateType.Children) this.validateChildren();
            /*
            if(this._invalidate & InvalidateType.App) this.validateApp();
            if(this._invalidate & InvalidateType.Template) this.validateTemplate();
            if(this._invalidate & InvalidateType.Theme) this.validateTheme();
            if(this._invalidate & InvalidateType.I18n) this.validateI18n();
            */
            this._invalidate = 0;
            this._isWaitingForValidate = false;
        }

        public validateData():void {}
        public validateState():void {}
        public validateParent():void {}
        public validateChildren():void {}
        /*
        public validateApp():void {}
        public validateTemplate():void {}
        public validateTheme():void {}
        public validateI18n():void {}
        */

        public render(element:Element):IView {
            if(this._inDocument) throw new Error('Cant render view, it is in document');
            this.createDom();
            this.enter();
            return this;
        }

        // Overrides of Notifier
        public dispose() {
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



    export interface IView {
        setModel(value:Model):IView;
        model:Model;
        setMediator(value:Mediator):IView;
        mediator:Mediator;

        createDom():void;
        enter():void;
        exit():void;
        render(element:Element):IView;
        invalidate(value:number):void;
        domHandler(e:any):void;
    }


}
