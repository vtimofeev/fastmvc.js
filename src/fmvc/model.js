var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(name, data, isEvents) {
            if (data === void 0) { data = {}; }
            if (isEvents === void 0) { isEvents = true; }
            _super.call(this, name);
            this._data = data;
            this._isEvents = isEvents;
            if (isEvents)
                this.sendEvent(fmvc.Event.MODEL_CREATED, this.data);
        }
        Object.defineProperty(Model.prototype, "data", {
            get: function () {
                return this._data;
            },
            set: function (value) {
                var data = this._data;
                var changedFields = null;
                var hasChanges = false;
                if (data) {
                    for (var i in value) {
                        if (data[i] != value[i]) {
                            if (!changedFields)
                                changedFields = [];
                            changedFields.push(i);
                            hasChanges = true;
                            data[i] = value[i];
                        }
                    }
                }
                else {
                    this._data = value;
                }
                if (hasChanges && this._isEvents)
                    this.sendEvent(fmvc.Event.MODEL_CHANGED, this._data);
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
        Model.prototype.destroy = function () {
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