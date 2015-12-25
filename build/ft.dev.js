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
var ft;
(function (ft) {
    var DataType = {
        Boolean: 'boolean',
        String: 'string',
        Number: 'number',
        Undefined: 'undefined',
        Object: 'object',
    };
    function applyBooleanStateValue(value) {
        if (!value)
            return false; // undefined, null, 0, false
        var type = typeof value;
        if (type === DataType.Boolean)
            return value;
        else if (type === DataType.String)
            return (value === 'false' || value === '0' || value === 'null') ? false : true;
        return true;
    }
    ft.applyBooleanStateValue = applyBooleanStateValue;
    function applyStringStateValue(value) {
        if (!value)
            return ''; // undefined, null, 0, false
        var type = typeof value;
        if (type === DataType.String)
            return value;
        else
            return String(value);
    }
    ft.applyStringStateValue = applyStringStateValue;
    function applyNumberStateValue(value) {
        var type = typeof value;
        if (type === DataType.Number)
            return value;
        else
            return Number(value);
    }
    ft.applyNumberStateValue = applyNumberStateValue;
    ft.TemplateStateValueFunc = {
        base: applyStringStateValue,
        life: applyStringStateValue,
        custom: applyStringStateValue,
        hover: applyBooleanStateValue,
        selected: applyBooleanStateValue,
        disable: applyBooleanStateValue,
        focus: applyBooleanStateValue,
    };
})(ft || (ft = {}));
///<reference path="./d.ts" />
var ft;
(function (ft) {
    var GetContext = {
        string: 'string',
        model: 'model',
        modelField: 'model.',
        data: 'data',
        dataField: 'data.',
        appField: 'app.',
        stateField: 'state',
        openBracket: '(',
        thisDot: 'this.'
    };
    var ExpressionName = (function () {
        function ExpressionName(name, context) {
            if (context === void 0) { context = null; }
            this.name = name;
            this.context = context;
        }
        return ExpressionName;
    })();
    ft.ExpressionName = ExpressionName;
    var Expression = (function () {
        function Expression() {
            this.counter = 0;
            this.ExpressionMatchRe = /\{[\(\)\\\.,\|\?:;'"!@A-Za-z<>=\[\]& \+\-\/\*%0-9]+\}/g;
            this.VariableMatchRe = /([A-Za-z0-9 _\-"'\.]+)/gi;
            this.ExResult = '{$0}';
            this.funcMap = {};
        }
        Expression.prototype.strToExpression = function (value) {
            var r = this.parseExpressionMultiContent(value);
            return r;
        };
        Expression.prototype.getExpressionNameObject = function (value) {
            return new ExpressionName(value.name);
        };
        Expression.prototype.execute = function (value, context, classes) {
            return this.executeMultiExpression(value, context, classes);
        };
        //----------------------------------------------------------------------------------------------------------------------------------------
        // Execute
        //----------------------------------------------------------------------------------------------------------------------------------------
        Expression.prototype.executeFilters = function (value /* primitive, object args of i18n */, filters, context) {
            if (!filters || !filters.length)
                return value;
            return _.reduce(filters, function (memo /* primitive/object args of i18n */, filter, index) {
                return this.executePlainFilter(filter, memo, context);
            }, value, this);
        };
        Expression.prototype.executePlainFilter = function (filter, value, context) {
            if (filter.indexOf('i18n.') === 0) {
                return context.getFormattedMessage(filter.replace('i18n.', ''), value);
            }
            else {
                if (!this.funcMap[filter])
                    this.funcMap[filter] = context.getFilter(filter);
                try {
                    var fnc = this.funcMap[filter];
                    return fnc.call(context, value);
                }
                catch (e) {
                    return '{error[' + filter + ']}';
                }
            }
        };
        Expression.prototype.executeMultiExpression = function (ex, context, classes) {
            var _this = this;
            var isSimpleExpression = (ex.expressions.length === 1);
            var contextValue;
            return isSimpleExpression ?
                this.executeExpression(ex, context, classes) :
                _.reduce(ex.expressions, function (memo, value, index) {
                    contextValue = _this.getParsedContextValue(value, context, classes);
                    if (classes && (!memo || !contextValue))
                        return '';
                    var result = memo ? memo.replace('{$' + index + '}', contextValue) : '{error:multiExpression}';
                    return result;
                }, ex.result, this);
        };
        Expression.prototype.getParsedContextValue = function (value, context, classes) {
            return this.parseContextValue(this.getContextValue(value, context), value, classes);
        };
        Expression.prototype.parseContextValue = function (value, ex, classes) {
            if (classes) {
                if (!!value) {
                    if (value === true) {
                        if (!_.isString(ex))
                            throw 'Incorrect type at parseContextValue with classes true';
                        return ex.split('.')[1];
                    }
                    else {
                        return value;
                    }
                }
                else {
                    return null;
                }
            }
            return value;
        };
        Expression.prototype.ifString = function (value) {
            return (_.isString(value) ? value : null);
        };
        Expression.prototype.getContextValue = function (v, context) {
            var r, safeV;
            if (r = context.getDynamicProperty(v))
                return r;
            console.log('V is ', v, ' check');
            if (typeof v === 'string') {
                ft.counters.expressionCtx++;
                if (v === GetContext.data || v === GetContext.model) {
                    r = context[v];
                    if (r === undefined)
                        r = null;
                    context.setDynamicProperty(v, r);
                }
                else if (v.indexOf(GetContext.dataField) === 0 || v.indexOf(GetContext.appField) === 0 || v.indexOf(GetContext.modelField) === 0) {
                    if (!this.funcMap[v]) {
                        //safeV = v.replace(/'/g, '"');
                        this.funcMap[v] = new Function('var v=null; try {v=this.' + v + ';} catch(e) {v=\'{' + v + '}\';} return v;');
                    }
                    r = this.funcMap[v].apply(context);
                    console.log('V is ', v, ' in internal exp ', r, this.funcMap[v]);
                    r = r === undefined ? null : r;
                    context.setDynamicProperty(v, r);
                }
                else if (v.indexOf(GetContext.stateField) === 0) {
                    if (!this.funcMap[v]) {
                        var state = v.substring(6);
                        this.funcMap[v] = new Function('return this.getState("' + state + '");');
                    }
                    r = this.funcMap[v].apply(context);
                    if (r === undefined)
                        r = null;
                    context.setDynamicProperty(v, r);
                }
                else if (v.indexOf(GetContext.openBracket) === 0 || v.indexOf(GetContext.thisDot) >= 0) {
                    if (!this.funcMap[v]) {
                        safeV = v.replace(/'/g, '"');
                        this.funcMap[v] = new Function('var v=null; try {v=' + v + ';} catch(e) {v=\'{' + safeV + '}\';} return v;');
                    }
                    r = this.funcMap[v].apply(context);
                    if (r === undefined)
                        r = null;
                }
                if (r !== undefined)
                    return r;
            }
            else if (_.isObject(v)) {
                ft.counters.expressionEx++;
                return this.executeExpression(v, context);
            }
            throw new Error('Not supported variable ' + v + ' in ' + context.name);
        };
        Expression.prototype.getContextArguments = function (ex, context) {
            var _this = this;
            return _.isString(ex.args) ? this.getContextValue(ex.args, context) : _.reduce(ex.args, function (r, v, k) { return (r[k] = _this.getContextValue(v, context), r); }, {}, this);
        };
        Expression.prototype.executeExpression = function (ex, context, classes) {
            ft.counters.expression++;
            var r = ex.args ? this.getContextArguments(ex, context) : this.getParsedContextValue(ex.expressions[0], context, classes);
            if (!r && classes)
                return ''; // empty class expression
            if (ex.filters)
                r = this.executeFilters(r, ex.filters, context);
            if (ex.result && ex.result !== this.ExResult)
                r = ex.result.replace(this.ExResult, r);
            return r;
        };
        //----------------------------------------------------------------------------------------------------------------------------------------
        // Create expression path
        //----------------------------------------------------------------------------------------------------------------------------------------
        Expression.prototype.getName = function () {
            return 'e-' + this.counter++;
        };
        Expression.prototype.strToJsMatch = function (value) {
            var m = value.match(this.ExpressionMatchRe);
            return m && m[0] ? (m[0]).substring(1, m[0].length - 1) : 'this.internalHandler("' + value + '", e)';
        };
        Expression.prototype.parseExpressionMultiContent = function (value) {
            var _this = this;
            var matches = value.match(this.ExpressionMatchRe);
            if (!(matches && matches.length))
                return null;
            var expressions = _.map(matches, function (v) { return _this.parseExpressionContent(v.substring(1, v.length - 1)); }, this);
            var expressionVars = [];
            var result = _.reduce(matches, function (r, v, i) {
                var e = '$' + i;
                return r.replace(v, '{' + e + '}');
            }, value, this);
            var simplyfiedExpressions = _.map(expressions, this.simplifyExpression, this);
            _.each(expressions, function (v) { return expressionVars = expressionVars.concat(v.vars); });
            var r = { name: this.getName(), content: value, result: result, vars: expressionVars, expressions: simplyfiedExpressions };
            return r;
        };
        Expression.prototype.simplifyExpression = function (expression) {
            var ex = this.ifExpression(expression);
            if (ex && !ex.filters)
                return ex.args;
            else
                return expression;
        };
        Expression.prototype.ifSimpleExpression = function (value) {
            return (_.isObject(value) ? value : null);
        };
        Expression.prototype.ifExpression = function (value) {
            return (_.isObject(value) ? value : null);
        };
        /*
         Supported types

         {a} - simple property
         {a|filterOne|filterTwo} - simple property with filters
         // excluded {a,b,c} - selector of properties
         {a||b||c} - expression executed in context
         {a||b?'one':'two'} - expression executed in context
         {data.name as A, (a||b) as V, c as D, (a||b||c) as E|i18n.t|s|d} - expression executed in context with filters
        */
        Expression.prototype.parseExpressionContent = function (value) {
            var _this = this;
            var result = {
                name: this.getName(),
                content: value,
                vars: [],
                args: {},
                filters: [],
            };
            var valueReplacedOr = value.replace(/\|\|/g, '###or');
            var valueSpitByFilter = valueReplacedOr.split(/\|/); // get before first `|`
            var expression = (_.first(valueSpitByFilter)).replace(/###or/g, '||');
            result.filters = _.map(_.rest(valueSpitByFilter), function (v) { return String(v).trim(); }); // get after first `|`
            var args = this.parseArguments(expression);
            var vars;
            var e;
            if (_.isObject(args)) {
                vars = _.map(args, function (v, k) { return (e = _this.tryParseRoundBracketExpression(v), (_.isObject(e) ? args[k] = e.expression : null), e); }, this);
                result.args = args;
            }
            else {
                vars = [this.tryParseRoundBracketExpression(args)];
                var firstExpression = this.ifSimpleExpression(vars[0]);
                result.args = firstExpression ? firstExpression.expression : vars[0];
            }
            _.each(vars, function (v) { return _.isObject(v) ? result.vars = [].concat(result.vars, v.vars) : result.vars.push(v); });
            // remove empty keys
            _.each(_.keys(result), function (key) { return (_.isEmpty(result[key]) ? delete result[key] : null); });
            return result;
        };
        Expression.prototype.tryParseRoundBracketExpression = function (expression, index) {
            //var expressions:string = value;
            //if(!expressions) return value; // @todo review this fix (replace ! sign)
            var _this = this;
            if (index === void 0) { index = 0; }
            //var expression = _.isArray(expressions)?expressions[0]:expressions ;
            // skip direct execution (at handlers);
            var variableMatches = expression.match(this.VariableMatchRe);
            var hasOneMatch = variableMatches && variableMatches.length === 1;
            if (expression.indexOf('this') > -1 || hasOneMatch)
                return expression;
            var variables = _.compact(_.filter(_.map(expression.match(this.VariableMatchRe), function (v) { return v.trim(); }), function (v) { return (v.indexOf('\'') < 0 && v.indexOf('"') < 0 && v.match(/^[A-Za-z]+/gi)); }));
            var convertedExpression = _.reduce(variables, function (memo, v, k) {
                return memo.replace(new RegExp(v, 'g'), '###' + k);
            }, expression, this);
            _.each(variables, function (v, k) { return convertedExpression = convertedExpression.replace(new RegExp('###' + k, 'g'), _this.getExVarToJsVar(v)); }, this);
            var r = { content: expression, expression: convertedExpression, vars: variables };
            return r;
        };
        Expression.prototype.getExVarToJsVar = function (v) {
            var requestVariable = ((v.indexOf('.') > -1 && v.indexOf('state.') === -1) || v === 'data' ? ('this.' + v) : (v.indexOf('state.') > -1 ? ('this.getState("' + v.replace('state.', '') + '")') : ''));
            return requestVariable;
        };
        Expression.prototype.parseArguments = function (value) {
            if (value.indexOf(',') === -1)
                return this.parseArgument(value);
            var result = {};
            _.each(value.split(','), function (argument, index) {
                var parsedArgs = this.parseArgument(argument);
                if (_.isObject(parsedArgs))
                    result = _.extend(result, parsedArgs);
            }, this);
            return _.isEmpty(result) ? null : result;
        };
        Expression.prototype.parseArgument = function (value) {
            if (value.indexOf(' as ') === -1)
                return value.trim();
            else {
                var result = value.split(' as ');
                var object = {};
                object[result[1].trim()] = result[0].trim();
                return object;
            }
        };
        Expression.prototype.getExpressionFromString = function (value) {
            var brackets = [];
            var open = 0;
            var r = [];
            _.each(value, function (v, i) {
                if (v === '(') {
                    if (open === 0)
                        brackets.push([i]);
                    open++;
                }
                else if (v === ')') {
                    if (open === 1)
                        brackets[brackets.length - 1].push(i);
                    open--;
                }
            });
            _.each(brackets, function (v) {
                r.push(value.substring(v[0], v[1] + 1));
            });
            return r.length ? r : null;
        };
        return Expression;
    })();
    ft.Expression = Expression;
})(ft || (ft = {}));
///<reference path='./../d.ts'/>
var ft;
(function (ft) {
    ft.PointerEvent = {
        MouseOver: 'mouseover',
        MouseOut: 'mouseout',
        MouseDown: 'mousedown',
        MouseUp: 'mouseup',
        MouseMove: 'mousemove'
    };
    ft.TouchEvent = {
        TouchStart: 'touchstart',
        TouchEnd: 'touchend',
        TouchMove: 'touchmove',
        TouchCancel: 'touchcancel'
    };
    ft.CompositeEvent = {
        Action: 'action',
        DoubleAction: 'doubleaction',
        LongAction: 'longaction',
        PointerOver: 'pointerover',
        PointerMove: 'pointermove',
        PointerOut: 'pointerout',
        PointerDown: 'pointerdown',
        PointerUp: 'pointerup',
        Swipe: 'swipe',
        Pan: 'pan',
        Pinch: 'pinch',
    };
    var EventTransform = {
        mouseover: 'pointerover',
        mouseout: 'pointerout',
        mousedown: 'pointerdown',
        mouseup: 'pointerup',
        mousemove: 'pointermove',
        touchstart: 'pointerdown',
        touchmove: 'pointermove',
        touchend: 'pointerup',
        touchcancel: 'pointerup'
    };
    var PointerModel = (function (_super) {
        __extends(PointerModel, _super);
        function PointerModel(data, opts) {
            _super.call(this, PointerModel.Name, data, opts);
        }
        PointerModel.prototype.tryTransformToCompositeEvent = function (e) {
            var transformName = EventTransform[e.type];
            var isTouch = e.type.indexOf('touch') === 0;
            var eventData;
            if (isTouch) {
                eventData = e.touches ? e.touches[0] : null;
                if (!eventData)
                    this.log('Incorrect touch event data ', e);
            }
            else {
                eventData = e;
            }
            var result = { name: transformName, clientX: eventData.clientX, clientY: eventData.clientY, time: e.timeStamp, isComposite: true };
            return transformName ? result : e;
        };
        PointerModel.prototype.addSequenceEvent = function (e, target) {
            if (!this.isSequenceEvent(e.name))
                return null;
            if (this.target !== target) {
                this.target = target;
                this.sequence = [];
                this.sequenceLastDownIndex = -1;
                this.sequenceTime = e.time;
            }
            if (e.name === ft.CompositeEvent.PointerDown)
                this.sequenceLastDownIndex = this.sequence.length;
            this.sequence.push(e);
            return this.analyzeSequence(e);
        };
        PointerModel.prototype.isSequenceEvent = function (name) {
            return name === ft.CompositeEvent.PointerMove || name === ft.CompositeEvent.PointerUp || name === ft.CompositeEvent.PointerDown;
        };
        PointerModel.prototype.analyzeSequence = function (e) {
            if (e.name === ft.CompositeEvent.PointerUp) {
                var firstEvent = this.sequence[this.sequenceLastDownIndex] || this.sequence[0];
                return this.getSequenceEvent(e.time - firstEvent.time, Math.abs(e.clientX - firstEvent.clientX), Math.abs(e.clientY - firstEvent.clientY), e);
            }
            return null;
        };
        PointerModel.prototype.getSequenceEvent = function (time, diffX, diffY, e) {
            if (time < 1000 && diffX < 10 && diffY < 10)
                return { name: ft.CompositeEvent.Action, sequence: 1, clientX: e.clientX, clientY: e.clientY };
            return null;
        };
        PointerModel.Name = 'PointerModel';
        return PointerModel;
    })(fmvc.Model);
    ft.PointerModel = PointerModel;
})(ft || (ft = {}));
///<reference path='./../d.ts'/>
var ft;
(function (ft) {
    ft.BrowserEvent = {
        Change: 'change',
        Scroll: 'scroll',
        Focus: 'focus',
        Blur: 'blur'
    };
    ft.KeyboardEvent = {
        KeyUp: 'keyup',
        KeyDown: 'keydown',
    };
    /*
    export interface IEventEmitter3 {
        on(event, handler, context):void;
        once(event, handler, context):void;
        off(event, handler, context):void;
        emit(event, ...args:any[]):any;
    }
    */
    var EventDispatcher = (function () {
        function EventDispatcher(viewHelper) {
            this.eventMap = {};
            this.viewHelper = viewHelper;
            this.pointer = new ft.PointerModel();
            _.bindAll(this, 'browserHandler');
            var listenEvents = [].concat(_.values(ft.BrowserEvent), _.values(ft.PointerEvent), _.values(ft.KeyboardEvent), _.values(ft.TouchEvent));
            _.each(listenEvents, this.on, this);
        }
        EventDispatcher.prototype.browserHandler = function (e) {
            var target = e.target || e.currentTarget;
            var pathId = target.getAttribute ? target.getAttribute(ft.AttributePathId) : null;
            var pathDefinition = this.viewHelper.getPathDefinitionByPathId(pathId);
            var pointerEvent = this.pointer.tryTransformToCompositeEvent(e);
            if (pointerEvent.isComposite) {
                //console.log('New pointer event: ', pointerEvent.name);
                this.pointer.setData(pointerEvent);
            }
            if (pathDefinition) {
                var sequenceEvent = this.pointer.addSequenceEvent(pointerEvent, target);
                var event = this.getTreeEventByBrowserEvent(pointerEvent.name || e.type, pathDefinition.data, pathDefinition.root, e, pointerEvent);
                //console.log('dispatch composite event', pathDefinition.data.path, pointerEvent);
                this.viewHelper.dispatchTreeEventDown(event);
                if (sequenceEvent) {
                    var sequenceEvent = this.getTreeEventByBrowserEvent(sequenceEvent.name, pathDefinition.data, pathDefinition.root, e, sequenceEvent);
                    //console.log('dispatch sequence event',  pathDefinition.data.path, sequenceEvent);
                    this.viewHelper.dispatchTreeEventDown(sequenceEvent);
                }
            }
        };
        EventDispatcher.prototype.getTreeEventByBrowserEvent = function (name, def, view, e, pe) {
            return { name: name, target: view, def: def, e: e, pe: pe, cancelled: false, prevented: false, depth: 1e2, executionHandlersCount: 0 };
        };
        EventDispatcher.prototype.getCustomTreeEvent = function (name, data, view, depth) {
            if (depth === void 0) { depth = 1; }
            return { name: name, target: view, def: view.domDef, previousTarget: null, currentTarget: view, data: data, cancelled: false, prevented: false, depth: depth, executionHandlersCount: 0 };
        };
        EventDispatcher.prototype.getPointer = function () {
            return this.pointer;
        };
        EventDispatcher.prototype.on = function (type) {
            if (this.eventMap[type])
                return;
            window.addEventListener(type, this.browserHandler, true);
            this.eventMap[type] = true;
        };
        EventDispatcher.prototype.off = function (type) {
            this.eventMap[type] = false;
            window.removeEventListener(type, this.browserHandler);
        };
        EventDispatcher.prototype.disposeEvent = function (e) {
            return;
            e.target = e.previousTarget = e.currentTarget = e.e = null;
        };
        return EventDispatcher;
    })();
    ft.EventDispatcher = EventDispatcher;
})(ft || (ft = {}));
///<reference path="./d.ts" />
var ft;
(function (ft) {
    // Params of dom element or component
    ft.TemplateParams = {
        ln: 'ln',
        states: 'states',
        setStates: 'setStates',
        setState: 'setState',
        setStateSelected: 'state.selected',
        setStateDisabled: 'state.disabled',
        stateHandlers: '.stateHandlers',
        setData: '.data',
        setModel: '.model',
        childrenClass: 'children.class',
        childrenSetStates: 'children.setStates',
        childrenEnableStateHandlers: 'children.stateHandlers',
        childrenSetStateSelected: 'children.state.selected',
        childrenSetStateDisabled: 'children.state.disabled',
        childrenData: 'children.data',
        childrenModel: 'children.model',
        onwildcard: 'on*',
        childrenOnAction: 'children.onAction' // children eventHandler
    };
})(ft || (ft = {}));
///<reference path="./d.ts" />
var ft;
(function (ft) {
    var Template = (function () {
        function Template() {
        }
        return Template;
    })();
    ft.Template = Template;
})(ft || (ft = {}));
///<reference path="./d.ts" />
var ft;
(function (ft) {
    var htmlparser = Tautologistics.NodeHtmlParser;
    var expressionManager;
    var expression = new ft.Expression();
    var TemplateParser = (function () {
        function TemplateParser() {
            this._skipProperties = ['raw'];
            this._svgTagNames = ('circle clipPath defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan').split(' ');
            this._componentParams = _.values(ft.TemplateParams);
            this._propAttribs = {
                style: {
                    delimiter: ';',
                    canGet: function (v) { return (v.split(':').length > 1); },
                    getName: function (v) { return (v.split(':')[0]).trim(); },
                    getValue: function (v) { return (v.split(':')[1]).trim(); }
                },
                class: {
                    delimiter: ' ',
                    canGet: function () { return true; },
                    getName: _.identity,
                    getValue: _.identity
                }
            };
            _.bindAll(this, 'parserHandler');
            this._htmlparserHandler = new htmlparser.HtmlBuilder(this.parserHandler, { caseSensitiveTags: true, caseSensitiveAttr: true });
            this._htmlParser = new htmlparser.Parser(this._htmlparserHandler /*, test.options.parser*/);
        }
        TemplateParser.prototype.reset = function () {
            this._htmlParser.reset();
            this.lastData = null;
            this.lastError = null;
        };
        TemplateParser.prototype.parseHtml = function (html) {
            this.reset();
            html = html.trim().replace(/\n/gi, '');
            this._htmlparserHandler.dom = null;
            this._htmlParser.parseComplete(html);
            return this._htmlparserHandler.dom;
        };
        TemplateParser.prototype.htmlObjectToTemplate = function (objs) {
            //console.log('Result parser: ' , objs);
            var result = {}; // new Template();
            _.each(objs, function (obj, index) {
                if (obj.name.indexOf('f.') < 0) {
                    result.expressionMap = {};
                    //(obj.attribs?result.extend=obj.attribs.extend:null);
                    result.name = obj.name;
                    result.pathMap = {};
                    // side effect, creates expression map to result, create pathMap
                    result.domTree = this.htmlObjectToDomTree(obj, result, '0');
                    result.dynamicTree = this.getDynamicTreeFromExpressionMap(result.expressionMap);
                    result.hasStates = !!this.getStatesByMap(result.expressionMap);
                }
            }, this);
            this.removeEmptyKeys(result);
            return result;
        };
        TemplateParser.prototype.htmlObjectToDomTree = function (o, r, path) {
            var _this = this;
            // switch to parser 2.0
            (o.attributes ? o.attribs = o.attributes : null);
            var skipped = ['extend'];
            var def = { type: null, path: null, name: null, attribs: {}, params: {}, handlers: {} };
            def.type = this.fixParserTypes(o.type, o.name); // @todo move cdata to tree creator
            def.name = o.name;
            def.path = path;
            def.parentPath = path.indexOf(',') > 0 ? path.substring(0, path.lastIndexOf(',')) : null;
            if (o.type != 'tag')
                def.data = this.parseExpressionAttrib(o.data, 'data', r.expressionMap, path, 'data'); // set data or data expression
            _.each(o.attribs, function (value, key) {
                if (skipped.indexOf(key) >= 0 || !(value = value ? value.trim() : value))
                    return;
                var group = this.getAttribGroup(key);
                var groupKey = this.getGroupKey(key, group);
                def[group][groupKey] = this.parseExpressionAttrib(value, key, r.expressionMap, path, group);
                //console.log('Group, key: ', group, groupKey, key);
            }, this);
            def.children = _.map(o.children, function (v, index) { return (_this.htmlObjectToDomTree(v, r, def.path + ',' + index)); }, this);
            _.each(_.keys(def), function (key) { return (_.isEmpty(def[key]) ? delete def[key] : null); });
            r.pathMap[path] = def;
            return def;
        };
        TemplateParser.prototype.fixParserTypes = function (type, name) {
            if (type === 'cdata') {
                return 'text';
            }
            else if (type === 'tag' && this._svgTagNames.indexOf(name) > -1) {
                return 'svg';
            }
            return type;
        };
        TemplateParser.prototype.getGroupKey = function (key, group) {
            if (group === 'handlers')
                return (key.replace(/^on/, '')).toLowerCase();
            else if (group === 'params')
                return (key.replace(/^\./, ''));
            else
                return key;
        };
        TemplateParser.prototype.getAttribGroup = function (name) {
            if (name.indexOf('on') === 0) {
                return 'handlers';
            }
            else if (name.indexOf('bind2.') === 0) {
                return 'bind2';
            }
            else {
                return (name.indexOf('.') === 0
                    || name.indexOf('children.') === 0 || name.indexOf('c.') === 0
                    || this._componentParams.indexOf(name) > -1) ? 'params' : 'attribs';
            }
        };
        // Проверяем данное выражение конвертируется в объект класса или стиля (набор свойств: выражений)
        TemplateParser.prototype.parseExpressionAttrib = function (value, key, map, path, group) {
            var _this = this;
            if (this._propAttribs[key]) {
                var prop = this._propAttribs[key];
                return _.reduce(value.split(prop.delimiter), function (r, value, index) { return (prop.canGet(value) ? (r[prop.getName(value)] = _this.parseExpressionValue(prop.getValue(value), map, path, group, key, prop.getName(value))) : null,
                    r); }, {}, this);
            }
            else if (group === 'handlers') {
                return this.parseJsValue(value);
            }
            else {
                return this.parseExpressionValue(value, map, path, group, key);
            }
        };
        TemplateParser.prototype.getDynamicTreeFromExpressionMap = function (map) {
            var result = {};
            _.each(map, function (ex) {
                var varParts;
                _.each(ex.vars, function (v) { return (varParts = v.split('.')
                    , result[varParts[0]] = result[varParts[0]] || {}
                    , result[varParts[0]][v] = result[varParts[0]][v] || []
                    , result[varParts[0]][v].push(ex.name)); });
            }, this);
            return result;
        };
        TemplateParser.prototype.getStatesByMap = function (map) {
            var result = 0;
            _.each(map, function (ex) {
                _.each(ex.hosts, function (v) { if (v.key === 'states')
                    result++; });
            }, this);
            return result;
        };
        TemplateParser.prototype.getExpressionHost = function (path, group /* attribs, params, data */, key /* class, href */, keyProperty) {
            if (keyProperty === void 0) { keyProperty = null; }
            return { path: path, group: group, key: this.getGroupKey(key, group), keyProperty: keyProperty };
        };
        // Выделяем из шаблонной строки JS код (handlers)
        TemplateParser.prototype.parseJsValue = function (value) {
            return expression.strToJsMatch(value);
        };
        // Парсим строку с выражением
        TemplateParser.prototype.parseExpressionValue = function (value, map, path, group, key, keyProperty) {
            var ex = expression.strToExpression(value);
            var expressionNameObj = ex ? expression.getExpressionNameObject(ex) : null;
            var result = expressionNameObj || value;
            if (ex) {
                // Добавляем хост в выражение
                var hosts = ex.hosts || [];
                hosts.push(this.getExpressionHost(path, group, key, keyProperty));
                ex.hosts = hosts;
                // Расширяем карту
                map[ex.name] = ex;
            }
            return result;
        };
        TemplateParser.prototype.removeEmptyKeys = function (def) {
            _.each(_.keys(def), function (key) { return (_.isEmpty(def[key]) && !def[key] ? delete def[key] : null); });
        };
        TemplateParser.prototype.parserHandler = function (error, data) {
            this.lastError = error;
            this.lastData = data;
        };
        return TemplateParser;
    })();
    ft.TemplateParser = TemplateParser;
})(ft || (ft = {}));
///<reference path="./d.ts" />
var ft;
(function (ft) {
    ft.AttributePathId = 'data-path-id';
    var svgNs = "http://www.w3.org/2000/svg";
    var ComplexDomElementAttributes = ['style', 'class'];
    var DomDefType = {
        Tag: 'tag',
        Svg: 'svg',
        Text: 'text',
        Comment: 'comment'
    };
    var TemplateViewHelper = (function () {
        function TemplateViewHelper() {
            this.idCounter = 0;
            this.domElementPathIds = {};
            this.composeNames_updateDynamicTree = _.compose(_.union, _.compact, _.flatten);
        }
        TemplateViewHelper.prototype.createTree = function (data, root) {
            var treeElement = this.createTreeElement(data, root);
            root.setTreeElementPath(data.path, treeElement);
            var treeDomElement = this.getDomElement(treeElement);
            var i;
            var childrenLength;
            if (this.isCommentElement(treeDomElement)) {
                return treeElement;
            }
            else {
                for (i = 0, childrenLength = (data.children ? data.children.length : 0); i < childrenLength; i++) {
                    var childrenTreeElement = this.createTree(data.children[i], root);
                    //console.log('CreateDom Append child', childrenTreeElement);
                    treeDomElement.appendChild(childrenTreeElement instanceof ft.TemplateView ? childrenTreeElement.getElement() : childrenTreeElement);
                }
                return treeElement;
            }
        };
        TemplateViewHelper.prototype.validateTree = function (data, root) {
            var treeElement = this.getTreeElement(data, root);
            var treeDomElement = this.getDomElement(treeElement);
            var included = this.isTreeObjectIncluded(data, root);
            var isComment = this.isCommentElement(treeDomElement);
            var newElement;
            var i;
            var childrenLength;
            if (isComment && included) {
                newElement = this.createTree(data, root);
                this.enterTree(data, root);
                console.log('Replace child ', treeDomElement, newElement);
                treeDomElement.parentNode.replaceChild(this.getDomElement(newElement), treeDomElement);
            }
            else if (!isComment && !included) {
                this.exitTree(data, root);
                newElement = this.createTree(data, root);
                treeDomElement.parentNode.replaceChild(this.getDomElement(newElement), treeDomElement);
            }
            else if (!isComment) {
                for (i = 0, childrenLength = (data.children ? data.children.length : 0); i < childrenLength; i++) {
                    this.validateTree(data.children[i], root);
                }
            }
        };
        TemplateViewHelper.prototype.enterTree = function (data, root) {
            var treeElement = this.getTreeElement(data, root);
            if (treeElement instanceof ft.TemplateView && treeElement !== root) {
                treeElement.enter();
            }
            var treeDomElement = this.getDomElement(treeElement);
            if (this.isTagElement(treeDomElement)) {
                // Регистрация элемента для диспетчера
                this.registerDomElementId(treeDomElement.getAttribute(ft.AttributePathId), data, root);
                this.enterChildrenView(data, root);
                var i;
                var childrenLength;
                for (i = 0, childrenLength = (data.children ? data.children.length : 0); i < childrenLength; i++) {
                    this.enterTree(data.children[i], root);
                }
            }
        };
        TemplateViewHelper.prototype.exitTree = function (data, root) {
            var treeElement = this.getTreeElement(data, root);
            //console.log('Exit ', treeElement, data, root);
            var i;
            var childrenLength;
            var domElement = this.getDomElement(treeElement);
            var isComment = this.isCommentElement(domElement);
            if (!isComment) {
                this.exitChildrenView(data, root);
                for (i = 0, childrenLength = (data.children ? data.children.length : 0); i < childrenLength; i++) {
                    this.exitTree(data.children[i], root);
                }
            }
            if (treeElement instanceof ft.TemplateView && treeElement !== root) {
                treeElement.exit();
            }
            else {
                var pathId = this.isTagElement(domElement) ? domElement.getAttribute(ft.AttributePathId) : null;
                this.unregisterDomElementId(pathId);
            }
        };
        TemplateViewHelper.prototype.updateDynamicTree = function (root, group, propertyName) {
            var _this = this;
            var dynamicTree = root.getTemplate().dynamicTree;
            if (!dynamicTree)
                return;
            var expressionArrays;
            if (!group) {
                expressionArrays = _.map(dynamicTree, function (v, group) { return _this.getChangedExpressionNames(group, v, root); }, this);
            }
            else {
                if (!dynamicTree[group])
                    return;
                if (propertyName) {
                    expressionArrays = root.isChangedDynamicProperty(propertyName) ? dynamicTree[group][propertyName] : null;
                }
                else {
                    expressionArrays = this.getChangedExpressionNames(group, dynamicTree[group], root);
                }
            }
            var exNames = this.composeNames_updateDynamicTree(expressionArrays);
            var tmpl = root.getTemplate();
            // console.log('Update dynamic tree ', root.name, exNames);
            var exObjArrays = _.map(exNames, function (v) { return (tmpl.expressionMap[v]); });
            _.each(exObjArrays, function (v, k) { return _this.applyExpressionToHosts(v, root); }, this);
        };
        // -----------------------------------------------------------------------------------------------------------
        // Creation
        // -----------------------------------------------------------------------------------------------------------
        TemplateViewHelper.prototype.createTreeElement = function (data, root) {
            var isIncluded = this.isTreeObjectIncluded(data, root);
            var result = null;
            if (isIncluded) {
                if (this.isComponentDef(data)) {
                    result = this.createComponentElement(data, root);
                }
                else {
                    result = this.createDomElement(data.type, data, root);
                }
                this.createChildrenView(result, data, root);
            }
            else {
                result = this.createDomElement('comment', data, root);
            }
            if (data.params && data.params.ln) {
                root[data.params.ln] = result; // Установка ссылки на рутовый элемент
            }
            return result;
        };
        TemplateViewHelper.prototype.createComponentElement = function (data, root) {
            var dataParams = this.applyFirstContextToExpressionParameters(data.params, root);
            var result = ft.templateManager.createInstance(data.name, 'view-' + data.name + '-' + this.getNextId(), dataParams);
            //console.log('CreateComponent ', data.name, result !== root, dataParams, result);
            result.parent = root;
            result.domDef = data;
            if (result !== root)
                result.createDom();
            return result;
        };
        TemplateViewHelper.prototype.createDomElement = function (type, data, root) {
            var result;
            switch (type) {
                case DomDefType.Tag:
                    var result = document.createElement(data.name);
                    this.initDomElement(result, data, root);
                    return result;
                case DomDefType.Text:
                    var result = document.createTextNode('');
                    this.initTextElement(result, data, root);
                    return result;
                case DomDefType.Comment:
                    return document.createComment(data.path);
                case DomDefType.Svg:
                    result = document.createElementNS(svgNs, data.name);
                    this.initDomElement(result, data, root);
                    return result;
                default:
                    throw 'Cant create dom element ' + type + ' of ' + data.path + ', ' + root.name;
                    return null;
            }
        };
        TemplateViewHelper.prototype.createChildrenView = function (object, data, root) {
            if (this.hasChildrenDef(data)) {
                var childrenView = new ft.TemplateChildrenView(root.name + ':ChildView-' + this.getNextId(), this.applyFirstContextToExpressionParameters(root.getParameters(), root));
                childrenView.domDef = data;
                childrenView.parent = root;
                childrenView.setElement(this.getDomElement(object));
                childrenView.createDom();
                //childrenView.enter();
                root.setChildrenViewPath(data.path, childrenView);
            }
        };
        TemplateViewHelper.prototype.initDomElement = function (object, data, root) {
            var _this = this;
            //console.log('Init dom element ', object, data, root);
            var domElement = this.getDomElement(object);
            //console.log(root.name, data.path, ' SetData');
            /* Процесс установки аттрибутов, в том числе с расчетом выражений, для конкретного узла Dom */
            if (this.isTagElement(domElement) && !domElement.getAttribute(ft.AttributePathId)) {
                //console.log(root.name, data.path, ' ApplyData');
                // Вычисление аттрибутов
                var domElementPathId = this.getNextId();
                var attribs = data.attribs;
                var attrsResult = attribs ? _.reduce(attribs, function (r, value, key) { return (_this.specialDomAttrs.indexOf(key) < 0 ? (r[key] = _this.getSimpleOrExpressionValue(value, root)) : null, r); }, {}, this) : {};
                // Установка глобального идентификатора элемента для событий
                attrsResult[ft.AttributePathId] = domElementPathId;
                // Установка аттрибутов
                if (data.type === 'tag') {
                    this.setDomElementAttributes(attrsResult, domElement);
                }
                else {
                    this.setSvgElementAttributes(attrsResult, domElement);
                }
                // Установка классов
                if (attribs && attribs.class) {
                    var classesValues = this.getPropertyValues('attribs', 'class', data, root);
                    this.setDomElementClasses(classesValues, domElement, data, root); // side effect, root add map enabled classes
                }
                // Установка стилей
                if (attribs && attribs.style) {
                    var stylesValues = this.getPropertyValues('attribs', 'style', data, root);
                    this.setDomElementStyles(stylesValues, domElement, root);
                }
            }
        };
        /* Установка контента текстового элемента */
        TemplateViewHelper.prototype.initTextElement = function (object, data, root) {
            if (data.data) {
                object.textContent = this.getSimpleOrExpressionValue(data.data, root);
            }
        };
        // -----------------------------------------------------------------------------------------------------------
        // Children view
        // -----------------------------------------------------------------------------------------------------------
        TemplateViewHelper.prototype.enterChildrenView = function (data, root) {
            if (!this.hasChildrenView(data, root))
                return;
            var childrenView = root.getChildrenViewByPath(data.path);
            childrenView.enter();
        };
        TemplateViewHelper.prototype.exitChildrenView = function (data, root) {
            if (!this.hasChildrenView(data, root))
                return;
            var childrenView = root.getChildrenViewByPath(data.path);
            childrenView.exit();
        };
        // -----------------------------------------------------------------------------------------------------------
        // Updates, apply value
        // -----------------------------------------------------------------------------------------------------------
        TemplateViewHelper.prototype.applyExpressionToHosts = function (exObj, root) {
            var result;
            var el;
            var i;
            var l = exObj.hosts.length;
            var host;
            for (i = 0; i < l; i++) {
                host = exObj.hosts[i];
                /*
                 performance bench
                 if(host.group === 'data') result = Math.round(Math.random()*100);
                 */
                result = result || (host.key === 'class' ? root.getCssClassExpressionValue(exObj) : root.getExpressionValue(exObj));
                el = this.getDomElement(root.getTreeElementByPath(host.path));
                //console.log('Apply ', root.name, host.path, host.key, result);
                if (el && el.nodeType != 8)
                    this.applyValueToHost(result, el, host, root);
            }
        };
        TemplateViewHelper.prototype.applyValueToHost = function (value, el, host, root) {
            var key = host.key;
            //console.log('Apply to ', host.path, host.key, value);
            switch (host.group) {
                case 'data':
                    el.textContent = value;
                    return;
                case 'attribs':
                    switch (host.key) {
                        case 'style':
                            el.style[host.keyProperty] = (value ? value : '');
                            return;
                        case 'class':
                            var previousClassValue = root.getPathClassValue(host.path, host.keyProperty);
                            previousClassValue && previousClassValue !== value ? el.classList.toggle(previousClassValue, false) : null;
                            value ? el.classList.toggle(value, true) : null;
                            root.setPathClassValue(host.path, host.keyProperty, value);
                            return;
                        default:
                            if (this.isSvgNode(el.nodeName)) {
                                var method = value ? el.setAttributeNS : el.removeAttributeNS;
                                if (host.key)
                                    method.call(el, null, host.key, value);
                            }
                            else {
                                var method = value ? el.setAttribute : el.removeAttribute;
                                if (host.key)
                                    method.call(el, host.key, value);
                            }
                            return;
                    }
                    return;
                case 'params':
                    // Default params changed: Data: model, data; states: selected, focused, children, base, custom
                    var view;
                    if (key.indexOf('.') < 0) {
                        view = root.getTreeElementByPath(host.path);
                        if (!(view instanceof ft.TemplateView)) {
                            view = root.getChildrenViewByPath(host.path);
                        }
                        if (view instanceof ft.TemplateView)
                            view.applyParameter(view.getParameters()[key], key);
                        else
                            console.warn('Cant apply parameter ', key, 'to', view, 'path', host.path);
                    }
                    else if (key.indexOf('children.') === 0) {
                        view = root.getTreeElementByPath(host.path);
                        var childrenView = root.getChildrenViewByPath(host.path) || view.getDefaultChildrenView();
                        if (!childrenView) {
                            console.warn('Has no ChildrenView instance and cant set hostValue ', host.path, key);
                            return;
                        }
                        if (key === 'children.data') {
                            childrenView.data = value;
                        }
                        else {
                            childrenView.applyChildrenParameter(value, key, root);
                        }
                    }
                    else {
                        console.warn('Not supported host parameter at applyToHost ', key, value, host.path);
                    }
                    return;
            }
        };
        // -----------------------------------------------------------------------------------------------------------
        // Attrs & values
        // -----------------------------------------------------------------------------------------------------------
        TemplateViewHelper.prototype.getTreeElement = function (data, root) {
            return root.getTreeElementByPath(data.path);
        };
        TemplateViewHelper.prototype.isSvgNode = function (name) {
            return name === 'svg' || name === 'circle' || false;
        };
        TemplateViewHelper.prototype.getPropertyValues = function (group, attrName, data, root) {
            var _this = this;
            var functor = (attrName === 'class') ? this.getClassSimpleOrExpressionValue : this.getSimpleOrExpressionValue;
            return _.reduce(data[group][attrName], function (result, value, key) { return (result[key] = functor.call(_this, value, root), result); }, {}, this);
        };
        TemplateViewHelper.prototype.getChangedExpressionNames = function (group, map, root) {
            return _.map(map, function (exNames, propName) { return (root.isChangedDynamicProperty(propName) ? exNames : null); }, this);
        };
        TemplateViewHelper.prototype.getSimpleOrExpressionValue = function (value, root) {
            return _.isObject(value) ? this.getExpressionValue(value, root) : value;
        };
        TemplateViewHelper.prototype.getClassSimpleOrExpressionValue = function (value, root) {
            return _.isObject(value) ? root.getCssClassExpressionValue(value) : value;
        };
        TemplateViewHelper.prototype.getExpressionValue = function (value, root) {
            return root.getExpressionValue(value);
        };
        TemplateViewHelper.prototype.registerDomElementId = function (id, data, root) {
            //console.log('Register dom', id, data.path);
            //@todo fix fast fix
            if (!this.domElementPathIds[id])
                this.domElementPathIds[id] = { data: data, root: root };
            else
                console.log('Yet registred at dom ', id, data.path);
        };
        TemplateViewHelper.prototype.unregisterDomElementId = function (id) {
            if (id)
                delete this.domElementPathIds[id];
        };
        TemplateViewHelper.prototype.getPathDefinitionByPathId = function (id) {
            return this.domElementPathIds[id];
        };
        // ------------------------------------------------------------------------------------------------------------
        // Utilites
        // ------------------------------------------------------------------------------------------------------------
        TemplateViewHelper.prototype.applyFirstContextToExpressionParameters = function (params, context) {
            if (!context)
                return params;
            var r = {};
            _.each(params, function (v, k) {
                var isExpression = v instanceof ft.ExpressionName;
                if (isExpression) {
                    r[k] = !v.context ? new ft.ExpressionName(v.name, context) : v;
                }
                else {
                    r[k] = v;
                }
            });
            return r;
        };
        TemplateViewHelper.prototype.hasDelay = function (data, root, functorName) {
            return data.params && data.params[functorName + 'Delay'] && root.isDelay(data, functorName);
        };
        TemplateViewHelper.prototype.isTagElement = function (e) {
            return e && e.nodeType === 1;
        };
        TemplateViewHelper.prototype.isCommentElement = function (e) {
            return e && e.nodeType === 8;
        };
        TemplateViewHelper.prototype.getNextId = function () {
            return (this.idCounter++).toString(36);
        };
        Object.defineProperty(TemplateViewHelper.prototype, "specialDomAttrs", {
            get: function () {
                return ComplexDomElementAttributes;
            },
            enumerable: true,
            configurable: true
        });
        TemplateViewHelper.prototype.setDomElementClasses = function (vals, object, data, root) {
            var previousClassValue;
            _.each(vals, function (value, name) {
                if (!object.classList)
                    return;
                previousClassValue = root.getPathClassValue(data.path, name);
                previousClassValue && previousClassValue !== value ? object.classList.toggle(previousClassValue, false) : null,
                    value ? object.classList.toggle(value, true) : null,
                    root.setPathClassValue(data.path, name, value);
            });
        };
        TemplateViewHelper.prototype.setDomElementStyles = function (vals, object, root) {
            _.each(vals, function (value, name) { return object.style[name] = (value ? value : ''); });
        };
        TemplateViewHelper.prototype.setDomElementAttributes = function (attrs, object) {
            for (name in attrs) {
                var value = attrs[name];
                var method = value ? object.setAttribute : object.removeAttribute;
                method.call(object, name, value);
            }
        };
        TemplateViewHelper.prototype.setSvgElementAttributes = function (attrs, object) {
            for (name in attrs) {
                var value = attrs[name];
                var method = value ? object.setAttributeNS : object.removeAttributeNS;
                method.call(object, null, name, value);
            }
        };
        TemplateViewHelper.prototype.getDomElement = function (value) {
            return (value instanceof ft.TemplateView ? value.getElement() : value);
        };
        TemplateViewHelper.prototype.isComponentDef = function (data) {
            return data.type && data.name && (data.name.indexOf('.') > 0);
        };
        TemplateViewHelper.prototype.isTreeObjectIncluded = function (data, root) {
            var states = data.params ? data.params[ft.TemplateParams.states] : null;
            var hasDelay = this.hasDelay(data, root, 'create');
            if (hasDelay)
                root.setDelay(data, 'create');
            if (!states && !hasDelay)
                return true;
            return !hasDelay && !!this.getExpressionValue(states, root);
        };
        TemplateViewHelper.prototype.hasChildrenDef = function (data) {
            return !!(data.params && data.params[ft.TemplateParams.childrenClass]);
        };
        TemplateViewHelper.prototype.hasChildrenView = function (data, root) {
            return !!root.getChildrenViewByPath(data.path);
        };
        //-------------------------------------------------------------------------------------------------
        // Event bubbling
        //-------------------------------------------------------------------------------------------------
        TemplateViewHelper.prototype.dispatchTreeEventDown = function (e) {
            var def = (e.currentDef || e.def);
            var view = (e.currentTarget || e.target);
            var template = view.getTemplate();
            // Execute current def handler
            this.triggerDefEvent(e);
            while (!e.cancelled && (def = template.pathMap[def.parentPath])) {
                // Execute on defs tree in view template scope
                e.currentDef = def;
                this.triggerDefEvent(e);
            }
            // Send to parent template defs tree
            view.handleTreeEvent(e);
            if (view.parent) {
                // exec event on parent
                def = view.domDef;
                e.currentTarget = view.parent;
                e.currentDef = def;
                this.triggerDefEvent(e);
                // check canceled
                e.cancelled = !!e.executionHandlersCount && e.name === 'click';
                // exec parent next domDef to root
                e.currentDef = def.parentPath ? view.parent.getTemplate().pathMap[def.parentPath] : null;
                if (!e.cancelled && e.currentDef)
                    this.dispatchTreeEventDown(e);
            }
        };
        TemplateViewHelper.prototype.triggerDefEvent = function (e) {
            var def = (e.currentDef || e.def);
            var view = (e.currentTarget || e.target);
            //console.log('Trigger def event, ', e.name, ' path ', def.path);
            if (!view.disabled && def.handlers && def.handlers[e.name]) {
                //console.log('Has trigger event, ', e.name, ' path ', def.path);
                view.evalHandler(def.handlers[e.name], e);
                e.executionHandlersCount++;
            }
        };
        return TemplateViewHelper;
    })();
    ft.TemplateViewHelper = TemplateViewHelper;
})(ft || (ft = {}));
///<reference path="./d.ts" />
var ft;
(function (ft) {
    ft.globalScope = window || {};
    ft.templateParser = new ft.TemplateParser();
    /**
     * Менеджер классов,
     * 1. используется для создания классов и регистрации их в глобальном скоупе, имеет возможности для переопределения встроенных методов и параметорв, создания новых.
     * 2. используется для получения экземпляров классов
     *
     */
    var TemplateManager = (function () {
        function TemplateManager() {
            this._templateMap = {};
            this._instanceFunc = {};
            _.bindAll(this, 'createClass', 'createInstance');
        }
        /**
         * Создаем класc - функцию которая линкует экземпляр "TemplateView" с параметрами заданными при создании класса, и расширением методоа
         * ***В функции конструкторе используется хак переопределения возвращаемого значения, это работает только для объектов
         *
         * @param className
         * @param content
         * @param params
         * @param mixin
         * @returns {ITemplateConstructor}
         */
        TemplateManager.prototype.createClass = function (className, content, params, mixin) {
            var templateData = this.parse(content);
            if (this._templateMap[className])
                throw 'TemplateManager: cant add ITempalte object of ' + className + ' cause it exists.';
            this._templateMap[className] = templateData;
            var result = this.createInstanceFunc(className, params, mixin);
            this.registerClass(className, result);
            return result;
        };
        /**
         * Фабрика классов, создание экземпляров по имени класса, имени экземпляра, параметрам и расширению методов ( которые в свою очередь будут расширять базовые)
         * Возвращает расширенный экземпляр TemplateView
         *
         * @param className
         * @param name
         * @param params
         * @param mixin
         * @returns {any}
         */
        TemplateManager.prototype.createInstance = function (className, name, params, mixin) {
            return this._instanceFunc[className](name, params, mixin);
        };
        /* Регистрируем класс (функцию конструктор), в глобальном скоупе */
        TemplateManager.prototype.registerClass = function (className, value) {
            _.reduce(className.split('.'), function (g, v) { return (g[v] ? g[v] : (g[v] = {})); }, ft.globalScope); // create constructor map at window
        };
        /* Создаем функцию конструктор, связанную с текущим именем класса и расширением - параметоров и методоа */
        TemplateManager.prototype.createInstanceFunc = function (className, baseParams, baseMixin) {
            var template = this._templateMap[className];
            if (!this._instanceFunc[className]) {
                this._instanceFunc[className] = function (name, params, mixin) {
                    //console.log('CreateInstance  ', name, baseParams, baseMixin, params, mixin);
                    var instanceParams = _.extend({}, baseParams, params); // extend base parameters
                    var instanceMixin = _.extend({}, baseMixin, mixin); // extend methods
                    var instance = new ft.TemplateView(name, instanceParams, template);
                    //console.log('CreateInstance base (p),(m) local (p),(m) instance p,m ', name, baseParams, baseMixin, params, mixin, instanceParams, instanceMixin);
                    _.each(instanceMixin, function (v, k) { return instance[k] = v; });
                    return instance;
                };
            }
            return this._instanceFunc[className];
        };
        /* Парсим текстовый шаблон, затем дополнительно обрабатываем для представления в виде "ITemplate" */
        TemplateManager.prototype.parse = function (value) {
            var objs = ft.templateParser.parseHtml(value);
            var template = ft.templateParser.htmlObjectToTemplate(objs);
            //@todo: Добавить проверку синтаксиса html и выражений, выводить в специальный логгер
            return template;
        };
        return TemplateManager;
    })();
    ft.TemplateManager = TemplateManager;
    ft.templateManager = new TemplateManager();
    ft.createClass = ft.templateManager.createClass;
    ft.createInstance = ft.templateManager.createInstance;
})(ft || (ft = {}));
///<reference path="./d.ts" />
var ft;
(function (ft) {
    ft.templateHelper = new ft.TemplateViewHelper();
    var localeFormatterCache = {};
    var templateFormatterChache = {};
    ft.expression = new ft.Expression();
    var dispatcher = new ft.EventDispatcher(ft.templateHelper);
    var timers = { createDom: 0, enter: 0, setData: 0, validate: 0 };
    var LifeState = {
        Init: 'init',
        Create: 'create',
        Active: 'active',
        Enter: 'enter',
        Exit: 'exit',
        Dispose: 'dispose'
    };
    var State = {
        Selected: 'selected',
        Focused: 'focused',
        Hover: 'hover',
        Disabled: 'disabled',
        Value: 'value',
        Custom: 'custom',
        Base: 'base',
        Life: 'life',
        CreateTime: 'createTime'
    };
    var TmplDict = {
        childrenDot: 'children.',
        stateDot: 'state.',
        on: 'on',
        states: 'states',
        createDelay: 'createDelay',
        class: 'class',
        ln: 'ln',
        bindoutDot: 'bindout.'
    };
    ft.FunctorType = {
        Create: 'create',
        Enter: 'enter',
        Exit: 'exit'
    };
    ft.DynamicTreeGroup = {
        App: 'app',
        Data: 'data',
        State: 'state'
    };
    ft.counters = {
        expression: 0,
        expressionEx: 0,
        expressionCtx: 0,
        multiExpression: 0,
        createDom: 0,
        enter: 0,
        setData: 0,
        validate: 0,
        validateState: 0,
        validateData: 0,
        validateApp: 0
    };
    setInterval(function () { return console.log('Statistic timers', JSON.stringify(timers), ' counters ', JSON.stringify(ft.counters), ' frames ', fmvc.frameExecution); }, 5000);
    function getFormatter(value, locale) {
        if (locale === void 0) { locale = 'en'; }
        return templateFormatterChache[value] || compileFormatter(value, locale);
    }
    function compileFormatter(value, locale) {
        var mf = localeFormatterCache[locale] || (localeFormatterCache[locale] = new MessageFormat(this.locale));
        return (templateFormatterChache[value] = mf.compile(value));
    }
    function getTime() {
        return (new Date()).getTime();
    }
    var TemplateView = (function (_super) {
        __extends(TemplateView, _super);
        function TemplateView(name, params, template) {
            _super.call(this, name);
            // Maps of current class values, by path and css name
            this._cssClassMap = {}; // map of component classes
            // Properties map
            this._prevDynamicProperiesMap = {};
            this._dynamicPropertiesMap = {};
            // Set special type of node, when component is created by TemplateViewChildren
            this._isChildren = false;
            this._template = template;
            this._constructorParams = params;
            //this.setParameters(_.extend({}, template.domTree.params, params));
            this.life = LifeState.Init;
        }
        Object.defineProperty(TemplateView.prototype, "globalPointer", {
            ////////////////////////////////////////////////////////////////
            // Internal
            ////////////////////////////////////////////////////////////////
            get: function () {
                return dispatcher.getPointer();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "domDef", {
            get: function () {
                return this._domDef;
            },
            set: function (value) {
                this._domDef = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "localDomDef", {
            get: function () {
                return this.getTemplate().domTree;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "i18n", {
            get: function () {
                return this._i18n;
            },
            set: function (value) {
                this._i18n = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "isChildren", {
            get: function () {
                return this._isChildren;
            },
            set: function (value) {
                this._isChildren = value;
            },
            enumerable: true,
            configurable: true
        });
        ////////////////////////////////////////////////////////////////        
        // States
        ////////////////////////////////////////////////////////////////
        // Для связывания внутреннего состояния с внешними данными, используется внешний биндинг состояния
        TemplateView.prototype.applyStateBinds = function (name, value) {
            if (!(this._stateBinds && this._stateBinds[name]))
                return;
            //console.log('Apply bind ', name, value, this.parent.model, this.parent.data);
            var dataRef = this._stateBinds[name];
            var hasParentModel = !!this.parent.model;
            if (hasParentModel) {
                var changes = {};
                changes[dataRef[1]] = value;
                this.parent.model.changes = changes;
                this.parent.invalidateData();
            }
            else {
                if (this.parent.data) {
                    this.parent.data[dataRef[1]] = value;
                    this.parent.invalidateData();
                }
                else {
                    throw 'Cant apply state bind ' + name + ' at ' + this.name;
                }
            }
        };
        // Проверяем типы данных приходящие в значении, если есть функция
        TemplateView.prototype.getStateValue = function (name, value) {
            if (ft.TemplateStateValueFunc[name]) {
                return ft.TemplateStateValueFunc[name](value);
            }
            else {
                return value;
            }
        };
        Object.defineProperty(TemplateView.prototype, "base", {
            // Состояние отвечающее за базовый класс
            get: function () {
                return this.getState(State.Base);
            },
            set: function (value) {
                this.setState(State.Base, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "value", {
            // Состояние отвечающее за значение
            get: function () {
                return this.getState(State.Value);
            },
            set: function (value) {
                this.setState(State.Value, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "custom", {
            // Состояние кастомное
            get: function () {
                return this.getState(State.Custom);
            },
            set: function (value) {
                this.setState(State.Custom, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "hover", {
            // Состояние отвечающее за базовый класс
            get: function () {
                return this.getState(State.Hover);
            },
            set: function (value) {
                this.setState(State.Hover, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "selected", {
            // Состояние отвечающее за тип выбранный (лучше использовать от данных)
            get: function () {
                return this.getState(State.Selected);
            },
            set: function (value) {
                this.setState(State.Selected, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "focused", {
            // Состояние отвечает за наличие пользовательского фокуса
            get: function () {
                return this.getState(State.Focused);
            },
            set: function (value) {
                this.setState(State.Focused, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "disabled", {
            // Состояние забокированный
            get: function () {
                return this.getState(State.Disabled);
            },
            set: function (value) {
                this.setState(State.Disabled, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "life", {
            // Состояние жизненного цикла компонента
            get: function () {
                return this.getState(State.Life);
            },
            set: function (value) {
                this.setState(State.Life, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "createTime", {
            // Состояние жизненного цикла компонента
            get: function () {
                return this.getState(State.CreateTime);
            },
            set: function (value) {
                this.setState(State.CreateTime, value);
            },
            enumerable: true,
            configurable: true
        });
        ////////////////////////////////////////////////////////////////
        // Parameters
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.setParameters = function (value) {
            this._resultParams = _.defaults(this._resultParams || {}, value);
        };
        TemplateView.prototype.getParameters = function () {
            return this._resultParams;
        };
        TemplateView.prototype.applyParameters = function () {
            _.each(this._resultParams, this.applyParameter, this);
        };
        TemplateView.prototype.applyParameter = function (value, key) {
            switch (key) {
                case TmplDict.states: // internal "include" parameters, used at createTree and validateTree
                case TmplDict.createDelay: // delay create dom
                case TmplDict.class: // child class
                case TmplDict.ln:
                    break;
                case ft.TemplateParams.stateHandlers:
                    this.stateHandlers(_.isString(value) ? (value.split(',')) : value); //@todo move to parser
                    break;
                default:
                    if (key.indexOf(TmplDict.childrenDot) === 0) {
                        return;
                    }
                    else if (key.indexOf(TmplDict.bindoutDot) === 0) {
                        var state = key.substr(8); //bind out state
                        if (!this._stateBinds)
                            this._stateBinds = {};
                        this._stateBinds[state] = value.split('.');
                    }
                    else if (key.indexOf(TmplDict.stateDot) === 0) {
                        var state = key.substr(6);
                        this.setState(state, this.getParameterValue(value, state, this));
                    }
                    else if (key.indexOf(TmplDict.on) === 0) {
                        var t = this;
                        this.on(key.substring(2), (_.isString(value) ? function (e) {
                            t.internalHandler(value, e);
                        } : value));
                    }
                    else if (key in this) {
                        // direct set states, values
                        if (_.isFunction(this[key])) {
                            this[key](value);
                        }
                        else {
                            this[key] = this.getParameterValue(value, key, this); //@todo check value type of states (boolean,number,...etc)
                        }
                    }
                    else {
                        console.warn(this.name + '.applyParameter: Cant set template view parameter, not found ', key);
                    }
                    break;
            }
        };
        TemplateView.prototype.getParameterValue = function (value, key) {
            var r = value instanceof ft.ExpressionName ? this.getExpressionValue(value) : value;
            console.log(this.name + ' :: apply parameter ', key, ' result=', r, value, value.context);
            return r;
        };
        ////////////////////////////////////////////////////////////////
        // Mappings
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.getTreeElementByPath = function (value) {
            return this._treeElementMapByPath ? this._treeElementMapByPath[value] : null;
        };
        TemplateView.prototype.setTreeElementPath = function (path, value) {
            if (!this._treeElementMapByPath)
                this._treeElementMapByPath = {};
            this._treeElementMapByPath[path] = value;
        };
        TemplateView.prototype.getPathClassValue = function (path, name) {
            return this._cssClassMap[path + '-' + name] || null;
        };
        TemplateView.prototype.setPathClassValue = function (path, name, value) {
            this._cssClassMap[path + '-' + name] = value;
        };
        TemplateView.prototype.getChildrenViewByPath = function (path) {
            return this._dataChildren ? this._dataChildren[path] : null;
        };
        TemplateView.prototype.getDefaultChildrenView = function () {
            return this._dataChildren ? _.values(this._dataChildren)[0] : null;
        };
        TemplateView.prototype.getChildrenViewByPathOrDefault = function (path) {
            return this.getChildrenViewByPath(path) || this.getDefaultChildrenView();
        };
        TemplateView.prototype.setChildrenViewPath = function (path, childrenView) {
            if (!this._dataChildren)
                this._dataChildren = {};
            this._dataChildren[path] = childrenView;
        };
        TemplateView.prototype.getDomDefinitionByPath = function (path) {
            return this._template.pathMap[path];
        };
        TemplateView.prototype.getTemplate = function () {
            return this._template;
        };
        TemplateView.prototype.setTreeElementLink = function (name, value) {
            if (!this[name]) {
                this[name] = value;
                if (!value) {
                    delete this[name];
                }
            }
            else {
                throw Error('Can not set name:' + name + ' property, cause it exists ' + this[name]);
            }
        };
        ////////////////////////////////////////////////////////////////
        // Dynamic properties
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.getDynamicProperty = function (name) {
            //console.log('Get dp ', name, this._dynamicPropertiesMap[name])
            return this._dynamicPropertiesMap[name];
        };
        TemplateView.prototype.setDynamicProperty = function (name, value) {
            // if(this.inDocument) todo check
            this._dynamicPropertiesMap[name] = value;
            //console.log('Set dp ', name, this._dynamicPropertiesMap[name])
        };
        TemplateView.prototype.isChangedDynamicProperty = function (name) {
            var prevValue = this._prevDynamicProperiesMap[name];
            var value = ft.expression.getContextValue(name, this);
            var r = !(prevValue === value);
            // console.log('Is changed ', name, r, value, this._prevDynamicProperiesMap[name]);
            return r;
        };
        ////////////////////////////////////////////////////////////////
        // Lifecycle: Create
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.beforeCreate = function () {
            this.life = LifeState.Create;
            this.setState(State.CreateTime, (new Date()).getTime());
            this.createParameters();
            this.applyParameters();
        };
        TemplateView.prototype.createDomImpl = function () {
            //console.log('Create ', this.name);
            if (this._element)
                return;
            var e = ft.templateHelper.createTree(this._template.domTree, this);
            var element = e instanceof TemplateView ? e.getElement() : e;
            this.setElement(element);
            this.setTreeElementPath('0', this);
            ft.counters.createDom++;
        };
        TemplateView.prototype.createParameters = function () {
            var localParams = this.localDomDef ? this.localDomDef.params : null;
            if (this.isChildren) {
                this.setParameters(_.extend({}, localParams, this._constructorParams));
            }
            else {
                var parentParams = ft.templateHelper.applyFirstContextToExpressionParameters(this.domDef ? this.domDef.params : null, this.parent);
                this.setParameters(_.extend({}, localParams, parentParams, this._constructorParams));
            }
        };
        ////////////////////////////////////////////////////////////////
        // Lifecycle: Enter
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.enterImpl = function () {
            var _this = this;
            //console.log('Enter ', this.name);
            _super.prototype.enterImpl.call(this);
            this.setState(State.CreateTime, (new Date()).getTime());
            this.life = LifeState.Enter;
            ft.counters.enter++;
            //this.invalidate(fmvc.InvalidateType.Data | fmvc.InvalidateType.App | fmvc.InvalidateType.State);
            ft.templateHelper.enterTree(this._template.domTree, this);
            setTimeout(function () { return _this.life = LifeState.Active; }, 0);
        };
        ////////////////////////////////////////////////////////////////
        // Lifecycle: Exit
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.exitImpl = function () {
            // console.log('Exit ', this.name);
            ft.templateHelper.exitTree(this._template.domTree, this);
            _super.prototype.exitImpl.call(this);
            this.cleanDelays();
        };
        ////////////////////////////////////////////////////////////////
        // Lifecycle: Dispose
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.dispose = function () {
            var _this = this;
            _super.prototype.dispose.call(this);
            this._domDef = null;
            this._cssClassMap = null;
            this._dynamicPropertiesMap = null;
            this._prevDynamicProperiesMap = null;
            this._localHandlers = null;
            this._treeElementMapByPath = null;
            _.each(this._resultParams, function (v, k) {
                v.context = null;
                delete _this._resultParams[k];
            });
            _.each(this._dataChildren, function (v, k) { return delete _this._dataChildren[k]; });
            _.each(this._treeElementMapByPath, function (v, k) { return delete _this._treeElementMapByPath[k]; });
            this._resultParams = null;
            this._template = null;
            this._i18n = null;
        };
        ////////////////////////////////////////////////////////////////
        // Validators override
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.canValidate = function (type) {
            var result = this.inDocument;
            return result;
        };
        TemplateView.prototype.validate = function () {
            // console.log('Validate try ', this.name);
            if (!this.inDocument)
                return;
            // console.log('Validate ', this.name, this._dynamicPropertiesMap);
            var start = getTime();
            if (!_.isEmpty(this._dynamicPropertiesMap))
                _.extend(this._prevDynamicProperiesMap, this._dynamicPropertiesMap);
            this._dynamicPropertiesMap = {};
            if (this._template.hasStates)
                ft.templateHelper.validateTree(this._template.domTree, this); // templateHelper.createTreeObject(this._template.domTree, this);
            //console.log('Validate ...', this.name, this._invalidate);
            _super.prototype.validate.call(this);
            var result = getTime() - start;
            ft.counters.validate++;
            timers.validate += result;
        };
        TemplateView.prototype.validateApp = function () {
            if (this.canValidate(fmvc.InvalidateType.App)) {
                ft.counters.validateApp++;
                ft.templateHelper.updateDynamicTree(this, ft.DynamicTreeGroup.App);
            }
        };
        TemplateView.prototype.validateData = function () {
            if (this.canValidate(fmvc.InvalidateType.Data)) {
                ft.counters.validateData++;
                ft.templateHelper.updateDynamicTree(this, ft.DynamicTreeGroup.Data);
            }
        };
        TemplateView.prototype.validateState = function () {
            if (this.canValidate(fmvc.InvalidateType.State)) {
                ft.counters.validateState++;
                ft.templateHelper.updateDynamicTree(this, ft.DynamicTreeGroup.State);
            }
        };
        TemplateView.prototype.validateParent = function () {
        };
        TemplateView.prototype.validateChildren = function () {
        };
        ////////////////////////////////////////////////////////////////
        // Event maps (auto)
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.stateHandlers = function (value) {
            var _this = this;
            if (_.isString(value))
                value = value.split(',');
            var stateHandlers = {
                hover: {
                    pointerover: this.mouseoverHandler,
                    pointerout: this.mouseoutHandler
                },
                selected: {
                    action: this.clickHandler
                },
                focused: {
                    focus: this.focusHandler,
                    blur: this.blurHandler
                }
            };
            _.each(value, function (state) { return _.each(stateHandlers[state], function (handler, event) { return _this.on(event, handler); }, _this); }, this);
        };
        TemplateView.prototype.focusHandler = function (e) {
            if (!!this.getState(State.Disabled))
                return;
            this.setState(State.Focused, true);
        };
        TemplateView.prototype.blurHandler = function (e) {
            if (!!this.getState(State.Disabled))
                return;
            this.setState(State.Focused, false);
        };
        TemplateView.prototype.mouseoverHandler = function (e) {
            if (!!this.getState(State.Disabled))
                return;
            this.setState(State.Hover, true);
        };
        TemplateView.prototype.mouseoutHandler = function (e) {
            if (!!this.getState(State.Disabled))
                return;
            this.setState(State.Hover, false);
        };
        TemplateView.prototype.clickHandler = function (e) {
            if (!!this.getState(State.Disabled))
                return;
            this.setState(State.Selected, !this.getState(State.Selected));
        };
        ////////////////////////////////////////////////////////////////
        // Events
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.handleTreeEvent = function (e) {
            e.currentTarget = this; // previous dispatch
            e.depth--;
            this.trigger(e); // dispatch to this component(dynamic handlers);
            if (e.prevented && e.e)
                e.e.preventDefault();
            e.previousTarget = this;
        };
        TemplateView.prototype.trigger = function (e, path) {
            var _this = this;
            if (path === void 0) { path = '0'; }
            var h = this._localHandlers ? this._localHandlers[path] : null;
            if (h && h[e.name]) {
                var handlers = h[e.name];
                //console.log('Has component triggers ', e.name, this.name);
                _.each(handlers, function (v) {
                    v.call(_this, e);
                    e.executionHandlersCount++;
                }, this);
            }
        };
        TemplateView.prototype.on = function (event, handler, path) {
            if (path === void 0) { path = '0'; }
            if (!this._localHandlers)
                this._localHandlers = {};
            if (path && !this._localHandlers[path])
                this._localHandlers[path] = {};
            var handlers = this._localHandlers[path][event] ? this._localHandlers[path][event] : [];
            handlers.push(handler);
            this._localHandlers[path][event] = handlers;
        };
        TemplateView.prototype.off = function (event, path) {
            if (path === void 0) { path = '0'; }
            if (!path)
                path = '0';
            delete this._localHandlers[path][event];
        };
        // custom event this.send(name, data), send stateChange event
        TemplateView.prototype.dispatchTreeEvent = function (e) {
            e.target = this;
            e.def = e.def || this.localDomDef;
            ft.templateHelper.dispatchTreeEventDown(e);
        };
        TemplateView.prototype.getCustomTreeEvent = function (name, data, depth) {
            if (data === void 0) { data = null; }
            if (depth === void 0) { depth = 1; }
            return dispatcher.getCustomTreeEvent(name, data, this, depth);
        };
        TemplateView.prototype.internalHandler = function (type, e) {
            //console.log('Internal handler ... ', type, e);
            if (this.parent)
                this.parent.internalHandler(type, e);
        };
        ////////////////////////////////////////////////////////////////
        // Expressions
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.getExpressionByName = function (name) {
            var value = this._template.expressionMap ? this._template.expressionMap[name] : null;
            value = value || (this.parent ? this.parent.getExpressionByName(name) : null);
            return value;
        };
        TemplateView.prototype.getExpressionValue = function (ex) {
            var exName = ex.name;
            if (this._dynamicPropertiesMap[exName])
                return this._dynamicPropertiesMap[exName];
            var exObj = this.getExpressionByName(exName);
            var result = ft.expression.execute(exObj, ex.context || this);
            return result;
        };
        TemplateView.prototype.getFilter = function (filter) {
            var fnc = new Function('return this.' + filter + ';');
            return fnc.call(this) || this.parent ? this.parent.getFilter(filter) : null;
        };
        TemplateView.prototype.getCssClassExpressionValue = function (ex) {
            var exObj = this.getExpressionByName(ex.name);
            var result = ft.expression.execute(exObj, ex.context || this, true);
            return result;
        };
        ////////////////////////////////////////////////////////////////
        // Utils (message formatter)
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.getFormattedMessage = function (name, args) {
            var formattedTemplate = (this._template && this._template.i18n && this._template.i18n[name]) ? this._template.i18n[name] : null
                || (this._i18n && this._i18n[name]) ? this._i18n[name] : null;
            if (!formattedTemplate)
                return 'Error: TemplateView.getFormattedMessage, formattedTemplate not found';
            var formatter = getFormatter(formattedTemplate);
            return formatter(args);
        };
        TemplateView.prototype.evalHandler = function (value, e) {
            var r = null;
            try {
                r = eval(value);
            }
            catch (e) {
                r = '{' + value + '}';
            }
            return r;
        };
        ////////////////////////////////////////////////////////////////
        // Delay of creation tree elements
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.isDelay = function (data, functor) {
            var result = false;
            if (functor === ft.FunctorType.Create) {
                var delayValue = Number(data.params[functor + 'Delay']); //@todo apply types move to parser
                result = ((new Date()).getTime() - this.createTime) < delayValue;
            }
            return result;
        };
        TemplateView.prototype.setDelay = function (data, functor) {
            var delayName = data.path + ':' + functor;
            if (!this._delays)
                this._delays = {};
            if (this._delays[delayName])
                return; // next enter -> return
            var delayValue = Number(data.params[functor + 'Delay']) - ((new Date()).getTime() - this.createTime);
            var t = this;
            this._delays[delayName] = setTimeout(function delayedFunctor() {
                if (!t.inDocument)
                    return;
                switch (functor) {
                    case ft.FunctorType.Create:
                        ft.templateHelper.createTree(t.getDomDefinitionByPath(data.parentPath) || t.domDef, t);
                        ft.templateHelper.enterTree(t.getDomDefinitionByPath(data.parentPath) || t.domDef, t);
                        return;
                }
            }, delayValue);
        };
        TemplateView.prototype.cleanDelays = function () {
            _.each(this._delays, function (v, k) { return clearTimeout(v); });
        };
        return TemplateView;
    })(fmvc.View);
    ft.TemplateView = TemplateView;
})(ft || (ft = {}));
///<reference path="./d.ts" />
var ft;
(function (ft) {
    var TemplateChildrenView = (function (_super) {
        __extends(TemplateChildrenView, _super);
        function TemplateChildrenView(name, params) {
            _super.call(this, name, params, { domTree: {} });
        }
        TemplateChildrenView.prototype.createChildren = function () {
            var def = this.domDef;
            var className = def.params[ft.TemplateParams.childrenClass];
            var prevChildren = this._children;
            var data = this.getParameterValue(this.getParameters()['children.data']) || this.data;
            var childrenViews = _.map(data, function (v, k) {
                var child = prevChildren && prevChildren.length ? (prevChildren.splice(0, 1)[0]) : ft.templateManager.createInstance(className, this.parent.name + ':' + className + '-' + k, this.childrenLocalParams);
                if (v instanceof fmvc.Model)
                    child.model = v;
                else
                    child.data = v;
                return child;
            }, this);
            this._children = childrenViews;
            _.each(prevChildren, function (v) { return v.dispose(); });
            this.applyChildrenParameters();
            _.each(this._children, function (child) {
                child.parent = this.parent;
                child.domDef = def;
                if (!child.inDocument) {
                    child.isChildren = true;
                    child.createDom();
                    //child.enter();
                    //console.log(this.name, ' create children ', child.getElement().outerHTML);
                    this.getElement().appendChild(child.getElement());
                }
                //child.invalidateData();
                //child.invalidateApp();
            }, this);
            //console.log('Created children is ', this._children);
        };
        TemplateChildrenView.prototype.setCurrentChildToExecutionContext = function (child, index, length, context) {
            context.child = child;
            context.childIndex = index;
            context.childrenLength = length;
        };
        TemplateChildrenView.prototype.getChildrenLocalParams = function (params) {
            var _this = this;
            var r = {};
            _.each(params, function (v, key) {
                if (key === 'data' || key === 'model')
                    return;
                if (_this.isChildrenParamName(key) && !_.isObject(v))
                    r[_this.getChildrenParamName(key)] = v;
            });
            return r;
        };
        TemplateChildrenView.prototype.getChildrenExpressionParams = function (params) {
            var _this = this;
            var r = {};
            _.each(params, function (v, key) {
                if (key === 'data' || key === 'model')
                    return;
                if (_this.isChildrenParamName(key) && _.isObject(v))
                    r[key] = v;
            });
            return r;
        };
        TemplateChildrenView.prototype.isChildrenParamName = function (value) {
            return value.indexOf('children.') === 0;
        };
        TemplateChildrenView.prototype.getChildrenParamName = function (value) {
            return value.substring(9);
        };
        TemplateChildrenView.prototype.applyChildrenParameters = function () {
            var _this = this;
            var params = this.getChildrenExpressionParams(this.getParameters());
            //console.log('Apply children params ', this.name, params);
            var length = this._children ? this._children.length : 0;
            _.each(this._children, function (child, index) {
                if (child.disposed)
                    return;
                //child.invalidateData();
                _.each(params, function (value, key) {
                    _this.setCurrentChildToExecutionContext(child, index, length, value.context || _this.parent);
                    var childParamName = _this.getChildrenParamName(key);
                    if (childParamName === 'data' || childParamName === 'model')
                        return;
                    var childValue = _this.getExpressionValue(value);
                    child.applyParameter(childValue, childParamName);
                });
            }, this);
        };
        TemplateChildrenView.prototype.applyChildrenParameter = function (value, key) {
            var value = this._resultParams[key];
            var length = this._children ? this._children.length : 0;
            //console.log('Apply children parameter ', value, key);
            _.each(this._children, function (child, index) {
                if (child.disposed)
                    return;
                this.setCurrentChildToExecutionContext(child, index, length, value.context || this.parent);
                var childValue = _.isObject(value) ? this.getExpressionValue(value) : value;
                var childParamName = this.getChildrenParamName(key);
                //console.log('Apply each parameter value ', childParamName, childValue);
                child.applyParameter(childValue, childParamName);
            }, this);
        };
        TemplateChildrenView.prototype.beforeCreate = function () {
            this.createParameters();
            this.applyParameters();
            this.childrenLocalParams = this.getChildrenLocalParams(this.getParameters());
        };
        TemplateChildrenView.prototype.createDom = function () {
            if (!this.getElement())
                throw 'Cant create children dom, cause not set element directly';
            this.beforeCreate();
            this.createChildren();
        };
        TemplateChildrenView.prototype.enterImpl = function () {
            //console.log('Enter children view ', this._children);
            _.each(this._children, function (child) {
                child.enter();
            }, this);
        };
        TemplateChildrenView.prototype.exitImpl = function () {
            _.each(this._children, function (child) {
                child.exit();
            }, this);
        };
        TemplateChildrenView.prototype.validateData = function () {
            //this.createChildren();
        };
        TemplateChildrenView.prototype.validateState = function () {
        };
        TemplateChildrenView.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.domDef = null;
            this.parent = null;
        };
        return TemplateChildrenView;
    })(ft.TemplateView);
    ft.TemplateChildrenView = TemplateChildrenView;
})(ft || (ft = {}));
///<reference path="../fmvc/d.ts" />
///<reference path="./template.state.ts" />
///<reference path="./expression.ts" />
///<reference path="./events/pointer.model.ts" />
///<reference path="./events/keyboard.model.ts" />
///<reference path="./events/event.dispatcher.ts" />
///<reference path="./template.i.ts" />
///<reference path="./template.ts" />
///<reference path="./template.parser.ts" />
///<reference path="./template.view.helper.ts" />
///<reference path="./template.manager.ts" />
///<reference path="./template.view.ts" />
///<reference path="./template.view.children.ts" />
var ft;
(function (ft) {
    var VirtualClassList = (function () {
        function VirtualClassList() {
            this.classes = {};
        }
        VirtualClassList.prototype.toggle = function (name, v) {
            //console.log('class toggle ', name, v);
            if (!v)
                delete this.classes[name];
            else
                this.classes[name] = v;
        };
        return VirtualClassList;
    })();
    ft.VirtualClassList = VirtualClassList;
    var VirtualElement = (function () {
        function VirtualElement(type, tag, text) {
            this._style = null;
            this._classList = null;
            this.attribute = null;
            this.children = null;
            this.textContent = null;
            this._type = type;
            this._tag = tag;
            this.textContent = text;
        }
        Object.defineProperty(VirtualElement.prototype, "outerHtml", {
            get: function () {
                var r = '';
                if (this._type === 1)
                    r += this.openTag;
                if (this.children)
                    r += this.innerHtml;
                if (this._type !== 1 && this.textContent)
                    r += this.textContent;
                if (this._type === 1)
                    r += this.closeTag;
                return r;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VirtualElement.prototype, "innerHtml", {
            get: function () {
                var r = '';
                this.children.forEach(function (c) { return r += c.outerHtml; });
                return r;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VirtualElement.prototype, "openTag", {
            get: function () {
                return '<' + this._tag + this.attrString() + this.classString() + this.styleString() + '>';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VirtualElement.prototype, "closeTag", {
            get: function () {
                return '</' + this._tag + '>';
            },
            enumerable: true,
            configurable: true
        });
        VirtualElement.prototype.attrString = function () {
            var r = '';
            if (!this.attribute)
                return r;
            for (var p in this.attribute) {
                r += ' ' + p + '="' + this.attribute[p] + '"';
            }
            return r;
        };
        VirtualElement.prototype.styleString = function () {
            var r = '';
            if (!this._style)
                return r;
            r += ' style="';
            for (var p in this._style) {
                r += p + ':' + this._style[p] + ';';
            }
            r += '"';
            return r;
        };
        VirtualElement.prototype.classString = function () {
            var r = '';
            if (!this._classList)
                return r;
            r += ' class="';
            var classes = this._classList.classes;
            for (var n in classes) {
                if (classes[n] === true)
                    r += n + ' ';
            }
            r += '"';
            return r;
        };
        Object.defineProperty(VirtualElement.prototype, "style", {
            get: function () {
                return this._style = this._style || {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VirtualElement.prototype, "classList", {
            get: function () {
                return this._classList ? this._classList : (this._classList = new VirtualClassList());
            },
            enumerable: true,
            configurable: true
        });
        VirtualElement.prototype.appendChild = function (v) {
            if (!this.children)
                this.children = [];
            if (this.children.indexOf(v) === -1)
                this.children.push(v);
        };
        VirtualElement.prototype.removeChild = function (v) {
            var index = this.children.indexOf(v);
            if (index > -1)
                this.children.splice(index, 1);
        };
        VirtualElement.prototype.replaceChild = function (n, o) {
            var index = this.children.indexOf(o);
            if (index > -1)
                this.children.splice(index, 1, n);
        };
        VirtualElement.prototype.setAttribute = function (name, value) {
            if (!this.attribute)
                this.attribute = {};
            this.attribute[name] = value;
        };
        return VirtualElement;
    })();
    ft.VirtualElement = VirtualElement;
    var VirtualDocument = (function () {
        function VirtualDocument() {
        }
        VirtualDocument.prototype.createComment = function (text) {
            return new VirtualElement(8, null, text);
        };
        VirtualDocument.prototype.createTextNode = function (text) {
            return new VirtualElement(3, null, text);
        };
        VirtualDocument.prototype.createElement = function (name) {
            return new VirtualElement(1, name);
        };
        return VirtualDocument;
    })();
    ft.VirtualDocument = VirtualDocument;
})(ft || (ft = {}));
if (typeof module !== 'undefined') {
    module.exports = new ft.VirtualDocument();
}
//# sourceMappingURL=ft.dev.js.map