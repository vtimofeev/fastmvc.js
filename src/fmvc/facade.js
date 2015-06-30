///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    fmvc.VERSION = '0.6.1';
    fmvc.TYPE_MEDIATOR = 'mediator';
    fmvc.TYPE_MODEL = 'model';
    fmvc.TYPE_VIEW = 'view';
    fmvc.DefaultModel = {
        locale: 'locale',
        i18n: 'i18n'
    };
    var Facade = (function () {
        function Facade(name, root, locale, i18nDict) {
            if (locale === void 0) { locale = 'ru'; }
            if (i18nDict === void 0) { i18nDict = {}; }
            this._name = '';
            this._objects = [];
            this._events = {};
            this.model = {};
            this.mediator = {};
            this._name = name;
            this._root = root;
            //this._logger = new fmvc.Logger(this, 'Log');
            //this.log('Start ' + name + ', fmvc ' + fmvc.VERSION);
            var locale = new fmvc.Model(fmvc.DefaultModel.locale, { value: 'ru' });
            var i18n = new fmvc.Model(fmvc.DefaultModel.i18n, {});
            this.register(locale, i18n);
            Facade._facades.push(name);
            init();
        }
        Facade.prototype.init = function () {
        };
        Facade.prototype.register = function (object) {
            object.facade = this;
            this.log('Register ' + object.name + ', ' + object.type);
            switch (object.type) {
                case fmvc.TYPE_MODEL:
                    break;
                case fmvc.TYPE_MEDIATOR:
                    var mediator = (object);
                    mediator.
                        break;
            }
            if (this._objects.indexOf(object) < 0) {
                this._objects.push(object);
                if (object && ('events' in object)) {
                    var events = object.events();
                    for (var i in events) {
                        var event = events[i];
                        this.log('Add event listener ' + object.name);
                        if (this._events[event]) {
                            this._events[event].push(object);
                        }
                        else {
                            this._events[event] = [object];
                        }
                    }
                }
            }
            return this;
        };
        Object.defineProperty(Facade.prototype, "locale", {
            get: function () {
            },
            enumerable: true,
            configurable: true
        });
        Facade.prototype.getLogger = function () {
            return this._logger;
        };
        Facade.prototype.getObject = function (name) {
            for (var i in this._objects) {
                var object = this._objects[i];
                if (object && object.name === name)
                    return object;
            }
            return null;
        };
        Facade.prototype.eventHandler = function (e) {
            var objects = this._events[e.name];
            for (var i in objects) {
                var object = objects[i];
                object.eventHandler(e);
            }
        };
        Facade.prototype.log = function (message, level) {
            this.sendLog(this._name, message, level);
        };
        Facade.prototype.sendLog = function (name, message, level) {
            console.log(_.toArray(arguments));
            //this._logger.saveLog(name, message, level);
        };
        Facade.prototype.getInstance = function (name) {
            return this._facades[name];
        };
        Facade._facades = [];
        return Facade;
    })();
    fmvc.Facade = Facade;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=facade.js.map