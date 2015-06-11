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
        Object.defineProperty(ViewList.prototype, "childrenConstructor", {
            set: function (value) {
                this.ChildrenConstructor = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewList.prototype, "dataset", {
            get: function () {
                return this._dataset;
            },
            set: function (value) {
                this._dataset = value;
                this.invalidate(8);
            },
            enumerable: true,
            configurable: true
        });
        ViewList.prototype.applyChildrenState = function (name, value) {
            if (!this.avaibleInheritedStates || this.avaibleInheritedStates.indexOf(name) === -1)
                return;
            this.forEachChild(function (view, index) { this.applyViewState(name, value, view, index); });
        };
        ViewList.prototype.applyViewState = function (name, value, view, index) {
            view.setState(name, value);
        };
        ViewList.prototype.updateChildren = function () {
            if (!this.inDocument)
                return;
            var children = this.removeAllChildren() || [];
            _.each(this.dataset, function (value, index) {
                var view = children[index] || new this.ChildrenConstructor();
                view.data = value;
                _.each(this.avaibleInheritedStates, function (name) { view.setState(name, this.getState(name)); }, this);
                if (!view.inDocument) {
                    this.addChild(view);
                }
            }, this);
        };
        return ViewList;
    })(fmvc.View);
    fmvc.ViewList = ViewList;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=view.list.js.map