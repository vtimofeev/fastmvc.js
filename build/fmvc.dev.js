var fmvc;
(function (fmvc) {
    var Event = (function () {
        function Event() {
        }
        Event.Model = {
            Changed: 'ModelChanged',
            StateChanged: 'ModelStateChanged',
        };
        return Event;
    })();
    fmvc.Event = Event;
})(fmvc || (fmvc = {}));
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
            this.log('Старт приложения ' + name + ', fmvc версия ' + fmvc.VERSION);
            this.init();
        }
        Object.defineProperty(Facade.prototype, "root", {
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
        // В насдедниках переписываем метод, в нем добавляем доменные модели, прокси, медиаторы
        Facade.prototype.init = function () {
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
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var Notifier = (function () {
        function Notifier(name, type) {
            if (type === void 0) { type = null; }
            this._disposed = false;
            this._name = name;
            this._type = type;
        }
        Object.defineProperty(Notifier.prototype, "facade", {
            get: function () {
                return this._facade;
            },
            set: function (value) {
                if (value) {
                    this._facade = value;
                    this.bind(this._facade, this._facade.eventHandler);
                    this.registerHandler();
                }
                else {
                    this.unbind(this._facade);
                    this.removeHandler();
                    this._facade = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Notifier.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Notifier.prototype, "disposed", {
            get: function () {
                return this._disposed;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Notifier.prototype, "type", {
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Notifier.prototype, "listenerCount", {
            // счетчик прямых слушателей
            get: function () {
                return this._listeners ? this._listeners.length : -1;
            },
            enumerable: true,
            configurable: true
        });
        // установка фасада для цепочки вызовов
        Notifier.prototype.setFacade = function (facade) {
            this.facade = facade;
            return this;
        };
        // Послаем сообщение сначала в фасад, потом частным слушателям (для моделей)
        Notifier.prototype.sendEvent = function (name, data, changes, sub, error) {
            if (data === void 0) { data = null; }
            if (changes === void 0) { changes = null; }
            if (sub === void 0) { sub = null; }
            if (error === void 0) { error = null; }
            this.log('SendEvent: ' + name);
            if (this._disposed)
                throw Error('Model ' + this.name + ' is disposed and cant send event');
            var e = { name: name, sub: sub, data: data, changes: changes, error: error, target: this };
            if (this._listeners)
                this._sendToListners(e);
            if (this._facade)
                this._facade.eventHandler(e);
        };
        Notifier.prototype.log = function () {
            var messages = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                messages[_i - 0] = arguments[_i];
            }
            if (this.facade)
                this.facade.logger.add(this.name, messages);
            else
                console.log(this.name, messages);
            return this;
        };
        Notifier.prototype.registerHandler = function () {
        };
        Notifier.prototype.removeHandler = function () {
        };
        Notifier.prototype.bind = function (object, handler) {
            this.addListener(object, handler);
            return this;
        };
        Notifier.prototype.unbind = function (object) {
            this.removeListener(object);
            return this;
        };
        Notifier.prototype.addListener = function (object, handler) {
            if (!this._listeners)
                this._listeners = [];
            var hasListener = _.filter(this._listeners, function (v) { return v.handler === handler; });
            if (_.isEmpty(hasListener))
                this._listeners.push({ target: object, handler: handler });
            else
                this.log('Try duplicate listener ', object.name);
        };
        Notifier.prototype.removeListener = function (object) {
            var deletedOffset = 0;
            this._listeners.forEach(function (lo, i) {
                if (lo.target === object) {
                    this.splice(i - deletedOffset, 1);
                    deletedOffset++;
                }
            }, this._listeners);
        };
        Notifier.prototype.removeAllListeners = function () {
            this._listeners = null;
        };
        Notifier.prototype._sendToListners = function (e) {
            _.each(this._listeners, function (lo) { if (!lo.target.disposed)
                (lo.handler).call(lo.target, e); });
        };
        Notifier.prototype.dispose = function () {
            this.removeAllListeners();
            this.facade = null;
            this._disposed = true;
        };
        return Notifier;
    })();
    fmvc.Notifier = Notifier;
})(fmvc || (fmvc = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    fmvc.ModelState = {
        None: '',
        Parsing: 'parsing',
        Syncing: 'syncing',
        Synced: 'synced',
        Changed: 'changed',
        Completed: 'completed',
        Error: 'error',
    };
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(name, data, opts) {
            if (data === void 0) { data = {}; }
            _super.call(this, name, fmvc.TYPE_MODEL);
            // queue
            this._queue = null;
            // model options
            this.enabledEvents = true;
            this.enabledState = true;
            this.watchChanges = true;
            if (opts)
                _.extend(this, opts);
            if (data)
                this.data = data;
            if (data)
                this.setState(fmvc.ModelState.Completed);
        }
        Model.prototype.setState = function (value) {
            if (!this.enabledState || this._state === value)
                return this;
            this._prevState = value;
            this._state = value;
            this.sendEvent(fmvc.Event.Model.StateChanged, this._state);
            return this;
        };
        Model.prototype.parseValueAndSetChanges = function (value) {
            if (value instanceof Model)
                throw Error('Cant set model data, data must be object, array or primitive');
            var result = null;
            var prevData = this._data;
            var changes = null;
            var hasChanges = false;
            this.setChanges(null);
            if (_.isArray(value)) {
                result = value.concat([]); //clone of array
            }
            else if (_.isObject(prevData) && _.isObject(value) && this.watchChanges) {
                // check changes and set auto data
                for (var i in value) {
                    if (prevData[i] !== value[i]) {
                        if (!changes)
                            changes = {};
                        hasChanges = true;
                        changes[i] = value[i];
                        prevData[i] = value[i];
                    }
                }
                this.setChanges(changes);
                result = prevData;
            }
            else {
                result = (_.isObject(value)) ? _.extend((prevData ? prevData : {}), value) : value; // primitive || array || object && !watchChanges , no data && any value (object etc)
            }
            return result;
        };
        Model.prototype.reset = function () {
            this._data = null;
            this._changes = null;
            this._state = fmvc.ModelState.None;
            this.sendEvent(fmvc.Event.Model.Changed);
            return this;
        };
        Object.defineProperty(Model.prototype, "data", {
            get: function () {
                return (this.getData());
            },
            set: function (value) {
                this.setData(value);
            },
            enumerable: true,
            configurable: true
        });
        Model.prototype.setChanges = function (value) {
            this._changes = value;
        };
        Model.prototype.setData = function (value) {
            if (this._data === value)
                return;
            var result = this.parseValueAndSetChanges(value);
            if (this._data !== result || this._changes) {
                this._data = result;
                this.sendEvent(fmvc.Event.Model.Changed, this._data, this._changes);
            }
        };
        Object.defineProperty(Model.prototype, "changes", {
            get: function () {
                return this._changes;
            },
            enumerable: true,
            configurable: true
        });
        Model.prototype.getData = function () {
            return this._data;
        };
        Object.defineProperty(Model.prototype, "state", {
            get: function () {
                return this._state;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Model.prototype, "prevState", {
            get: function () {
                return this._prevState;
            },
            enumerable: true,
            configurable: true
        });
        Model.prototype.sendEvent = function (name, data, changes, sub, error) {
            if (data === void 0) { data = null; }
            if (changes === void 0) { changes = null; }
            if (sub === void 0) { sub = null; }
            if (error === void 0) { error = null; }
            if (this.enabledEvents)
                _super.prototype.sendEvent.call(this, name, data, changes, sub, error);
        };
        Model.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            // remove queue
        };
        //-----------------------------------------------------------------------------
        // Source model
        //-----------------------------------------------------------------------------
        //-----------------------------------------------------------------------------
        // Queue
        //-----------------------------------------------------------------------------
        Model.prototype.queue = function (create) {
            if (create === void 0) { create = false; }
            if (create && this._queue)
                this._queue.dispose();
            return this._queue && !create ? this._queue : (this._queue = new ModelQueue(this));
        };
        return Model;
    })(fmvc.Notifier);
    fmvc.Model = Model;
    /*
     export class TypeModel <T> extends Model {
     constructor(name:string, data:T, opts?:IModelOptions) {
     super(name, data, opts);
     }

     public get data():T {
     return <T>this.getData();
     }
     }
     */
    var SourceModel = (function (_super) {
        __extends(SourceModel, _super);
        function SourceModel(name, source, opts) {
            _super.call(this, name, null, opts);
            this.throttleApplyChanges = _.throttle(_.bind(this.applyChanges, this), 100);
            this.addSources(source);
        }
        SourceModel.prototype.addSources = function (v) {
            if (!v)
                return this;
            if (!this._sources)
                this._sources = [];
            if (_.isArray(v)) {
                _.each(v, this.addSources, this);
            }
            else if (v instanceof Model) {
                var m = v;
                m.bind(this, this.sourceChangeHandler);
                this._sources.push(m);
            }
            else {
                console.warn('Cant add source ', v);
            }
            return this;
        };
        SourceModel.prototype.removeSource = function (v) {
            var index = -1;
            if (this._sources && (index = this._sources.indexOf(v)) > -1) {
                this._sources.splice(index, 1);
                v.unbind(v);
            }
            return this;
        };
        SourceModel.prototype.sourceChangeHandler = function (e) {
            this.throttleApplyChanges();
        };
        SourceModel.prototype.setSourceMethod = function (value) {
            this._sourceMethod = value;
            this.throttleApplyChanges();
            return this;
        };
        SourceModel.prototype.setResultMethods = function () {
            var values = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                values[_i - 0] = arguments[_i];
            }
            this._resultMethods = _.flatten([].concat(this._resultMethods ? this._resultMethods : [], values));
            this.throttleApplyChanges();
            return this;
        };
        SourceModel.prototype.applyChanges = function () {
            console.log('Apply changes ...', this._sources, this._sourceMethod, this._resultMethods);
            if (!this._sources || !this._sources.length)
                this.setData(null);
            if (this._sourceMethod && this._sources.length === 1)
                throw new Error('SourceModel: source method not defined');
            var result = null;
            var sourcesResult = this._sourceMethod && this._sources.length > 1 ? (this._sourceMethod.apply(this, _.map(this._sources, function (v) { return v.data; }))) : this._sources[0].data;
            console.log('SourceModel: Source Result is ', sourcesResult);
            if (sourcesResult)
                result = _.reduce(this._resultMethods, function (memo, method) {
                    return method.call(this, memo);
                }, sourcesResult, this);
            console.log('SourceModel: Result is ', JSON.stringify(result));
            this.reset().setData(result);
        };
        return SourceModel;
    })(Model);
    fmvc.SourceModel = SourceModel;
    // Uses jQuery Deferred model
    var ModelQueue = (function () {
        function ModelQueue(model) {
            this.model = model;
        }
        ModelQueue.prototype.load = function (object) {
            this.model.setState(fmvc.ModelState.Syncing);
            this.async($.ajax, [object], $, { done: fmvc.ModelState.Synced, fault: fmvc.ModelState.Error });
            return this;
        };
        ModelQueue.prototype.loadXml = function (object) {
            var defaultAjaxRequestObject = _.defaults(object, {
                method: 'GET',
                dataType: 'xml',
                data: { rnd: (Math.round(Math.random() * 1000000)) }
            });
            return this.load(defaultAjaxRequestObject);
        };
        ModelQueue.prototype.parse = function (method) {
            this.model.setState(fmvc.ModelState.Parsing);
            this.sync(method, [this.model], this, { done: fmvc.ModelState.Completed, fault: fmvc.ModelState.Error });
            return this;
        };
        ModelQueue.prototype.async = function (getPromiseMethod, args, context, states) {
            var deferred = $.Deferred();
            var queuePromise = this.setup();
            var t = this;
            queuePromise.then(function done(value) {
                (getPromiseMethod.apply(context, args)).then(function successPromise(result) {
                    console.log('Async success ', result);
                    deferred.resolve(result);
                }, function faultPromise(result) {
                    console.log('Async fault ', arguments);
                    deferred.reject(result);
                    t.executeError(result);
                });
            }, function fault() {
                deferred.reject();
                t.executeError();
            });
            this.currentPromise = deferred.promise();
            return this;
        };
        ModelQueue.prototype.sync = function (method, args, context, states) {
            var deferred = $.Deferred();
            var queuePromise = this.setup();
            var t = this;
            queuePromise.done(function doneQueue(value) {
                var methodArgs = [value].concat(args);
                var result = method.apply(context, methodArgs);
                console.log('Call sync method ', result, ' args ', methodArgs);
                if (result)
                    deferred.resolve(result);
                else {
                    deferred.reject();
                    t.executeError();
                }
            });
            this.currentPromise = deferred.promise();
            return this;
        };
        ModelQueue.prototype.complete = function (method, args, context, states) {
            this.sync(method, context, args, states);
        };
        ModelQueue.prototype.executeError = function (err) {
            console.log('Product error ', arguments);
            if (this.error) {
                this.error.method.apply(this.error.context, this.error.args);
            }
        };
        ModelQueue.prototype.fault = function (method, args, context, states) {
            this.error = { method: method, args: args, context: context, states: states };
            return this;
        };
        ModelQueue.prototype.setup = function () {
            var queueDeferred = $.Deferred();
            $.when(this.currentPromise).then(function doneQueue(value) {
                queueDeferred.resolve(value);
            }, function faultQueue() {
                queueDeferred.reject();
            });
            return queueDeferred.promise();
        };
        ModelQueue.prototype.dispose = function () {
            this.model = null;
            this.currentPromise = null;
            this.error = null;
        };
        return ModelQueue;
    })();
    fmvc.ModelQueue = ModelQueue;
    var Validator = (function () {
        function Validator(name, fnc) {
            this.name = null;
            this.fnc = null;
            this.name = name;
            this.fnc = fnc;
        }
        Validator.prototype.execute = function (data) {
            this.fnc.call(data, data);
        };
        return Validator;
    })();
    fmvc.Validator = Validator;
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var ModelList = (function (_super) {
        __extends(ModelList, _super);
        function ModelList(name, data, opts) {
            if (data === void 0) { data = []; }
            _super.call(this, name, data, opts);
        }
        ModelList.prototype.parseValue = function (value) {
            if (!_.isArray(value))
                throw Error('Cant set modelList from not array data');
            var data = [];
            _.each(value, function (item) {
                var modelValue = (item instanceof fmvc.Model) ? item : this.getModel(item);
                data.push(modelValue);
            }, this);
            return data;
        };
        // @overrided
        ModelList.prototype.getModel = function (value) {
            return new fmvc.Model(this.name + '-item', value);
        };
        Object.defineProperty(ModelList.prototype, "count", {
            get: function () {
                var data = this.data;
                return (data && data.length) ? data.length : 0;
            },
            enumerable: true,
            configurable: true
        });
        return ModelList;
    })(fmvc.Model);
    fmvc.ModelList = ModelList;
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var Logger = (function (_super) {
        __extends(Logger, _super);
        function Logger(name, config) {
            _super.call(this, name, [], { enabledEvents: false, watchChanges: false });
            this._config = { filter: [], length: 100000, console: true };
            this._modules = [];
            if (config)
                this.config = config;
            console.log('Construct facade logger ');
        }
        Object.defineProperty(Logger.prototype, "config", {
            set: function (value) {
                _.extend(this._config, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Logger.prototype, "console", {
            set: function (value) {
                this._config.console = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Logger.prototype, "filter", {
            set: function (value) {
                this._config.filter = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Logger.prototype, "modules", {
            get: function () {
                return this._modules;
            },
            enumerable: true,
            configurable: true
        });
        Logger.prototype.add = function (name, messages, level) {
            if (messages === void 0) { messages = null; }
            if (level === void 0) { level = 0; }
            var data = { name: name, data: messages, level: level, date: new Date() };
            var dataArray = this.data;
            var config = this._config;
            dataArray.push(data);
            // add module
            if (this._modules.indexOf(name) === -1)
                this._modules.push(name);
            // exit if it has filters and has no the name in the array
            if (config.filter && config.filter.length && config.filter.indexOf(name) === -1) {
                return;
            }
            // console
            if (config && config.console && ('console' in window)) {
                console.log('[' + name + '] ' + level + ' ', messages);
            }
            // clean: remove part of logs
            if (dataArray.length > config.length * 2) {
                dataArray.splice(0, dataArray.length - this._config.length);
            }
            // send event
            if (this.enabledEvents)
                this.sendEvent('log', data, null, null);
            return this;
        };
        return Logger;
    })(fmvc.Model);
    fmvc.Logger = Logger;
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    fmvc.InvalidateType = {
        Data: 1,
        App: 2,
        State: 4,
        Parent: 8,
        Children: 16,
        Template: 32,
        Theme: 64,
        I18n: 128,
        All: (1 | 2 | 4 | 8 | 16 | 32 | 64 | 128)
    };
    var View = (function (_super) {
        __extends(View, _super);
        function View(name) {
            _super.call(this, name, fmvc.TYPE_VIEW);
            this._invalidate = 0;
            this._isWaitingForValidate = false;
            this._inDocument = false;
            _.bindAll(this, 'validate');
        }
        // Properties: mediator, data, model
        View.prototype.getElement = function () {
            return this._element;
        };
        View.prototype.setMediator = function (value) {
            this._mediator = value;
            return this;
        };
        Object.defineProperty(View.prototype, "mediator", {
            get: function () {
                return this._mediator;
            },
            set: function (value) {
                this.setMediator(value);
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.setData = function (value) {
            this._data = value;
            return this;
        };
        Object.defineProperty(View.prototype, "data", {
            get: function () {
                return this._data;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.setModel = function (value) {
            this._model = value;
            this.setData(value ? value.data : null);
            return this;
        };
        Object.defineProperty(View.prototype, "model", {
            get: function () {
                return this._model;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "inDocument", {
            get: function () {
                return this._inDocument;
            },
            enumerable: true,
            configurable: true
        });
        // events
        View.prototype.getEventNameByDomEvent = function (e) {
            return '';
        };
        View.prototype.domHandler = function (e) {
            this.sendEvent(this.getEventNameByDomEvent(e), e);
        };
        // lifecycle
        View.prototype.createDom = function () {
            this._element = document.createElement('div');
        };
        View.prototype.enter = function () {
            if (this._inDocument)
                throw new Error('Cant enter, it is in document');
            this._inDocument = true;
            this.invalidate(fmvc.InvalidateType.Data | fmvc.InvalidateType.Children);
        };
        View.prototype.exit = function () {
            this._inDocument = false;
        };
        Object.defineProperty(View.prototype, "isWaitingForValidate", {
            get: function () {
                return this._isWaitingForValidate;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.invalidate = function (value) {
            this._invalidate = this._invalidate | value;
            if (!this._isWaitingForValidate) {
                this._isWaitingForValidate = true;
                setTimeout(this.validate, 0);
            }
        };
        View.prototype.validate = function () {
            if (this._invalidate & fmvc.InvalidateType.Data)
                this.validateData();
            if (this._invalidate & fmvc.InvalidateType.State)
                this.validateState();
            if (this._invalidate & fmvc.InvalidateType.Parent)
                this.validateParent();
            if (this._invalidate & fmvc.InvalidateType.Children)
                this.validateChildren();
            /*
            if(this._invalidate & InvalidateType.App) this.validateApp();
            if(this._invalidate & InvalidateType.Template) this.validateTemplate();
            if(this._invalidate & InvalidateType.Theme) this.validateTheme();
            if(this._invalidate & InvalidateType.I18n) this.validateI18n();
            */
            this._invalidate = 0;
            this._isWaitingForValidate = false;
        };
        View.prototype.validateData = function () { };
        View.prototype.validateState = function () { };
        View.prototype.validateParent = function () { };
        View.prototype.validateChildren = function () { };
        /*
        public validateApp():void {}
        public validateTemplate():void {}
        public validateTheme():void {}
        public validateI18n():void {}
        */
        View.prototype.render = function (element) {
            if (this._inDocument)
                throw new Error('Cant render view, it is in document');
            this.createDom();
            this.enter();
            return this;
        };
        // Overrides of Notifier
        View.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        View.prototype.sendEvent = function (name, data, sub, error, global) {
            if (data === void 0) { data = null; }
            if (sub === void 0) { sub = null; }
            if (error === void 0) { error = null; }
            if (global === void 0) { global = false; }
            var e = { name: name, data: data, global: global, target: this };
            if (this.mediator)
                this.mediator.internalHandler(e);
        };
        View.prototype.log = function () {
            var messages = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                messages[_i - 0] = arguments[_i];
            }
            if (this.mediator && this.mediator.facade)
                this.mediator.facade.logger.add(this.name, messages);
            return this;
        };
        return View;
    })(fmvc.Notifier);
    fmvc.View = View;
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var Mediator = (function (_super) {
        __extends(Mediator, _super);
        function Mediator(name, root) {
            _super.call(this, name, fmvc.TYPE_MEDIATOR);
            this.setRoot(root);
            this.views = [];
        }
        Mediator.prototype.setRoot = function (root) {
            this._root = root;
            return this;
        };
        Object.defineProperty(Mediator.prototype, "root", {
            get: function () {
                return this._root;
            },
            enumerable: true,
            configurable: true
        });
        Mediator.prototype.addView = function () {
            var views = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                views[_i - 0] = arguments[_i];
            }
            _.each(views, this._addView, this);
            return this;
        };
        Mediator.prototype._addView = function (view) {
            if (this.views.indexOf(view) === -1) {
                this.views.push(view);
                view.setMediator(this).render(this.root);
            }
            else {
                this.log('Warn: try to duplicate view');
            }
        };
        Mediator.prototype.getView = function (name) {
            return _.find(this.views, function (view) { return view.name === name; });
        };
        Mediator.prototype.removeView = function (name) {
            this.views = _.without(this.views, this.getView(name));
            return this;
        };
        Object.defineProperty(Mediator.prototype, "events", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Mediator.prototype.internalHandler = function (e) {
            if (e && e.global) {
                this.facade.eventHandler(e);
            }
            else {
                this.eventHandler(e);
            }
        };
        Mediator.prototype.eventHandler = function (e) {
            switch (e && e.target ? e.target.type : null) {
                case fmvc.TYPE_MEDIATOR:
                    this.mediatorEventHandler(e);
                    break;
                case fmvc.TYPE_MODEL:
                    this.modelEventHandler(e);
                    break;
                case fmvc.TYPE_VIEW:
                    this.viewEventHandler(e);
                    break;
            }
        };
        Mediator.prototype.modelEventHandler = function (e) {
        };
        Mediator.prototype.mediatorEventHandler = function (e) {
        };
        Mediator.prototype.viewEventHandler = function (e) {
        };
        return Mediator;
    })(fmvc.Notifier);
    fmvc.Mediator = Mediator;
})(fmvc || (fmvc = {}));
///<reference path='./event.ts'/>
///<reference path='./facade.ts'/>
///<reference path='./notifier.ts'/>
/////<reference path='./event.dispatcher.ts'/>
///<reference path='./model.ts'/>
///<reference path='./model.list.ts'/>
///<reference path='./logger.ts'/>
/////<reference path='./view.i.ts'/>
///<reference path='./view.ts'/>
/////<reference path='./view.list.ts'/>
///<reference path='./mediator.ts'/>
///<reference path='../../../DefinitelyTyped/lodash/lodash.d.ts'/>
///<reference path='../../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='../fmvc/d.ts'/>
/* start compiled view */
var ui;
(function (ui) {
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(name, modelOrData, jsTemplate) {
            _super.call(this, name, modelOrData, jsTemplate);
        }
        Button.prototype.createDom = function () {
            this.element = this.templateElement;
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        };
        Object.defineProperty(Button.prototype, "jsTemplate", {
            get: function () {
                return Button.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Button.__jsTemplate = {
            "path": "0",
            "type": "tag",
            "properties": {},
            "attribs": {
                "className": "Button",
                "class": {
                    "static": ["button"],
                    "dynamic": [{
                            "content": "button-{selected}",
                            "result": "button-{$0}",
                            "vars": ["$0"],
                            "expressions": ["selected"]
                        }, {
                            "content": "button-{disabled}",
                            "result": "button-{$0}",
                            "vars": ["$0"],
                            "expressions": ["disabled"]
                        }, {
                            "content": "button-{hover}",
                            "result": "button-{$0}",
                            "vars": ["$0"],
                            "expressions": ["hover"]
                        }, {
                            "content": "button-{error}",
                            "result": "button-{$0}",
                            "vars": ["$0"],
                            "expressions": ["error"]
                        }, {
                            "content": "button-{open}",
                            "result": "button-{$0}",
                            "vars": ["$0"],
                            "expressions": ["open"]
                        }, {
                            "content": "{exClass}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": ["exClass"]
                        }]
                }
            },
            "static": {},
            "dynamic": {},
            "children": [{
                    "path": "0,0",
                    "type": "text",
                    "data": {
                        "content": "{(state.content||data)}",
                        "result": "{$0}",
                        "vars": ["$0"],
                        "expressions": [{
                                "content": "(state.content||data)",
                                "vars": ["state.content", "data", "$0"],
                                "values": ["$0"],
                                "expressions": ["(this.getState(\"content\")||this.data)"]
                            }]
                    },
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }],
            "dynamicSummary": {
                "state.content": {
                    "data": {
                        "0,0": {
                            "content": "{(state.content||data)}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "(state.content||data)",
                                    "vars": ["state.content", "data", "$0"],
                                    "values": ["$0"],
                                    "expressions": ["(this.getState(\"content\")||this.data)"]
                                }]
                        }
                    }
                },
                "data": {
                    "data": {
                        "0,0": {
                            "content": "{(state.content||data)}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "(state.content||data)",
                                    "vars": ["state.content", "data", "$0"],
                                    "values": ["$0"],
                                    "expressions": ["(this.getState(\"content\")||this.data)"]
                                }]
                        }
                    }
                }
            },
            "tagName": "div",
            "enableStates": ["hover", "selected", "disabled", "error", "open", {
                    "name": "content",
                    "type": "string",
                    "default": ""
                }, {
                    "name": "exClass",
                    "type": "string",
                    "default": ""
                }],
            "extend": "fmvc.View",
            "className": "Button",
            "moduleName": "ui"
        };
        return Button;
    })(fmvc.View);
    ui.Button = Button;
})(ui || (ui = {}));
///<reference path='../fmvc/d.ts'/>
/* start compiled view */
var test;
(function (test) {
    var TestButtons = (function (_super) {
        __extends(TestButtons, _super);
        function TestButtons(name, modelOrData, jsTemplate) {
            _super.call(this, name, modelOrData, jsTemplate);
        }
        TestButtons.prototype.createDom = function () {
            this.element = this.templateElement;
            this.b1 = this.componentPaths["0,13"] || this.elementPaths["0,13"];
            this.b2 = this.componentPaths["0,15"] || this.elementPaths["0,15"];
            this.b3 = this.componentPaths["0,17"] || this.elementPaths["0,17"];
            this.b4 = this.componentPaths["0,19"] || this.elementPaths["0,19"];
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        };
        Object.defineProperty(TestButtons.prototype, "jsTemplate", {
            get: function () {
                return TestButtons.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        TestButtons.__jsTemplate = {
            "path": "0",
            "type": "tag",
            "properties": {},
            "attribs": {
                "class": {
                    "static": ["containerButtons"],
                    "dynamic": []
                }
            },
            "static": {},
            "dynamic": {},
            "children": [{
                    "path": "0,0",
                    "type": "text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }, {
                    "path": "0,1",
                    "type": "tag",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {},
                    "children": [{
                            "path": "0,1,0",
                            "type": "text",
                            "data": "Simple div without anything",
                            "properties": {},
                            "attribs": {},
                            "static": {},
                            "dynamic": {}
                        }, {
                            "path": "0,1,1",
                            "type": "tag",
                            "properties": {},
                            "attribs": {},
                            "static": {},
                            "dynamic": {},
                            "children": [{
                                    "path": "0,1,1,0",
                                    "type": "text",
                                    "data": "ola!",
                                    "properties": {},
                                    "attribs": {},
                                    "static": {},
                                    "dynamic": {}
                                }],
                            "tagName": "b"
                        }, {
                            "path": "0,1,2",
                            "type": "text",
                            "data": "model data:",
                            "properties": {},
                            "attribs": {},
                            "static": {},
                            "dynamic": {}
                        }, {
                            "path": "0,1,3",
                            "type": "tag",
                            "properties": {},
                            "attribs": {},
                            "static": {},
                            "dynamic": {},
                            "children": [{
                                    "path": "0,1,3,0",
                                    "type": "text",
                                    "data": {
                                        "content": "{app.test.data.title}",
                                        "result": "{$0}",
                                        "vars": ["$0"],
                                        "expressions": ["app.test.data.title"]
                                    },
                                    "properties": {},
                                    "attribs": {},
                                    "static": {},
                                    "dynamic": {}
                                }],
                            "tagName": "i"
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,2",
                    "type": "text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }, {
                    "path": "0,3",
                    "type": "tag",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {},
                    "children": [{
                            "path": "0,3,0",
                            "type": "text",
                            "data": {
                                "content": "{app.test.data.title} - has model data, sure ?",
                                "result": "{$0} - has model data, sure ?",
                                "vars": ["$0"],
                                "expressions": ["app.test.data.title"]
                            },
                            "properties": {},
                            "attribs": {},
                            "static": {},
                            "dynamic": {}
                        }],
                    "tagName": "div",
                    "states": {
                        "content": "(app.test.state==='one')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='one')"]
                    }
                }, {
                    "path": "0,4",
                    "type": "text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }, {
                    "path": "0,5",
                    "type": "tag",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {},
                    "children": [{
                            "path": "0,5,0",
                            "type": "text",
                            "data": "State one",
                            "properties": {},
                            "attribs": {},
                            "static": {},
                            "dynamic": {}
                        }],
                    "tagName": "div",
                    "states": {
                        "content": "(app.test.state==='one')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='one')"]
                    },
                    "selected": "(app.test.state)"
                }, {
                    "path": "0,6",
                    "type": "text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }, {
                    "path": "0,7",
                    "type": "tag",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {},
                    "children": [{
                            "path": "0,7,0",
                            "type": "text",
                            "data": "State two button",
                            "properties": {},
                            "attribs": {},
                            "static": {},
                            "dynamic": {}
                        }],
                    "tagName": "ui.Button",
                    "states": {
                        "content": "(app.test.state==='two')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='two')"]
                    },
                    "selected": "(!!app.test.state)"
                }, {
                    "path": "0,8",
                    "type": "text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }, {
                    "path": "0,9",
                    "type": "tag",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {},
                    "children": [{
                            "path": "0,9,0",
                            "type": "text",
                            "data": "State three",
                            "properties": {},
                            "attribs": {},
                            "static": {},
                            "dynamic": {}
                        }],
                    "tagName": "div",
                    "states": {
                        "content": "(app.test.state==='three')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='three')"]
                    }
                }, {
                    "path": "0,10",
                    "type": "text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }, {
                    "path": "0,11",
                    "type": "tag",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {},
                    "children": [{
                            "path": "0,11,0",
                            "type": "tag",
                            "properties": {},
                            "attribs": {},
                            "static": {},
                            "dynamic": {},
                            "children": [{
                                    "path": "0,11,0,0",
                                    "type": "text",
                                    "data": {
                                        "content": "{app.test.state}",
                                        "result": "{$0}",
                                        "vars": ["$0"],
                                        "expressions": ["app.test.state"]
                                    },
                                    "properties": {},
                                    "attribs": {},
                                    "static": {},
                                    "dynamic": {}
                                }],
                            "tagName": "b"
                        }, {
                            "path": "0,11,1",
                            "type": "text",
                            "data": "- has model data, sure ?",
                            "properties": {},
                            "attribs": {},
                            "static": {},
                            "dynamic": {}
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,12",
                    "type": "text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }, {
                    "path": "0,13",
                    "type": "tag",
                    "properties": {},
                    "attribs": {
                        "content": "SimpleButtonContentFromProperty"
                    },
                    "static": {},
                    "dynamic": {},
                    "tagName": "ui.Button",
                    "link": "b1",
                    "selected": "(app.test.state)"
                }, {
                    "path": "0,14",
                    "type": "text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }, {
                    "path": "0,15",
                    "type": "tag",
                    "properties": {},
                    "attribs": {
                        "hover": "(data.hover)",
                        "exClass": "buttonOne"
                    },
                    "static": {},
                    "dynamic": {},
                    "children": [{
                            "path": "0,15,0",
                            "type": "text",
                            "data": "Selected TheContentFromContainer And Text 2",
                            "properties": {},
                            "attribs": {},
                            "static": {},
                            "dynamic": {}
                        }],
                    "tagName": "ui.Button",
                    "link": "b2",
                    "selected": "(app.test.state==='one')"
                }, {
                    "path": "0,16",
                    "type": "text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }, {
                    "path": "0,17",
                    "type": "tag",
                    "properties": {},
                    "attribs": {
                        "exClass": "buttonOne"
                    },
                    "static": {},
                    "dynamic": {},
                    "children": [{
                            "path": "0,17,0",
                            "type": "text",
                            "data": "Button 3 / And a lot of text",
                            "properties": {},
                            "attribs": {},
                            "static": {},
                            "dynamic": {}
                        }],
                    "tagName": "ui.Button",
                    "link": "b3",
                    "selected": "(app.test.state==='one')"
                }, {
                    "path": "0,18",
                    "type": "text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }, {
                    "path": "0,19",
                    "type": "tag",
                    "properties": {},
                    "attribs": {
                        "exClass": "buttonOne"
                    },
                    "static": {},
                    "dynamic": {},
                    "children": [{
                            "path": "0,19,0",
                            "type": "text",
                            "data": "Button 4 / And a lot of text",
                            "properties": {},
                            "attribs": {},
                            "static": {},
                            "dynamic": {}
                        }],
                    "tagName": "ui.Button",
                    "link": "b4",
                    "selected": "(app.test.state==='one')"
                }, {
                    "path": "0,20",
                    "type": "text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }],
            "links": [{
                    "name": "b1",
                    "value": "0,13"
                }, {
                    "name": "b2",
                    "value": "0,15"
                }, {
                    "name": "b3",
                    "value": "0,17"
                }, {
                    "name": "b4",
                    "value": "0,19"
                }],
            "dynamicSummary": {},
            "tagName": "div",
            "className": "TestButtons",
            "moduleName": "test",
            "enableStates": [null, null]
        };
        return TestButtons;
    })(fmvc.View);
    test.TestButtons = TestButtons;
})(test || (test = {}));
///<reference path='../fmvc/d.ts'/>
/* start compiled view */
var test;
(function (test) {
    var TestInput = (function (_super) {
        __extends(TestInput, _super);
        function TestInput(name, modelOrData, jsTemplate) {
            _super.call(this, name, modelOrData, jsTemplate);
        }
        TestInput.prototype.createDom = function () {
            this.element = this.templateElement;
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        };
        Object.defineProperty(TestInput.prototype, "jsTemplate", {
            get: function () {
                return TestInput.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        TestInput.__jsTemplate = {
            "path": "0",
            "type": "tag",
            "properties": {},
            "attribs": {},
            "static": {},
            "dynamic": {},
            "children": [{
                    "path": "0,0",
                    "type": "text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }, {
                    "path": "0,1",
                    "type": "tag",
                    "properties": {},
                    "attribs": {
                        "type": "text",
                        "value": {
                            "content": "@{data.firstname}",
                            "result": "@{$0}",
                            "vars": ["$0"],
                            "expressions": ["data.firstname"]
                        },
                        "state.custom": {
                            "content": "Wasa happens {data.firstname}?",
                            "result": "Wasa happens {$0}?",
                            "vars": ["$0"],
                            "expressions": ["data.firstname"]
                        },
                        "placeholder": {
                            "content": "{data.name|i18n.setFirstname}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": ["data.name|i18n.setFirstname"]
                        },
                        "customSetting": "{app.test.state}",
                        "maxlength": "{state.maxlength}"
                    },
                    "static": {},
                    "dynamic": {},
                    "tagName": "input"
                }, {
                    "path": "0,2",
                    "type": "text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }, {
                    "path": "0,3",
                    "type": "tag",
                    "properties": {},
                    "attribs": {
                        "class": {
                            "static": ["div-static"],
                            "dynamic": [{
                                    "content": "div-{state.hover}",
                                    "result": "div-{$0}",
                                    "vars": ["$0"],
                                    "expressions": ["state.hover"]
                                }, {
                                    "content": "div-{data.firstname}",
                                    "result": "div-{$0}",
                                    "vars": ["$0"],
                                    "expressions": ["data.firstname"]
                                }, {
                                    "content": "div-{data.secondname}",
                                    "result": "div-{$0}",
                                    "vars": ["$0"],
                                    "expressions": ["data.secondname"]
                                }]
                        },
                        "style": {
                            "static": [{
                                    "position": "absolute"
                                }, {
                                    "top": "0px"
                                }, {}],
                            "dynamic": [{
                                    "background-color": {
                                        "content": "{data.color}",
                                        "result": "{$0}",
                                        "vars": ["$0"],
                                        "expressions": ["data.color"]
                                    }
                                }]
                        }
                    },
                    "static": {},
                    "dynamic": {},
                    "children": [{
                            "path": "0,3,0",
                            "type": "text",
                            "data": "Data",
                            "properties": {},
                            "attribs": {},
                            "static": {},
                            "dynamic": {}
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,4",
                    "type": "text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }],
            "dynamicSummary": {},
            "tagName": "div",
            "className": "TestInput",
            "moduleName": "test",
            "enableStates": [null, null]
        };
        return TestInput;
    })(fmvc.View);
    test.TestInput = TestInput;
})(test || (test = {}));
//# sourceMappingURL=fmvc.dev.js.map