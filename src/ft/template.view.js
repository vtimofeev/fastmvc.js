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
    var TemplateView = (function (_super) {
        __extends(TemplateView, _super);
        function TemplateView(name, params, template) {
            _super.call(this, name);
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
        return TemplateView;
    })(fmvc.View);
    ft.TemplateView = TemplateView;
})(ft || (ft = {}));
//# sourceMappingURL=template.view.js.map