///<reference path='notifier.ts'/>
///<reference path='facade.ts'/>
///<reference path='view.ts'/>


module fastmvc {
    export class Mediator extends fastmvc.Notifier implements IMediator {
        private views:any;

        constructor(facade:fastmvc.Facade, name:string, views:any = null) {
            super(name, fastmvc.TYPE_MEDIATOR);
            this.setFacade(facade);
            this.initViews(views);
        }

        private initViews(views)
        {
            if (views) {
                if (views.length) {
                    for (var i in views) {
                        this.initView(views[i]);
                    }

                    this.views = views;
                }
                else {
                    this.initView(views);
                    this.views = [views];
                }
            }
            else {
                this.log('Has no views on init');
            }
        }

        private initView(view:fastmvc.View) {
            this.log('Init view ' + view.name());
            view.mediator(this);
            view.delegateEventHandlers(true);
        }

        public getView(name:string):fastmvc.View
        {
            for(var i in this.views) { if(this.views[i].name() == name) return this.views[i]; }
            return null;
        }

        public events():any {
            return [];
        }

        public internalHandler(e:any):void {
            if (e && e.global) {
                this.facade().eventHandler(e);
            }
            else {
                this.eventHandler(e);
            }
        }

        public eventHandler(e:any):void {
            this.log('Handled ' + e.name + ' from ' + e.target.name() + ":" + e.target.type());
            switch (e.target.type()) {
                case fastmvc.TYPE_MEDIATOR:
                    this.mediatorEventHandler(e);
                    break;
                case fastmvc.TYPE_MODEL:
                    this.modelEventHandler(e);
                    break;
                case fastmvc.TYPE_VIEW:
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
        events():any;
        eventHandler(e:any):void;
        getView(name:string):fastmvc.View;
        internalHandler(e:any):void;
    }
}



