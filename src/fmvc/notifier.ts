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

        // Послаем сообщение сначала в фасад, потом частным слушателям (для моделей)
        public sendEvent(name:string, data:any = null, sub:string = null, error:any = null, log:boolean = true):void
        {
            var e = {name: name, sub:sub, data: data, error: error, target: this};
            this.log('Send event ' + name);
            if(this._listeners && this._listeners.length) this._sendToListners(e);
            if(this._facade) this._facade.eventHandler(e);
        }


        public log(message:string, level?:number):Notifier
        {
            // @todo remove facade reference
            if(this._facade) this._facade.logger.add(this.name, message, level);
            return this;
        }

        public registerHandler():void
        {
        }

        public removeHandler():void
        {
        }

        public bind(object:any, handler?:any):Notifier
        {
            this.addListener(object, handler);
            return this;
        }

        public unbind(object:any, handler?:any):Notifier
        {
            this.removeListener(object, handler);
            return this;
        }

        public addListener(object:INotifier, handler:Function):Notifier
        {
            if(!this._listeners) this._listeners = [];
            var yetListener = _.filter(this._listeners, (v)=>v.handler===handler);
            if(!(yetListener && yetListener.length)) this._listeners.push({target: object, handler: handler});
            else console.warn('Try duplicate listener of ' , this.name );
            return this;
        }

        public removeListener(object:INotifier, handler?:Function):Notifier
        {
            var deleted:number = 0;
            this._listeners.forEach(function(lo:IListener, i:number) {
                if(lo.target === object) { this.splice(i - deleted, 1); deleted++; }
            }, this._listeners);
            return this;
        }

        public removeAllListeners():void
        {
            this._listeners = null;
        }

        private _sendToListners(e:IEvent)
        {
            this._listeners.forEach(function(lo:IListener) {
                if(!lo.target.disposed) (lo.handler).call(lo.target, e);
            });
        }

        public dispose():void {
            this.removeAllListeners();
            this.facade = null;
            this._disposed = true;
        }
    }

    export interface IListener {
        target:INotifier;
        handler:Function;
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

    export interface IEvent {
        target:INotifier;
        name:string;
        data?:any;
        sub?:any;
        error?:any;
    }

    export interface IViewEvent extends IEvent{
        source?:any; // source browser event, if exist
    }

}