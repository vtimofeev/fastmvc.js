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
//# sourceMappingURL=model.js.map