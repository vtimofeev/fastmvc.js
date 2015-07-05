var fmvc;
(function (fmvc) {
    var Event = (function () {
        function Event() {
        }
        Event.MODEL_CHANGED = 'model.changed';
        Event.MODEL_CREATED = 'model.created';
        Event.MODEL_VALIDATED = 'model.validated';
        Event.MODEL_ADDED = 'model.added';
        Event.MODEL_UPDATED = 'model.updated';
        Event.MODEL_DELETED = 'model.deleted';
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
            function removeFromObjects(objects) {
                if (objects.indexOf(object) > -1)
                    objects = _.without(objects, object);
            }
            ;
            if (event)
                removeFromObjects(this._events[event]);
            else
                _.each(this._events, removeFromObjects, this);
            return this;
        };
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
            _.each(objects, function (object) { return object.eventHandler(e.name); });
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
            if (log)
                this.log('Send event ' + name);
            if (this._facade)
                this._facade.eventHandler(e);
            if (this._listeners && this._listeners.length)
                this._sendToListners(name, data);
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
            this._listeners.push({ target: object, handler: handler });
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
        Notifier.prototype._sendToListners = function (event, data) {
            this._listeners.forEach(function (lo) {
                if (!lo.target.disposed)
                    (lo.handler).apply(lo.target, [event, data]);
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
            //if(!this.elementIdMap[id]) this.elementIdMap[id] = el;
            this.executionMap[id] = this.executionMap[id] || {};
            if (!this.executionMap[id][type]) {
                this.executionMap[id][type] = { handler: handler, context: context };
                console.log(id, type, this.executionMap[id][type]);
                this.__createListener(el, id, type, handler, context);
            }
            else {
                console.warn('Cant listen cause exist ', id, type);
            }
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
            _.each(this.executionMap[id], function (handlerObject, type) {
                el.removeEventListener(type, this.browserHandler);
                delete handlerObject.handler;
                delete handlerObject.context;
            }, this);
            delete this.executionMap[id];
            //delete this.elementIdMap[id];
        };
        EventDispatcher.prototype.unlisten = function (el, type) {
            var id = el.getAttribute('id');
            if (!id)
                return;
            var handlerObject = this.executionMap[id][type];
            el.removeEventListener(type, this.browserHandler);
            delete handlerObject.handler;
            delete handlerObject.context;
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
                var handlerObject = this.executionMap[id][type];
                handlerObject.handler.call(handlerObject.context, e);
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
    fmvc.ModelState = {
        NONE: 'none',
        LOADING: 'loading',
        UPDATING: 'updating',
        SYNCING: 'syncing',
        SYNCED: 'synced',
        CHANGED: 'changed',
    };
    /*
        Загрузка данных
        var configModel = new Model('config', { default data } , { enabedState: true , state: 'synced' } );
        var loaderProxy = new LoaderProxy(configModel, configUrl);
        loaderProxy.load().then(function(data) {
         var parserProxy = new ParserProxy(data, parserFunction, configModel);
         parserProxy.parser().then(function() { });

         configModel(
            defaultConfig,
            { url : { load: [template], update: [template], remove: [template] },
              loadProxy: {} // universary queue manager,
              parserProxy: {} // parserFunction(data=>result),
              validateProxy: {} // validatorFunction
              onError
            }) // option init
            .load(callback?) // load in model context
            .sync(callback?). // if changed -> save , if synced -> update
            .parse(callback?);
        });

     */
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(name, data, opts) {
            if (data === void 0) { data = {}; }
            _super.call(this, name);
            this.enabledEvents = true;
            this.enabledState = false;
            this.watchChanges = true;
            if (opts)
                _.extend(this, opts);
            if (data)
                this.data = data;
            this.sendEvent(fmvc.Event.MODEL_CREATED, this.data);
        }
        Model.prototype.setState = function (value) {
            if (!this.enabledState || this._state === value)
                return this;
            this._previousState = value;
            this._state = value;
            return this;
        };
        Object.defineProperty(Model.prototype, "data", {
            get: function () {
                return this._data;
            },
            set: function (value) {
                var data = this._data;
                var changes = null;
                var hasChanges = false;
                if (value instanceof Model)
                    throw Error('Cant set model data, data must be object, array or primitive');
                //@todo check type of data and value
                if (_.isObject(data) && _.isObject(value) && this.watchChanges) {
                    for (var i in value) {
                        if (data[i] !== value[i]) {
                            if (!changes)
                                changes = {};
                            hasChanges = true;
                            changes[i] = value[i];
                            data[i] = value[i];
                        }
                    }
                }
                else {
                    // primitive || array || no data && any value (object etc)
                    if (data !== value) {
                        hasChanges = true;
                        this._data = _.isObject(value) ? _.extend(this._data, value) : value;
                    }
                }
                if (hasChanges)
                    this.sendEvent(fmvc.Event.MODEL_CHANGED, changes || this._data);
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
        Model.prototype.destroy = function () {
        };
        Model.prototype.addValidator = function (value) {
            this._validators = this._validators ? this._validators : [];
            if (this._validators.indexOf(value) >= 0)
                throw 'Cant add validator to model';
            this._validators.push(value);
        };
        Model.prototype.removeValidator = function (value) {
            var index = this._validators ? this._validators.indexOf(value) : -1;
            if (index >= 0)
                this._validators.splice(index, 1);
        };
        Model.prototype.validate = function (value) {
            var result = false;
            var error = {};
            for (var i in this._validators) {
                var validator = this._validators[i];
                value = validator.execute(value);
                if (!value) {
                    result = false;
                    break;
                }
            }
            this.sendEvent(fmvc.Event.MODEL_VALIDATED, result, null, error);
            return result;
        };
        return Model;
    })(fmvc.Notifier);
    fmvc.Model = Model;
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
        function ModelList(name, data) {
            if (data === void 0) { data = null; }
            _super.call(this, name);
            this.data = data;
        }
        Object.defineProperty(ModelList.prototype, "data", {
            get: function () {
                return this._data;
            },
            set: function (value) {
                if (!this._data)
                    this._data = [];
                for (var i in value) {
                    this._data.push(this.createModel(value[i]));
                }
                this.sendEvent(fmvc.Event.MODEL_CHANGED, this.data);
            },
            enumerable: true,
            configurable: true
        });
        ModelList.prototype.createModel = function (value) {
            return new fmvc.Model(this.name + '-item', value);
        };
        ModelList.prototype.add = function (value) {
            this._data.push(this.createModel(value));
            this.sendEvent(fmvc.Event.MODEL_CHANGED, this.data);
            return true;
        };
        ModelList.prototype.remove = function (value) {
            var data = this._data;
            var result = false;
            var index = data.indexOf(value);
            if (index > -1) {
                data.splice(index, 1);
                result = true;
            }
            this.sendEvent(fmvc.Event.MODEL_CHANGED, this.data);
            return result;
        };
        ModelList.prototype.update = function (value) {
            var data = this._data;
            var result = false;
            var index = this.getIndexOfModelData(value);
            if (index > -1) {
                data[index].setData(value);
                result = true;
            }
            this.sendEvent(fmvc.Event.MODEL_CHANGED, this.data);
            return result;
        };
        ModelList.prototype.getIndexOfModelData = function (value) {
            for (var i in this._data) {
                var model = this._data[i];
                console.log('Check ' + model.data + ', ' + value);
                if (model.data === value)
                    return Number(i);
            }
            return -1;
        };
        return ModelList;
    })(fmvc.Notifier);
    fmvc.ModelList = ModelList;
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
    /*
    export var BrowserEvent = {
        CLICK: 'click',
        MOUSEOVER: 'mouseover',
        MOUSEOUT: 'mouseout'
    };
    */
    fmvc.State = {
        SELECTED: 'selected',
        HOVER: 'hover',
        FOCUSED: 'focused',
        DISABLED: 'disabled'
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
            _.bindAll(this, 'getDataStringValue', 'applyEventHandlers', 'invalidateHandler', 'getDataObjectValue');
            this.template = this.jsTemplate;
            if (modelOrData) {
                if (modelOrData.type === fmvc.TYPE_MODEL)
                    this.model = modelOrData;
                else
                    this.data = modelOrData;
            }
            this.initTemplate(jsTemplate);
            this.init();
            this.invalidateHandler = this.invalidateHandler.bind(this);
        }
        View.prototype.initTemplate = function (templateExtention) {
            if (templateExtention)
                this.template = (_.extend(_.clone(this.template), templateExtention));
            console.log('template: ', this.template);
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
                    this._states[ivalue.name] = ivalue.value;
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
                    //console.log('Set data ' , prefix + name);
                    this.dynamicProperties[prefix + name] ? this.updateDynamicProperty(prefix + name, value) : null;
                }
            }, this);
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
        View.prototype.getDataStringValue = function (propertyName, propertyValue, templateStringOrObject) {
            if (_.isString(templateStringOrObject)) {
                return templateStringOrObject.replace('{' + propertyName + '}', propertyValue);
            }
            else if (_.isObject(templateStringOrObject)) {
                return this.getDataObjectValue(propertyName, propertyValue, templateStringOrObject);
            }
        };
        View.prototype.executeComplexFilter = function (filterArrayData, value) {
        };
        View.prototype.executeFilter = function (filter, value) {
            switch (filter) {
                case fmvc.Filter.FIRST:
                    return 'first:' + value;
                    break;
                case fmvc.Filter.SECOND:
                    return 'second:' + value;
                    break;
            }
            return value;
        };
        View.prototype.getDataObjectValue = function (propertyName, propertyValue, templateObject) {
            var getFilterValue = function (reducedValue, filter) {
                if (_.isArray(filter)) {
                    if (filter[0] === 'i18n') {
                        var secondName = filter[1];
                        if (!this.i18n[secondName])
                            return 'Error:View.getDataObjectValue has no i18n property';
                        var data = {};
                        _.each(templateObject.args, function (value, key) {
                            if (value)
                                data[key] = this.data[value.replace('data.', '')];
                        }, this);
                        var result = this.getFormattedMessage(this.i18n[secondName], data);
                        return templateObject.source.replace('{replace}', result);
                    }
                    else {
                        return this.executeComplexFilter(filter, reducedValue);
                    }
                }
                else {
                    return this.executeFilter(filter, reducedValue);
                }
            };
            return _.reduce(templateObject.filters, getFilterValue, propertyValue, this);
        };
        View.prototype.updatePaths = function (paths, type, name, value, GetValue, each) {
            _.each(paths, function (valueOrValues, path) {
                var r = '';
                if (_.isString(valueOrValues)) {
                    var result = GetValue(name, value, valueOrValues);
                    r += result;
                    if (each)
                        this.updatePathProperty(path, type, value, result);
                }
                else if (_.isArray(valueOrValues)) {
                    _.each(valueOrValues, function (stringValue) {
                        var result = GetValue(name, value, stringValue);
                        r += result;
                        if (each)
                            this.updatePathProperty(path, type, value, stringValue);
                    }, this);
                }
                else if (_.isObject(valueOrValues)) {
                    var result = GetValue(name, value, valueOrValues);
                    r += result;
                    if (each)
                        this.updatePathProperty(path, type, value, result);
                }
                if (!each)
                    this.updatePathProperty(path, type, value, r);
            }, this);
        };
        View.prototype.updateDynamicProperty = function (name, value) {
            var domPropsObject = this.dynamicProperties[name];
            this.dynamicPropertyValue[name] = value;
            if (!domPropsObject)
                return;
            //console.log('Update dyn prop: ', domPropsObject, name, value);
            _.each(domPropsObject, function (pathsAndValues, type) {
                var GetValue = null;
                var each = false;
                switch (type) {
                    case 'class':
                        GetValue = this.getClassStringValue;
                        each = true;
                        break;
                    case 'style':
                        GetValue = this.getClassStringValue; //resultValue.replace('{' + name + '}', _.isBoolean(value) ? name : resultValue);
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
        View.prototype.updatePathProperty = function (path, type, value, resultValue) {
            var element = this.elementPaths[path];
            if (!(element && element.nodeType !== 8))
                return; // virtual element or comment
            switch (type) {
                case 'class':
                    element.classList.toggle(resultValue, value);
                    break;
                case 'style':
                    var style = resultValue.split(':');
                    var propName = style[0].trim();
                    element.style[propName] = style[1].trim();
                    break;
                case 'data':
                    //console.log('Set data ', element, element.nodeType, element.textContent);
                    if (element.nodeType === 3 && element.textContent != resultValue)
                        element.textContent = resultValue;
                    break;
                default:
                    element.setAttribute(type, resultValue);
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
            if (this._inDocument)
                return;
            this._inDocument = true;
            var t = this;
            if (!this.isDynamicStylesEnabled())
                this.enableDynamicStyle(true);
            ViewHelper.checkElementAttribute(this.element, 'id', this.id);
            if (this.hasState(fmvc.State.HOVER)) {
                this.dispatcher.listen(this.element, fmvc.BrowserEvent.MOUSEOVER, function () { return t.setState(fmvc.State.HOVER, true); });
                this.dispatcher.listen(this.element, fmvc.BrowserEvent.MOUSEOUT, function () { return t.setState(fmvc.State.HOVER, false); });
            }
            if (this.hasState(fmvc.State.SELECTED)) {
                this.dispatcher.listen(this.element, fmvc.BrowserEvent.CLICK, function () { return t.setState(fmvc.State.SELECTED, !t.getState(fmvc.State.SELECTED)); });
            }
            this.enterDocumentElement(this.jsTemplate, this.elementPaths);
            this.invalidate(1);
        };
        View.prototype.applyEventHandlers = function (e) {
            var path = e.target.getAttribute('data-path');
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
            console.log('Event to handle ', name);
        };
        View.prototype.enterDocumentElement = function (value, object) {
            if (!value || !object)
                return;
            var path = value.path;
            var e = object[value.path];
            var isTag = e.nodeType === 1;
            var c = this.componentPaths[value.path];
            if (c)
                c.enterDocument();
            if (value.type === fmvc.DomObjectType.TAG && isTag) {
                //console.log('EnterDocument ', value.tagName, value.path);
                _.each(value.children, function (child, index) {
                    this.enterDocumentElement(child, object);
                }, this);
                // add global handlers if not exist
                if (value.handlers) {
                    var id = value.staticAttributes ? value.staticAttributes['id'] : null || ViewHelper.getId();
                    ViewHelper.checkElementAttribute(e, 'id', id);
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
            var isEnabled = (e.nodeType === 1);
            //console.log('path, included, enabled ', value.tagName, value.path, isIncluded, isEnabled);
            if (isIncluded && !isEnabled) {
                var newElement = this.getElement(value, object);
                var parentNode = e.parentNode;
                //console.log('Replace node on Real ');
                parentNode.replaceChild(newElement, e);
                object[value.path] = newElement;
                this.enterDocumentElement(value, object);
                View.Counters.element.removed++;
            }
            else if (!isIncluded && isEnabled) {
                this.exitDocumentElement(value, object);
                var newElement = this.getElement(value, object);
                var parentNode = e.parentNode;
                //console.log('Replace node on Comment ');
                parentNode.replaceChild(newElement, e);
                object[value.path] = newElement;
                View.Counters.element.removed++;
            }
            else {
            }
        };
        View.prototype.exitDocument = function () {
            this._inDocument = false;
            this.delegateEventHandlers(false);
        };
        View.prototype.getFormattedMessage = function (value, data) {
            View.__formatter[value] = View.__formatter[value] ? View.__formatter[value] : this.getCompiledFormatter(value);
            return (View.__formatter[value](data));
        };
        View.prototype.getCompiledFormatter = function (value) {
            View.__messageFormat[this.locale] = View.__messageFormat[this.locale] ? View.__messageFormat[this.locale] : new MessageFormat(this.locale);
            return View.__messageFormat[this.locale].compile(value);
        };
        View.prototype.delegateEventHandlers = function (init) {
            /*
             private eventHandlers:any[];

             private static delegateEventSplitter = /^(\S+)\s*(.*)$/;
             var _t:View = this;
             this.log('Events: ' + (JSON.stringify(this.eventHandlers)));

             for (var commonHandlerData in this.eventHandlers) {
             var eventName:string = this.eventHandlers[commonHandlerData];
             var match:any = commonHandlerData.match(View.delegateEventSplitter);
             var handledEvents:string = match[1];
             var selector:string = match[2];

             // add handlers
             if (init) {
             this.log('Add listeners [' + handledEvents + '] of the [' + selector + ']');
             var eventClosure = function (name) {
             return function (e) {
             _t.eventHandler(name, e);
             };
             }(eventName);
             if (selector === '') {
             this.$root.on(handledEvents, eventClosure);
             } else {
             this.$root.on(handledEvents, selector, eventClosure);
             }
             }
             // remove handlers
             else {
             if (selector === '') {
             this.$root.off(handledEvents);
             } else {
             this.$root(selector).on(handledEvents, selector);
             }
             }
             }
             */
        };
        //------------------------------------------------------------------------------------------------
        // States
        //------------------------------------------------------------------------------------------------
        View.prototype.hasState = function (name) {
            return _.isBoolean(this._states[name]);
        };
        View.prototype.setState = function (name, value) {
            if (!(name in this._states))
                return this;
            if (name in this._statesType)
                value = View.getTypedValue(value, this._statesType[name]);
            if (this._states[name] === value)
                return this;
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
                if (!this._avaibleInheritedStates) {
                    this._avaibleInheritedStates = _.filter(_.map(this._states, function (v, k) {
                        return k;
                    }), function (k) {
                        return this.inheritedStates.indexOf(k) > -1;
                    }, this);
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
        View.prototype.isSelected = function () {
            return !!this.getState(fmvc.State.SELECTED);
        };
        View.prototype.isHover = function () {
            return !!this.getState(fmvc.State.HOVER);
        };
        View.prototype.isFocused = function () {
            return !!this.getState(fmvc.State.FOCUSED);
        };
        View.prototype.isDisabled = function () {
            return !!this.getState(fmvc.State.DISABLED);
        };
        //------------------------------------------------------------------------------------------------
        // VALIDATE
        //------------------------------------------------------------------------------------------------
        View.prototype.invalidate = function (type) {
            this._invalidate = this._invalidate | type;
            if (!this._invalidateTimeout)
                this._invalidateTimeout = setTimeout(this.invalidateHandler, 20);
        };
        View.prototype.invalidateHandler = function () {
            this.removeInvalidateTimeout();
            //console.log('invalid ' , this._invalidate , this._inDocument);
            if (!this._invalidate || !this._inDocument)
                return;
            if (this._invalidate & 1)
                this.updateData(this.data, 'data.', 2);
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
        View.prototype.removeChild = function (value) {
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
                return this._data;
            },
            //------------------------------------------------------------------------------------------------
            // Data & model
            //------------------------------------------------------------------------------------------------
            set: function (value) {
                //console.log('View: set data' , value);
                this._data = value;
                this.invalidate(1);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "model", {
            get: function () {
                return this._model;
            },
            set: function (data) {
                this._model = data;
                this.data = data.data;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.setModelWithListener = function (value) {
            this.model = value;
            this.model.bind(true, this, this.modelHandler);
        };
        View.prototype.modelHandler = function (name, data) {
            this.log('modelHandler ' + name);
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
                this._mediator.facade.logger.log(this.name, message, level);
        };
        // Overrided
        View.prototype.viewEventsHandler = function (name, e) {
            this.log('event ' + name);
            this.sendEvent(name, e);
        };
        //
        View.prototype.eventHandler = function (name, e) {
            this.viewEventsHandler(name, e);
        };
        // Overrided
        View.prototype.dispose = function () {
            if (this.model)
                this.model.bind(false, this, this.modelHandler);
            this.delegateEventHandlers(false);
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(View.prototype, "dynamicProperties", {
            /* Overrided by generator */
            get: function () {
                return this.jsTemplate ? this.jsTemplate.dynamicSummary : null;
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
            if (value && !this.isDynamicStylesEnabled()) {
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
            var statesLength = states.length;
            for (var i = 0; i < statesLength; i++) {
                var stateValue = states[i];
                return _.isArray(stateValue) ? this.getState(stateValue[0]) === stateValue[1] : !!this.getState(states[i]);
            }
            return false;
        };
        View.prototype.getElement = function (value, object) {
            var e = null;
            var n = null;
            var isIncluded = value.states ? this.isStateEnabled(value.states) : true;
            if (isIncluded && value.type === fmvc.DomObjectType.TAG) {
                if (value.tagName.indexOf('.') > -1) {
                    //console.log('Create component, ' + value.tagName);
                    var component = new (fmvc.global.ui[value.tagName.split('.')[1]])();
                    this.componentPaths[value.path] = component;
                    e = component.createDom().element;
                }
                else {
                    e = document.createElement(value.tagName);
                    _.each(value.staticAttributes, function (v, key) {
                        e.setAttribute(key, v);
                    });
                    if (value.handlers || String(value.path) === '0')
                        e.setAttribute('id', 'id-' + View.Counters.element.added);
                }
                _.each(value.children, function (child, index) {
                    var ce = this.getElement(child, object);
                    if (ce)
                        e.appendChild(ce);
                }, this);
            }
            else if (value.type === fmvc.DomObjectType.TEXT)
                n = document.createTextNode(value.data || '');
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
        View.Counters = { element: { added: 0, removed: 0, handlers: 0 } };
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
            if (el.getAttribute(name) !== String(value))
                el.setAttribute(name, value);
        };
        return ViewHelper;
    })();
    fmvc.ViewHelper = ViewHelper;
    setInterval(function () {
        console.log(JSON.stringify(View.Counters));
    }, 3000);
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var ViewList = (function (_super) {
        __extends(ViewList, _super);
        function ViewList(name, $root) {
            _super.call(this, name, $root);
        }
        Object.defineProperty(ViewList.prototype, "childrenConstructor", {
            set: function (value) {
                this.ChildrenConstructor = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewList.prototype, "dataset", {
            get: function () {
                return this._dataset;
            },
            set: function (value) {
                this._dataset = value;
                this.invalidate(8);
            },
            enumerable: true,
            configurable: true
        });
        ViewList.prototype.applyChildrenState = function (name, value) {
            if (!this.avaibleInheritedStates || this.avaibleInheritedStates.indexOf(name) === -1)
                return;
            this.forEachChild(function (view, index) {
                this.applyViewState(name, value, view, index);
            });
        };
        ViewList.prototype.applyViewState = function (name, value, view, index) {
            view.setState(name, value);
        };
        ViewList.prototype.updateChildren = function () {
            if (!this.inDocument)
                return;
            var children = this.removeAllChildren() || [];
            _.each(this.dataset, function (value, index) {
                var view = children[index] || new this.ChildrenConstructor();
                view.data = value;
                _.each(this.avaibleInheritedStates, function (name) {
                    view.setState(name, this.getState(name));
                }, this);
                if (!view.inDocument) {
                    this.addChild(view);
                }
            }, this);
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
        Mediator.prototype.setFacade = function (facade) {
            this.facade = facade;
            return this;
        };
        Mediator.prototype.addViews = function (views) {
            if (views) {
                if (_.isArray(views)) {
                    for (var i in views) {
                        this.initView(views[i]);
                    }
                    this.views = views;
                }
                else {
                    this.initView((views));
                    this.views = [views];
                }
            }
            else {
                this.log('Has no views to add');
            }
            return this;
        };
        Mediator.prototype.initView = function (view) {
            this.log('Init view ' + view.name);
            view.mediator = this;
            view.render(this._root);
        };
        Mediator.prototype.getView = function (name) {
            for (var i in this.views) {
                if (this.views[i].name() == name)
                    return this.views[i];
            }
            return null;
        };
        Object.defineProperty(Mediator.prototype, "events", {
            get: function () {
                return [];
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
            this.log('Handled ' + e.name + ' from ' + e.target.name + ":" + e.target.type);
            switch (e.target.type()) {
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
///<reference path='./logger.ts'/>
///<reference path='./model.ts'/>
///<reference path='./model.list.ts'/>
///<reference path='./view.i.ts'/>
///<reference path='./view.ts'/>
///<reference path='./view.list.ts'/>
///<reference path='./mediator.ts'/>
///<reference path='../../../DefinitelyTyped/lodash/lodash.d.ts'/>
///<reference path='../../src/fmvc/d.ts'/>
/* start object */
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
            /*
            public isDynamicStylesEnabled(value?:boolean):boolean {
                 if(_.isBoolean(value)) Button.__isDynamicStylesEnabled = value;
                    return Button.__isDynamicStylesEnabled;
            }
            private static __isDynamicStylesEnabled:boolean = false;
            */
            get: function () {
                return Button.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Button.__jsTemplate = {
            "path": "0",
            "type": "tag",
            "staticAttributes": {
                "class": "button"
            },
            "children": [{
                "path": "0,0",
                "type": "text",
                "data": "\n     "
            }, {
                "path": "0,1",
                "type": "tag",
                "tagName": "div",
                "states": {
                    "content": "content00",
                    "values": ["content00"],
                    "vars": ["content00"],
                    "args": {},
                    "filters": [],
                    "expression": []
                }
            }, {
                "path": "0,2",
                "type": "text",
                "data": "\n     "
            }, {
                "path": "0,3",
                "type": "tag",
                "staticAttributes": {
                    "class": "content content-{(!!(content))}"
                },
                "tagName": "div",
                "states": {
                    "content": "data.content0,content0",
                    "values": ["data.content0", "content0"],
                    "vars": ["data.content0", "content0"],
                    "args": {},
                    "filters": [],
                    "expression": []
                }
            }, {
                "path": "0,4",
                "type": "text",
                "data": "\n     "
            }, {
                "path": "0,5",
                "type": "tag",
                "children": [{
                    "path": "0,5,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.title": ["{data.title} a button content can be {(data.title||title)}"],
                            "(data.title": [{
                                "args": {
                                    "VALUE": "(data.title"
                                },
                                "filters": ["", "title)"],
                                "source": "{replace} a button content can be {(data.title||title)}"
                            }]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div",
                "states": {
                    "content": "(data.content1 && (state.content1 === 'pizda' || state.content1 === 'ebatnya'))",
                    "values": ["$0"],
                    "vars": ["state.content1", "data.content1", "$0"],
                    "args": {},
                    "filters": [],
                    "expression": ["(this.data.content1 && (this.getState(\"content1\") === 'pizda' || this.getState(\"content1\") === 'ebatnya'))"]
                }
            }, {
                "path": "0,6",
                "type": "text",
                "data": "\n     "
            }, {
                "path": "0,7",
                "type": "tag",
                "children": [{
                    "path": "0,7,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.title": ["{data.title} a button content can be {(data.title||title)}"],
                            "(data.title": [{
                                "args": {
                                    "VALUE": "(data.title"
                                },
                                "filters": ["", "title)"],
                                "source": "{replace} a button content can be {(data.title||title)}"
                            }]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div",
                "states": {
                    "content": "(data.content2||state.content2) as VALUE2, data.content3 as VALUE3|i18n.checkValue",
                    "values": [],
                    "vars": ["state.content2", "data.content2", "data.content3"],
                    "args": {
                        "VALUE2": "$0",
                        "VALUE3": "data.content3"
                    },
                    "filters": ["i18n.checkValue"],
                    "expression": ["(this.data.content2||this.getState(\"content2\"))"]
                }
            }, {
                "path": "0,8",
                "type": "text",
                "data": "\n     "
            }, {
                "path": "0,9",
                "type": "tag",
                "children": [{
                    "path": "0,9,0",
                    "type": "tag",
                    "children": [{
                        "path": "0,9,0,1",
                        "type": "text",
                        "data": {
                            "static": null,
                            "dynamic": {
                                "data.title": ["{data.title} a button content can be {(data.title||title)}"],
                                "(data.title": [{
                                    "args": {
                                        "VALUE": "(data.title"
                                    },
                                    "filters": ["", "title)"],
                                    "source": "{replace} a button content can be {(data.title||title)}"
                                }]
                            },
                            "bounds": null
                        }
                    }],
                    "tagName": "10||state.content4"
                }],
                "tagName": "div",
                "states": {
                    "content": "states",
                    "values": ["states"],
                    "vars": ["states"],
                    "args": {},
                    "filters": [],
                    "expression": []
                }
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
                "data.title": {
                    "data": {
                        "0,5,0": "{data.title} a button content can be {(data.title||title)}",
                        "0,7,0": "{data.title} a button content can be {(data.title||title)}",
                        "0,9,0,1": "{data.title} a button content can be {(data.title||title)}"
                    }
                },
                "(data.title": {
                    "data": {
                        "0,5,0": {
                            "args": {
                                "VALUE": "(data.title"
                            },
                            "filters": ["", "title)"],
                            "source": "{replace} a button content can be {(data.title||title)}"
                        },
                        "0,7,0": {
                            "args": {
                                "VALUE": "(data.title"
                            },
                            "filters": ["", "title)"],
                            "source": "{replace} a button content can be {(data.title||title)}"
                        },
                        "0,9,0,1": {
                            "args": {
                                "VALUE": "(data.title"
                            },
                            "filters": ["", "title)"],
                            "source": "{replace} a button content can be {(data.title||title)}"
                        }
                    }
                }
            },
            "tagName": "div",
            "enableStates": ["hover", "selected", "disabled", "error", "open", {
                "name": "content",
                "type": "string",
                "default": "Default caption"
            }, {
                "name": "title",
                "type": "string",
                "default": "Can be also a content"
            }],
            "extend": "fmvc.View",
            "className": "Button",
            "css": {
                "content": ".button{display:inline-block;min-width:120px;width:100;background-color:#0a0;color:#fff;font-size:1}.button-hover{background-color:#0f0}.button-selected{font-weight:bold;border-bottom:2px solid #000}",
                "enabled": false
            }
        };
        return Button;
    })(fmvc.View);
    ui.Button = Button;
})(ui || (ui = {}));
///<reference path='../../src/fmvc/d.ts'/>
/* start object */
var ui;
(function (ui) {
    var UserView = (function (_super) {
        __extends(UserView, _super);
        function UserView(name, modelOrData, jsTemplate) {
            _super.call(this, name, modelOrData, jsTemplate);
        }
        UserView.prototype.createDom = function () {
            this.element = this.templateElement;
            this.hellobutton = this.elementPaths["0,21"];
            this.close2 = this.elementPaths["0,23"];
            this.close = this.elementPaths["0,25"];
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        };
        Object.defineProperty(UserView.prototype, "jsTemplate", {
            /*
            public isDynamicStylesEnabled(value?:boolean):boolean {
                 if(_.isBoolean(value)) UserView.__isDynamicStylesEnabled = value;
                    return UserView.__isDynamicStylesEnabled;
            }
            private static __isDynamicStylesEnabled:boolean = false;
            */
            get: function () {
                return UserView.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        UserView.__jsTemplate = {
            "path": "0",
            "type": "tag",
            "staticAttributes": {
                "style": "background-color:blue;color: red;",
                "class": "userview"
            },
            "children": [{
                "path": "0,1",
                "type": "tag",
                "children": [{
                    "path": "0,1,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.firstname": ["F: {data.firstname}"]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,3",
                "type": "tag",
                "children": [{
                    "path": "0,3,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.secondname": ["S: {data.secondname}"]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,5",
                "type": "tag",
                "children": [{
                    "path": "0,5,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.age": ["A: {data.age}"]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,7",
                "type": "tag",
                "children": [{
                    "path": "0,7,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "i18n.template": ["{i18n.template}"]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,9",
                "type": "tag",
                "children": [{
                    "path": "0,9,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.firstname": [{
                                "args": {
                                    "VALUE": "data.firstname"
                                },
                                "filters": [
                                    ["i18n", "template"]
                                ],
                                "source": "{replace}"
                            }]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,11",
                "type": "tag",
                "children": [{
                    "path": "0,11,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.age": [{
                                "args": {
                                    "AGE": "data.age",
                                    "FIRST": "data.firstname"
                                },
                                "filters": [
                                    ["i18n", "template"]
                                ],
                                "source": "Hello man ! Yo Yo {replace}"
                            }],
                            "data.firstname": [{
                                "args": {
                                    "AGE": "data.age",
                                    "FIRST": "data.firstname"
                                },
                                "filters": [
                                    ["i18n", "template"]
                                ],
                                "source": "Hello man ! Yo Yo {replace}"
                            }]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,13",
                "type": "tag",
                "children": [{
                    "path": "0,13,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.age": [{
                                "args": {
                                    "AGE": "data.age",
                                    "FIRST": "data.firstname"
                                },
                                "filters": [
                                    ["i18n", "template2"]
                                ],
                                "source": "{replace}"
                            }],
                            "data.firstname": [{
                                "args": {
                                    "AGE": "data.age",
                                    "FIRST": "data.firstname"
                                },
                                "filters": [
                                    ["i18n", "template2"]
                                ],
                                "source": "{replace}"
                            }]
                        },
                        "bounds": null
                    }
                }],
                "handlers": {
                    "mouseover": "overText",
                    "mouseout": "outText"
                },
                "tagName": "div"
            }, {
                "path": "0,15",
                "type": "tag",
                "children": [{
                    "path": "0,15,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.value": ["The value is {data.value}"]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,17",
                "type": "tag",
                "children": [{
                    "path": "0,17,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.coordinates.x": ["Cooridnates {data.coordinates.x} & {data.coordinates.y}"],
                            "data.coordinates.y": ["Cooridnates {data.coordinates.x} & {data.coordinates.y}"]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,19",
                "type": "tag",
                "handlers": {
                    "change": "set,data.value,{data.value}",
                    "keydown": "changeValueOnKeyUp",
                    "keyup": "changeValueOnKeyDown"
                },
                "bounds": {
                    "value": {
                        "data.value": "{data.value}"
                    }
                },
                "tagName": "input",
                "states": {
                    "content": "selected",
                    "values": ["selected"],
                    "vars": ["selected"],
                    "args": {},
                    "filters": [],
                    "expression": []
                }
            }, {
                "path": "0,21",
                "type": "tag",
                "children": [{
                    "path": "0,21,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.firstname": [{
                                "args": {
                                    "VALUE": "data.firstname"
                                },
                                "filters": ["second", "first"],
                                "source": "{replace} The Text Of The button\n    "
                            }]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "ui.Button"
            }, {
                "path": "0,23",
                "type": "tag",
                "staticAttributes": {
                    "class": "close"
                },
                "children": [{
                    "path": "0,23,1",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.firstname": [{
                                "args": {
                                    "VALUE": "data.firstname"
                                },
                                "filters": ["first"],
                                "source": "{replace} Close Text get from ."
                            }]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div",
                "states": {
                    "content": "states",
                    "values": ["states"],
                    "vars": ["states"],
                    "args": {},
                    "filters": [],
                    "expression": []
                }
            }, {
                "path": "0,25",
                "type": "tag",
                "staticAttributes": {
                    "class": "close",
                    "style": "background-color:red"
                },
                "tagName": "div",
                "states": {
                    "content": "app.config.close&&(state==='one'||state==='two'))",
                    "values": ["app.config.close&&$0)"],
                    "vars": ["state", "app.config.close&&$0)"],
                    "args": {},
                    "filters": [],
                    "expression": ["(this.getState(\"state\")==='one'||this.getState(\"state\")==='two')"]
                }
            }, {
                "path": "0,27",
                "type": "tag",
                "tagName": "div",
                "states": {
                    "content": "states",
                    "values": ["states"],
                    "vars": ["states"],
                    "args": {},
                    "filters": [],
                    "expression": []
                }
            }, {
                "path": "0,29",
                "type": "comment",
                "data": " Comment "
            }],
            "links": [{
                "name": "hellobutton",
                "value": "0,21"
            }, {
                "name": "close2",
                "value": "0,23"
            }, {
                "name": "close",
                "value": "0,25"
            }],
            "dynamicSummary": {
                "selected": {
                    "selected": {
                        "0": "{selected}"
                    },
                    "class": {
                        "0": "userview-{selected}"
                    }
                },
                "state.top": {
                    "style": {
                        "0": " top:{state.top}px"
                    }
                },
                "disabled": {
                    "class": {
                        "0": "userview-{disabled}"
                    }
                },
                "hover": {
                    "class": {
                        "0": "userview-{hover}"
                    }
                },
                "data.firstname": {
                    "data": {
                        "0,1,0": "F: {data.firstname}",
                        "0,9,0": {
                            "args": {
                                "VALUE": "data.firstname"
                            },
                            "filters": [
                                ["i18n", "template"]
                            ],
                            "source": "{replace}"
                        },
                        "0,11,0": {
                            "args": {
                                "AGE": "data.age",
                                "FIRST": "data.firstname"
                            },
                            "filters": [
                                ["i18n", "template"]
                            ],
                            "source": "Hello man ! Yo Yo {replace}"
                        },
                        "0,13,0": {
                            "args": {
                                "AGE": "data.age",
                                "FIRST": "data.firstname"
                            },
                            "filters": [
                                ["i18n", "template2"]
                            ],
                            "source": "{replace}"
                        },
                        "0,21,0": {
                            "args": {
                                "VALUE": "data.firstname"
                            },
                            "filters": ["second", "first"],
                            "source": "{replace} The Text Of The button\n    "
                        },
                        "0,23,1": {
                            "args": {
                                "VALUE": "data.firstname"
                            },
                            "filters": ["first"],
                            "source": "{replace} Close Text get from ."
                        }
                    }
                },
                "data.secondname": {
                    "data": {
                        "0,3,0": "S: {data.secondname}"
                    }
                },
                "data.age": {
                    "data": {
                        "0,5,0": "A: {data.age}",
                        "0,11,0": {
                            "args": {
                                "AGE": "data.age",
                                "FIRST": "data.firstname"
                            },
                            "filters": [
                                ["i18n", "template"]
                            ],
                            "source": "Hello man ! Yo Yo {replace}"
                        },
                        "0,13,0": {
                            "args": {
                                "AGE": "data.age",
                                "FIRST": "data.firstname"
                            },
                            "filters": [
                                ["i18n", "template2"]
                            ],
                            "source": "{replace}"
                        }
                    }
                },
                "i18n.template": {
                    "data": {
                        "0,7,0": "{i18n.template}"
                    }
                },
                "data.value": {
                    "data": {
                        "0,15,0": "The value is {data.value}"
                    },
                    "value": {
                        "0,19": "{data.value}"
                    }
                },
                "data.coordinates.x": {
                    "data": {
                        "0,17,0": "Cooridnates {data.coordinates.x} & {data.coordinates.y}"
                    }
                },
                "data.coordinates.y": {
                    "data": {
                        "0,17,0": "Cooridnates {data.coordinates.x} & {data.coordinates.y}"
                    }
                }
            },
            "tagName": "div",
            "enableStates": ["hover", "selected", "disabled", {
                "name": "counter",
                "type": "int",
                "default": 0
            }, {
                "name": "top",
                "type": "int",
                "default": 0
            }, {
                "name": "value",
                "type": "int",
                "default": 0
            }, {
                "name": "type",
                "type": "string",
                "default": "none"
            }],
            "extend": "fmvc.View",
            "className": "UserView",
            "i18n": {
                "ru": {
                    "title": "Карточка пользователя",
                    "username": "Завут пацанчика/у {VALUE}",
                    "age": "Уже {VALUE} стукнуло",
                    "balance": "На текущий момент у него/нее {VALUE} бабосов",
                    "template": "Какой то щаблон без всего",
                    "template2": "Шаблон RU. Юзеру {AGE, plural, one {# год} few {# года} many {# лет} other {# лет}} , {FIRST} - FIRST"
                },
                "en": {
                    "title": "The user card",
                    "username": "His/her name is {VALUE}",
                    "age": "She/he is {VALUE} ages",
                    "balance": "She/he has {VALUE, plural, one {# ruble} other {# rubles}"
                }
            },
            "css": {
                "content": ".userview{background-color:#808080;font-size:16px;line-height:24px;display:inline-block;width:200px}.userview-selected{border:1px solid #f00}.userview-hover{font-weight:bold;background-color:#0e90d2 !important;border:1px solid #00f}.userview-disabled{font-color:#f00;text-decoration:underline}",
                "enabled": false
            }
        };
        return UserView;
    })(fmvc.View);
    ui.UserView = UserView;
})(ui || (ui = {}));
