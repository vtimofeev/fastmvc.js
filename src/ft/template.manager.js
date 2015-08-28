///<reference path="./d.ts" />
var ft;
(function (ft) {
    var tp = new ft.TemplateParser();
    var TemplateManager = (function () {
        function TemplateManager() {
            this._templateMap = {};
            this._templateFunc = {};
        }
        TemplateManager.prototype.parse = function (value) {
            var objs = tp.parseHtml(value);
            var template = tp.htmlObjectToTemplate(objs);
            return template;
        };
        TemplateManager.prototype.addTemplate = function (name, value) {
            if (this._templateMap[name])
                throw 'TemplateManager: cant add constructor ' + name + ' cause it exists';
            this._templateMap[name] = value;
            return this;
        };
        TemplateManager.prototype.getTemplate = function (name) {
            return this._templateMap[name];
        };
        TemplateManager.prototype.getTemplateViewFunc = function (templateName) {
            var t = this;
            return this._templateFunc[templateName] || (this._templateFunc[templateName] = function (name, params) {
                return new ft.TemplateView(name, params, t.getTemplate(templateName));
            });
        };
        return TemplateManager;
    })();
    ft.TemplateManager = TemplateManager;
    ft.templateManager = new TemplateManager();
})(ft || (ft = {}));
//# sourceMappingURL=template.manager.js.map