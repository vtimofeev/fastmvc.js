module fastmvc
{
    export class Notifier implements INotifier{
        private _facade:fastmvc.Facade;
        private _name:string;
        private _type:string;

        constructor(facade:fastmvc.Facade, name:string, type:string = null)
        {
            this._facade = facade;
            this._name = name;
            this._type = type?type:fastmvc.TYPE_MODEL;
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
            var e = { name: name, data: data, target: this}
            this._facade.eventHandler(e);
        }

        public log(message:string, level?:number):void
        {
            this._facade.log(this._name, message, level);
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