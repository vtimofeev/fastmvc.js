///<reference path='notifier.ts'/>
///<reference path='facade.ts'/>
///<reference path='view.ts'/>
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
        function Mediator(facade, name, views) {
            if (typeof views === "undefined") { views = null; }
            _super.call(this, name, fastmvc.TYPE_MEDIATOR);
            this.setFacade(facade);
            this.initViews(views);
        }
        Mediator.prototype.initViews = function (views) {
            if (views) {
                if (views.length) {
                    for (var i in views) {
                        this.initView(views[i]);
                    }

                    this.views = views;
                } else {
                    this.initView(views);
                    this.views = [views];
                }
            } else {
                this.log('Has no views on init');
            }
        };

        Mediator.prototype.initView = function (view) {
            this.log('Init view ' + view.name());
            view.mediator(this);
            view.delegateEventHandlers(true);
        };

        Mediator.prototype.getView = function (name) {
            for (var i in this.views) {
                if (this.views[i].name() == name)
                    return this.views[i];
            }
            return null;
        };

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
//# sourceMappingURL=mediator.js.map