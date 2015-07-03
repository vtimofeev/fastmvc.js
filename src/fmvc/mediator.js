///<reference path='./d.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fmvc;
(function (fmvc) {
    var Mediator = (function (_super) {
        __extends(Mediator, _super);
        function Mediator(name, root, facade) {
            _super.call(this, name, fmvc.TYPE_MEDIATOR);
            this._root = root;
            this.facade = facade;
        }
        Mediator.prototype.setRoot = function (root) {
            this._root = root;
            return this;
        };
        Mediator.prototype.setFacade = function (facade) {
            this.facade = facade;
            return this;
        };
        Mediator.prototype.addViews = function (views) {
            if (views) {
                if (_.isArray(views)) {
                    for (var i in views) {
                        this.initView(views[i]);
                    }
                    this.views = views;
                }
                else {
                    this.initView((views));
                    this.views = [views];
                }
            }
            else {
                this.log('Has no views to add');
            }
            return this;
        };
        Mediator.prototype.initView = function (view) {
            this.log('Init view ' + view.name);
            view.mediator = this;
            view.render(this._root);
        };
        Mediator.prototype.getView = function (name) {
            for (var i in this.views) {
                if (this.views[i].name() == name)
                    return this.views[i];
            }
            return null;
        };
        Object.defineProperty(Mediator.prototype, "events", {
            get: function () {
                return [];
            },
            enumerable: true,
            configurable: true
        });
        Mediator.prototype.internalHandler = function (e) {
            if (e && e.global) {
                this.facade.eventHandler(e);
            }
            else {
                this.eventHandler(e);
            }
        };
        Mediator.prototype.eventHandler = function (e) {
            this.log('Handled ' + e.name + ' from ' + e.target.name + ":" + e.target.type);
            switch (e.target.type()) {
                case fmvc.TYPE_MEDIATOR:
                    this.mediatorEventHandler(e);
                    break;
                case fmvc.TYPE_MODEL:
                    this.modelEventHandler(e);
                    break;
                case fmvc.TYPE_VIEW:
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
    })(fmvc.Notifier);
    fmvc.Mediator = Mediator;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=mediator.js.map