///<reference path='notifier.ts'/>
///<reference path='facade.ts'/>
///<reference path='mediator.ts'/>
///<reference path='model.ts'/>
///<reference path='view.ts'/>

declare var $:any;
declare var _:any;
declare var bt:any;

module fmvc {

    export class BasisView extends fmvc.Notifier implements IView {
        private _mediator:any;
        private _base:HTMLElement;
        private _model:any;

        private currentViewData:any;
        private template:any;
        public  basisInstance:any;
        private htmlElementsLinks:any;

        constructor(name:string, base:HTMLElement, template:any, model:fmvc.Model, bindModel:boolean = true) {

            super(name, fmvc.TYPE_VIEW);
            _.bindAll(this, 'eventHandler', 'modelChangeHandler');

            this._base = base ? base : $('#base-' + name).get(0);
            this.template = template ? template : bt('id:template-' + this.name);
            this.setModel(model, bindModel);
        }

        public setModel(value:fmvc.Model, bind:boolean = false) {
            if (this._model) this._model.bind(false, this);
            this._model = value;
            this._model.bind(bind, this, this.modelChangeHandler);
        }

        public getModel():fmvc.Model {
            return this._model;
        }

        public setMediator(value:fmvc.Mediator) {
            this._mediator = value;
        }

        public getMediator():fmvc.Mediator {
            return this._mediator;
        }

        public setBase(value:HTMLElement) {
            this.rebaseInstance(value);
            this._base = value;
        }

        public getBase():HTMLElement {
            return this._base;
        }

        private rebaseInstance(newBase:any) {
            if (this.basisInstance) {
                var element:HTMLElement = this.basisInstance.element;
                if (this._base) this._base.removeChild(element);
                newBase.appendChild(element);
            }
        }

        public init():void {
            this.createTemplateInstance();
            this.createInstanceLinks();
        }

        private createTemplateInstance():void {
            if (!this.template) return this.log('Error, cant get template to create instance');

            this.log('Create template ' + this.template + ', base is ' + this._base);
            this.basisInstance = this.template.createInstance(null, this.eventHandler);

            if (this._base) this._base.appendChild(this.basisInstance.element);
            else this.log('Has no base element');
        }

        private createInstanceLinks():void {
            if (!this.basisInstance) return this.log('Error, cant create instance links with undefined basis instance');
            if (!this.htmlElementsLinks) return;
            for (var i in this.htmlElementsLinks) {
                var elementName = this.htmlElementsLinks[i];
                this[elementName] = this.basisInstance[elementName];
            }
        }

        // Overrided method
        // Render
        public render():void {
            if (!this.basisInstance) return this.log('Error, cant render with undefined instance');
            if (!this.currentViewData) this.currentViewData = {};

            var objectData:any = this._model.getData();
            for (var i in objectData) {
                var objectValue = objectData[i];
                if (this.currentViewData[i] != objectValue) {
                    this.basisInstance.set(i, objectValue);
                    this.currentViewData[i] = objectValue;
                }
            }
            this.log('Rendered');
        }

        // Event manipulations
        // Handler
        public eventHandler(name:string, e:any):void {
            this.log('event ' + name);
            this.sendEvent(name, e);
        }

        // Model Handler
        public modelChangeHandler(name:string, e:any):void {
            this.log('event ' + name);
            this.sendEvent(name, e);
        }

        // Send event overrided
        public sendEvent(name:string, data:any = null, sub:string = null, error:any = null, global:boolean = false):void {
            if (this._mediator) this._mediator.internalHandler({name: name, data: data, global: global, target: this});
        }

        // Log overrided
        public log(message:string, level?:number):void {
            if(this._mediator) this._mediator.facade().saveLog(this.name(), message, level);
        }

        // Destroy overrided
        public destroy():any {
            this.currentViewData = null;
            if (this._model) this._model.bind(false, this);
            if (this.basisInstance) {
                this.basisInstance.destroy();
                if (this._base) this._base.removeChild(this.basisInstance.element);
            }
        }

    }

    export class BasisListView extends BasisView implements IView {
        modelList:any;
        viewList:any;
        itemTemplate:any;
        bindItemModel:boolean = true;

        constructor(name:string, base:HTMLElement, template:any, itemTemplate:any, model:fmvc.Model, modelList:fmvc.ModelList, bindModel:boolean = true, bindItemModel:boolean = true) {
            super(name, base, template, model, bindModel);
            this.itemTemplate = itemTemplate ? itemTemplate :  bt('id:template-' + this.name + 'Item');
            this.bindItemModel = bindItemModel;
        }

        public init()
        {
            super.init();
            this.createViewList();
        }

        // to override
        public getItemView(base, template, model, bind):fmvc.BasisView
        {
             return null;
        }

        createViewList():void {
            var baseElement:HTMLElement = this.basisInstance['itemsBase'];
            var itemModels:any = this.modelList.getData();

            for (var i in itemModels) {
                var itemModel:fmvc.Model = itemModels[i];
                var item:fmvc.BasisView = this.getItemView(baseElement, this.itemTemplate, itemModel, this.bindItemModel);
                item.setMediator(this.getMediator());
                item.init();
                this.viewList.push(item);
            }
        }

        public destroy()
        {
            for (var i in this.viewList)
            {
                this.viewList[i].destroy();
            }
            super.destroy();
        }
    }

}
