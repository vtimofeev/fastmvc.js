///<reference path="./d.ts" />
var ft;
(function (ft) {
    ft.globalScope = window || {};
    var templateParser = new ft.TemplateParser();
    /**
     * Менеджер классов,
     * 1. используется для создания классов и регистрации их в глобальном скоупе, имеет возможности для переопределения встроенных методов и параметорв, создания новых.
     * 2. используется для получения экземпляров классов
     *
     */
    var TemplateManager = (function () {
        function TemplateManager() {
            this._templateMap = {};
            this._instanceFunc = {};
        }
        /**
         * Создаем класc - функцию которая линкует экземпляр "TemplateView" с параметрами заданными при создании класса, и расширением методоа
         * ***В функции конструкторе используется хак переопределения возвращаемого значения, это работает только для объектов
         *
         * @param className
         * @param content
         * @param params
         * @param mixin
         * @returns {ITemplateConstructor}
         */
        TemplateManager.prototype.createClass = function (className, content, params, mixin) {
            var templateData = this.parse(content);
            if (this._templateMap[className])
                throw 'TemplateManager: cant add ITempalte object of ' + className + ' cause it exists.';
            this._templateMap[className] = templateData;
            var result = this.createInstanceFunc(className, params, mixin);
            this.registerClass(className, result);
            return result;
        };
        /**
         * Фабрика классов, создание экземпляров по имени класса, имени экземпляра, параметрам и расширению методов ( которые в свою очередь будут расширять базовые)
         * Возвращает расширенный экземпляр TemplateView
         *
         * @param className
         * @param name
         * @param params
         * @param mixin
         * @returns {any}
         */
        TemplateManager.prototype.createInstance = function (className, name, params, mixin) {
            return this._instanceFunc[className](name, params, mixin);
        };
        /* Регистрируем класс (функцию конструктор), в глобальном скоупе */
        TemplateManager.prototype.registerClass = function (className, value) {
            _.reduce(className.split('.'), function (g, v) { return (g[v] ? g[v] : (g[v] = {})); }, ft.globalScope); // create constructor map at window
        };
        /* Создаем функцию конструктор, связанную с текущим именем класса и расширением - параметоров и методоа */
        TemplateManager.prototype.createInstanceFunc = function (className, baseParams, baseMixin) {
            var template = this._templateMap[className];
            if (!this._instanceFunc[className]) {
                this._instanceFunc[className] = function (name, params, mixin) {
                    //console.log('CreateInstance  ', name, baseParams, baseMixin, params, mixin);
                    var instanceParams = _.extend({}, baseParams, params); // extend base parameters
                    var instanceMixin = _.extend({}, baseMixin, mixin); // extend methods
                    var instance = new ft.TemplateView(name, instanceParams, template);
                    //console.log('CreateInstance base (p),(m) local (p),(m) instance p,m ', name, baseParams, baseMixin, params, mixin, instanceParams, instanceMixin);
                    _.each(instanceMixin, function (v, k) { return instance[k] = v; });
                    return instance;
                };
            }
            return this._instanceFunc[className];
        };
        /* Парсим текстовый шаблон, затем дополнительно обрабатываем для представления в виде "ITemplate" */
        TemplateManager.prototype.parse = function (value) {
            var objs = templateParser.parseHtml(value);
            var template = templateParser.htmlObjectToTemplate(objs);
            //@todo: Добавить проверку синтаксиса html и выражений, выводить в специальный логгер
            return template;
        };
        return TemplateManager;
    })();
    ft.TemplateManager = TemplateManager;
    ft.templateManager = new TemplateManager();
})(ft || (ft = {}));
//# sourceMappingURL=template.manager.js.map