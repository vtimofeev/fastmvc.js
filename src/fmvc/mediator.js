///<reference path='./d.ts'/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fmvc;
(function (fmvc) {
    var Mediator = (function (_super) {
        __extends(Mediator, _super);
        function Mediator(name, root) {
            _super.call(this, name, fmvc.TYPE_MEDIATOR);
            this.setRoot(root);
            this.views = [];
        }
        Mediator.prototype.setRoot = function (root) {
            this._root = root;
            return this;
        };
        Object.defineProperty(Mediator.prototype, "root", {
            get: function () {
                return this._root;
            },
            enumerable: true,
            configurable: true
        });
        Mediator.prototype.addView = function () {
            var views = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                views[_i - 0] = arguments[_i];
            }
            _.each(views, this._addView, this);
            return this;
        };
        Mediator.prototype._addView = function (view) {
            if (this.views.indexOf(view) === -1) {
                this.views.push(view);
                view.setMediator(this).render(this.root);
            }
            else {
                this.log('Warn: try to duplicate view');
            }
        };
        Mediator.prototype.getView = function (name) {
            return _.find(this.views, function (view) { return view.name === name; });
        };
        Mediator.prototype.removeView = function (name) {
            this.views = _.without(this.views, this.getView(name));
            return this;
        };
        Object.defineProperty(Mediator.prototype, "events", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Mediator.prototype.internalHandler = function (e) {
            if (e && e.globalScope) {
                this.facade.eventHandler(e);
            }
            else {
                this.eventHandler(e);
            }
        };
        Mediator.prototype.eventHandler = function (e) {
            switch (e && e.target ? e.target.type : null) {
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