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
            this._type = type;
        }

        public set facade(value:fmvc.Facade)
        {
            if(value) {
                this._facade = value;
                this.bind(this._facade, this._facade.eventHandler);
                this.registerHandler();
            }
            else {
                this.unbind(this._facade);
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

        // счетчик прямых слушателей
        public get listenerCount():number {
            return this._listeners?this._listeners.length:-1;
        }

        // установка фасада для цепочки вызовов
        public setFacade(facade:fmvc.Facade):Notifier {
            this.facade = facade;
            return this;
        }

        // Послаем сообщение сначала в фасад, потом частным слушателям (для моделей)
        public sendEvent(name:string, data:any = null, changes:any = null, sub:string = null, error:any = null):void
        {
            this.log('SendEvent: ' + name);
            if(this._disposed) throw Error('Model ' + this.name + ' is disposed and cant send event');
            var e:IEvent = {name: name, sub:sub, data: data, changes:changes, error: error, target: this};
            if(this._listeners) this._sendToListners(e);
            if(this._facade) this._facade.eventHandler(e);
        }

        public log(...messages:string[]):Notifier
        {
            if(this.facade) this.facade.logger.add(this.name, messages);
            else console.log(this.name, messages);
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

        public unbind(object:any):Notifier
        {
            this.removeListener(object);
            return this;
        }

        private addListener(object:INotifier, handler:Function):void
        {
            if(!this._listeners) this._listeners = [];
            var hasListener = _.filter(this._listeners, (v)=>v.handler===handler);
            if(_.isEmpty(hasListener)) this._listeners.push({target: object, handler: handler});
            else this.log('Try duplicate listener ' , object.name);
        }

        private removeListener(object:INotifier):void
        {
            var deletedOffset:number = 0;
            this._listeners.forEach(function(lo:IListener, i:number) {
                if(lo.target === object) { this.splice(i - deletedOffset, 1); deletedOffset++; }
            }, this._listeners);
        }

        private removeAllListeners():void
        {
            this._listeners = null;
        }

        private _sendToListners(e:IEvent)
        {
            _.each(this._listeners, function(lo:IListener) { if(!lo.target.disposed) (lo.handler).call(lo.target, e); });
        }

        public dispose():void {
            this.removeAllListeners();
            this._facade = null;
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
        changes?:any;

        sub?:any;
        error?:any;
        global?:any;
    }

    export interface IViewEvent extends IEvent{
        source?:any; // source browser event, if exist
    }

}