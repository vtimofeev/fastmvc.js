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
                this.removeHandler();
                this.unbind(this._facade);
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

        public bind(object:any, handler:any):Notifier
        {
            this.addListener(object, handler);
            return this;
        }

        public unbind(object:any, handler?:any):Notifier
        {
            this.removeListener(object, handler);
            return this;
        }

        // Послаем сообщение сначала в фасад, потом частным слушателям (для моделей)
        public sendEvent(name:string, data:any = null, changes:any = null, sub:string = null, error:any = null):void
        {
            if(this._disposed) throw Error('Model ' + this.name + ' is disposed and cant send event');
            if(!this._listeners) return;

            // facade, mediators, other is optional
            var e:IEvent = {name: name, sub:sub, data: data, changes:changes, error: error, target: this};
            this.sendToListeners(e);
        }

        public log(...args:string[]):Notifier
        {
            if(this.facade) this.facade.logger.add(this.name, args);
            else console.log(this.name, args);
            return this;
        }

        public registerHandler():void
        {
        }

        public removeHandler():void
        {
        }

        private addListener(object:INotifier, handler:Function):void
        {
            var hasBind:boolean = this.hasBind(object, handler);
            if(!this._listeners) this._listeners = [];

            if(!hasBind) {
                this._listeners.push({target: object, handler: handler});
            }
        }

        public hasBind(object:INotifier, handler:Function):boolean {
            var l:number,i:number, ol:IListener;
            if(!this._listeners) return false;

            for(i=0, l=this._listeners.length; i<l;i++) {
                ol = this._listeners[i];
                if(ol.target === object && ol.handler === handler) return true;
            }

            return false;
        }

        private removeListener(object:INotifier, handler?:any):void
        {
            var deletedOffset:number = 0;
            this._listeners.forEach(function(lo:IListener, i:number) {
                if(lo.target === object && (!handler || handler === lo.handler)) { this.splice(i - deletedOffset, 1); deletedOffset++; }
            }, this._listeners);
        }

        private removeAllListeners():void
        {
            this._listeners = null;
        }

        private sendToListeners(e:IEvent):void
        {
            var lo:IListener;
            var target:INotifier;
            for(var i:number = 0,  len:number = this._listeners.length; i < len; i++) {
                 lo = this._listeners[i];
                 target = lo.target;
                 target.disposed?this.unbind(lo):(lo.handler).call(target, e);
            }
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
        sendEvent(name:string, data:any, ...rest):void;
        bind(context:INotifier, handler:Function):INotifier;
        unbind(context:INotifier, handler?:Function):INotifier;
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