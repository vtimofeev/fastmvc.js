module fastmvc
{
    export class Notifier implements INotifier{
        private _facade:fastmvc.Facade;
        private _name:string;
        private _type:string;

        constructor(name:string, type:string = null)
        {
            this._name = name;
            this._type = type?type:fastmvc.TYPE_MODEL;
        }

        public setFacade(value:fastmvc.Facade):void
        {
            this._facade = value;
        }

        public facade():fastmvc.Facade
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

        public sendEvent(name:string, data:any = null):void
        {
            var e = { name: name, data: data, target: this };
            this.log('Send event ' + name);
            if(this._facade) this._facade.eventHandler(e);
        }

        public log(message:string, level?:number):void
        {
            // log messages
            if(this._facade) this._facade.saveLog(this.name(), message, level);
        }

        public registerHandler():void
        {
        }

        public removeHandler():void
        {
        }
    }

    export interface INotifier
    {
        name():string;
        facade():fastmvc.Facade;
        sendEvent(name:string, data:any):void;
        registerHandler():void;
        removeHandler():void;
    }


}