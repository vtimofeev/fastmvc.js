var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fastmvc;
(function (fastmvc) {
    var ViewGroup = (function (_super) {
        __extends(ViewGroup, _super);
        function ViewGroup() {
            _super.apply(this, arguments);
        }
        return ViewGroup;
    })(View);
    fastmvc.ViewGroup = ViewGroup;

    var View = (function (_super) {
        __extends(View, _super);
        function View(mediator, name) {
            _super.call(this, null, name, fastmvc.TYPE_VIEW);
            this._mediator = mediator;
        }
        View.prototype.render = function () {
        };

        View.prototype.sendEvent = function (name, data, global) {
            if (typeof data === "undefined") { data = null; }
            if (typeof global === "undefined") { global = false; }
            this._mediator.internalHandler({ name: name, data: data, global: global, target: this });
        };
        return View;
    })(fastmvc.Notifier);
    fastmvc.View = View;
})(fastmvc || (fastmvc = {}));
//@ sourceMappingURL=view.js.map
