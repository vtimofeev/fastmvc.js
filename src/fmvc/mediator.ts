///<reference path='./d.ts'/>

module fmvc {
    export class Mediator extends fmvc.Notifier implements IMediator {
        private views:any;
        private _root:Element;

        constructor(name:string, root?:Element, facade?:Facade) {
            super(name, fmvc.TYPE_MEDIATOR);
            this._root = root;
            this.facade = facade;
        }

        public setRoot(root:Element):Mediator {
            this._root = root;
            return this;
        }

        public setFacade(facade:fmvc.Facade):Mediator {
            this.facade = facade;
            return this;
        }

        public addViews(views:fmvc.View|fmvc.View[]):Mediator
        {
            if (views) {
                if (_.isArray(views)) {
                    for (var i in views) {
                        this.initView(views[i]);
                    }
                    this.views = views;
                }
                else {
                    this.initView(<fmvc.View> (views));
                    this.views = [views];
                }
            }
            else {
                this.log('Has no views to add');
            }

            return this;
        }

        private initView(view:fmvc.View) {
            this.log('Init view ' + view.name);
            view.mediator = this;
            view.render(this._root)
        }

        public getView(name:string):any
        {
            for(var i in this.views) { if(this.views[i].name() == name) return this.views[i]; }
            return null;
        }

        public get events():string[] {
            return [];
        }

        public internalHandler(e:any):void {
            if (e && e.global) {
                this.facade.eventHandler(e);
            }
            else {
                this.eventHandler(e);
            }
        }

        public eventHandler(e:any):void {
            this.log('Handled ' + e.name + ' from ' + e.target.name + ":" + e.target.type);
            switch (e.target.type()) {
                case fmvc.TYPE_MEDIATOR:
                    this.mediatorEventHandler(e);
                    break;
                case fmvc.TYPE_MODEL:
                    this.modelEventHandler(e);
                    break;
                case fmvc.TYPE_VIEW:
                    this.viewEventHandler(e);
                    break;
            }
        }

        public modelEventHandler(e:any):void {
        }

        public mediatorEventHandler(e:any):void {
        }

        public viewEventHandler(e:any):void {
        }
    }

    export interface IMediator {
        events:string[];
        internalHandler(e:any):void;
        eventHandler(e:any):void;
        getView(name:string):any;
    }
}



