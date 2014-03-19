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
            _super.call(this, name, fastmvc.TYPE_MEDIATOR);
            this.setFacade(facade);
            if (view) {
                this._view = view;
                view.mediator(this);
                view.delegateEventHandlers(true);
            }
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
            this.log('Handled ' + e.name + ' from ' + e.target.name() + ":" + e.target.type());
            switch (e.target.type()) {
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

        Mediator.prototype.view = function () {
            return this._view;
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
