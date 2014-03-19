module fastmvc
{
    export var VERSION:string = '0.0.2';

    export var TYPE_MEDIATOR:string = 'mediator';
    export var TYPE_MODEL:string = 'model';
    export var TYPE_VIEW:string = 'view';


    export class Facade {


        private _name:string = '';
        private _objects:any = [];
        private _events:any = {};
        private _log:fastmvc.Logger;
        private static _facades = [];


        constructor(name:string) {
            this._name = name;
            this._log = new fastmvc.Logger(this, 'Log');
            this.log('Start ' + name + ', fastmvc ' + fastmvc.VERSION);
            Facade._facades.push(name);
        }

        public register(object:any):void {
            object.setFacade(this);
            this.log('Register ' + object.name())

            if (this._objects.indexOf(object) < 0) {

                this._objects.push(object);
                if (object && ('events' in object)) {
                    var events = object.events();
                    for (var i in events) {
                        var event:string = events[i];
                        this.log('Add event listener ' + object.name());
                        if (this._events[event]) {
                            this._events[event].push(object);
                        }
                        else {
                            this._events[event] = [ object ];
                        }
                    }
                }
            }
        }

        public getObject(name:String):any
        {
            for (var i in this._objects)
            {
                var object = this._objects[i];
                if(object && object.name() === name) return object;
            }
            return null;
        }

        public eventHandler(e:any):void {
            var objects:any = this._events[e.name];
            for (var i in objects)
            {
                var object:fastmvc.IMediator = objects[i];
                object.eventHandler(e);
            }
        }

        public log(message:string, level?:number)
        {
            this.saveLog(this._name, message, level);
        }

        public saveLog(name:string, message:string, level?:number)
        {
            this._log.saveLog(name, message, level);
        }


    }
}
