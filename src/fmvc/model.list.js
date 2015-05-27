var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var ModelList = (function (_super) {
        __extends(ModelList, _super);
        function ModelList(name, data) {
            if (data === void 0) { data = null; }
            _super.call(this, name);
            this.data = data;
        }
        Object.defineProperty(ModelList.prototype, "data", {
            get: function () {
                return this._data;
            },
            set: function (value) {
                if (!this._data)
                    this._data = [];
                for (var i in value) {
                    this._data.push(this.createModel(value[i]));
                }
                this.sendEvent(fmvc.Event.MODEL_CHANGED, this.data);
            },
            enumerable: true,
            configurable: true
        });
        ModelList.prototype.createModel = function (value) {
            return new fmvc.Model(this.name + '-item', value);
        };
        ModelList.prototype.add = function (value) {
            this._data.push(this.createModel(value));
            this.sendEvent(fmvc.Event.MODEL_CHANGED, this.data);
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
            this.sendEvent(fmvc.Event.MODEL_CHANGED, this.data);
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
            this.sendEvent(fmvc.Event.MODEL_CHANGED, this.data);
            return result;
        };
        ModelList.prototype.getIndexOfModelData = function (value) {
            for (var i in this._data) {
                var model = this._data[i];
                console.log('Check ' + model.data + ', ' + value);
                if (model.data === value)
                    return Number(i);
            }
            return -1;
        };
        return ModelList;
    })(fmvc.Notifier);
    fmvc.ModelList = ModelList;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=model.list.js.map