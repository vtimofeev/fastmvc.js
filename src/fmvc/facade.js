///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    fmvc.VERSION = '0.8.2';
    fmvc.TYPE_MEDIATOR = 'mediator';
    fmvc.TYPE_MODEL = 'model';
    fmvc.TYPE_VIEW = 'view';
    fmvc.FacadeModel = {
        Log: 'log'
    };
    var Facade = (function () {
        function Facade(name, type, root) {
            this._events = {};
            this.model = {};
            this.mediator = {};
            this._name = name; // Уникальное имя приложения
            this._type = type; // Тип приложения
            this._root = root; // Контейнер приложения
            Facade.registerInstance(this); // Регистрируем в синглтоне приложений среды  - в дальнейшем используется для взаимойдействий между приложениями;
            this.register(new fmvc.Logger(fmvc.FacadeModel.Log)); // создание модели логгера, записываем модель в фасад (для глобального доступа и обработки событий из модели)
            this.init();
        }
        Object.defineProperty(Facade.prototype, "mode", {
            /*
                Mode - тип работы приложения, 0 - дебаг, 1 - продакшн
             */
            get: function () {
                return this._mode;
            },
            set: function (value) {
                this._mode = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Facade.prototype, "root", {
            /*
                
             */
            get: function () {
                return this._root;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Facade.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Facade.prototype, "type", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Facade.prototype.init = function () {
            this.log('Старт приложения ' + name + ', fmvc версия ' + fmvc.VERSION);
            this.log('Регистрация модулей');
            this.initModels();
            this.initMediators();
            this.log('Старт приложения');
            this.start();
        };
        // В насдедниках переписываем метод, в нем добавляем доменные модели
        Facade.prototype.initModels = function () {
        };
        // В насдедниках переписываем метод, в нем добавляем медиаторы
        Facade.prototype.initMediators = function () {
        };
        // В насдедниках переписываем метод, в нем отправляем событие для старта
        Facade.prototype.start = function () {
        };
        // Регистрация объкта система - модели, медиатора
        // Модели, содержат данные, генерируют события моделей
        // Медиаторы, содержат отображения, а тажке генерируют, проксируют события отображения, слушают события модели
        Facade.prototype.register = function () {
            var objects = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                objects[_i - 0] = arguments[_i];
            }
            _.each(objects, this._register, this);
            return this;
        };
        Facade.prototype._register = function (object) {
            var _this = this;
            this.log('Register ' + object.name + ', ' + object.type);
            object.facade = this;
            switch (object.type) {
                case fmvc.TYPE_MODEL:
                    var model = (object);
                    this.model[object.name] = model;
                    break;
                case fmvc.TYPE_MEDIATOR:
                    var mediator = (object);
                    this.mediator[object.name] = mediator;
                    _.each(mediator.events, function (e) { return _this.addListener(mediator, e); }, this);
                    break;
            }
        };
        // Удаление объекта системы - модели, медиатора
        Facade.prototype.unregister = function () {
            var objects = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                objects[_i - 0] = arguments[_i];
            }
            _.each(objects, this._unregister, this);
            return this;
        };
        Facade.prototype._unregister = function (object) {
            this.log('Unregister ' + object.name + ', ' + object.type);
            object.dispose();
            switch (object.type) {
                case fmvc.TYPE_MODEL:
                    delete this.model[object.name];
                    break;
                case fmvc.TYPE_MEDIATOR:
                    delete this.mediator[object.name];
                    this.removeListener((object));
                    break;
            }
        };
        Facade.prototype.get = function (name) {
            return this.model[name] || this.mediator[name];
        };
        Facade.prototype.addListener = function (object, event) {
            this._events[event] ? this._events[event].push(object) : (this._events[event] = [object]);
            return this;
        };
        Facade.prototype.removeListener = function (object, event) {
            function removeFromObjects(objects) { if (objects.indexOf(object) > -1)
                objects = _.without(objects, object); }
            ;
            if (event)
                removeFromObjects(this._events[event]);
            else
                _.each(this._events, removeFromObjects, this);
            return this;
        };
        // Глобальный получатель событий от системы
        Facade.prototype.eventHandler = function (e) {
            var objects = this._events[e.name];
            _.each(objects, function (object) { return object.eventHandler(e); });
        };
        Object.defineProperty(Facade.prototype, "logger", {
            get: function () {
                return (this.model[fmvc.FacadeModel.Log]);
            },
            enumerable: true,
            configurable: true
        });
        Facade.prototype.log = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var logger = this.logger;
            if (logger) {
                logger.add(this._name, args, 0);
            }
            else {
                console.log(this._name, args);
            }
            return this;
        };
        // Получение фасада приложения по имени
        Facade.registerInstance = function (facade) {
            Facade.__facadesByName[facade.name] = facade;
            var types = Facade.__facadesByType;
            var type = facade.type;
            (types[type] ? types[type] : types[type] = []).push(facade);
        };
        Facade.unregisterInstance = function (facade) {
            delete Facade.__facadesByName[facade.name];
            Facade.__facadesByType[facade.type] = _.without(Facade.__facadesByType[facade.type], facade);
        };
        Facade.getFacadeByName = function (name) {
            return Facade.__facadesByName[name];
        };
        Facade.getFacadesByType = function (type) {
            return Facade.__facadesByType[type];
        };
        //-------------------------------------------------------------------------------
        // Менеджмент фасадов
        //-------------------------------------------------------------------------------
        Facade.__facadesByName = {};
        Facade.__facadesByType = {};
        return Facade;
    })();
    fmvc.Facade = Facade;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=facade.js.map