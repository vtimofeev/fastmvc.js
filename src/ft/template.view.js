///<reference path="./d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ft;
(function (ft) {
    ft.templateHelper;
    var TemplateView = (function (_super) {
        __extends(TemplateView, _super);
        function TemplateView(name, params, template) {
            _super.call(this, name);
        }
        TemplateView.prototype.createDom = function () {
            ft.templateHelper.createDom(this);
        };
        TemplateView.prototype.getTemplate = function () {
            this._template;
        };
        TemplateView.prototype.setProperty = function (name, value) {
        };
        TemplateView.prototype.setPath = function (path, value) {
        };
        return TemplateView;
    })(fmvc.View);
    ft.TemplateView = TemplateView;
    var TemplateViewHelper = (function () {
        function TemplateViewHelper() {
        }
        TemplateViewHelper.prototype.createDom = function (view) {
        };
        TemplateViewHelper.prototype.createComponent = function (value) {
        };
        TemplateViewHelper.prototype.updateDom = function (view) {
        };
        return TemplateViewHelper;
    })();
    ft.TemplateViewHelper = TemplateViewHelper;
})(ft || (ft = {}));
//# sourceMappingURL=template.view.js.map