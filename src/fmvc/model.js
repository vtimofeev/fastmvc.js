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
            console.log('Model set data ... ', value);
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
            this._queue ? this._queue.dispose() : null;
            this._queue = null;
            _super.prototype.dispose.call(this);
        };
        //-----------------------------------------------------------------------------
        // Queue
        //-----------------------------------------------------------------------------
        Model.prototype.queue = function (create) {
            if (create === void 0) { create = false; }
            if (create && this._queue)
                this._queue.dispose();
            return this._queue && !create ? this._queue : (this._queue = new fmvc.ModelQueue(this));
        };
        return Model;
    })(fmvc.Notifier);
    fmvc.Model = Model;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=model.js.map