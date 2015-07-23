var fmvc;
(function (fmvc) {
    var BrowserUtils = (function () {
        function BrowserUtils() {
        }
        BrowserUtils.getClient = function () {
            return bowser;
        };
        return BrowserUtils;
    })();
    fmvc.BrowserUtils = BrowserUtils;
})(fmvc || (fmvc = {}));
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
    fmvc.VERSION = '0.8.0';
    fmvc.TYPE_MEDIATOR = 'mediator';
    fmvc.TYPE_MODEL = 'model';
    fmvc.TYPE_VIEW = 'view';
    fmvc.DefaultModel = {
        locale: 'locale',
        i18n: 'i18n',
        theme: 'theme',
        log: 'log'
    };
    var Facade = (function () {
        function Facade(name, root, theme, locale, i18nDict) {
            if (theme === void 0) { theme = ''; }
            if (locale === void 0) { locale = 'ru'; }
            if (i18nDict === void 0) { i18nDict = {}; }
            this._name = '';
            this._events = {};
            this.model = {};
            this.mediator = {};
            // Уникальное имя приложения
            this._name = name;
            // Контейнер приложения
            this._root = root;
            // Регистрируем в синглтоне приложений среды (в дальнейшем используется для взаимойдействий между приложениями)
            Facade.__facades[name] = this;
            // создание модели логгера
            var logModel = new fmvc.Logger(fmvc.DefaultModel.log);
            // записываем модель в фасад (для глобального доступа и обработки событий из модели)
            this.register(logModel);
            // Модель локали, содержит строку указывающую на локализацию
            var localeModel = new fmvc.Model(fmvc.DefaultModel.locale, { value: locale });
            // Модель темы, содержит строку указывающую на тему
            var themeModel = new fmvc.Model(fmvc.DefaultModel.theme, { value: theme });
            // Объект содержащий глобальные данные i18n
            var i18nModel = new fmvc.Model(fmvc.DefaultModel.i18n, i18nDict);
            // Добавляем модели по умолчанию в фасад
            this.register([localeModel, i18nModel, themeModel]);
            this.log('Старт приложения ' + name + ', fmvc версия ' + fmvc.VERSION);
            this.init();
        }
        // В насдедниках переписываем метод, в нем добавляем доменные модели, прокси, медиаторы
        Facade.prototype.init = function () {
        };
        // Регистрация объкта система - модели, медиатора
        // Модели, содержат данные, генерируют события моделей
        // Медиаторы, содержат отображения, а тажке генерируют, проксируют события отображения, слушают события модели
        Facade.prototype.register = function (objects) {
            var _this = this;
            if (_.isArray(objects)) {
                _.each(objects, this.register, this);
            }
            else {
                var object = (objects);
                object.facade = this;
                this.log('Register ' + object.name + ', ' + object.type);
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
            }
            return this;
        };
        // Удаление объекта системы - модели, медиатора
        Facade.prototype.unregister = function (objects) {
            if (_.isArray(objects)) {
                _.each(objects, this.unregister, this);
            }
            else {
                var object = (objects);
                this.log('Unregister ' + object.name + ', ' + object.type);
                object.dispose();
                switch (object.type) {
                    case fmvc.TYPE_MODEL:
                        delete this.model[object.name];
                        break;
                    case fmvc.TYPE_MEDIATOR:
                        delete this.model[object.name];
                        this.removeListener((object));
                        break;
                }
            }
            return this;
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
        Object.defineProperty(Facade.prototype, "root", {
            get: function () {
                return this._root;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Facade.prototype, "locale", {
            // Текущее значение локали
            get: function () {
                return this.model[fmvc.DefaultModel.locale].data.value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Facade.prototype, "theme", {
            // Текущее значение темы
            get: function () {
                return this.model[fmvc.DefaultModel.locale].data.value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Facade.prototype, "i18n", {
            // i18n
            get: function () {
                return this.model[fmvc.DefaultModel.i18n].data;
            },
            enumerable: true,
            configurable: true
        });
        // Глобальный получатель событий от системы
        Facade.prototype.eventHandler = function (e) {
            var objects = this._events[e.name];
            _.each(objects, function (object) { return object.eventHandler(e); });
        };
        Object.defineProperty(Facade.prototype, "logger", {
            get: function () {
                return (this.model[fmvc.DefaultModel.log]);
            },
            enumerable: true,
            configurable: true
        });
        Facade.prototype.log = function (message, level) {
            if (this.logger) {
                this.logger.add(this._name, message, level);
            }
            else {
                console.log(this._name, message, level);
            }
            return this;
        };
        // Получение фасада приложения по имени
        Facade.getInstance = function (name) {
            return this.__facades[name];
        };
        Facade.__facades = {};
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
            this._type = type ? type : fmvc.TYPE_MODEL;
        }
        Object.defineProperty(Notifier.prototype, "facade", {
            get: function () {
                return this._facade;
            },
            set: function (value) {
                if (value) {
                    this._facade = value;
                    this.registerHandler();
                }
                else {
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
        // Послаем сообщение сначала в фасад, потом частным слушателям (для моделей)
        Notifier.prototype.sendEvent = function (name, data, sub, error, log) {
            if (data === void 0) { data = null; }
            if (sub === void 0) { sub = null; }
            if (error === void 0) { error = null; }
            if (log === void 0) { log = true; }
            var e = { name: name, sub: sub, data: data, error: error, target: this };
            this.log('Send event ' + name);
            if (this._listeners && this._listeners.length)
                this._sendToListners(e);
            if (this._facade)
                this._facade.eventHandler(e);
        };
        Notifier.prototype.log = function (message, level) {
            // @todo remove facade reference
            if (this._facade)
                this._facade.logger.add(this.name, message, level);
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
        Notifier.prototype.unbind = function (object, handler) {
            this.removeListener(object, handler);
            return this;
        };
        Notifier.prototype.addListener = function (object, handler) {
            if (!this._listeners)
                this._listeners = [];
            var yetListener = _.filter(this._listeners, function (v) { return v.handler === handler; });
            if (!(yetListener && yetListener.length))
                this._listeners.push({ target: object, handler: handler });
            else
                console.warn('Try duplicate listener of ', this.name);
            return this;
        };
        Notifier.prototype.removeListener = function (object, handler) {
            var deleted = 0;
            this._listeners.forEach(function (lo, i) {
                if (lo.target === object) {
                    this.splice(i - deleted, 1);
                    deleted++;
                }
            }, this._listeners);
            return this;
        };
        Notifier.prototype.removeAllListeners = function () {
            this._listeners = null;
        };
        Notifier.prototype._sendToListners = function (e) {
            this._listeners.forEach(function (lo) {
                if (!lo.target.disposed)
                    (lo.handler).call(lo.target, e);
            });
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
/**
 * Created by Vasily on 19.06.2015.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    fmvc.BrowserEvent = {
        CLICK: 'click',
        KEYUP: 'keyup',
        KEYDOWN: 'keydown',
        MOUSEOVER: 'mouseover',
        MOUSEOUT: 'mouseout',
        CHANGE: 'change'
    };
    fmvc.SpecialEvent = {
        ACTION: 'action',
        SWIPE: 'swipe',
        PAN: 'pan',
        PINCH: 'pinch',
        TAP: 'tap',
        DRAG: 'drag' // start,end,move
    };
    fmvc.browserElementEvents = [fmvc.BrowserEvent.MOUSEOUT, fmvc.BrowserEvent.MOUSEOVER, fmvc.BrowserEvent.CLICK];
    fmvc.browserWindowEvents = [fmvc.BrowserEvent.KEYDOWN, fmvc.BrowserEvent.KEYUP];
    fmvc.specialEvents = [fmvc.SpecialEvent.ACTION];
    var EventDispatcher = (function (_super) {
        __extends(EventDispatcher, _super);
        function EventDispatcher() {
            _super.call(this, EventDispatcher.NAME, 'controller');
            //private elementIdMap = {};
            this.executionMap = {};
            this.windowHandlerMap = {};
            _.bindAll(this, 'browserHandler');
        }
        EventDispatcher.prototype.listen = function (el, type, handler, context) {
            var id = el.getAttribute('id');
            if (!id || !type || !handler) {
                console.warn('Incorrect listener on ', el, id, type);
                return;
            }
            this.executionMap[id] = this.executionMap[id] || {};
            var listenerData = { handler: handler, context: context };
            if (!this.executionMap[id][type]) {
                this.executionMap[id][type] = [listenerData];
            }
            else {
                this.executionMap[id][type].push(listenerData);
            }
            console.log('Create listener ', id, type, this.executionMap[id]);
            this.__createListener(el, id, type, handler, context);
            return this;
        };
        EventDispatcher.prototype.__createListener = function (el, id, type, handler, context) {
            if (_.contains(fmvc.browserWindowEvents, type))
                this.__createWindowListener(el, type);
            else if (_.contains(fmvc.browserElementEvents, type))
                this.__createElementListener(el, type);
            else if (_.contains(fmvc.specialEvents, type))
                this.__createSpecialListener(el, type);
            else
                console.warn('create listener for %s not found', type);
        };
        EventDispatcher.prototype.__removeListener = function (el, id, type) {
            var id = id || el.getAttribute('id');
            if (_.contains(fmvc.browserElementEvents, type)) {
                el.removeEventListener(type, this.browserHandler);
            }
        };
        EventDispatcher.prototype.__createElementListener = function (el, type) {
            //console.log('Element listener of %s , %s' , el, type);
            el.addEventListener(type, this.browserHandler);
        };
        EventDispatcher.prototype.__createWindowListener = function (el, type) {
            //console.log('Browser listener of %s , %s' , el, type);
            if (!this.windowHandlerMap[type])
                this.createWindowListener(type);
        };
        EventDispatcher.prototype.__createSpecialListener = function (el, type) {
            console.warn('create special listener for %s not implemented', type);
        };
        EventDispatcher.prototype.unlistenAll = function (el) {
            var id = el.getAttribute('id');
            if (!id)
                return;
            _.each(this.executionMap[id], function (handlerObjectsArray, type) {
                el.removeEventListener(type, this.browserHandler);
                _.each(handlerObjectsArray, function (handlerObject) {
                    delete handlerObject.handler;
                    delete handlerObject.context;
                });
            }, this);
            delete this.executionMap[id];
            //delete this.elementIdMap[id];
        };
        EventDispatcher.prototype.unlisten = function (el, type) {
            var id = el.getAttribute('id');
            if (!id || !this.executionMap[id]) {
                console.warn('Cant unlisten ', el, id, type);
                return;
            }
            var handlerObjectsArray = this.executionMap[id][type];
            el.removeEventListener(type, this.browserHandler);
            _.each(handlerObjectsArray, function (handlerObject) {
                delete handlerObject.handler;
                delete handlerObject.context;
            });
            delete this.executionMap[id][type];
        };
        EventDispatcher.prototype.browserHandler = function (e) {
            var el = e.currentTarget || e.target;
            var id = el.getAttribute('id');
            var type = e.type;
            if (!id)
                return;
            console.log(id, type, this.executionMap[id]);
            if (this.executionMap[id] && this.executionMap[id][type]) {
                var handlerObjectsArray = this.executionMap[id][type];
                _.each(handlerObjectsArray, function (handlerObject) {
                    handlerObject.handler.call(handlerObject.context, e);
                });
            }
        };
        EventDispatcher.prototype.createWindowListener = function (type) {
            this.windowHandlerMap[type] = true;
            window.addEventListener(type, this.browserHandler, true);
        };
        EventDispatcher.NAME = 'EventDispatcher';
        return EventDispatcher;
    })(fmvc.Notifier);
    fmvc.EventDispatcher = EventDispatcher;
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    fmvc.ModelState = {
        None: 'none',
        Parsing: 'parsing',
        Parsed: 'parsed',
        Loading: 'loading',
        Loaded: 'loaded',
        Updating: 'updating',
        Syncing: 'syncing',
        Synced: 'synced',
        Changed: 'changed',
        Complete: 'complete',
        Error: 'error',
    };
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(name, data, opts) {
            if (data === void 0) { data = {}; }
            _super.call(this, name);
            this._state = null;
            this._source = false;
            this._queue = null;
            this.enabledEvents = true;
            this.enabledState = true;
            this.watchChanges = true;
            if (opts)
                _.extend(this, opts);
            if (data)
                this.data = data;
            if (data)
                this.setState(fmvc.ModelState.Synced);
        }
        Model.prototype.setState = function (value) {
            if (!this.enabledState || this._state === value)
                return this;
            this._prevState = value;
            this._state = value;
            this.sendEvent(fmvc.Event.Model.StateChanged, this._state);
            return this;
        };
        Model.prototype.parseValue = function (value) {
            var result = null;
            var prevData = this._data;
            var changes = null;
            var hasChanges = false;
            if (value instanceof Model) {
                throw Error('Cant set model data, data must be object, array or primitive');
            }
            if (_.isObject(prevData) && _.isObject(value) && this.watchChanges) {
                for (var i in value) {
                    if (prevData[i] !== value[i]) {
                        if (!changes)
                            changes = {};
                        hasChanges = true;
                        changes[i] = value[i];
                        prevData[i] = value[i];
                    }
                }
                // if watch object property change
                if (hasChanges)
                    this.sendEvent(fmvc.Event.Model.Changed, changes);
                result = prevData;
            }
            else {
                // primitive || array || object && !watchChanges , no data && any value (object etc)
                if (prevData !== value) {
                    result = (_.isObject(prevData) && _.isObject(value)) ? _.extend({}, prevData, value) : value;
                }
            }
            return result;
        };
        Model.prototype.reset = function () {
            this._data = null;
            return this;
        };
        Object.defineProperty(Model.prototype, "data", {
            get: function () {
                return this.getData();
            },
            set: function (value) {
                this.setData(value);
            },
            enumerable: true,
            configurable: true
        });
        Model.prototype.setData = function (value) {
            var previousData = this._data;
            var result = this.parseValue(value);
            // for primitive, arrays, objects with no changes
            // console.log('[' + this.name + ']: New prev, new data ' + this._data + ', ' + result);
            if (previousData !== result) {
                this._data = result;
                this.sendEvent(fmvc.Event.Model.Changed, this._data);
            }
        };
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
        Model.prototype.sendEvent = function (name, data, sub, error, log) {
            if (data === void 0) { data = null; }
            if (sub === void 0) { sub = null; }
            if (error === void 0) { error = null; }
            if (log === void 0) { log = true; }
            if (this.enabledEvents)
                _super.prototype.sendEvent.call(this, name, data, sub, error, log);
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
    var TypeModel = (function (_super) {
        __extends(TypeModel, _super);
        function TypeModel(name, data, opts) {
            _super.call(this, name, data, opts);
        }
        Object.defineProperty(TypeModel.prototype, "data", {
            get: function () {
                return this.getData();
            },
            enumerable: true,
            configurable: true
        });
        return TypeModel;
    })(Model);
    fmvc.TypeModel = TypeModel;
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
                result = _.reduce(this._resultMethods, function (memo, method) { return method.call(this, memo); }, sourcesResult, this);
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
            this.model.setState(fmvc.ModelState.Loading);
            this.async($.ajax, [object], $, { done: fmvc.ModelState.Loaded, fault: fmvc.ModelState.Error });
            return this;
        };
        ModelQueue.prototype.loadXml = function (object) {
            var defaultAjaxRequestObject = _.defaults(object, { method: 'GET', dataType: 'xml', data: { rnd: (Math.round(Math.random() * 1000000)) } });
            return this.load(defaultAjaxRequestObject);
        };
        ModelQueue.prototype.parse = function (method) {
            this.model.setState(fmvc.ModelState.Parsing);
            this.sync(method, [this.model], this, { done: fmvc.ModelState.Parsed, fault: fmvc.ModelState.Error });
            return this;
        };
        ModelQueue.prototype.async = function (getPromiseMethod, args, context, states) {
            var deferred = $.Deferred();
            var queuePromise = this.setup();
            var t = this;
            queuePromise.then(function done(value) {
                (getPromiseMethod.apply(context, args)).then(function successPromise(result) { console.log('Async success ', result); deferred.resolve(result); }, function faultPromise(result) { console.log('Async fault ', arguments); deferred.reject(result); t.executeError(result); });
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
            $.when(this.currentPromise).then(function doneQueue(value) { queueDeferred.resolve(value); }, function faultQueue() { queueDeferred.reject(); });
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
        Logger.prototype.add = function (name, message, level) {
            if (level === void 0) { level = 0; }
            var data = { name: name, message: message, level: level, date: new Date() };
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
                console.log('[' + name + '] ' + level + ' ' + message);
            }
            // clean: remove part of logs
            if (dataArray.length > config.length * 2) {
                dataArray.splice(0, dataArray.length - this._config.length);
            }
            // send event
            if (this.enabledEvents)
                this.sendEvent('log', data, null, null, false);
            return this;
        };
        return Logger;
    })(fmvc.Model);
    fmvc.Logger = Logger;
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    fmvc.Type = {
        String: 'string',
        Int: 'int',
        Float: 'float',
        Boolean: 'boolean'
    };
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    fmvc.global = window || {};
    console.log('Global is ' + fmvc.global);
    fmvc.State = {
        SELECTED: 'selected',
        HOVER: 'hover',
        FOCUSED: 'focused',
        DISABLED: 'disabled',
        OPEN: 'open'
    };
    fmvc.DomObjectType = {
        TEXT: 'text',
        TAG: 'tag',
        COMMENT: 'comment'
    };
    fmvc.Filter = {
        FIRST: 'first',
        SECOND: 'second'
    };
    var View = (function (_super) {
        __extends(View, _super);
        function View(name, modelOrData, jsTemplate) {
            _super.call(this, name, fmvc.TYPE_VIEW);
            this._data = null;
            this.dynamicPropertyValue = {}; // те которые были установлены
            this.elementPaths = {};
            this.componentPaths = {};
            this.handlers = {};
            // Invalidate properties
            this._invalidateTimeout = 0;
            this._invalidate = 0;
            this._inDocument = false;
            this._avaibleInheritedStates = null;
            this._locale = 'ru';
            this._id = null;
            this.tmp = {};
            _.bindAll(this, 'getDataStringValue', 'applyEventHandlers', 'invalidateHandler', 'appModelHandler' /*, 'getDataObjectValue'*/);
            this.template = this.jsTemplate;
            if (modelOrData) {
                if (modelOrData.type === fmvc.TYPE_MODEL)
                    this.model = modelOrData;
                else
                    this.data = modelOrData;
            }
            this.enableStates(null);
            this.initTemplate(jsTemplate);
            this.init();
            this.invalidateHandler = this.invalidateHandler.bind(this);
        }
        View.prototype.initTemplate = function (templateExtention) {
            if (templateExtention)
                this.template = (_.extend(_.clone(this.template), templateExtention));
            if (this.template && this.template.enableStates)
                this.enableStates(this.template.enableStates);
        };
        // @override
        View.prototype.init = function () {
        };
        View.prototype.render = function (parent) {
            this.parentElement = parent;
            this.createDom();
            this.parentElement.appendChild(this.element);
            this.updateDom();
            this.enterDocument();
            this.updateChildren();
        };
        View.prototype.updateChildren = function () {
        };
        Object.defineProperty(View.prototype, "id", {
            // @memorize
            get: function () {
                if (!this._id) {
                    this._id = (_.property('staticAttributes')(this.jsTemplate) ? this.jsTemplate.staticAttributes['id'] : null) || ViewHelper.getId();
                }
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        //------------------------------------------------------------------------------------------------
        // Dom
        //------------------------------------------------------------------------------------------------
        View.prototype.createDom = function () {
            this.element = document.createElement('div');
            this.childrenContainer = this.element;
            return this;
        };
        View.prototype.enableStates = function (states) {
            this._states = {};
            this._statesType = {};
            _.each(states, function (value) {
                if (_.isString(value)) {
                    var svalue = (value);
                    this._states[svalue] = false;
                }
                else if (_.isObject(value)) {
                    var ivalue = (value);
                    this._statesType[ivalue.name] = ivalue.type;
                    this._states[ivalue.name] = ivalue.value || ivalue.default;
                }
            }, this);
        };
        View.prototype.updateDom = function () {
            if (!this.dynamicProperties)
                return;
            //this.element = document.createElement('div');
            _.each(this._states, function (stateValue, stateName) {
                if (this.dynamicProperties[stateName] && stateValue != this.dynamicPropertyValue[stateName])
                    this.updateDynamicProperty(stateName, stateValue);
            }, this);
            this.updateI18N();
            //this.updateData();
        };
        View.prototype.updateI18N = function () {
            if (!this.dynamicProperties)
                return;
            if (!this.i18n)
                return;
            _.each(this.i18n, function (value, name) {
                if (_.isObject(value)) {
                }
                else {
                    var prefix = 'i18n.';
                    this.dynamicProperties[prefix + name] ? this.updateDynamicProperty(prefix + name, value) : null;
                }
            }, this);
        };
        View.prototype.updateData = function (data, prefix, depth) {
            if (prefix === void 0) { prefix = 'data.'; }
            if (depth === void 0) { depth = 0; }
            if (!this.dynamicProperties || !data || !depth)
                return;
            depth--;
            _.each(data, function (value, name) {
                var nextPrefix = prefix + name + '.';
                if (_.isObject(value) && depth) {
                    this.updateData(value, nextPrefix, depth);
                }
                else {
                    this.dynamicProperties[prefix + name] ? this.updateDynamicProperty(prefix + name, value) : null;
                }
            }, this);
        };
        View.prototype.updateApp = function () {
            if (!this.dynamicProperties || !this.app)
                return;
            var appProps = _.filter(_.keys(this.dynamicProperties), function (v) { return v.indexOf('app.') === 0; });
            _.each(appProps, function (name) {
                this.updateAppProp(name);
            }, this);
        };
        View.prototype.updateAppProp = function (name) {
            var appValue = eval('this.' + name);
            this.updateDynamicProperty(name, appValue);
        };
        // @todo
        View.prototype.getStyleValue = function (name) {
        };
        View.prototype.getClassStringValue = function (propertyName, propertyValue, templateString) {
            if (_.isBoolean(propertyValue)) {
                return templateString.replace('{' + propertyName + '}', propertyName);
            }
            else {
                return templateString.replace('{' + propertyName + '}', propertyValue);
            }
        };
        View.prototype.getDataStringValue = function (propertyName, propertyValue, strOrExOrMEx) {
            if (_.isString(strOrExOrMEx)) {
                return strOrExOrMEx.replace('{' + propertyName + '}', propertyValue);
            }
            else if (_.isObject(strOrExOrMEx)) {
                return this.executeMultiExpression(strOrExOrMEx);
            }
        };
        View.prototype.executeFilters = function (value, filters) {
            if (!filters || !filters.length)
                return value;
            return _.reduce(filters, function (memo, filter, index) {
                if (filter.indexOf('i18n.') === 0)
                    return this.getFormattedMessage(this.i18n[filter.replace('i18n.', '')], memo);
                else
                    return this.executePlainFilter(filter, memo);
            }, value, this);
        };
        View.prototype.executePlainFilter = function (filter, value) {
            switch (filter) {
                case 'hhmmss':
                    return ViewHelper.hhmmss(value);
                case fmvc.Filter.FIRST:
                    return 'first:' + value;
                    break;
                case fmvc.Filter.SECOND:
                    return 'second:' + value;
                    break;
            }
            return value;
        };
        /*
        public getDataObjectValue(propertyName, propertyValue, templateObject:any):string {
            var getFilterValue = function (reducedValue:string, filter:string | string[]):string {
                if(_.isArray(filter)) {
                    if(filter[0] === 'i18n') {
                        var secondName = filter[1];
                        if (!this.i18n[secondName]) return 'Error:View.getDataObjectValue has no i18n property';
                        var data:any = {};
                        _.each(templateObject.args, function (value:string, key:string) {
                            if (value) data[key] = this.data[value.replace('data.', '')];
                        }, this);
                        var result = this.getFormattedMessage(this.i18n[secondName], data);
                        return templateObject.source.replace('{replace}', result);
                    }
                    else {
                        return this.executeComplexFilter(filter, reducedValue);
                    }
                }
                else {
                    return this.executePlainFilter(filter, reducedValue);
                }
            };

            return _.reduce(templateObject.filters, getFilterValue, propertyValue, this);
        }
        */
        View.prototype.updatePaths = function (paths, type, name, value, GetValue, each) {
            _.each(paths, function (valueOrValues, path) {
                var r = '';
                if (_.isString(valueOrValues)) {
                    var result = GetValue(name, value, valueOrValues);
                    r += result;
                    if (each)
                        this.updatePathProperty(path, type, name, value, result, valueOrValues);
                }
                else if (_.isArray(valueOrValues)) {
                    _.each(valueOrValues, function (stringValue) {
                        var result = GetValue(name, value, stringValue);
                        r += result;
                        if (each)
                            this.updatePathProperty(path, type, name, value, stringValue);
                    }, this);
                }
                else if (_.isObject(valueOrValues)) {
                    var result = GetValue(name, value, valueOrValues);
                    r += result;
                    if (each)
                        this.updatePathProperty(path, type, name, value, result);
                }
                if (!each)
                    this.updatePathProperty(path, type, name, value, r);
            }, this);
        };
        View.prototype.updateDynamicProperty = function (name, value) {
            var domPropsObject = this.dynamicProperties[name];
            this.dynamicPropertyValue[name] = value;
            if (!domPropsObject)
                return;
            _.each(domPropsObject, function (pathsAndValues, type) {
                var GetValue = null;
                var each = false;
                switch (type) {
                    case 'class':
                        GetValue = this.getClassStringValue;
                        each = true;
                        break;
                    case 'style':
                        GetValue = this.getDataStringValue;
                        break;
                    case 'data':
                        GetValue = this.getDataStringValue;
                        break;
                    default:
                        GetValue = this.getDataStringValue;
                        break;
                }
                this.updatePaths(pathsAndValues, type, name, value, GetValue, each);
            }, this);
        };
        View.prototype.updatePathProperty = function (path, type, name, value, resultValue, template) {
            var element = this.elementPaths[path];
            if (!(element && element.nodeType !== 8 /* comment */))
                return; // virtual element or comment
            //console.log('updated element ', path, type, value, resultValue);
            switch (type) {
                case 'selected':
                    var view = this.componentPaths[path];
                    if (view) {
                        console.log('Selected: path %s, type %s, name %s, result %s ', path, type, name, resultValue, _.isString(resultValue), view);
                        view.setState(type, (resultValue === 'false' ? false : !!resultValue));
                    }
                    break;
                case 'class':
                    console.log('Class: path %s, type %s, name %s, value %s, result %s, template %s, ', path, type, name, value, resultValue, template, this);
                    var prevClassValue;
                    // удаляем предыдушее значение для sting типов значения классов
                    if (template && !!(prevClassValue = this.tmp[template])) {
                        if (prevClassValue === resultValue)
                            return;
                        element.classList.toggle(prevClassValue, false);
                        this.tmp[template] = resultValue;
                    }
                    try {
                        element.classList.toggle(resultValue, !!value);
                    }
                    catch (e) {
                        console.log(e);
                    }
                    View.Counters.update.class++;
                    break;
                case 'style':
                    var style = resultValue.split(':');
                    var propName = style[0].trim();
                    style.splice(0, 1);
                    var propValue = style.join(':');
                    element.style[propName] = propValue;
                    View.Counters.update.style++;
                    break;
                case 'data':
                    //console.log('Set data ', element, element.nodeType, element.textContent);
                    if (element.nodeType === 3 && element.textContent != resultValue)
                        element.textContent = resultValue;
                    View.Counters.update.data++;
                    break;
                default:
                    element.setAttribute(type, resultValue);
                    View.Counters.update.other++;
                    break;
            }
        };
        View.prototype.getElementByPath = function (element /* Element */, path, root) {
            if (root === void 0) { root = false; }
            if (!this.element)
                throw Error('cant get element by path');
            //console.log('get path of ' , path, element);
            if (root)
                return element;
            if (path && path.length && element && element.childNodes.length) {
                var index = path.splice(0, 1)[0];
                return this.getElementByPath(element.childNodes[parseInt(index, 10)], path);
            }
            else {
                return element;
            }
        };
        Object.defineProperty(View.prototype, "inDocument", {
            get: function () {
                return this._inDocument;
            },
            enumerable: true,
            configurable: true
        });
        //------------------------------------------------------------------------------------------------
        // Event handlers
        //------------------------------------------------------------------------------------------------
        View.prototype.enterDocument = function () {
            var _this = this;
            if (this._inDocument)
                return;
            this._inDocument = true;
            var t = this;
            if (!this.isDynamicStylesEnabled())
                this.enableDynamicStyle(true);
            ViewHelper.setIfNotExistAttribute(this.element, 'id', this.id);
            if (this.hasState(fmvc.State.HOVER)) {
                this.dispatcher.listen(this.element, fmvc.BrowserEvent.MOUSEOVER, function () { return t.setState(fmvc.State.HOVER, true); });
                this.dispatcher.listen(this.element, fmvc.BrowserEvent.MOUSEOUT, function () { return t.setState(fmvc.State.HOVER, false); });
            }
            if (this.hasState(fmvc.State.SELECTED)) {
                this.dispatcher.listen(this.element, fmvc.BrowserEvent.CLICK, function () { return t.setState(fmvc.State.SELECTED, !t.getState(fmvc.State.SELECTED)); });
            }
            this.enterDocumentElement(this.jsTemplate, this.elementPaths);
            this.invalidate(1 | 2);
            var appModels = _.filter(_.keys(this.dynamicProperties), function (v) { return v.indexOf('app.') === 0; });
            var modelNames = _.map(appModels, function (v) { return v.split('.')[1]; });
            _.each(modelNames, function (n) { return (_this.app[n]).bind(_this, _this.appModelHandler); }, this);
        };
        View.prototype.appModelHandler = function (e) {
            var _this = this;
            if (!this._inDocument)
                return;
            console.log('AppModelHandler: ', e.target.name, ' view: ', this.name, ', ', JSON.stringify(e.target.data));
            var modelName = e.target.name;
            var appProps = _.filter(_.keys(this.dynamicProperties), function (v) { return v.indexOf('app.' + modelName) === 0; });
            _.each(appProps, function (n) { return _this.updateAppProp(n); }, this);
            this.applyChangeStateElement(this.jsTemplate, this.elementPaths);
        };
        View.prototype.exitDocument = function () {
            var _this = this;
            var appModels = _.filter(_.keys(this.dynamicProperties), function (v) { return v.indexOf('app.') === 0; });
            var modelNames = _.map(appModels, function (v) { return v.split('.')[1]; });
            _.each(modelNames, function (n) { return (_this.app[n]).unbind(_this, _this.appModelHandler); }, this);
            this.dispatcher.unlistenAll(this.element);
            this._inDocument = false;
        };
        View.prototype.applyEventHandlers = function (e) {
            var path = e.currentTarget.getAttribute('data-path');
            var name = this.handlers[path][e.type];
            e.stopPropagation();
            if (name === 'stopPropagation') {
                e.stopPropagation();
            }
            else {
                if (name.indexOf(',')) {
                    var commands = name.split(',');
                    if (commands[0] === 'set') {
                        var objectTo = commands[1].split('.');
                        var objectProperty = objectTo[1].trim();
                        if (this.model) {
                            var result = {};
                            result[objectProperty] = e.target.value;
                            this.model.data = result;
                        }
                        if (this._data) {
                            this._data[objectProperty] = e.target.value;
                        }
                    }
                }
            }
            this.elementEventHandler(name, e);
        };
        // @to override with custom actions
        // if(name==='any') make something
        // if(name==='exit') make exit
        View.prototype.elementEventHandler = function (name, e) {
            //console.log('Event to handle ', name, e);
            this.mediator.viewEventHandler({ name: name, target: this, event: e });
        };
        View.prototype.enterDocumentElement = function (value, object) {
            if (!value || !object)
                return;
            var path = value.path;
            var e = object[value.path];
            var isTag = e.nodeType === 1;
            var c = this.componentPaths[value.path];
            //if(c) console.log('Create listeners ? ', c , e, value.handlers);
            if (c)
                c.enterDocument();
            if (value.type === fmvc.DomObjectType.TAG && isTag) {
                //console.log('EnterDocument ', value.tagName, value.path);
                _.each(value.children, function (child, index) {
                    this.enterDocumentElement(child, object);
                }, this);
                // add global handlers if not exist
                //if(c) console.log('Create listeners : ', c , e, value.handlers);
                if (value.handlers) {
                    var id = value.staticAttributes ? value.staticAttributes['id'] : null || ViewHelper.getId();
                    ViewHelper.setIfNotExistAttribute(e, 'id', id);
                    _.each(value.handlers, function (name, eventType) {
                        if (!this.handlers[path] || !this.handlers[path][eventType]) {
                            if (!this.handlers[path])
                                this.handlers[path] = {};
                            this.handlers[path][eventType] = name;
                            e.setAttribute('data-path', path);
                            this.dispatcher.listen(e, eventType, this.applyEventHandlers);
                        }
                    }, this);
                }
                else {
                }
            }
        };
        View.prototype.exitDocumentElement = function (value, object) {
            if (!value || !object)
                return;
            var path = value.path;
            var e = object[value.path];
            var isTag = e.nodeType === 1;
            var c = this.componentPaths[value.path];
            if (c)
                c.exitDocument();
            if (value.type === fmvc.DomObjectType.TAG && isTag) {
                //console.log('ExitDocument ', value.tagName, value.path);
                _.each(value.children, function (child, index) {
                    this.exitDocumentElement(child, object);
                }, this);
                // add global handlers if not exist
                if (value.handlers) {
                    _.each(value.handlers, function (name, eventType) {
                        //console.log('try remove listener ', e, value.tagName, path, eventType);
                        if (this.handlers[path] && this.handlers[path][eventType]) {
                            this.dispatcher.unlisten(e, eventType);
                            delete this.handlers[path][eventType];
                        }
                    }, this);
                }
            }
        };
        View.prototype.applyChangeStateElement = function (value, object) {
            if (!value || !object)
                return;
            var e = object[value.path];
            if (e) {
                _.each(value.children, function (child, index) {
                    this.applyChangeStateElement(child, object);
                }, this);
            }
            var isStated = !!value.states;
            if (!isStated)
                return;
            var isIncluded = value.states ? this.isStateEnabled(value.states) : true;
            //this.log(['Apply change state element: ' , value.path, isIncluded, value.states].join(', '));
            var isEnabled = (e.nodeType === 1);
            //console.log('path, included, enabled ', value.tagName, value.path, isIncluded, isEnabled);
            if (isIncluded && !isEnabled) {
                var newElement = this.getElement(value, object);
                var parentNode = e.parentNode;
                //console.log('Replace and disable ', e, value.path);
                parentNode.replaceChild(newElement, e);
                object[value.path] = newElement;
                this.enterDocumentElement(value, object);
                View.Counters.element.removed++;
            }
            else if (!isIncluded && isEnabled) {
                this.exitDocumentElement(value, object);
                var newElement = this.getElement(value, object);
                var parentNode = e.parentNode;
                //console.log('Replace and enable ', e, value.path);
                //console.log('Replace node on Comment ');
                parentNode.replaceChild(newElement, e);
                object[value.path] = newElement;
                View.Counters.element.removed++;
            }
            else {
            }
        };
        View.prototype.getFormattedMessage = function (value, data) {
            View.__formatter[value] = View.__formatter[value] ? View.__formatter[value] : this.getCompiledFormatter(value);
            return (View.__formatter[value](data));
        };
        View.prototype.getCompiledFormatter = function (value) {
            View.__messageFormat[this.locale] = View.__messageFormat[this.locale] ? View.__messageFormat[this.locale] : new MessageFormat(this.locale);
            return View.__messageFormat[this.locale].compile(value);
        };
        //------------------------------------------------------------------------------------------------
        // States
        //------------------------------------------------------------------------------------------------
        View.prototype.hasState = function (name) {
            return _.isBoolean(this._states[name]);
        };
        View.prototype.setStates = function (value) {
            var _this = this;
            _.each(value, function (v, k) { return _this.setState(k, v); }, this);
            return this;
        };
        View.prototype.setState = function (name, value) {
            if (!(name in this._states))
                return this;
            if (name in this._statesType)
                value = View.getTypedValue(value, this._statesType[name]);
            if (this._states[name] === value)
                return this;
            console.log('Set state ... ', name, value);
            this._states[name] = value;
            this.applyState(name, value);
            this.applyChildrenState(name, value);
            this.applyChangeStateElement(this.jsTemplate, this.elementPaths);
            return this;
        };
        View.prototype.getState = function (name) {
            return this._states[name];
        };
        View.prototype.applyState = function (name, value) {
            if (!this.dynamicProperties)
                return;
            if (this._inDocument)
                this.updateDynamicProperty(name, value);
        };
        View.prototype.applyChildrenState = function (name, value) {
        };
        View.prototype.applyChildState = function () {
        };
        Object.defineProperty(View.prototype, "avaibleInheritedStates", {
            get: function () {
                var _this = this;
                if (!this._avaibleInheritedStates) {
                    this._avaibleInheritedStates = _.filter(_.map(this._states, function (v, k) { return k; }), function (k) { return _this.inheritedStates.indexOf(k) > -1; }, this);
                }
                return this._avaibleInheritedStates;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "inheritedStates", {
            get: function () {
                return View.__inheritedStates;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "isSelected", {
            get: function () {
                return !!this.getState(fmvc.State.SELECTED);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "isHover", {
            get: function () {
                return !!this.getState(fmvc.State.HOVER);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "isFocused", {
            get: function () {
                return !!this.getState(fmvc.State.FOCUSED);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "isDisabled", {
            get: function () {
                return !!this.getState(fmvc.State.DISABLED);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "isOpen", {
            get: function () {
                return !!this.getState(fmvc.State.OPEN);
            },
            enumerable: true,
            configurable: true
        });
        //------------------------------------------------------------------------------------------------
        // VALIDATE
        //------------------------------------------------------------------------------------------------
        View.prototype.invalidate = function (type) {
            this._invalidate = this._invalidate | type;
            if (!this._invalidateTimeout)
                this._invalidateTimeout = setTimeout(this.invalidateHandler, 20);
        };
        View.prototype.invalidateHandler = function () {
            var _this = this;
            this.removeInvalidateTimeout();
            //console.log('invalid ' , this._invalidate , this._inDocument);
            if (!this._invalidate || !this._inDocument)
                return;
            if (this._invalidate & 1) {
                if (_.isObject(this.data))
                    this.updateData(this.data, 'data.', 2);
                else
                    this.updateDynamicProperty('data', this.data);
                this.updateApp();
            }
            if (this._invalidate & 2)
                _.each(this._states, function (value, key) { return value ? _this.applyState(key, value) : null; }, this);
            if (this._invalidate & 4) {
                this.updateChildren();
            }
            this._invalidate = 0;
        };
        View.prototype.removeInvalidateTimeout = function () {
            clearTimeout(this._invalidateTimeout);
            this._invalidateTimeout = null;
        };
        Object.defineProperty(View.prototype, "mediator", {
            get: function () {
                return this._mediator;
            },
            //------------------------------------------------------------------------------------------------
            // Mediator
            //------------------------------------------------------------------------------------------------
            set: function (value) {
                this._mediator = value;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.setMediator = function (value) {
            this._mediator = value;
            return this;
        };
        //------------------------------------------------------------------------------------------------
        // Children
        //------------------------------------------------------------------------------------------------
        View.prototype.forEachChild = function (value) {
            if (!this.childrenViews || !this.childrenViews.length) {
                return;
            }
            _.each(this.childrenViews, (value), this);
        };
        View.prototype.addChild = function (value) {
            this.childrenViews = this.childrenViews ? this.childrenViews : [];
            this.childrenViews.push(value);
            value.render(this.childrenContainer);
        };
        View.prototype.removeChildFrom = function (index) {
            if (!(this.childrenViews && this.childrenViews.length))
                return null;
            var result = this.childrenViews.splice(index); //_.filter(this.childrenViews, (view:View, key:number)=>(key>=index?view.dispose():null) );
            _.each(result, function (v) { return v.dispose(); });
            return result;
        };
        View.prototype.removeAllChildren = function () {
            _.each(this.childrenViews, function (view) { return view.dispose(); });
            var result = this.childrenViews;
            this.childrenViews = [];
            return result;
        };
        View.prototype.removeChildAt = function (value) {
        };
        Object.defineProperty(View.prototype, "data", {
            get: function () {
                return this._model ? this._model.data : (this._data === null ? View.__emptyData : this._data);
            },
            //------------------------------------------------------------------------------------------------
            // Data & model
            //------------------------------------------------------------------------------------------------
            set: function (value) {
                console.log('View %s set data %s', this.name, value);
                this._data = value;
                this.invalidate(1);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "model", {
            set: function (data) {
                this._model = data;
                this.data = data.data;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "app", {
            get: function () {
                return (this._mediator && this._mediator.facade) ? this._mediator.facade.model : null;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.setModel = function (value, listen) {
            this.model = value;
            if (listen)
                this._model.bind(this, this.modelHandler);
        };
        View.prototype.modelHandler = function (e) {
            console.log('modelHandler ', arguments, this._model);
            this.invalidate(1);
        };
        Object.defineProperty(View.prototype, "locale", {
            get: function () {
                return this._locale;
            },
            set: function (value) {
                this._locale = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "i18n", {
            get: function () {
                return this.jsTemplate && this.jsTemplate.i18n && this.locale ? this.jsTemplate.i18n[this.locale] : null;
            },
            enumerable: true,
            configurable: true
        });
        //------------------------------------------------------------------------------------------------
        // Local methods, overrides
        //------------------------------------------------------------------------------------------------
        View.prototype.sendEvent = function (name, data, sub, error, global) {
            if (data === void 0) { data = null; }
            if (sub === void 0) { sub = null; }
            if (error === void 0) { error = null; }
            if (global === void 0) { global = false; }
            if (this._mediator)
                this._mediator.internalHandler({ name: name, data: data, global: global, target: this });
        };
        View.prototype.log = function (message, level) {
            if (this._mediator)
                this._mediator.facade.logger.add(this.name, message, level);
            else {
                console.log('[c]', this.name, message, level);
            }
            return this;
        };
        // Overrided
        View.prototype.viewEventsHandler = function (name, e) {
            this.log('event ' + name);
            this.sendEvent(name, e);
        };
        //
        View.prototype.eventHandler = function (name, e) {
            console.log(e, e.currentTarget);
            this.viewEventsHandler(name, e);
        };
        // Overrided
        View.prototype.dispose = function () {
            if (this.model)
                this.model.unbind(this);
            this.exitDocument();
            if (this.element.parentNode)
                this.element.parentNode.removeChild(this.element);
            _super.prototype.dispose.call(this);
            return this;
        };
        Object.defineProperty(View.prototype, "dynamicProperties", {
            /* Overrided by generator */
            get: function () {
                return this.jsTemplate ? this.jsTemplate.dynamicSummary : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "isDynamicStylesAvaible", {
            get: function () {
                return !!(this.jsTemplate && this.jsTemplate.css);
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.isDynamicStylesEnabled = function (value) {
            if (!(this.jsTemplate && this.jsTemplate.css))
                return false;
            if (_.isBoolean(value))
                this.jsTemplate.css.enabled = value;
            return this.jsTemplate.css.enabled;
        };
        View.prototype.enableDynamicStyle = function (value) {
            var id = this.className + '__' + Math.random() + 'Style';
            if (this.isDynamicStylesAvaible && value && !this.isDynamicStylesEnabled()) {
                console.log(' *** enable dynamic style *** ', this.jsTemplate.css);
                var style = document.createElement('style');
                style.id = id; //@todo create method that setup className at the generator
                style.type = 'text/css';
                //style.cssText = this.dynamicStyle;
                style.innerHTML = this.dynamicStyle;
                document.getElementsByTagName('head')[0].appendChild(style);
                this.isDynamicStylesEnabled(true);
            }
        };
        Object.defineProperty(View.prototype, "dynamicStyle", {
            get: function () {
                return this.jsTemplate && this.jsTemplate.css ? this.jsTemplate.css.content : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "templateElement", {
            get: function () {
                this.elementPaths = {};
                return this.getElement(this.jsTemplate, this.elementPaths);
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.isStateEnabled = function (states) {
            return this.executeExpression(states);
        };
        View.prototype.executeEval = function (value) {
            return eval(value);
        };
        View.prototype.getVarValue = function (v, ex) {
            if (v.indexOf('data.') === 0) {
                var varName = v.replace('data.', '');
                return (this.data && this.data[varName]) ? this.data[varName] : null;
            }
            else if (v.indexOf('app.') === 0) {
                return eval('this.' + v);
            }
            else if (v.indexOf('$') === 0) {
                var varEx = ex.expressions[parseInt(v.replace('$', ''), 10)];
                return (typeof varEx === 'string') ? this.executeEval(varEx) : this.executeExpression(varEx);
            }
            else if (v.indexOf('.') === -1 || v.indexOf('state.') === 0) {
                var varName = v.replace('state.', '');
                return this.getState(varName);
            }
            else
                throw new Error('Not supported variable in ' + this.name + ', ' + v);
        };
        View.prototype.executeMultiExpression = function (mex) {
            //console.log('------------------------------ ?* --------------------------' , mex);
            //console.log(mex);
            return _.reduce(mex.vars, function (memo, value) {
                return memo.replace('{' + value + '}', this.getVarValue(value, mex));
            }, mex.result || '{$0}', this);
        };
        View.prototype.executeExpression = function (ex) {
            var _this = this;
            //console.log(ex);
            var r = null;
            // we create object to send to first filter (like i18n method) that returns a string value
            if (ex.args && ex.filters) {
                r = {};
                _.each(ex.args, function (v, k) { return r[k] = _this.getVarValue(v, ex); }, this);
            }
            else if (ex.values) {
                var i = 0, length = ex.values.length;
                while (!r && i < length) {
                    r = this.getVarValue(ex.values[i], ex);
                    //this.log(['Search positive ' + i + ' value in [', ex.values[i], ']=',  r].join(''));
                    i++;
                }
            }
            else
                throw Error('Expression must has args and filter or values');
            console.log([this.name, ' ... ExecuteExpression ', ex, '  result=', JSON.stringify(r), ', of content: ', ex.content].join(''), ex);
            r = this.executeFilters(r, ex.filters);
            return r;
        };
        View.prototype.getElement = function (value, object) {
            var e = null;
            var n = null;
            var isIncluded = value.states ? this.isStateEnabled(value.states) : true;
            if (isIncluded && value.type === fmvc.DomObjectType.TAG) {
                if (value.tagName.indexOf('.') > -1) {
                    //console.log('Create component, ' , value.tagName, value.path);
                    var componentPath = value.tagName.split('.');
                    var component = new (fmvc.global[componentPath[0]][componentPath[1]])();
                    component.mediator = this.mediator;
                    component.setStates(value.attribs);
                    this.componentPaths[value.path] = component;
                    if (value.link)
                        this[value.link] = component;
                    e = component.createDom().element;
                }
                else {
                    //console.log('Create element ', value.tagName, value.path);
                    e = document.createElement(value.tagName);
                    _.each(value.staticAttributes, function (v, key) {
                        e.setAttribute(key, v);
                    });
                }
                _.each(value.children, function (child, index) {
                    var ce = this.getElement(child, object);
                    if (ce)
                        e.appendChild(ce);
                }, this);
            }
            else if (value.type === fmvc.DomObjectType.TEXT)
                n = document.createTextNode((_.isString(value.data) ? value.data : ''));
            else
                n = document.createComment(value.path);
            View.Counters.element.added++;
            object[value.path] = e || n;
            return (e || n);
        };
        Object.defineProperty(View.prototype, "jsTemplate", {
            get: function () {
                return View.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "className", {
            get: function () {
                return View.__className;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "dispatcher", {
            get: function () {
                return View.dispatcher;
            },
            enumerable: true,
            configurable: true
        });
        View.getTypedValue = function (s, type) {
            switch (type) {
                case fmvc.Type.String:
                    return _.isString(s) ? s : String(s);
                case fmvc.Type.Int:
                    return parseInt(s, 10);
                case fmvc.Type.Float:
                    return parseFloat(s);
                case fmvc.Type.Boolean:
                    return !!(s === true || s === 'true');
            }
        };
        View.__isDynamicStylesEnabled = false;
        View.__jsTemplate = null;
        View.__formatter = {};
        View.__messageFormat = {};
        View.__className = 'View';
        View.__inheritedStates = [fmvc.State.DISABLED];
        View.__emptyData = {};
        View.Counters = { element: { added: 0, removed: 0, handlers: 0 }, update: { class: 0, data: 0, style: 0, other: 0 } };
        View.dispatcher = new fmvc.EventDispatcher();
        View.Name = 'View';
        return View;
    })(fmvc.Notifier);
    fmvc.View = View;
    var ViewHelper = (function () {
        function ViewHelper() {
        }
        ViewHelper.getId = function (name) {
            if (name === void 0) { name = View.Name; }
            return 'id_' + (View.Counters.element.handlers++);
        };
        ViewHelper.checkElementAttribute = function (el, name, value) {
            if (!el || !name)
                return;
            if (el.getAttribute(name) !== String(value)) {
                el.setAttribute(name, value);
            }
        };
        ViewHelper.setIfNotExistAttribute = function (el, name, value) {
            if (!el || !name)
                return;
            if (!el.getAttribute(name)) {
                el.setAttribute(name, value);
                return true;
            }
            return false;
        };
        ViewHelper.hhmmss = function (value) {
            value = parseInt(value);
            var hours = Math.floor(value / 3600);
            value -= hours * 3600;
            var minutes = Math.floor(value / 60);
            value -= minutes * 60;
            var seconds = Math.floor(value % 60);
            var hoursStr = String((hours < 10) ? "0" + hours : hours);
            var minutesStr = String((minutes < 10) ? "0" + minutes : minutes);
            var secondsStr = String((seconds < 10) ? "0" + seconds : seconds);
            var values = value >= 3600 ? [hoursStr, minutesStr, secondsStr] : [minutesStr, secondsStr];
            return values.join(":");
        };
        return ViewHelper;
    })();
    fmvc.ViewHelper = ViewHelper;
    setInterval(function () { console.log(JSON.stringify(View.Counters)); }, 3000);
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var ViewList = (function (_super) {
        __extends(ViewList, _super);
        function ViewList(name) {
            _super.call(this, name);
            this.ChildrenConstructor = fmvc.View;
        }
        Object.defineProperty(ViewList.prototype, "childrenConstructor", {
            set: function (value) {
                this.ChildrenConstructor = value;
            },
            enumerable: true,
            configurable: true
        });
        /*
        set dataset(value:any[]) {
            this._dataset = value;
            this.invalidate(8);
        }

        get dataset():any[] {
            return this._dataset;
        }
        */
        ViewList.prototype.applyChildrenState = function (name, value) {
            if (!this.avaibleInheritedStates || this.avaibleInheritedStates.indexOf(name) === -1)
                return;
            this.forEachChild(function (view, index) { this.applyViewState(name, value, view, index); });
        };
        ViewList.prototype.applyViewState = function (name, value, view, index) {
            view.setState(name, value);
        };
        ViewList.prototype.updateChildren = function () {
            if (!this.inDocument)
                return;
            var children = this.removeChildFrom(this.data.length - 1) || [];
            console.log('Update children ... ', this._model, this.data);
            _.each(this.data, function (value, index) {
                var view = (this.childrenViews && this.childrenViews.length ? this.childrenViews[index] : null)
                    || (children && children.length ? children.splice(0, 1)[0] : null)
                    || new this.ChildrenConstructor(ViewList.Name + index);
                if (value instanceof fmvc.Model)
                    view.setModel(value, true);
                else
                    view.data = value;
                console.log('Updated view ', view);
                _.each(this.avaibleInheritedStates, function (name) { view.setState(name, this.getState(name)); }, this);
                if (!view.inDocument) {
                    this.addChild(view);
                }
            }, this);
        };
        ViewList.prototype.modelHandler = function (e) {
            //this.log('modelHandler ' + name);
            _super.prototype.modelHandler.call(this, e);
            this.invalidate(4);
        };
        return ViewList;
    })(fmvc.View);
    fmvc.ViewList = ViewList;
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var Mediator = (function (_super) {
        __extends(Mediator, _super);
        function Mediator(name, root, facade) {
            _super.call(this, name, fmvc.TYPE_MEDIATOR);
            this._root = root;
            this.facade = facade;
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
        Mediator.prototype.setFacade = function (facade) {
            this.facade = facade;
            return this;
        };
        Mediator.prototype.addView = function (views) {
            if (!this.views)
                this.views = [];
            if (views) {
                if (_.isArray(views)) {
                    for (var i in views) {
                        this.addView(views[i]);
                    }
                }
                else {
                    var view = views;
                    if (this.views.indexOf(view) === -1) {
                        this.views.push(view);
                        view.setMediator(this).render(this._root);
                    }
                    else {
                        this.log('Warn: try to duplicate view');
                    }
                }
            }
            else {
                this.log('Has no views to add');
            }
            return this;
        };
        Mediator.prototype.getView = function (name) {
            return _.find(this.views, function (view) { return view.name === name; });
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
            //console.log('Mediator handled ... ' , e);
            //this.log('Handled ' + e.name + ' from ' + e.target.name + ":" + e.target.type);
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
///<reference path='./event.dispatcher.ts'/>
///<reference path='./model.ts'/>
///<reference path='./model.list.ts'/>
///<reference path='./logger.ts'/>
///<reference path='./view.i.ts'/>
///<reference path='./view.ts'/>
///<reference path='./view.list.ts'/>
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
            "attribs": {
                "className": "Button"
            },
            "staticAttributes": {
                "class": "button"
            },
            "children": [{
                    "path": "0,0",
                    "type": "text",
                    "data": {
                        "content": "\n    {(state.content||data)}\n",
                        "result": "\n    {$0}\n",
                        "vars": ["$0"],
                        "expressions": [{
                                "content": "(state.content||data)",
                                "vars": ["state.content", "data", "$0"],
                                "values": ["$0"],
                                "expressions": ["(this.getState(\"content\")||this.data)"]
                            }]
                    },
                    "attribs": {}
                }],
            "dynamicSummary": {
                "selected": {
                    "class": {
                        "0": "button-{selected}"
                    }
                },
                "disabled": {
                    "class": {
                        "0": "button-{disabled}"
                    }
                },
                "hover": {
                    "class": {
                        "0": "button-{hover}"
                    }
                },
                "error": {
                    "class": {
                        "0": "button-{error}"
                    }
                },
                "open": {
                    "class": {
                        "0": "button-{open}"
                    }
                },
                "exClass": {
                    "class": {
                        "0": "{exClass}"
                    }
                },
                "state.content": {
                    "data": {
                        "0,0": {
                            "content": "\n    {(state.content||data)}\n",
                            "result": "\n    {$0}\n",
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
                            "content": "\n    {(state.content||data)}\n",
                            "result": "\n    {$0}\n",
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
            this.b1 = this.componentPaths["0,11"] || this.elementPaths["0,11"];
            this.b2 = this.componentPaths["0,13"] || this.elementPaths["0,13"];
            this.b3 = this.componentPaths["0,15"] || this.elementPaths["0,15"];
            this.b4 = this.componentPaths["0,17"] || this.elementPaths["0,17"];
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
            "attribs": {},
            "staticAttributes": {
                "class": "containerButtons"
            },
            "children": [{
                    "path": "0,1",
                    "type": "tag",
                    "attribs": {},
                    "children": [{
                            "path": "0,1,0",
                            "type": "text",
                            "data": "Simple div without anything",
                            "attribs": {}
                        }, {
                            "path": "0,1,1",
                            "type": "tag",
                            "attribs": {},
                            "children": [{
                                    "path": "0,1,1,0",
                                    "type": "text",
                                    "data": "ola!",
                                    "attribs": {}
                                }],
                            "tagName": "b"
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,3",
                    "type": "tag",
                    "attribs": {},
                    "children": [{
                            "path": "0,3,0",
                            "type": "text",
                            "data": "State one",
                            "attribs": {}
                        }],
                    "tagName": "div",
                    "states": {
                        "content": "(app.test.state==='one')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='one')"]
                    },
                    "selected": {
                        "content": "(app.test.state)",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state)"]
                    }
                }, {
                    "path": "0,5",
                    "type": "tag",
                    "attribs": {},
                    "children": [{
                            "path": "0,5,0",
                            "type": "text",
                            "data": "State two button",
                            "attribs": {}
                        }],
                    "tagName": "ui.Button",
                    "states": {
                        "content": "(app.test.state==='two')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='two')"]
                    },
                    "selected": {
                        "content": "(!!app.test.state)",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(!!this.app.test.state)"]
                    }
                }, {
                    "path": "0,7",
                    "type": "tag",
                    "attribs": {},
                    "children": [{
                            "path": "0,7,0",
                            "type": "text",
                            "data": "State three",
                            "attribs": {}
                        }],
                    "tagName": "div",
                    "states": {
                        "content": "(app.test.state==='three')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='three')"]
                    }
                }, {
                    "path": "0,9",
                    "type": "tag",
                    "attribs": {},
                    "children": [{
                            "path": "0,9,0",
                            "type": "tag",
                            "attribs": {},
                            "children": [{
                                    "path": "0,9,0,0",
                                    "type": "text",
                                    "data": {
                                        "content": "{app.test.state}",
                                        "result": "{$0}",
                                        "vars": ["$0"],
                                        "expressions": [{
                                                "content": "app.test.state",
                                                "vars": ["app.test.state"],
                                                "values": ["app.test.state"]
                                            }]
                                    },
                                    "attribs": {}
                                }],
                            "tagName": "b"
                        }, {
                            "path": "0,9,1",
                            "type": "text",
                            "data": "- has model data, sure ?",
                            "attribs": {}
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,11",
                    "type": "tag",
                    "attribs": {
                        "content": "SimpleButtonContentFromProperty"
                    },
                    "tagName": "ui.Button",
                    "link": "b1",
                    "selected": {
                        "content": "(app.test.state)",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state)"]
                    }
                }, {
                    "path": "0,13",
                    "type": "tag",
                    "attribs": {
                        "exClass": "buttonOne"
                    },
                    "children": [{
                            "path": "0,13,0",
                            "type": "text",
                            "data": "Selected TheContentFromContainer And Text 2",
                            "attribs": {}
                        }],
                    "tagName": "ui.Button",
                    "link": "b2",
                    "selected": {
                        "content": "(app.test.state==='one')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='one')"]
                    }
                }, {
                    "path": "0,15",
                    "type": "tag",
                    "attribs": {
                        "exClass": "buttonOne"
                    },
                    "children": [{
                            "path": "0,15,0",
                            "type": "text",
                            "data": "Button 3 / And a lot of text",
                            "attribs": {}
                        }],
                    "tagName": "ui.Button",
                    "link": "b3",
                    "selected": {
                        "content": "(app.test.state==='one')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='one')"]
                    }
                }, {
                    "path": "0,17",
                    "type": "tag",
                    "attribs": {
                        "exClass": "buttonOne"
                    },
                    "children": [{
                            "path": "0,17,0",
                            "type": "text",
                            "data": "Button 4 / And a lot of text",
                            "attribs": {}
                        }],
                    "tagName": "ui.Button",
                    "link": "b4",
                    "selected": {
                        "content": "(app.test.state==='one')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='one')"]
                    }
                }],
            "links": [{
                    "name": "b1",
                    "value": "0,11"
                }, {
                    "name": "b2",
                    "value": "0,13"
                }, {
                    "name": "b3",
                    "value": "0,15"
                }, {
                    "name": "b4",
                    "value": "0,17"
                }],
            "dynamicSummary": {
                "app.test.state": {
                    "selected": {
                        "0,3": {
                            "content": "(app.test.state)",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state)"]
                        },
                        "0,5": {
                            "content": "(!!app.test.state)",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(!!this.app.test.state)"]
                        },
                        "0,11": {
                            "content": "(app.test.state)",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state)"]
                        },
                        "0,13": {
                            "content": "(app.test.state==='one')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='one')"]
                        },
                        "0,15": {
                            "content": "(app.test.state==='one')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='one')"]
                        },
                        "0,17": {
                            "content": "(app.test.state==='one')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='one')"]
                        }
                    },
                    "states": {
                        "0,3": {
                            "content": "(app.test.state==='one')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='one')"]
                        },
                        "0,5": {
                            "content": "(app.test.state==='two')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='two')"]
                        },
                        "0,7": {
                            "content": "(app.test.state==='three')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='three')"]
                        }
                    },
                    "data": {
                        "0,9,0,0": {
                            "content": "{app.test.state}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "app.test.state",
                                    "vars": ["app.test.state"],
                                    "values": ["app.test.state"]
                                }]
                        }
                    }
                }
            },
            "tagName": "div",
            "className": "TestButtons",
            "moduleName": "test",
            "enableStates": [null, null]
        };
        return TestButtons;
    })(fmvc.View);
    test.TestButtons = TestButtons;
})(test || (test = {}));
//# sourceMappingURL=fmvc.dev.js.map