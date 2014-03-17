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
        function Model(facade, name, data) {
            if (typeof data === "undefined") { data = null; }
            _super.call(this, facade, name);
            this._data = data;
        }
        return Model;
    })(fastmvc.Notifier);
    fastmvc.Model = Model;
})(fastmvc || (fastmvc = {}));
//@ sourceMappingURL=model.js.map
