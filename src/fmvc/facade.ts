///<reference path='./d.ts'/>

module fmvc {
    export var VERSION:string = '0.8.0';
    export var TYPE_MEDIATOR:string = 'mediator';
    export var TYPE_MODEL:string = 'model';
    export var TYPE_VIEW:string = 'view';

    export var DefaultModel = {
        locale: 'locale',
        i18n: 'i18n',
        theme:'theme',
        log:'log'
    };

    export class Facade {
        private _name:string = '';
        private _events:any = {};
        private _root:any;

        public model:{[id:string]:Model} = {};
        public mediator:{[id:string]:Mediator} = {};

        constructor(name:string, root:Element|Window, theme:string = '', locale:string = 'ru', i18nDict:any = {}) {
            // Уникальное имя приложения
            this._name = name;
            // Контейнер приложения
            this._root = root;

            // Регистрируем в синглтоне приложений среды (в дальнейшем используется для взаимойдействий между приложениями)
            Facade.__facades[name] = this;

            // создание модели логгера
            var logModel:Logger = new Logger(DefaultModel.log);
            // записываем модель в фасад (для глобального доступа и обработки событий из модели)
            this.register(logModel);

            // Модель локали, содержит строку указывающую на локализацию
            var localeModel:Model = new Model(DefaultModel.locale, {value: locale});
            // Модель темы, содержит строку указывающую на тему
            var themeModel:Model = new Model(DefaultModel.theme, {value: theme});
            // Объект содержащий глобальные данные i18n
            var i18nModel:Model = new Model(DefaultModel.i18n, i18nDict);

            // Добавляем модели по умолчанию в фасад
            this.register([localeModel, i18nModel, themeModel]);

            this.log('Старт приложения ' + name + ', fmvc версия ' + fmvc.VERSION);
            this.init();
        }

        // В насдедниках переписываем метод, в нем добавляем доменные модели, прокси, медиаторы
        init() {
        }

        // Регистрация объкта система - модели, медиатора
        // Модели, содержат данные, генерируют события моделей
        // Медиаторы, содержат отображения, а тажке генерируют, проксируют события отображения, слушают события модели
        public register(objects:INotifier|INotifier[]):Facade {
            if (_.isArray(objects)) {
                _.each(objects, this.register, this);
            }
            else {
                var object = <INotifier> (objects);
                object.facade = this;
                this.log('Register ' + object.name + ', ' + object.type);

                switch (object.type) {
                    case TYPE_MODEL:
                        var model = <Model> (object)
                        this.model[object.name] = model;
                        break;
                    case TYPE_MEDIATOR:
                        var mediator:Mediator = <Mediator>(object);
                        this.mediator[object.name] = mediator;
                        _.each(mediator.events, (e:string)=>this.addListener(mediator,e), this);
                        break;
                }
            }
            return this;
        }

        // Удаление объекта системы - модели, медиатора
        public unregister(objects:INotifier|INotifier[]):Facade {
            if (_.isArray(objects)) {
                _.each(objects, this.unregister, this);
            }
            else {
                var object = <INotifier>(objects);
                this.log('Unregister ' + object.name + ', ' + object.type);
                object.dispose();
                switch (object.type) {
                    case TYPE_MODEL:
                        delete this.model[object.name];
                        break;
                    case TYPE_MEDIATOR:
                        delete this.model[object.name];
                        this.removeListener(<Mediator> (object));
                        break;
                }
            }
            return this;
        }


        public addListener(object:IMediator, event:string):Facade {
            this._events[event]?this._events[event].push(object):(this._events[event] = [object]);
            return this;
        }

        public removeListener(object:IMediator, event?:string):Facade {
            function removeFromObjects(objects:IMediator[]) { if(objects.indexOf(object) > -1) objects = _.without(objects, object); };
            if(event) removeFromObjects(this._events[event]);
            else _.each(this._events, removeFromObjects, this);
            return this;
        }

        // Текущее значение локали
        public get locale():string {
            return this.model[DefaultModel.locale].data.value;
        }

        // Текущее значение темы
        public get theme():string {
            return this.model[DefaultModel.locale].data.value;
        }

        // i18n
        public get i18n():any {
            return this.model[DefaultModel.i18n].data;
        }

        // Глобальный получатель событий от системы
        public eventHandler(e:IEvent):void {
            var objects:any = this._events[e.name];
            _.each(objects, (object:IMediator) => object.eventHandler(e));
        }

        public get logger():Logger {
            return <Logger> (this.model[DefaultModel.log]);
        }

        public log(message:string, level?:number):Facade {
            if(this.logger) {
                this.logger.add(this._name, message, level);
            }
            else {
                console.log(this._name, message, level);
            }

            return this;
        }


        // Получение фасада приложения по имени
        public static getInstance(name:string):Facade {
            return this.__facades[name];
        }
        private static __facades:{[key:string]:Facade} = {};
    }
}
