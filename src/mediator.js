var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fastmvc;
(function (fastmvc) {
    var Mediator = (function (_super) {
        __extends(Mediator, _super);
        function Mediator(facade, name, view) {
            if (typeof view === "undefined") { view = null; }
            _super.call(this, facade, name, fastmvc.TYPE_MEDIATOR);
            this._view = view;
        }
        Mediator.prototype.events = function () {
            return [];
        };

        Mediator.prototype.internalHandler = function (e) {
            if (e && e.global) {
                this.facade().eventHandler(e);
            } else {
                this.eventHandler(e);
            }
        };

        Mediator.prototype.eventHandler = function (e) {
            switch (e.target.type) {
                case fastmvc.TYPE_MEDIATOR:
                    this.mediatorEventHandler(e);
                    break;
                case fastmvc.TYPE_MODEL:
                    this.modelEventHandler(e);
                    break;
                case fastmvc.TYPE_VIEW:
                    this.viewEventHandler(e);
                    break;
            }
        };

        Mediator.prototype.modelEventHandler = function (e) {
        };

        Mediator.prototype.mediatorEventHandler = function (e) {
        };

        Mediator.prototype.viewEventHandler = function (e) {
        };
        return Mediator;
    })(fastmvc.Notifier);
    fastmvc.Mediator = Mediator;
})(fastmvc || (fastmvc = {}));
//@ sourceMappingURL=mediator.js.map
