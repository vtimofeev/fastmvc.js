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
            var exParams = this.getChildrenExpressionParams(this.getParameters());
            var childrenViews = _.map(this.data, function (v, k) {
                var child = prevChildren && prevChildren.length ? (prevChildren.splice(0, 1)[0]) : ComponentContructorFunc(this.parent.name + ':' + className + '-' + k, this.childrenLocalParams);
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
                    child.isChildren = true;
                    child.createDom();
                    child.enter();
                    this.getElement().appendChild(child.getElement());
                }
                child.invalidateData();
                child.invalidateApp();
            }, this);
        };
        TemplateChildrenView.prototype.executeExpression = function (value) {
            return ft.expression.execute(value, this.parent);
        };
        TemplateChildrenView.prototype.setCurrentChildToExecutionContext = function (child, index, length, context) {
            context.child = child;
            context.childIndex = index;
            context.childrenLength = length;
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
        TemplateChildrenView.prototype.applyChildrenParameters = function () {
            var _this = this;
            var params = this.getChildrenExpressionParams(this.getParameters());
            console.log('Apply children params ', this.name, params);
            var length = this._children ? this._children.length : 0;
            _.each(this._children, function (child, index) {
                if (child.disposed)
                    return;
                child.invalidateData();
                _.each(params, function (value, key) {
                    _this.setCurrentChildToExecutionContext(child, index, length, value.context || _this.parent);
                    var childValue = _this.getExpressionValue(value);
                    var childParamName = _this.getChildrenParamName(key);
                    if (childParamName === 'selected' || childParamName === 'disabled') {
                        console.log('Apply children parameter ', childParamName, childValue);
                        child.applyParameter(childValue, childParamName);
                    }
                });
                /*
                */
            }, this);
        };
        // Executes when applyValueToHost executed
        TemplateChildrenView.prototype.applyChildrenParameter = function (value, key) {
            var value = this._resultParams[key];
            var length = this._children ? this._children.length : 0;
            _.each(this._children, function (child, index) {
                if (child.disposed)
                    return;
                this.setCurrentChildToExecutionContext(child, index, length, value.context || this.parent);
                var childValue = _.isObject(value) ? this.getExpressionValue(value) : value;
                var childParamName = this.getChildrenParamName(key);
                child.applyParameter(childValue, childParamName);
            }, this);
            //this.setChildContext(null, 0);
        };
        // virtual
        TemplateChildrenView.prototype.createDom = function () {
            if (!this.getElement())
                throw 'Cant create children dom, cause not set element directly';
            this.createParameters();
            console.log('Children params is ', this.getParameters());
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
            this.applyChildrenParameters();
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