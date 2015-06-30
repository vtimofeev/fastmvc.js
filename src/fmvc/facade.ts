///<reference path='./d.ts'/>

module fmvc
{
    export var VERSION:string = '0.6.1';

    export var TYPE_MEDIATOR:string = 'mediator';
    export var TYPE_MODEL:string = 'model';
    export var TYPE_VIEW:string = 'view';

    export var DefaultModel = {
        locale:'locale',
        i18n:'i18n'
    };

    export class Facade {
        private _name:string = '';
        private _objects:any = [];
        private _events:any = {};
        private _logger:fmvc.Logger;
        private _root:any;

        public model:{[id:string]:Model} = {};
        public mediator:{[id:string]:Mediator} = {};

        constructor(name:string, root:Element|Window, locale:string = 'ru', i18nDict:any = {}) {
            this._name = name;
            this._root = root;
            //this._logger = new fmvc.Logger(this, 'Log');
            //this.log('Start ' + name + ', fmvc ' + fmvc.VERSION);

            var locale:Model = new Model(DefaultModel.locale, {value: 'ru'});
            var i18n:Model = new Model(DefaultModel.i18n, {});
            this.register(locale, i18n);

            Facade._facades.push(name);
            init();
        }

        init() {
        }

        public register(object:any):Facade {
            object.facade = this;
            this.log('Register ' + object.name + ', ' + object.type);
            switch(object.type) {
                case TYPE_MODEL:
                    break;
                    case TYPE_MEDIATOR:
                        var mediator:Mediator = <Mediator>(object);
                        mediator.
                    break;
            }

            if (this._objects.indexOf(object) < 0) {
                this._objects.push(object);
                if (object && ('events' in object)) {
                    var events = object.events();
                    for (var i in events) {
                        var event:string = events[i];
                        this.log('Add event listener ' + object.name);
                        if (this._events[event]) {
                            this._events[event].push(object);
                        }
                        else {
                            this._events[event] = [ object ];
                        }
                    }
                }
            }
            return this;
        }



        public get locale() {

        }

        public getLogger():fmvc.Logger
        {
            return this._logger;
        }

        public getObject(name:String):any
        {
            for (var i in this._objects)
            {
                var object = this._objects[i];
                if(object && object.name === name) return object;
            }
            return null;
        }



        public eventHandler(e:IEvent):void {
            var objects:any = this._events[e.name];
            for (var i in objects)
            {
                var object:fmvc.IMediator = objects[i];
                object.eventHandler(e);
            }
        }

        public log(message:string, level?:number)
        {
            this.sendLog(this._name, message, level);
        }

        public sendLog(name:string, message:string, level?:number)
        {
            console.log(_.toArray(arguments));
            //this._logger.saveLog(name, message, level);
        }


        public getInstance(name:string):Facade {
            return this._facades[name];
        }
        private static _facades = [];
    }
}
