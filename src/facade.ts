module fastmvc
{
    public static const TYPE_MEDIATOR:string = 'mediator';
    public static const TYPE_MODEL:string = 'model';
    public static const TYPE_VIEW:string = 'view';

    export class Facade {
        private _name:string = '';
        private _objects:any = [];
        private _events:any = {};
        private _log:fastmvc.Logger;
        private static _facades = [];


        constructor(name:string) {
            this._name = name;
            this._log = new fastmvc.Logger(this, 'Log');
            Facade._facades.push(name);
        }

        public register(object:any):void {
            if (this._objects.indexOf(object) < 0) {
                this._objects.push(object);
                if (object && object.events()) {
                    var events = object.events();
                    for (var i in events) {
                        var event:string = events[i];
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
            this._log.saveLog(name, message, level);
        }

        public log(name:string, message:string, level?:number)
        {
            this._log.saveLog(name, message, level);
        }


    }
}
