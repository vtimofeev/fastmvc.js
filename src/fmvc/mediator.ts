///<reference path='./d.ts'/>

module fmvc {
    export class Mediator extends fmvc.Notifier implements IMediator {
        private views:any;

        constructor(facade:fmvc.Facade, name:string, views:fmvc.View[] = null) {
            super(name, fmvc.TYPE_MEDIATOR);
            this.facade = facade;
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

        private initView(view:fmvc.View) {
            this.log('Init view ' + view.name);
            view.mediator = this;
            view.init();
        }

        public getView(name:string):any
        {
            for(var i in this.views) { if(this.views[i].name() == name) return this.views[i]; }
            return null;
        }

        public events():any {
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
        events():any;
        internalHandler(e:any):void;
        eventHandler(e:any):void;
        getView(name:string):any;
    }
}



