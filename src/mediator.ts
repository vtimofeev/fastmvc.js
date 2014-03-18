module fastmvc
{
    export class Mediator extends fastmvc.Notifier implements IMediator {
        private _view:any;

        constructor(name:string, view:fastmvc.View = null) {
            super(name, fastmvc.TYPE_MEDIATOR);
            if(view) {
                this._view = view;
                view.mediator(this);
            }
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

        private eventHandler(e:any):void {
            switch(e.target.type)
            {
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

    export interface IMediator
    {
        events():any;
        eventHandler(e:any):void;
        internalHandler(e:any):void;
    }
}



