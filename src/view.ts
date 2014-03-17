module fastmvc
{
    export class ViewGroup  extends View{
    }

    export class View extends  fastmvc.Notifier {
        private _mediator:any;

        constructor(mediator:fastmvc.Mediator, name:string)
        {
            super(null, name, fastmvc.TYPE_VIEW);
            this._mediator = mediator;
        }

        render():void
        {
        }

        sendEvent(name:string, data:any = null, global:bool = false)
        {
            this._mediator.internalHandler({name: name, data: data, global: global, target:this});
        }
    }

}
