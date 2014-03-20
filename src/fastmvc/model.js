var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fastmvc;
(function (fastmvc) {
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(name, data) {
            if (typeof data === "undefined") { data = null; }
            _super.call(this, name);
            this._data = data;
        }
        Model.prototype.setData = function (value) {
            this._data = value;
            this.sendEvent(fastmvc.Event.MODEL_CREATE, this.data());
            this.sendEvent(fastmvc.Event.MODEL_CHANGE, this.data());
        };

        Model.prototype.setValidator = function (value) {
            this._validator = value;
        };

        Model.prototype.data = function () {
            return this._data;
        };

        Model.prototype.validate = function (value, key) {
            var result = false;
            var error = {};

            if (!this._validator)
                result = true;
            else
                result = this._validator(value, key, this, error);

            this.sendEvent(fastmvc.Event.MODEL_VALIDATE, result, null, error);
            return result;
        };

        Model.prototype.add = function (value, key) {
            var data = this._data;

            if (!data || !value)
                return false;

            if (key) {
                data[key] = value;
            } else {
                data.push(value);
            }

            this.sendEvent(fastmvc.Event.MODEL_ADD, this.data());
            this.sendEvent(fastmvc.Event.MODEL_CHANGE, this.data());
            return true;
        };

        Model.prototype.remove = function (value, key) {
            var data = this._data;
            var result = false;

            if (key) {
                if (data[key]) {
                    delete data[key];
                    result = true;
                }
            } else {
                var index = data.indexOf(value);
                if (index > -1) {
                    data.splice(index, 1);
                    result = true;
                }
            }

            this.sendEvent(fastmvc.Event.MODEL_REMOVE, this.data());
            this.sendEvent(fastmvc.Event.MODEL_CHANGE, this.data());
            return result;
        };

        Model.prototype.update = function (value, key) {
            var data = this._data;
            var result = false;

            if (key) {
                if (data[key]) {
                    data[key] = value;
                    result = true;
                }
            } else {
                var index = data.indexOf(value);
                if (index > -1) {
                    data[index] = value;
                    result = true;
                }
            }

            this.sendEvent(fastmvc.Event.MODEL_UPDATE, this.data());
            this.sendEvent(fastmvc.Event.MODEL_CHANGE, this.data());
            return result;
        };
        return Model;
    })(fastmvc.Notifier);
    fastmvc.Model = Model;
})(fastmvc || (fastmvc = {}));
//# sourceMappingURL=model.js.map
