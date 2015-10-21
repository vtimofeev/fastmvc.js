///<reference path="./d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ft;
(function (ft) {
    var TemplateChildrenView = (function (_super) {
        __extends(TemplateChildrenView, _super);
        function TemplateChildrenView(name, params, template) {
            _super.call(this, name, params, { domTree: {} });
        }
        TemplateChildrenView.prototype.createChildren = function () {
            var def = this.domDef;
            var className = def.params[ft.TemplateParams.childrenClass];
            var ComponentContructorFunc = (window[className]);
            if (!ComponentContructorFunc)
                throw 'Children class ' + className + ' not found';
            var prevChildren = this._children;
            var childrenViews = _.map(this.data, function (v, k) {
                var child = prevChildren && prevChildren.length ? (prevChildren.splice(0, 1)[0]) : ComponentContructorFunc(this.parent.name + ':' + className + '-' + k, this.childrenLocalParams);
                child.isChildren = true;
                if (v instanceof fmvc.Model)
                    child.model = v;
                else
                    child.data = v;
                return child;
            }, this);
            this._children = childrenViews;
            _.each(prevChildren, function (v) { return v.dispose(); });
            _.each(this._children, function (child) {
                child.parent = this.parent;
                child.domDef = def;
                if (!child.inDocument) {
                    //child.applyParameters();
                    child.createDom();
                    child.enter();
                    this.getElement().appendChild(child.getElement());
                }
                child.invalidateData();
                child.invalidateApp();
                //child.validate();
            }, this);
            //if(def.params[TemplateParams.childrenSetStateSelected]) this.checkSelected();
            //if(def.params[TemplateParams.childrenSetStateDisabled]) this.checkDisabled();
        };
        TemplateChildrenView.prototype.executeExpression = function (value) {
            return ft.expression.execute(value, this.parent);
        };
        TemplateChildrenView.prototype.setChildContext = function (child, index) {
            this.parent.child = child;
            this.parent.childIndex = index;
        };
        TemplateChildrenView.prototype.getChildrenLocalParams = function (params) {
            var _this = this;
            var r = {};
            _.each(params, function (v, key) {
                if (key === 'data' || key === 'model')
                    return;
                if (_this.isChildrenParamName(key) && !_.isObject(v))
                    r[_this.getChildrenParamName(key)] = v;
            });
            return r;
        };
        TemplateChildrenView.prototype.getChildrenExpressionParams = function (params) {
            var _this = this;
            var r = {};
            _.each(params, function (v, key) {
                if (key === 'data' || key === 'model')
                    return;
                if (_this.isChildrenParamName(key) && _.isObject(v))
                    r[key] = v;
            });
            return r;
        };
        TemplateChildrenView.prototype.isChildrenParamName = function (value) {
            return value.indexOf('children.') === 0;
        };
        TemplateChildrenView.prototype.getChildrenParamName = function (value) {
            return value.substring(9);
        };
        TemplateChildrenView.prototype.getChildExpressionValue = function (ex) {
            var exName = ex.name;
            var exObj = this.getExpressionByName(exName);
            var result = this.executeExpression(exObj);
            return result;
        };
        TemplateChildrenView.prototype.applyChildrenParameters = function () {
            var _this = this;
            var params = this.getChildrenExpressionParams(this._params);
            this.parent.childrenLength = this._children ? this._children.length : 0;
            _.each(this._children, function (child, index) {
                if (child.disposed)
                    return;
                _this.setChildContext(child, index);
                _.each(params, function (value, key) {
                    var childValue = _this.getChildExpressionValue(value);
                    var childParamName = _this.getChildrenParamName(key);
                    child.applyParameter(childValue, childParamName);
                });
            }, this);
        };
        // Executes when applyValueToHost executed
        TemplateChildrenView.prototype.applyChildrenParameter = function (value, key) {
            var value = this._params[key];
            _.each(this._children, function (child, index) {
                if (child.disposed)
                    return;
                this.setChildContext(child, index);
                var childValue = _.isObject(value) ? this.getChildExpressionValue(value) : value;
                var childParamName = this.getChildrenParamName(key);
                child.applyParameter(childValue, childParamName);
            }, this);
            this.setChildContext(null, 0);
        };
        /*
         checkDisabled() {
         _.each(this._children, function (child:ITemplateView) {
         if(!child.disposed) child.applyParameter(this.domDef.params[TemplateParams.childrenSetStateDisabled], TemplateParams.setStateDisabled);
         }, this);
         }
         */
        // virtual
        TemplateChildrenView.prototype.createDom = function () {
            if (!this.getElement())
                throw 'Cant create children dom, cause not set element directly';
        };
        TemplateChildrenView.prototype.enter = function () {
            if (this.inDocument)
                return;
            this.childrenLocalParams = this.getChildrenLocalParams(this.getParameters());
            this.applyParameters();
            this.createChildren();
            this.applyChildrenParameters();
            _super.prototype.enter.call(this);
        };
        TemplateChildrenView.prototype.exit = function () {
            _.each(this._children, function (child) {
                child.exit();
            }, this);
        };
        TemplateChildrenView.prototype.validateData = function () {
            this.createChildren();
        };
        TemplateChildrenView.prototype.validateState = function () {
        };
        TemplateChildrenView.prototype.unrender = function () {
        };
        TemplateChildrenView.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.domDef = null;
            this.parent = null;
        };
        return TemplateChildrenView;
    })(ft.TemplateView);
    ft.TemplateChildrenView = TemplateChildrenView;
})(ft || (ft = {}));
//# sourceMappingURL=template.view.children.js.map