///<reference path="./d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ft;
(function (ft) {
    var TemplateViewChildren = (function (_super) {
        __extends(TemplateViewChildren, _super);
        function TemplateViewChildren() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(TemplateViewChildren.prototype, "domDef", {
            get: function () {
                return this._domDef;
            },
            set: function (value) {
                this._domDef = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateViewChildren.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            set: function (value) {
                this._parent = value;
            },
            enumerable: true,
            configurable: true
        });
        TemplateViewChildren.prototype.createChildren = function () {
            var def = this.domDef;
            var className = def.params[ft.TemplateParams.childrenClass];
            var ViewClass = (ft.global[className]);
            if (!ViewClass)
                throw 'Children class ' + className + ' not found';
            var prevChildren = this._children;
            var childrenViews = _.map(this.data, function (v, k) {
                var params = {};
                if (v instanceof fmvc.Model) {
                    params['model'] = v;
                }
                else {
                    params['data'] = v;
                }
                if (def.params[ft.TemplateParams.childrenEnableStateHandlers])
                    params[ft.TemplateParams.stateHandlers] = def.params[ft.TemplateParams.childrenEnableStateHandlers];
                var child = prevChildren && prevChildren.length ? prevChildren.splice(0, 1)[0] : new ViewClass(className + '-' + k, null);
                child.cleanParameters();
                child.setParameters(params);
                child.applyParameters();
                return child;
            }, this);
            this._children = childrenViews;
            _.each(prevChildren, function (v) { return v.dispose(); });
            _.each(this._children, function (child) {
                child.parent = this.parent;
                child.domDef = def;
                if (!child.inDocument) {
                    child.createDom();
                    child.enter();
                    this.getElement().appendChild(child.getElement());
                }
                child.invalidateData();
                child.invalidateApp();
                //child.validate();
            }, this);
            if (def.params[ft.TemplateParams.childrenSetStateSelected])
                this.checkSelected();
            if (def.params[ft.TemplateParams.childrenSetStateDisabled])
                this.checkDisabled();
        };
        TemplateViewChildren.prototype.checkSelected = function () {
            _.each(this._children, function (child) {
                if (!child.disposed)
                    child.applyParameter(this.domDef.params[ft.TemplateParams.childrenSetStateSelected], ft.TemplateParams.setStateSelected);
            }, this);
        };
        TemplateViewChildren.prototype.checkDisabled = function () {
            _.each(this._children, function (child) {
                if (!child.disposed)
                    child.applyParameter(this.domDef.params[ft.TemplateParams.childrenSetStateDisabled], ft.TemplateParams.setStateDisabled);
            }, this);
        };
        // virtual
        TemplateViewChildren.prototype.createDom = function () {
            if (!this.getElement())
                throw 'Cant create children dom, cause not set element directly';
        };
        TemplateViewChildren.prototype.enter = function () {
            if (this.inDocument)
                return;
            this.createChildren();
            /*
            _.each(this._children, function (child:ITemplateView) {
                child.enter();
            }, this);
            */
            _super.prototype.enter.call(this);
        };
        TemplateViewChildren.prototype.exit = function () {
            _.each(this._children, function (child) {
                child.exit();
            }, this);
        };
        TemplateViewChildren.prototype.validateData = function () {
            //console.log('Validate children data...');
            this.createChildren();
        };
        TemplateViewChildren.prototype.validateState = function () {
        };
        TemplateViewChildren.prototype.unrender = function () {
        };
        TemplateViewChildren.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.domDef = null;
            this.parent = null;
        };
        return TemplateViewChildren;
    })(fmvc.View);
    ft.TemplateViewChildren = TemplateViewChildren;
})(ft || (ft = {}));
//# sourceMappingURL=template.view.children.js.map