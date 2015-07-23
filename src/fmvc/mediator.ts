///<reference path='./d.ts'/>

module fmvc {
    export class Mediator extends fmvc.Notifier implements IMediator {
        private views:View[];
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

        public get root():Element {
            return this._root;
        }

        public setFacade(facade:fmvc.Facade):Mediator {
            this.facade = facade;
            return this;
        }

        public addView(views:fmvc.View|fmvc.View[]):Mediator
        {
            if(!this.views) this.views = [];
            if (views) {
                if (_.isArray(views)) {
                    for (var i in views) {
                        this.addView(views[i]);
                    }
                }
                else {
                    var view = <View> views;
                    if (this.views.indexOf(view) === -1) {
                        this.views.push(view);
                        view.setMediator(this).render(this._root);
                    } else {
                        this.log('Warn: try to duplicate view');
                    }
                }
            }
            else {
                this.log('Has no views to add');
            }

            return this;
        }

        public getView(name:string):View
        {
            return _.find<View>(this.views,(view:View) => view.name === name);
        }

        public get events():string[] {
            return null;
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
            //console.log('Mediator handled ... ' , e);
            //this.log('Handled ' + e.name + ' from ' + e.target.name + ":" + e.target.type);
            switch (e && e.target?e.target.type:null) {
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

        public modelEventHandler(e:IEvent):void {
        }

        public mediatorEventHandler(e:IEvent):void {
        }

        public viewEventHandler(e:IViewEvent):void {
        }
    }

    export interface IMediator {
        events:string[];
        internalHandler(e:any):void;
        eventHandler(e:any):void;
        getView(name:string):View;
    }
}



