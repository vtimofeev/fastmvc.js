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

    /*
    export class BasisListView extends fmvc.Notifier implements IView {
        private _mediator:any;
        public base:HTMLElement;
        public model:fmvc.Model;
        public modelList:fmvc.ModelList

        public htmlElementLinks:Array;

        private renderedData:Object;

        private template:any;
        private itemTemplate:any;

        private itemViews:any = [];
        private ItemViewConstructor:fmvc.BasisView;

        private basisInstance:any;

        constructor(name:string, base:HTMLElement, template:any, model:fmvc.Model, modelList:fmvc.ModelList, ItemViewConstructor:any) {

            super(name, fmvc.TYPE_VIEW);
            _.bindAll(this, 'viewEventsHandler');
            this.base = base;

            if (template) this.template = template;
            else this.template = bt.template('id:template-' + name);

            this.setModel(model);
            this.setModelList(modelList);
            this.ItemViewConstructor = ItemViewConstructor;
            this.createChilds();
        }

        public setModel(value:fmvc.Model) {
            this.model = value;
        }

        public getModel():fmvc.Model {
            return this.model;
        }

        public setModelList(value:fmvc.ModelList) {
            this.modelList = value;
        }

        public getModelList():fmvc.ModelList {
            return this.modelList;
        }

        public setBase(value:HTMLElement) {
            this.rebaseInstance(value);
            this.base = value;
        }

        public getBase():HTMLElement {
            return this.base;
        }

        private rebaseInstance(newBase:any) {
            if (this.base && this.basisInstance) {
                var element:HTMLElement = this.basisInstance.element;
                this.base.removeChild(element);
                newBase.appendChild(element);
            }
        }

        public bindModel(value:boolean):void {
            if (!this.model) return this.log('Error, cant bind with undefined model');
            this.model.bind(value, this, this.dataHandler);
        }

        public init():void {
            this.createTemplateInstance();
            this.bindModel(true);
        }

        createTemplateInstance():void {
            if (!this.template) return this.log('Error, cant get template to create instance');

            this.log('Create template ' + this.template + ', base is ' + this.base);

            this.basisInstance = this.template.createInstance(null, this.viewEventsHandler);
            if (this.base) this.base.appendChild(this.basisInstance.element);
            if (this.htmlElementLinks) this.createInstanceLinks();
        }

        createInstanceLinks():void {
            if (!this.basisInstance) return this.log('Error, cant create instance links with undefined basis instance');
            for (var i in this.htmlElementLinks) {
                var elementName = this.htmlElementLinks[i];
                this[elementName] = this.basisInstance[elementName];
            }
        }

        createChilds():void {
            var baseChildElement:HTMLElement = this.basisInstance['childBase'];
            var childModels:any = this.modelList.getData();

            for (var i in childModels) {
                var childModel:fmvc.Model = childModels[i];
                this.itemViews.push(new (this.ItemViewConstructor)(this.ItemViewConstructor.NAME, this.itemTemplate, childModel, baseChildElement));
            }
        }

        public dataHandler(event:string, data:any) {
            this.render();
        }

        public mediator(value:fmvc.Mediator) {
            this._mediator = value;
        }

        public sendEvent(name:string, data:any = null, sub:string = null, error:any = null, global:boolean = false):void {
            if (this._mediator) this._mediator.internalHandler({name: name, data: data, global: global, target: this});
        }

        // Overrided method
        // Render
        public render():void {
            var data = this.data;
            if (!this.renderedData) this.renderedData = {};

            this.log('Render ' + this.basisInstance);
        }

        public test() {
            console.log('in super');
        }

        // Overrided method
        // Handler
        public viewEventsHandler(name:string, e:any):void {
            this.log('event ' + name);
            this.sendEvent(name, e);
        }

        public destroy():any {

            if (this.model) this.bindModel(false);
            if (this.basisInstance) {
                this.basisInstance.destroy();
                this.base.removeChild(this.basisInstance.element);
            }
        }

        public log(message:string, level?:number):void {
            this._mediator.facade().saveLog(this.name(), message, level);
        }


    }
    */


}
