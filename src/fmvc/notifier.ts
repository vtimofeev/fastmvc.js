module fmvc
{
    export class Notifier implements INotifier{
        private _facade:fmvc.Facade;
        private _name:string;
        private _type:string;
        private _listeners:any;

        constructor(name:string, type:string = null)
        {
            this._name = name;
            this._type = type?type:fmvc.TYPE_MODEL;
        }

        public setFacade(value:fmvc.Facade):void
        {
            this._facade = value;
        }

        public facade():fmvc.Facade
        {
            return this._facade;
        }

        public name():string
        {
            return this._name;
        }

        public type():string
        {
            return this._type;
        }

        public sendEvent(name:string, data:any = null, sub:string = null, error:any = null, log:boolean = true):void
        {
            var e = {name: name, sub:sub, data: data, error: error, target: this};
            if(log) this.log('Send event ' + name);
            if(this._facade) this._facade.eventHandler(e);
            if(this._listeners && this._listeners.length) this.sendToListners(name, data);
        }

        public log(message:string, level?:number):void
        {
            // log messages
            if(this._facade) this._facade.saveLog(this.name(), message, level);
            return void;
        }

        public registerHandler():void
        {
        }

        public removeHandler():void
        {
        }

        public addListener(object:any, handler:any):void
        {
            if(!this._listeners) this._listeners = [];
            this._listeners.push({'object': object, 'handler': handler});
        }

        public bind(bind:boolean, object:any, handler?:any)
        {
            if(bind) this.addListener(object, handler);
            else this.removeListener(object, handler);
        }

        public removeListener(object:any, handler?:any):void
        {
        }

        public removeAllListeners():void
        {
        }

        public sendToListners(event, data)
        {
            for (var i in this._listeners)
            {
                var lo:any = this._listeners[i];
                (lo.handler).apply(lo.object, [event, data]);
            }
        }
    }

    export interface IEvent
    {
        name:string;
        data:any;
    }


    export interface INotifier
    {
        name():string;
        facade():fmvc.Facade;
        sendEvent(name:string, data:any):void;
        registerHandler():void;
        removeHandler():void;
    }
}