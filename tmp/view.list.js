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
        function ViewList(name) {
            _super.call(this, name);
            this.ChildrenConstructor = fmvc.View;
        }
        Object.defineProperty(ViewList.prototype, "childrenConstructor", {
            set: function (value) {
                this.ChildrenConstructor = value;
            },
            enumerable: true,
            configurable: true
        });
        /*
        set dataset(value:any[]) {
            this._dataset = value;
            this.invalidate(8);
        }

        get dataset():any[] {
            return this._dataset;
        }
        */
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
            var children = this.removeChildFrom(this.data.length - 1) || [];
            console.log('Update children ... ', this._model, this.data);
            _.each(this.data, function (value, index) {
                var view = (this.childrenViews && this.childrenViews.length ? this.childrenViews[index] : null)
                    || (children && children.length ? children.splice(0, 1)[0] : null)
                    || new this.ChildrenConstructor(ViewList.Name + index);
                if (value instanceof fmvc.Model)
                    view.setModel(value, true);
                else
                    view.data = value;
                console.log('Updated view ', view);
                _.each(this.avaibleInheritedStates, function (name) { view.setState(name, this.getState(name)); }, this);
                if (!view.inDocument) {
                    this.addChild(view);
                }
            }, this);
        };
        ViewList.prototype.modelHandler = function (e) {
            //this.log('modelHandler ' + name);
            _super.prototype.modelHandler.call(this, e);
            this.invalidate(4);
        };
        return ViewList;
    })(fmvc.View);
    fmvc.ViewList = ViewList;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=view.list.js.map