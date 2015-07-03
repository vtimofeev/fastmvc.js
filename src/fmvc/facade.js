///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    fmvc.VERSION = '0.8.0';
    fmvc.TYPE_MEDIATOR = 'mediator';
    fmvc.TYPE_MODEL = 'model';
    fmvc.TYPE_VIEW = 'view';
    fmvc.DefaultModel = {
        locale: 'locale',
        i18n: 'i18n',
        theme: 'theme',
        log: 'log'
    };
    var Facade = (function () {
        function Facade(name, root, theme, locale, i18nDict) {
            if (theme === void 0) { theme = ''; }
            if (locale === void 0) { locale = 'ru'; }
            if (i18nDict === void 0) { i18nDict = {}; }
            this._name = '';
            this._events = {};
            this.model = {};
            this.mediator = {};
            // Уникальное имя приложения
            this._name = name;
            // Контейнер приложения
            this._root = root;
            // Регистрируем в синглтоне приложений среды (в дальнейшем используется для взаимойдействий между приложениями)
            Facade.__facades[name] = this;
            // создание модели логгера
            var logModel = new fmvc.Logger(fmvc.DefaultModel.log);
            // записываем модель в фасад (для глобального доступа и обработки событий из модели)
            this.register(logModel);
            // Модель локали, содержит строку указывающую на локализацию
            var localeModel = new fmvc.Model(fmvc.DefaultModel.locale, { value: locale });
            // Модель темы, содержит строку указывающую на тему
            var themeModel = new fmvc.Model(fmvc.DefaultModel.theme, { value: theme });
            // Объект содержащий глобальные данные i18n
            var i18nModel = new fmvc.Model(fmvc.DefaultModel.i18n, i18nDict);
            // Добавляем модели по умолчанию в фасад
            this.register([localeModel, i18nModel, themeModel]);
            this.log('Старт приложения ' + name + ', fmvc версия ' + fmvc.VERSION);
            this.init();
        }
        // В насдедниках переписываем метод, в нем добавляем доменные модели, прокси, медиаторы
        Facade.prototype.init = function () {
        };
        // Регистрация объкта система - модели, медиатора
        // Модели, содержат данные, генерируют события моделей
        // Медиаторы, содержат отображения, а тажке генерируют, проксируют события отображения, слушают события модели
        Facade.prototype.register = function (objects) {
            var _this = this;
            if (_.isArray(objects)) {
                _.each(objects, this.register, this);
            }
            else {
                var object = (objects);
                object.facade = this;
                this.log('Register ' + object.name + ', ' + object.type);
                switch (object.type) {
                    case fmvc.TYPE_MODEL:
                        var model = (object);
                        this.model[object.name] = model;
                        break;
                    case fmvc.TYPE_MEDIATOR:
                        var mediator = (object);
                        this.mediator[object.name] = mediator;
                        _.each(mediator.events, function (e) { return _this.addListener(mediator, e); }, this);
                        break;
                }
            }
            return this;
        };
        // Удаление объекта системы - модели, медиатора
        Facade.prototype.unregister = function (objects) {
            if (_.isArray(objects)) {
                _.each(objects, this.unregister, this);
            }
            else {
                var object = (objects);
                this.log('Unregister ' + object.name + ', ' + object.type);
                object.dispose();
                switch (object.type) {
                    case fmvc.TYPE_MODEL:
                        delete this.model[object.name];
                        break;
                    case fmvc.TYPE_MEDIATOR:
                        delete this.model[object.name];
                        this.removeListener((object));
                        break;
                }
            }
            return this;
        };
        Facade.prototype.addListener = function (object, event) {
            this._events[event] ? this._events[event].push(object) : (this._events[event] = [object]);
            return this;
        };
        Facade.prototype.removeListener = function (object, event) {
            function removeFromObjects(objects) { if (objects.indexOf(object) > -1)
                objects = _.without(objects, object); }
            ;
            if (event)
                removeFromObjects(this._events[event]);
            else
                _.each(this._events, removeFromObjects, this);
            return this;
        };
        Object.defineProperty(Facade.prototype, "locale", {
            // Текущее значение локали
            get: function () {
                return this.model[fmvc.DefaultModel.locale].data.value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Facade.prototype, "theme", {
            // Текущее значение темы
            get: function () {
                return this.model[fmvc.DefaultModel.locale].data.value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Facade.prototype, "i18n", {
            // i18n
            get: function () {
                return this.model[fmvc.DefaultModel.i18n].data;
            },
            enumerable: true,
            configurable: true
        });
        // Глобальный получатель событий от системы
        Facade.prototype.eventHandler = function (e) {
            var objects = this._events[e.name];
            _.each(objects, function (object) { return object.eventHandler(e.name); });
        };
        Object.defineProperty(Facade.prototype, "logger", {
            get: function () {
                return (this.model[fmvc.DefaultModel.log]);
            },
            enumerable: true,
            configurable: true
        });
        Facade.prototype.log = function (message, level) {
            if (this.logger) {
                this.logger.add(this._name, message, level);
            }
            else {
                console.log(this._name, message, level);
            }
            return this;
        };
        // Получение фасада приложения по имени
        Facade.getInstance = function (name) {
            return this.__facades[name];
        };
        Facade.__facades = {};
        return Facade;
    })();
    fmvc.Facade = Facade;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=facade.js.map