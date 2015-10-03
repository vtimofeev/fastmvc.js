///<reference path='./d.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fmvc;
(function (fmvc) {
    var ModelList = (function (_super) {
        __extends(ModelList, _super);
        function ModelList(name, data, opts) {
            if (data === void 0) { data = []; }
            _super.call(this, name, data, opts);
        }
        ModelList.prototype.parseValue = function (value) {
            if (!_.isArray(value))
                throw Error('Cant set modelList from not array data');
            var data = [];
            _.each(value, function (item) {
                var modelValue = (item instanceof fmvc.Model) ? item : this.getModel(item);
                data.push(modelValue);
            }, this);
            return data;
        };
        // @overrided
        ModelList.prototype.getModel = function (value) {
            return new fmvc.Model(this.name + '-item', value);
        };
        Object.defineProperty(ModelList.prototype, "count", {
            get: function () {
                var data = this.data;
                return (data && data.length) ? data.length : 0;
            },
            enumerable: true,
            configurable: true
        });
        return ModelList;
    })(fmvc.Model);
    fmvc.ModelList = ModelList;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=model.list.js.map