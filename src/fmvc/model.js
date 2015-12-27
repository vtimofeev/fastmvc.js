var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
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
        Object.defineProperty(Model.prototype, "count", {
            get: function () {
                return (this.data && this.data instanceof Array) ? this.data.length : -1;
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
                this._data = changes; // was array, string, number, boolean
            this.state = fmvc.ModelState.Synced;
            this.sendEvent(fmvc.Event.Model.Changed, this._data, this._changes);
        };
        Model.prototype.commit = function () {
            if (this._changedData) {
                var isValid = this.validate();
                if (isValid) {
                    return this.sync().then(this.applyChanges).catch(this.syncErrorHandler);
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
//# sourceMappingURL=model.js.map