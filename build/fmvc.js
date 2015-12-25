var fmvc;
(function (fmvc) {
    var Event = (function () {
        function Event() {
        }
        Event.Model = {
            Changed: 'ModelChanged',
            StateChanged: 'ModelStateChanged',
            Disposed: 'ModelDisposed'
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
                    this.removeHandler();
                    this.unbind(this._facade);
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
        Notifier.prototype.bind = function (object, handler) {
            this.addListener(object, handler);
            return this;
        };
        Notifier.prototype.unbind = function (object, handler) {
            this.removeListener(object, handler);
            return this;
        };
        // Послаем сообщение сначала в фасад, потом частным слушателям (для моделей)
        Notifier.prototype.sendEvent = function (name, data, changes, sub, error) {
            if (data === void 0) { data = null; }
            if (changes === void 0) { changes = null; }
            if (sub === void 0) { sub = null; }
            if (error === void 0) { error = null; }
            if (this._disposed)
                throw Error('Model ' + this.name + ' is disposed and cant send event');
            if (!this._listeners)
                return;
            // facade, mediators, other is optional
            var e = { name: name, sub: sub, data: data, changes: changes, error: error, target: this };
            this.sendToListeners(e);
        };
        Notifier.prototype.log = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (this.facade)
                this.facade.logger.add(this.name, args);
            else
                console.log(this.name, args);
            return this;
        };
        Notifier.prototype.registerHandler = function () {
        };
        Notifier.prototype.removeHandler = function () {
        };
        Notifier.prototype.addListener = function (object, handler) {
            var hasBind = this.hasBind(object, handler);
            if (!this._listeners)
                this._listeners = [];
            if (!hasBind) {
                this._listeners.push({ target: object, handler: handler });
            }
        };
        Notifier.prototype.hasBind = function (object, handler) {
            var l, i, ol;
            if (!this._listeners)
                return false;
            for (i = 0, l = this._listeners.length; i < l; i++) {
                ol = this._listeners[i];
                if (ol.target === object && ol.handler === handler)
                    return true;
            }
            return false;
        };
        Notifier.prototype.removeListener = function (object, handler) {
            var deletedOffset = 0;
            this._listeners.forEach(function (lo, i) {
                if (lo.target === object && (!handler || handler === lo.handler)) {
                    this.splice(i - deletedOffset, 1);
                    deletedOffset++;
                }
            }, this._listeners);
        };
        Notifier.prototype.removeAllListeners = function () {
            this._listeners = null;
        };
        Notifier.prototype.sendToListeners = function (e) {
            var lo;
            var target;
            for (var i = 0, len = this._listeners.length; i < len; i++) {
                lo = this._listeners[i];
                target = lo.target;
                target.disposed ? this.unbind(lo) : (lo.handler).call(target, e);
            }
        };
        Notifier.prototype.dispose = function () {
            this.removeAllListeners();
            this._facade = null;
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
        None: 'none',
        New: 'new',
        Parsing: 'parsing',
        Parsed: 'parsed',
        Syncing: 'syncing',
        Synced: 'synced',
        Changed: 'changed',
        Error: 'error',
    };
    fmvc.ModelAction = {
        Get: 'get',
        Insert: 'insert',
        Update: 'update',
        Delete: 'delete',
        Add: 'add',
    };
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(name, data, opts) {
            if (data === void 0) { data = null; }
            _super.call(this, name, fmvc.TYPE_MODEL);
            // model options
            this.enabledEvents = true;
            this.enabledState = true;
            this.enableValidate = false;
            this.enableCommit = false; // re,validate & sync changes
            this.autoCommit = false; //
            this.history = false;
            if (opts)
                _.extend(this, opts);
            if (data) {
                this.setData(data);
                this.setState(fmvc.ModelState.New);
            }
        }
        Model.prototype.reset = function () {
            this._data = null;
            this._changes = null;
            this._state = fmvc.ModelState.None;
            this.sendEvent(fmvc.Event.Model.Changed);
            return this;
        };
        Object.defineProperty(Model.prototype, "d", {
            /*
             * Data layer
             */
            get: function () {
                return this.getData();
            },
            set: function (value) {
                this.setData(value);
            },
            enumerable: true,
            configurable: true
        });
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
        Object.defineProperty(Model.prototype, "invalid", {
            get: function () {
                return this._invalid;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Model.prototype, "schemas", {
            get: function () {
                return this.getSchemas();
            },
            enumerable: true,
            configurable: true
        });
        Model.prototype.getSchemas = function () {
            return null;
        };
        Model.prototype.getData = function () {
            return this._data;
        };
        Model.prototype.setData = function (value) {
            if (this._data === value || this.disposed)
                return;
            this._data = value;
            this.sendEvent(fmvc.Event.Model.Changed, this._data, this._changes);
        };
        Object.defineProperty(Model.prototype, "changes", {
            get: function () {
                return this._changes;
            },
            set: function (value) {
                this.setChanges(value);
            },
            enumerable: true,
            configurable: true
        });
        Model.prototype.setChanges = function (value) {
            if (this._data === value || this.disposed)
                return;
            if (!this.enableCommit) {
                this.applyChanges(value);
            }
            else {
                if (_.isObject(value) && _.isObject(this._data))
                    this._changedData = _.extend(this._changedData || _.extend({}, this._data), value);
                else
                    this._changedData = value;
                this.state = fmvc.ModelState.Changed;
                if (this.autoCommit)
                    this.commit();
            }
        };
        Model.prototype.applyChanges = function (changes) {
            if (_.isObject(changes) && _.isObject(this._data))
                _.extend(this._data, changes);
            else
                this._data = changes; // array, string, number, boolean
            this.state = fmvc.ModelState.Synced;
            this.sendEvent(fmvc.Event.Model.Changed, this._data, this._changes);
        };
        Model.prototype.commit = function () {
            if (this._changedData) {
                var isValid = this.validate();
                if (isValid) {
                    return this.sync().then(this.applyChanges, this.syncErrorHandler);
                }
                return isValid;
            }
            return true;
        };
        Model.prototype.sync = function () {
            this.state = fmvc.ModelState.Syncing;
            return this.syncImpl();
        };
        Model.prototype.syncImpl = function () {
            return null;
        };
        Model.prototype.syncErrorHandler = function () {
            this.state = fmvc.ModelState.Error;
        };
        Model.prototype.validate = function () {
            return false;
        };
        Object.defineProperty(Model.prototype, "state", {
            /*
            public parseValueAndSetChanges(value:T):any {
                if (value instanceof Model) throw Error('Cant set model data, data must be object, array or primitive');
                var result = null;
                var prevData = _.clone(this._data);
                var changes:{[id:string]:any} = null;
                var hasChanges:boolean = false;
    
                if (_.isArray(value)) {
                    result = (<any>value).concat([]); //clone of array
                }
                else if (this.changesWatch && _.isObject(prevData) && _.isObject(value)) {
                    // check changes and set auto data
                    for (var i in value) {
                        if (prevData[i] !== value[i]) {
                            if (!changes) changes = {};
                            hasChanges = true;
                            changes[i] = value[i];
                            prevData[i] = value[i];
                        }
                    }
                    this._changes = value;
                    result = prevData;
                }
                else {
                    result = (_.isObject(value)) ? _.extend((prevData ? prevData : {}), value) : value; // primitive || array || object && !watchChanges , no data && any value (object etc)
                }
                return result;
            }
            */
            /*
             *   Internal state layer
             */
            get: function () {
                return this._state;
            },
            set: function (value) {
                this.setState(value);
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
        Model.prototype.setState = function (value) {
            if (!this.enabledState || this._state === value)
                return this;
            this._prevState = value;
            this._state = value;
            this.sendEvent(fmvc.Event.Model.StateChanged, this._state);
            return this;
        };
        Object.defineProperty(Model.prototype, "length", {
            get: function () {
                return _.isArray(this.data) ? this.data.length : -1;
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
            this.sendEvent(fmvc.Event.Model.Disposed);
            this._data = null;
            _super.prototype.dispose.call(this);
        };
        return Model;
    })(fmvc.Notifier);
    fmvc.Model = Model;
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    /*
         var d1 = ["a", "b",1,2,3,4,5,6,7];
         var m2 = new fmvc.Model<T>('a2', [4,5,6,7,8,9,10,11]);
         var s1 = new fmvc.CompositeModel('s1', [d1,m2]);
         s1.setMapBeforeCompare(m2.name, (v)=>v).setSourceCompareFunc(_.intersection).setResultFunc((v)=>(_.chain(v).filter((r:any)=>(r%2===0)).map((d:any)=>(d*100)).value()));
     */
    var CompositeModel = (function (_super) {
        __extends(CompositeModel, _super);
        function CompositeModel(name, source, opts) {
            _super.call(this, name, null, opts);
            this.throttleApplyChanges = _.throttle(_.bind(this.apply, this), 100, { leading: false });
            if (_.isArray(source))
                this.addSources(source);
            else
                this.addSource(source);
        }
        CompositeModel.prototype.addSources = function (v) {
            var _this = this;
            if (!v)
                return this;
            if (!this._sources)
                this._sources = [];
            _.each(v, function (source) { return _this.addSource(source); }, this);
            return this;
        };
        CompositeModel.prototype.addSource = function (v, mapBeforeCompareFunc) {
            if (v instanceof fmvc.Model) {
                var m = v;
                m.bind(this, this.sourceChangeHandler);
                this._sources.push(m);
                if (mapBeforeCompareFunc) {
                    if (_.isFunction(mapBeforeCompareFunc)) {
                        this.setMapBeforeCompare(m.name, mapBeforeCompareFunc);
                    }
                    else {
                        throw 'SourceModel: Cant set ' + mapBeforeCompareFunc + ' mapBeforeCompareFunc for model ' + m.name;
                    }
                }
            }
            else if (v.length) {
                this._sources.push(v);
            }
            else {
                throw 'SourceModel: Cant add source ' + v;
            }
            return this;
        };
        CompositeModel.prototype.removeSource = function (v) {
            var index = -1;
            if (this._sources && (index = this._sources.indexOf(v)) > -1) {
                this._sources.splice(index, 1);
                if (v instanceof fmvc.Model)
                    v.unbind(v);
                if (this._mapBeforeCompareFunc[v.name])
                    delete this._mapBeforeCompareFunc[v.name];
            }
            else {
                throw 'SourceModel: Can remove source ' + v;
            }
            return this;
        };
        CompositeModel.prototype.sourceChangeHandler = function (e) {
            this.throttleApplyChanges();
        };
        CompositeModel.prototype.setSourceCompareFunc = function (value) {
            this._sourceCompareFunc = value;
            this.throttleApplyChanges();
            return this;
        };
        CompositeModel.prototype.setMapBeforeCompare = function (name, value) {
            if (!this._mapBeforeCompareFunc)
                this._mapBeforeCompareFunc = {};
            this._mapBeforeCompareFunc[name] = value;
            this.throttleApplyChanges();
            return this;
        };
        CompositeModel.prototype.setResultFunc = function () {
            var values = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                values[_i - 0] = arguments[_i];
            }
            this._resultFuncs = values ? _.flatten([].concat(this._resultFuncs ? this._resultFuncs : [], values)) : null;
            this.throttleApplyChanges();
            return this;
        };
        CompositeModel.prototype.apply = function () {
            if (this.disposed)
                return;
            if (!this._sources || !this._sources.length)
                this.setData(null);
            if (!this._sourceCompareFunc && this._sources.length > 1) {
                throw 'SourceModel: has source datas, but method not defined';
            }
            var result = null;
            var sourcesResult = this.getSourceResult();
            if (sourcesResult)
                result = _.reduce(this._resultFuncs, function (memo, method) {
                    return method.call(this, memo);
                }, sourcesResult, this);
            this.reset().setData(result);
        };
        CompositeModel.prototype.getSourceResult = function () {
            if (this._sourceCompareFunc && this._sources.length > 1) {
                return this._sourceCompareFunc.apply(this, _.map(this._sources, this.getPreparedSourceData, this), this);
            }
            else {
                return this._sources[0] instanceof fmvc.Model ? this._sources[0].data : this._sources[0];
            }
        };
        CompositeModel.prototype.getPreparedSourceData = function (v) {
            if (v instanceof fmvc.Model) {
                var mapper = this._mapBeforeCompareFunc && this._mapBeforeCompareFunc[v.name] ? this._mapBeforeCompareFunc[v.name] : null;
                var mappedResult = mapper ? _.map(v.data, mapper) : v.data;
                return mappedResult;
            }
            else {
                return v;
            }
        };
        CompositeModel.prototype.dispose = function () {
            var _this = this;
            _.each(this._sources, function (v) { return _this.removeSource(v); }, this);
            _.each(this._mapBeforeCompareFunc, function (v, k) { return delete _this._mapBeforeCompareFunc[k]; }, this);
            this._mapBeforeCompareFunc = null;
            this._sources = null;
            this._sourceCompareFunc = null;
            this._resultFuncs = null;
            this._sourceCompareFunc = null;
            _super.prototype.dispose.call(this);
        };
        return CompositeModel;
    })(fmvc.Model);
    fmvc.CompositeModel = CompositeModel;
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var Logger = (function (_super) {
        __extends(Logger, _super);
        function Logger(name, config) {
            _super.call(this, name, []);
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
    var ViewBindedMethods = {
        Validate: 'validate'
    };
    fmvc.frameExecution = 0;
    var nextFrameHandlers = [];
    var maxFrameCount = 5000;
    var waiting = false;
    var frameStep = 1;
    function requestFrameHandler() {
        if (waiting)
            return;
        waiting = true;
        window.requestAnimationFrame ? window.requestAnimationFrame(executeNextFrameHandlers) : setTimeout(executeNextFrameHandlers, 0);
    }
    function nextFrameHandler(handler, context) {
        var params = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            params[_i - 2] = arguments[_i];
        }
        var result = function () { return handler.apply(context, params); };
        nextFrameHandlers.push(result);
        requestFrameHandler();
    }
    fmvc.nextFrameHandler = nextFrameHandler;
    function executeNextFrameHandlers(time) {
        if (++fmvc.frameExecution % frameStep === 0) {
            var executedHandlers = nextFrameHandlers.splice(0, maxFrameCount);
            _.each(executedHandlers, function (v, k) { return v(); });
        }
        waiting = false;
        if (nextFrameHandlers.length)
            requestFrameHandler();
    }
    var View = (function (_super) {
        __extends(View, _super);
        function View(name) {
            _super.call(this, name, fmvc.TYPE_VIEW);
            this._states = {};
            this._invalidate = 0;
            this._isWaitingForValidate = false;
            this._inDocument = false;
            this._isDomCreated = false;
            _.bindAll(this, ViewBindedMethods.Validate);
        }
        Object.defineProperty(View.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            set: function (value) {
                this._parent = value;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.getElement = function () {
            return this._element;
        };
        View.prototype.setElement = function (value) {
            if (this._element)
                throw Error('Cant set element of the fmvc.View instance ' + this.name);
            this._element = value;
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
        View.prototype.setStates = function (value) {
            _.each(value, this.setStateReverse, this);
            return this;
        };
        View.prototype.setStateReverse = function (value, name) {
            this.setState(name, value);
            return this;
        };
        View.prototype.setState = function (name, value) {
            if (this.disposed)
                return;
            var stateValue = this.getStateValue(name, value);
            if (this._states[name] === stateValue)
                return this;
            this._states[name] = stateValue;
            this.applyStateBinds(name, stateValue);
            this.invalidate(fmvc.InvalidateType.State);
            return this;
        };
        View.prototype.applyStateBinds = function (name, value) {
        };
        View.prototype.getStateValue = function (name, value) {
            return value;
        };
        View.prototype.getState = function (name) {
            return this._states[name];
        };
        Object.defineProperty(View.prototype, "model", {
            get: function () {
                return this._model;
            },
            set: function (value) {
                this.setModel(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "data", {
            get: function () {
                return this._data;
            },
            set: function (value) {
                this.setData(value);
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.setData = function (value) {
            if (this.disposed)
                return this;
            if (this._data === value)
                return this;
            this._data = value;
            this.invalidate(fmvc.InvalidateType.Data);
            return this;
        };
        View.prototype.setModel = function (value) {
            if (this.disposed)
                return this;
            if (value != this._model) {
                if (this._model)
                    this._model.unbind(this);
                if (value && value instanceof fmvc.Model)
                    value.bind(this, this.modelChangeHandler);
                this.setData(value ? value.data : null);
                this._model = value;
            }
            return this;
        };
        Object.defineProperty(View.prototype, "app", {
            get: function () {
                return (this._mediator && this._mediator.facade) ? this._mediator.facade.model : (this.parent ? this.parent.app : null);
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
        Object.defineProperty(View.prototype, "isDomCreated", {
            get: function () {
                return this._isDomCreated;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.createDom = function () {
            if (this._isDomCreated)
                return;
            this.beforeCreate();
            this.createDomImpl();
            this._isDomCreated = true;
            this.afterCreate();
        };
        View.prototype.createDomImpl = function () {
            this.setElement(document.createElement('div'));
        };
        View.prototype.enter = function () {
            if (this._inDocument) {
                throw new Error('Cant enter, it is in document');
            }
            this.enterImpl();
            this._inDocument = true;
            this.afterEnter();
        };
        View.prototype.enterImpl = function () {
            var _this = this;
            if (this._model)
                this._model.bind(this, this.modelChangeHandler);
            if (this._binds)
                this._binds.forEach(function (v) { return v.bind(_this, _this.invalidateApp); });
        };
        View.prototype.exit = function () {
            this.beforeExit();
            this.exitImpl();
            this._inDocument = false;
            this.afterExit();
        };
        View.prototype.modelChangeHandler = function (e) {
            this.setData(this.model.data);
            this.invalidateData(); //@todo check
            if (e && e.name === fmvc.Event.Model.Disposed)
                this.dispose(); //@todo analyze
        };
        View.prototype.exitImpl = function () {
            var _this = this;
            if (this._model)
                this._model.unbind(this);
            if (this._binds)
                this._binds.forEach(function (v) { return v.unbind(_this); });
        };
        View.prototype.beforeCreate = function () {
        };
        View.prototype.afterCreate = function () {
        };
        View.prototype.beforeEnter = function () {
        };
        View.prototype.afterEnter = function () {
        };
        View.prototype.beforeExit = function () {
        };
        View.prototype.afterExit = function () {
        };
        View.prototype.afterRender = function () {
        };
        View.prototype.beforeUnrender = function () {
        };
        View.prototype.invalidate = function (value) {
            this._invalidate = this._invalidate | value;
            if (!this._isWaitingForValidate) {
                this._isWaitingForValidate = true;
                nextFrameHandler(this.validate, this);
            }
        };
        Object.defineProperty(View.prototype, "isWaitingForValidate", {
            get: function () {
                return this._isWaitingForValidate;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.invalidateData = function () {
            this.invalidate(fmvc.InvalidateType.Data);
        };
        View.prototype.invalidateApp = function () {
            this.invalidate(fmvc.InvalidateType.App);
        };
        View.prototype.invalidateAll = function () {
            this.invalidate(fmvc.InvalidateType.App | fmvc.InvalidateType.Data | fmvc.InvalidateType.State);
        };
        View.prototype.validate = function () {
            if (!this._inDocument || !this._invalidate)
                return;
            if (this._invalidate & fmvc.InvalidateType.State)
                this.validateState();
            if (this._invalidate & fmvc.InvalidateType.Data)
                this.validateData();
            if (this._invalidate & fmvc.InvalidateType.App)
                this.validateApp();
            //if (this._invalidate & InvalidateType.Parent) this.validateParent();
            //if (this._invalidate & InvalidateType.Children) this.validateChildren();
            /*
             if(this._invalidate & InvalidateType.Template) this.validateTemplate();
             if(this._invalidate & InvalidateType.Theme) this.validateTheme();
             if(this._invalidate & InvalidateType.I18n) this.validateI18n();
             */
            this._invalidate = 0;
            this._isWaitingForValidate = false;
        };
        View.prototype.validateData = function () {
        };
        View.prototype.validateState = function () {
        };
        View.prototype.validateApp = function () {
        };
        View.prototype.render = function (parent, replaced) {
            var requiredValidate = this.isDomCreated;
            this.createDom();
            this.enter();
            if (requiredValidate)
                this.invalidateAll();
            if (replaced) {
                parent.replaceChild(this.getElement(), replaced);
            }
            else {
                parent.appendChild(this.getElement());
            }
            this.afterRender();
            return this;
        };
        View.prototype.unrender = function (replace) {
            this.exit();
            this.beforeUnrender();
            var parentElement = this.getElement().parentNode;
            if (!parentElement)
                return this;
            if (replace) {
                parentElement.replaceChild(replace, this.getElement());
            }
            else {
                parentElement.removeChild(this.getElement());
            }
            return this;
        };
        View.prototype.dispose = function () {
            this.exit();
            this.unrender();
            _super.prototype.dispose.call(this);
            // Clean refs
            this._states = null;
            this._parent = null;
            this._mediator = null;
            this._model = null;
            this._data = null;
            this._binds = null;
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
        View.prototype.unregisterBind = function (value) {
            var i = this._binds.indexOf(value);
            if (i > -1)
                this._binds.splice(i, 1);
            value.unbind(this);
        };
        View.prototype.registerBind = function (value) {
            if (!this._binds)
                this._binds = [];
            if (this._binds.indexOf(value) > -1)
                return;
            this._binds.push(value);
            if (this.inDocument)
                value.bind(this, this.invalidateApp);
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
            if (e && e.globalScope) {
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
///<reference path='./source.model.ts'/>
///<reference path='./logger.ts'/>
///<reference path='./view.ts'/>
///<reference path='./mediator.ts'/>
///<reference path='../../../DefinitelyTyped/lodash/lodash.d.ts'/>
///<reference path='../../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='../../../DefinitelyTyped/bluebird/bluebird.d.ts'/>
//# sourceMappingURL=fmvc.js.map