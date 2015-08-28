///<reference path="./d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ft;
(function (ft) {
    ft.templateHelper = new ft.TemplateViewHelper();
    var localeFormatterCache = {};
    var templateFormatterChache = {};
    var expression = new ft.Expression();
    function getFormatter(value, locale) {
        if (locale === void 0) { locale = 'en'; }
        return templateFormatterChache[value] || compileFormatter(value, locale);
    }
    function compileFormatter(value, locale) {
        var mf = localeFormatterCache[locale] || (localeFormatterCache[locale] = new MessageFormat(this.locale));
        return (templateFormatterChache[value] = mf.compile(value));
    }
    var TemplateView = (function (_super) {
        __extends(TemplateView, _super);
        function TemplateView(name, params, template) {
            _super.call(this, name);
            this._classMap = {};
            this._prevDynamicProperiesMap = {};
            this._dynamicPropertiesMap = {};
            this._template = template;
        }
        TemplateView.prototype.isChangedDynamicProperty = function (name) {
            var value = expression.getContextValue(name, this);
            return !(this._prevDynamicProperiesMap[name] === value);
        };
        TemplateView.prototype.setDynamicProperty = function (name, value) {
            this._dynamicPropertiesMap[name] = value;
        };
        TemplateView.prototype.createDom = function () {
            var e = ft.templateHelper.createTreeObject(this._template.domTree, this);
            ft.templateHelper.setDataTreeObject(this._template.domTree, this);
            this.setElement(e);
        };
        TemplateView.prototype.getTemplate = function () {
            return this._template;
        };
        TemplateView.prototype.getElementByPath = function (value) {
            return this._elementMap ? this._elementMap[value] : null;
        };
        TemplateView.prototype.getComponentByPath = function (value) {
            return this._componentMap ? this._componentMap[value] : null;
        };
        TemplateView.prototype.eval = function (value) {
            return undefined;
        };
        TemplateView.prototype.getValue = function (value) {
            return undefined;
        };
        TemplateView.prototype.getFormattedMessage = function (name, arguments) {
            return undefined;
        };
        TemplateView.prototype.getExpressionValue = function (ex) {
            var exObj = this.getTemplate().expressionMap[ex.name];
            var result = expression.execute(exObj, this.getTemplate().expressionMap, this);
            return result;
        };
        TemplateView.prototype.getClassExpressionValue = function (ex) {
            var exObj = this.getTemplate().expressionMap[ex.name];
            var result = expression.execute(exObj, this.getTemplate().expressionMap, this, true);
            return result;
        };
        TemplateView.prototype.getPathClassValue = function (path, name) {
            return this._classMap[path + '-' + name];
        };
        TemplateView.prototype.setPathClassValue = function (path, name, value) {
            this._classMap[path + '-' + name] = value;
        };
        TemplateView.prototype.setTemplateElementProperty = function (name, value) {
            if (!this[name]) {
                this[name] = value;
                if (!value)
                    delete this[name];
            }
            else {
                throw Error('Can not set name:' + name + ' property, cause it exist ' + this[name]);
            }
        };
        TemplateView.prototype.setPathOfCreatedElement = function (path, value) {
            if ('getElement' in value) {
                if (!this._componentMap)
                    this._componentMap = {};
                this._componentMap[path] = value;
            }
            else {
                if (!this._elementMap)
                    this._elementMap = {};
                this._elementMap[path] = value;
            }
        };
        TemplateView.prototype.getFormattedMessage = function (name, args) {
            var formattedTemplate = (this._template && this._template.i18n && this._template.i18n[name]) ? this._template.i18n[name] : null
                || (this._i18n && this._i18n[name]) ? this._i18n[name] : null;
            if (!formattedTemplate)
                return 'Error: not found';
            var formatter = getFormatter(formattedTemplate);
            return formatter(args);
        };
        TemplateView.prototype.canValidate = function (type) {
            var result = this.inDocument;
            //if(type===fmvc.InvalidateType.Data) result = result && !!this.data;
            return result;
        };
        TemplateView.prototype.validate = function () {
            if (!_.isEmpty(this._dynamicPropertiesMap)) {
                _.extend(this._prevDynamicProperiesMap, this._dynamicPropertiesMap);
                this._dynamicPropertiesMap = {};
            }
            _super.prototype.validate.call(this);
            if (this.canValidate())
                ft.templateHelper.updateDynamicTree(this);
            //console.log('After validate: ', this);
        };
        TemplateView.prototype.validateRecreateTree = function () {
            //templateHelper.createTreeObject(this._template.domTree, this);
        };
        TemplateView.prototype.validateData = function () {
            //if (this.canValidate(fmvc.InvalidateType.Data))
            //
        };
        TemplateView.prototype.eval = function (value) {
            var r = eval(value);
            return r;
        };
        return TemplateView;
    })(fmvc.View);
    ft.TemplateView = TemplateView;
})(ft || (ft = {}));
//# sourceMappingURL=template.view.js.map