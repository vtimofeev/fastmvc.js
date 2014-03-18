module fastmvc
{
    export class ViewGroup  extends View{
    }

    export class View extends  fastmvc.Notifier implements  IView {
        private _mediator:any;
        private _$base:any;

        constructor(name:string, $base:any)
        {
            super(name, fastmvc.TYPE_VIEW);
            this._$base = $base;
        }

        public mediator(value:fastmvc.Mediator)
        {
            this._mediator = value;
        }

        sendEvent(name:string, data:any = null, global:bool = false)
        {
            if(this._mediator) this._mediator.internalHandler({name: name, data: data, global: global, target:this});
        }

        // Override events
        public render():void
        {
        }

        public eventHandler(e:any):void
        {
        }
    }

    export interface IView
    {
        render():void;
        eventHandler(e:any):void;
    }

}
