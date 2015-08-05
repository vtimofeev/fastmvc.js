///<reference path='./d.ts'/>

module fmvc {
    export class Mediator extends fmvc.Notifier implements IMediator {
        private views:View[];
        private _root:Element;

        constructor(name:string, root?:Element) {
            super(name, fmvc.TYPE_MEDIATOR);
            this.setRoot(root);
            this.views = [];
        }

        public setRoot(root:Element):Mediator {
            this._root = root;
            return this;
        }

        public get root():Element {
            return this._root;
        }

        public addView(...views:fmvc.View[]):Mediator
        {
            _.each(views, this._addView, this);
            return this;
        }

        private _addView(view:fmvc.View):void {
            if (this.views.indexOf(view) === -1) {
                this.views.push(view);
                view.setMediator(this).render(this.root);
            } else {
                this.log('Warn: try to duplicate view');
            }
        }

        public getView(name:string):View
        {
            return _.find<View>(this.views,(view:View) => view.name === name);
        }

        public removeView(name:string):Mediator {
            this.views = _.without(this.views, this.getView(name));
            return this;
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

        public eventHandler(e:IEvent):void {
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



