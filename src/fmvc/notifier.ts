///<reference path='./d.ts'/>
namespace fmvc
{

    export class Notifier implements INotifier, IDynamicObject {
        private _facade:IFacade;
        private _name:string;
        private _type:number;
        private _listeners:IListener[];
        private _composed:{[name:string]:INotifier};
        private _disposed:boolean = false;

        constructor(name:string, type:number = null)
        {
            this._name = name;
            this._type = type;
        }

        public set facade(value:IFacade)
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

        public get facade():IFacade
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

        public get composed():{[name:string]:INotifier}
        {
            return this._composed;
        }

        public get type():number
        {
            return this._type;
        }

        public get listenerCount():number {
            return this._listeners?this._listeners.length:-1;
        }

        public compose(value:INotifier):void {
            var name:string = value && value.name,
                isComposed:boolean = !!(this._composed && this._composed[name]);

            if(!name) throw 'Cant compose ' + value;
            if(isComposed) throw 'Cant compose cause name "' + name + '" is used at ' + this.name;
            !this._composed && (this._composed == {});
            this._composed[name] = value;
        }

        public decompose(value:INotifier|string):void {
            var name:string = typeof value === 'string' ? value : value && value.name,
                isComposed:boolean = !!(this._composed && this._composed[name]);

            if(!name || !isComposed) throw 'Cant decompose ' + value;
            delete this._composed[name];
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
            this._composed && Object.keys(this._composed).forEach((v:string)=>(delete this._composed[v]));
        }
    }

    export interface IListener {
        target:INotifier;
        handler:Function;
    }

    export interface IDynamicObject {
        [name:string]: any;
    }

    export interface IFacade extends INotifier {
        root:Element;
        logger:any;
        eventHandler:any;
    }

    export interface INotifier
    {
        name:string;
        type:number;
        disposed:boolean;
        facade:INotifier;
        composed:{[name:string]:INotifier};

        compose(value:INotifier):void;
        decompose(value:INotifier|string):void;

        bind(context:INotifier, handler:Function):INotifier;
        unbind(context:INotifier, handler?:Function):INotifier;

        dispatchEvent(e:IEvent|string):void;
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