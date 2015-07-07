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
        Loading: 'loading',
        Updating: 'updating',
        Syncing: 'syncing',
        Synced: 'synced',
        Changed: 'changed',
        Error: 'error',
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
            .load(callback?):Promise // load in model context
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
        Model.prototype.set = function (value, direct, reset) {
            if (direct === void 0) { direct = false; }
            if (reset === void 0) { reset = false; }
            if (reset)
                this._data = null;
            if (direct)
                this._data = value;
            else
                this.data = value;
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
//# sourceMappingURL=model.js.map