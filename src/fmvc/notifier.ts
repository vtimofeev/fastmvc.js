///<reference path='./d.ts'/>
module fmvc
{
    export class Notifier implements INotifier{
        private _facade:fmvc.Facade;
        private _name:string;
        private _type:string;
        private _listeners:IListener[];
        private _composed:string[];
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

        public get listenerCount():number {
            return this._listeners?this._listeners.length:-1;
        }

        public setFacade(facade:fmvc.Facade):Notifier {
            this.facade = facade;
            return this;
        }

        public compose(value:INotifier):Notifier {
            if(!(value && value.name)  throw 'Cant compose, argument is ' + value;
            if(typeof this[value.name] !== 'undefined') throw 'Cant compose cause name "' + value.name + '" is used ';

            this._composed = this._composed || [];
            this._composed.push(value.name);
            this[value.name] = value;

            return this;
        }

        public bind(object:any, handler:any):Notifier
        {
            var hasBind:boolean = this.hasBind(object, handler);
            if(!this._listeners) this._listeners = [];

            if(!hasBind) {
                this._listeners.push({target: object, handler: handler});
            }
            return this;
        }

        public unbind(object:any, handler?:any):Notifier
        {
            var deletedOffset:number = 0;
            this._listeners && this._listeners.forEach(function(lo:IListener, i:number) {
                if(lo.target === object && (!handler || handler === lo.handler)) { this.splice(i - deletedOffset, 1); deletedOffset++; }
            }, this._listeners);

            return this;
        }

        // Послаем сообщение сначала в фасад, потом частным слушателям (для моделей)
        public dispatchEvent(e:IEvent|string):void //name:string, data:any = null, changes:any = null, sub:string = null, error:any = null
        {
            if(this._disposed) throw Error('Notifier(Model/View) ' + this.name + ' is disposed and cant send event');
            if(!e || !this._listeners) return;

            var event:IEvent = <IEvent> (typeof e === 'string'? {type: e} : e);
            !event.target && (event.target = this);
            event.currentTarget = this;

            this.sendToListeners(event);
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


        public hasBind(object:INotifier, handler:Function):boolean {
            var l:number,i:number, ol:IListener;
            if(!this._listeners) {
                return false;
            }

            for(i = 0, l = this._listeners.length; i < l; i++) {
                ol = this._listeners[i];
                if(ol.target === object && ol.handler === handler) return true;
            }

            return false;
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
            this._composed && this._composed.forEach((v:string)=>(delete this[v]));
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
        dispatchEvent(e:IEvent|string):void;
        bind(context:INotifier, handler:Function):INotifier;
        unbind(context:INotifier, handler?:Function):INotifier;
        dispose():void;
    }

    export interface IEvent {
        target?:INotifier;
        currentTarget?:INotifier;
        type:string;
        data?:any;
        changes?:any;

        sub?:any;
        error?:any;
        global?:any;
    }


}