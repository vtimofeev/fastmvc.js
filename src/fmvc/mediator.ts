///<reference path='./d.ts'/>

namespace fmvc {
    export class Mediator extends fmvc.Notifier implements IMediator {
        private views:IView[];
        private _root:Element;

        constructor(name:string, root:Element) {
            super(name, TYPE_MEDIATOR);
            this.setRoot(root);
            this.views = [];
        }

        public setRoot(root:Element):Mediator {
            this._root = root;
            return this;
        }

        public get root():Element {
            return this._root || this.facadeRoot;
        }

        public get facadeRoot():Element {
            return this.facade ? this.facade.root : null;
        }

        public addView(...views:IView[]):Mediator
        {
            _.each(views, this._addView, this);
            return this;
        }

        private _addView(view:IView):void {
            if (this.views.indexOf(view) === -1) {
                this.views.push(view);
                view.setMediator(this).render(this.root);
            } else {
                this.log('Warn: try to duplicate view');
            }
        }

        public getView(name:string):IView
        {
            return _.find<IView>(this.views,(view:View) => view.name === name);
        }

        public removeView(name:string):Mediator {
            this.views = _.without(this.views, this.getView(name));
            return this;
        }

        public get events():string[] {
            return null;
        }

        public internalHandler(e:IEvent):void {

            if (e && e.global) {
                this.facade.eventHandler(e);
            }
            else {
                this.eventHandler(e);
            }

        }

        public eventHandler(e:IEvent):void {
            switch (e && e.target?e.target.type:null) {
                case TYPE_MEDIATOR:
                    this.mediatorEventHandler(e);
                    break;
                case TYPE_MODEL:
                    this.modelEventHandler(e);
                    break;
                case TYPE_VIEW:
                    this.viewEventHandler(e);
                    break;
            }
        }

        public modelEventHandler(e:IEvent):void {
        }

        public mediatorEventHandler(e:IEvent):void {
        }

        public viewEventHandler(e:IEvent):void {
        }
    }

    export interface IMediator {
        events:string[];
        internalHandler(e:any):void;
        eventHandler(e:any):void;
        getView(name:string):IView;
    }

}



