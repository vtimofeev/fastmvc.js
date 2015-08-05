///<reference path='./d.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fmvc;
(function (fmvc) {
    fmvc.DefaultModel = {
        locale: 'locale',
        i18n: 'i18n',
        theme: 'theme',
        log: 'log'
    };
    var AppFacade = (function (_super) {
        __extends(AppFacade, _super);
        function AppFacade(name, root, theme, locale, i18nDict) {
            if (theme === void 0) { theme = ''; }
            if (locale === void 0) { locale = 'ru'; }
            if (i18nDict === void 0) { i18nDict = {}; }
            _super.call(this, name, root);
            // Модель локали, содержит строку указывающую на локализацию
            var localeModel = new fmvc.Model(fmvc.DefaultModel.locale, { value: locale });
            // Модель темы, содержит строку указывающую на тему
            var themeModel = new fmvc.Model(fmvc.DefaultModel.theme, { value: theme });
            // Объект содержащий глобальные данные i18n
            var i18nModel = new fmvc.Model(fmvc.DefaultModel.i18n, i18nDict);
            // Добавляем модели по умолчанию в фасад
            this.register([localeModel, i18nModel, themeModel]);
        }
        AppFacade.prototype.init = function () {
        };
        Object.defineProperty(AppFacade.prototype, "locale", {
            // Текущее значение локали
            get: function () {
                return this.model[fmvc.DefaultModel.locale].data.value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppFacade.prototype, "theme", {
            // Текущее значение темы
            get: function () {
                return this.model[fmvc.DefaultModel.locale].data.value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppFacade.prototype, "i18n", {
            // i18n
            get: function () {
                return this.model[fmvc.DefaultModel.i18n].data;
            },
            enumerable: true,
            configurable: true
        });
        return AppFacade;
    })(fmvc.Facade);
    fmvc.AppFacade = AppFacade;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=app.facade.js.map