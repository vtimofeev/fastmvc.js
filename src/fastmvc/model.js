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
            var data = this.getData();
            this.sendEvent(fastmvc.Event.MODEL_CHANGE, data);
        };

        Model.prototype.getData = function () {
            return this._data;
        };

        Model.prototype.setValidator = function (value) {
            this._validator = value;
        };

        Model.prototype.validate = function (value) {
            var result = false;
            var error = {};

            if (!this._validator)
                result = true;
            else
                result = this._validator(value, this, error);
            this.sendEvent(fastmvc.Event.MODEL_VALIDATE, result, null, error);
            return result;
        };

        Model.prototype.destroy = function () {
        };
        return Model;
    })(fastmvc.Notifier);
    fastmvc.Model = Model;

    var ModelList = (function (_super) {
        __extends(ModelList, _super);
        function ModelList(name, data) {
            if (typeof data === "undefined") { data = null; }
            _super.call(this, name);
            this.setData(data);
        }
        ModelList.prototype.setData = function (value) {
            if (!this._data)
                this._data = [];
            for (var i in value) {
                this._data.push(this.createModel(value[i]));
            }
            this.sendEvent(fastmvc.Event.MODEL_CHANGE, this.data());
        };

        ModelList.prototype.getData = function () {
            return this._data;
        };

        ModelList.prototype.createModel = function (value) {
            return new Model(this.name + '-item', value);
        };

        ModelList.prototype.data = function () {
            return this._data;
        };

        ModelList.prototype.add = function (value) {
            this._data.push(value);
            this.sendEvent(fastmvc.Event.MODEL_CHANGE, this.getData());
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

            this.sendEvent(fastmvc.Event.MODEL_CHANGE, this.getData());
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

            this.sendEvent(fastmvc.Event.MODEL_CHANGE, this.getData());
            return result;
        };

        ModelList.prototype.getIndexOfModelData = function (value) {
            for (var i in this._data) {
                var model = this._data[i];
                console.log('Check ' + model.getData() + ', ' + value);
                if (model.getData() === value)
                    return Number(i);
            }
            return -1;
        };
        return ModelList;
    })(fastmvc.Notifier);
    fastmvc.ModelList = ModelList;
})(fastmvc || (fastmvc = {}));
//# sourceMappingURL=model.js.map
