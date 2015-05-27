var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var ViewList = (function (_super) {
        __extends(ViewList, _super);
        function ViewList(name, $root) {
            _super.call(this, name, $root);
        }
        Object.defineProperty(ViewList.prototype, "modelList", {
            get: function () {
                return this._modelList;
            },
            set: function (value) {
                this._modelList = value;
            },
            enumerable: true,
            configurable: true
        });
        ViewList.prototype.listAdd = function (view) {
        };
        ViewList.prototype.listRemove = function (view) {
        };
        ViewList.prototype.listRemoveAt = function (view) {
        };
        return ViewList;
    })(fmvc.View);
    fmvc.ViewList = ViewList;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=view.list.js.map