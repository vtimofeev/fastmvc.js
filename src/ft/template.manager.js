///<reference path="./d.ts" />
var ft;
(function (ft) {
    var TemplateManager = (function () {
        function TemplateManager() {
        }
        TemplateManager.prototype.parse = function (value) {
            return undefined;
        };
        TemplateManager.prototype.add = function (name, value) {
            return undefined;
        };
        TemplateManager.prototype.get = function (name) {
            return undefined;
        };
        TemplateManager.prototype.getConstructor = function (template) {
            return function (name, params) {
                return new ft.TemplateView(name, params, template);
            };
        };
        return TemplateManager;
    })();
    ft.TemplateManager = TemplateManager;
})(ft || (ft = {}));
//# sourceMappingURL=template.manager.js.map