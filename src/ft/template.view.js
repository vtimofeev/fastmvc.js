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
    //var MessageFormat = exports?exports.MessageFormat:window.MessageFormat;
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
            this._template = template;
        }
        TemplateView.prototype.createDom = function () {
            var e = ft.templateHelper.createTreeObject(this._template.domTree, this);
            this.setElement(e);
        };
        TemplateView.prototype.getTemplate = function () {
            return this._template;
        };
        TemplateView.prototype.getElementByPath = function (value) {
            return this._elementMapByPath ? this._elementMapByPath[value] : null;
        };
        TemplateView.prototype.getComponentByPath = function (value) {
            return this._componentMapByPath ? this._componentMapByPath[value] : null;
        };
        TemplateView.prototype.setTemplateElementProperty = function (name, value) {
            if (!this[name]) {
                this[name] = value;
                if (!value)
                    delete this[name];
            }
            else {
                throw Error('Cant set ' + name + ' property, cause it exist ' + this[name]);
            }
        };
        TemplateView.prototype.setPathOfCreatedElement = function (path, value) {
            if (_.isElement(value)) {
                if (!this._elementMapByPath)
                    this._elementMapByPath = {};
                this._elementMapByPath[path] = value;
            }
            else {
                if (!this._componentMapByPath)
                    this._componentMapByPath = {};
                this._componentMapByPath[path] = value;
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
        TemplateView.prototype.eval = function (value) {
            var r = eval(value);
            console.log('eval: ', value, ' = ', r, ' instance', this);
            return r;
        };
        return TemplateView;
    })(fmvc.View);
    ft.TemplateView = TemplateView;
})(ft || (ft = {}));
//# sourceMappingURL=template.view.js.map