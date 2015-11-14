var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var todo;
(function (todo) {
    var App = (function (_super) {
        __extends(App, _super);
        function App(name, root, theme, locale, i18nDict) {
            _super.call(this, name, root, theme, locale, i18nDict);
        }
        App.prototype.initModels = function () {
            var itemsData = [{ title: 'First', done: false }, { title: 'Second', done: true }];
            var items = new fmvc.Model('items', itemsData.map(function (v, k) { return new fmvc.Model('item-' + k, v); }));
            this.register(items);
        };
        App.prototype.initMediators = function () {
            return _super.initMediators.call(this);
        };
        return App;
    })(fmvc.AppFacade);
    var AppMediator = (function (_super) {
        __extends(AppMediator, _super);
        function AppMediator(name, root) {
            _super.call(this, name, root);
        }
        return AppMediator;
    })(fmvc.Mediator);
})(todo || (todo = {}));
//# sourceMappingURL=app.js.map