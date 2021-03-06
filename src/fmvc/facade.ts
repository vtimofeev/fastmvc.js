///<reference path='./d.ts'/>
///<reference path='./notifier.ts'/>

namespace fmvc {
    export var VERSION:string = '0.21.0';

    export var TYPE_MEDIATOR:number = 2;
    export var TYPE_MODEL:number = 1;
    export var TYPE_VIEW:number = 3;

    export var FacadeModel = {
        Log:'log'
    };

    export class Facade extends fmvc.Notifier implements IFacade {

        private _domain:string;
        private _mode:number;
        private _events:any = {};
        private _root:any;

        public model:{[id:string]:Model<any>} = {};
        public mediator:{[id:string]:Mediator} = {};

        public remoteTaskManager:RemoteTaskManager = null;

        constructor(name:string, domain?:string, root?:Element) {
            super(name);
            this._domain = domain; // Тип приложения
            this._root = root; // Контейнер приложения
            Facade.registerInstance(this); // Регистрируем в синглтоне приложений среды  - в дальнейшем используется для взаимойдействий между приложениями;
            this.register(new Logger(FacadeModel.Log));  // создание модели логгера, записываем модель в фасад (для глобального доступа и обработки событий из модели)
            this.init();
        }

        /*
            Mode - тип работы приложения, 0 - дебаг, 1 - продакшн
        */
        public get mode():number {
            return this._mode;
        }

        public set mode(value:number) {
            this._mode = value;
        }

        public get root():Element {
            return this._root;
        }

        public get domain():string {
            return this._domain;
        }

        public init() {
            this.log('Старт приложения ' + this.name + ', fmvc версия ' + fmvc.VERSION);
            this.log('Регистрация модулей');
            this.initModels();
            this.initMediators();
        }

        // В насдедниках переписываем метод, в нем добавляем доменные модели
        public initModels() {
        }

        // В насдедниках переписываем метод, в нем добавляем медиаторы
        public initMediators() {
        }

        // В насдедниках переписываем метод, в нем отправляем событие для старта
        public start() {
            this.log('Старт приложения');
        }

        // Регистрация объкта система - модели, медиатора
        // Модели, содержат данные, генерируют события моделей
        // Медиаторы, содержат отображения, а тажке генерируют, проксируют события отображения, слушают события модели
        public register(...objects:INotifier[]):Facade {
            _.each(objects, this._register, this);
            return this;
        }

        private _register(object:INotifier) {
            this.log('Register ' + object.name + ', ' + object.type);
            object.facade = this;
            switch (object.type) {
                case TYPE_MODEL:
                    var model = <Model<any>> (object);
                    this.model[object.name] = model;
                    break;
                case TYPE_MEDIATOR:
                    var mediator:Mediator = <Mediator>(object);
                    this.mediator[object.name] = mediator;
                    _.each(mediator.events, (e:string)=>this.addListener(mediator,e), this);
                    break;
            }
        }

        // Удаление объекта системы - модели, медиатора
        public unregister(...objects:INotifier[]):Facade {
            _.each(objects, this._unregister, this);
            return this;
        }

        private _unregister(object:INotifier) {
            this.log('Unregister ' + object.name + ', ' + object.type);
            object.dispose();
            switch (object.type) {
                case TYPE_MODEL:
                    delete this.model[object.name];
                    break;
                case TYPE_MEDIATOR:
                    delete this.mediator[object.name];
                    this.removeListener(<Mediator> (object));
                    break;
            }
        }

        public get(name:string):INotifier {
            return this.model[name] || this.mediator[name];
        }

        private addListener(object:IMediator, event:string):Facade {
            this._events[event]?this._events[event].push(object):(this._events[event] = [object]);
            return this;
        }

        private removeListener(object:IMediator, event?:string):Facade {
            function removeFromObjects(objects:IMediator[]) { if(objects.indexOf(object) > -1) objects = _.without(objects, object); };
            if(event) removeFromObjects(this._events[event]);
            else _.each(this._events, removeFromObjects, this);
            return this;
        }

        // Глобальный получатель событий от системы
        public eventHandler(e:IEvent):void {
            var objects:any = this._events[e.type];
            _.each(objects, (object:IMediator) => object.eventHandler(e));
        }

        public get logger():Logger {
            return <Logger>(this.model[FacadeModel.Log]);
        }

        public log(...args:any[]):Facade {
            var logger = this.logger;
            if(logger) {
                logger.add(this.name, args, 0);
            }
            else {
                console.log(this.name, args);
            }
            return this;
        }

        //-------------------------------------------------------------------------------
        // Менеджмент фасадов
        //-------------------------------------------------------------------------------

        private static __facadesByName:{[key:string]:Facade} = {};
        private static __facadesByType:{[key:string]:Facade[]} = {};

        // Получение фасада приложения по имени
        public static registerInstance(facade:Facade) {
            Facade.__facadesByName[facade.name] = facade;
            const types = Facade.__facadesByType;
            const type = facade.domain;
            (types[type]?types[type]:types[type] = []).push(facade);
        }

        public static unregisterInstance(facade:Facade) {
            delete Facade.__facadesByName[facade.name];
            Facade.__facadesByType[facade.domain] = _.without(Facade.__facadesByType[facade.domain], facade);
        }

        public static getFacadeByName(name:string):Facade {
            return Facade.__facadesByName[name];
        }
        public static getFacadesByType(type:string):Facade[] {
            return Facade.__facadesByType[type];
        }
    }
}
