///<reference path='./d.ts'/>
module fmvc
{
    export class Notifier implements INotifier{
        private _facade:fmvc.Facade;
        private _name:string;
        private _type:string;
        private _listeners:IListener[];
        private _disposed:boolean = false;

        constructor(name:string, type:string = null)
        {
            this._name = name;
            this._type = type?type:fmvc.TYPE_MODEL;
        }

        public set facade(value:fmvc.Facade)
        {
            if(value) {
                this._facade = value;
                this.registerHandler();
            }
            else {
                this.removeHandler();
                this._facade = value;
            }
        }

        public get facade():fmvc.Facade
        {
            return this._facade;
        }

        public get name():string
        {
            return this._name;
        }

        public get disposed():boolean
        {
            return this._disposed;
        }

        public get type():string
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
            if(this._facade) this._facade.sendLog(this.name, message, level);
        }

        public registerHandler():void
        {
        }

        public removeHandler():void
        {
        }

        public addListener(object:INotifier, handler:Function):void
        {
            if(!this._listeners) this._listeners = [];
            this._listeners.push({target: object, handler: handler});
        }

        public bind(bind:boolean, object:any, handler?:any)
        {
            if(bind) this.addListener(object, handler);
            else this.removeListener(object, handler);
        }

        public removeListener(object:INotifier, handler?:Function):void
        {
            var deleted:number = 0;
            this._listeners.forEach(function(lo:IListener, i:number) {
                if(lo.target === object) { this.splice(i - deleted, 1); deleted++; }
            }, this._listeners);
        }

        public removeAllListeners():void
        {
            this._listeners = null;
        }

        public sendToListners(event, data)
        {
            this._listeners.forEach(function(lo:IListener) {
                if(!lo.target.disposed) (lo.handler).apply(lo.target, [event, data]);
            });
        }

        public dispose():void {
            this.facade = null;
            this._listeners = null;
            this._disposed = true;
        }

    }

    export interface IListener {
        target:INotifier;
        handler:Function;
    }

    export interface IEvent
    {
        name:string;
        data:any;
    }


    export interface INotifier
    {
        name:string;
        type:string;
        disposed:boolean;
        facade:fmvc.Facade;
        sendEvent(name:string, data:any):void;
        registerHandler():void;
        removeHandler():void;
        dispose():void;
    }
}