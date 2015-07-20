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
        Error: 'error',
    };
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(name, data, opts) {
            if (data === void 0) { data = {}; }
            _super.call(this, name);
            this.enabledEvents = true;
            this.enabledState = true;
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
            this.log('New state: ' + value);
            this.sendEvent(fmvc.Event.MODEL_CHANGED, this._state);
            return this;
        };
        Model.prototype.parseValue = function (value) {
            var result = null;
            var prevData = this.data;
            var changes = null;
            var hasChanges = false;
            if (value instanceof Model) {
                console.log(value);
                this.log('Check errors in this');
                throw Error('Cant set model data, data must be object, array or primitive');
            }
            //@todo check type of data and value
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
                    this.sendEvent(fmvc.Event.MODEL_CHANGED, changes);
                result = prevData;
            }
            else {
                // primitive || array || no data && any value (object etc)
                if (prevData !== value) {
                    result = (_.isObject(prevData) && _.isObject(value)) ? _.extend({}, prevData, value) : value;
                }
            }
            return result;
        };
        Model.prototype.reset = function () {
            this._data = null;
        };
        Object.defineProperty(Model.prototype, "data", {
            get: function () {
                return this._data;
            },
            set: function (value) {
                var previousData = this._data;
                var result = this.parseValue(value);
                if (previousData !== result) {
                    console.log('[' + this.name + ']: New prev, new data ' + this._data + ', ' + result);
                    this._data = result;
                    this.sendEvent(fmvc.Event.MODEL_CHANGED, this.data);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Model.prototype, "state", {
            get: function () {
                return this._state;
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
        Object.defineProperty(Model.prototype, "queue", {
            //-----------------------------------------------------------------------------
            // Queue
            //-----------------------------------------------------------------------------
            get: function () {
                return this._queue ? this._queue : (this._queue = new ModelQueue(this));
            },
            enumerable: true,
            configurable: true
        });
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
            queuePromise.then(function done(value) {
                console.log('Call async method args ', args);
                (getPromiseMethod.apply(context, args)).then(function successPromise(result) { console.log('Async success ', result); deferred.resolve(result); }, function faultPromise(result) { console.log('Async fault ', arguments); deferred.reject(result); });
            }, function fault() {
                deferred.reject();
            });
            this.currentPromise = deferred.promise();
            return this;
        };
        ModelQueue.prototype.sync = function (method, args, context, states) {
            var deferred = $.Deferred();
            var queuePromise = this.setup();
            queuePromise.done(function doneQueue(value) {
                var methodArgs = [value].concat(args);
                var result = method.apply(context, methodArgs);
                console.log('Call sync method ', result, ' args ', methodArgs);
                if (result)
                    deferred.resolve(result);
                else
                    deferred.reject();
            });
            this.currentPromise = deferred.promise();
            return this;
        };
        ModelQueue.prototype.complete = function (method, args, context, states) {
            this.sync(method, context, args, states);
        };
        ModelQueue.prototype.setup = function () {
            var queueDeferred = $.Deferred();
            $.when(this.currentPromise).then(function doneQueue(value) { queueDeferred.resolve(value); }, function faultQueue() { queueDeferred.reject(); });
            return queueDeferred.promise();
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