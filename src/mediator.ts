module fastmvc
{
    export class Mediator extends fastmvc.Notifier implements IMediator {
        private _view:any;

        constructor(facade:fastmvc.Facade, name:string, view:any = null) {
            super(facade, name, fastmvc.TYPE_MEDIATOR);
            this._view = view;
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

        private modelEventHandler(e:any):void {
        }

        private mediatorEventHandler(e:any):void {
        }

        private viewEventHandler(e:any):void {
        }
    }

    export interface IMediator
    {
        events():any;
        eventHandler(e:any):void;
        internalHandler(e:any):void;
    }
}



