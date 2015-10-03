///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var Notifier = (function () {
        function Notifier(name, type) {
            if (type === void 0) { type = null; }
            this._disposed = false;
            this._name = name;
            this._type = type;
        }
        Object.defineProperty(Notifier.prototype, "facade", {
            get: function () {
                return this._facade;
            },
            set: function (value) {
                if (value) {
                    this._facade = value;
                    this.bind(this._facade, this._facade.eventHandler);
                    this.registerHandler();
                }
                else {
                    this.unbind(this._facade);
                    this.removeHandler();
                    this._facade = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Notifier.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Notifier.prototype, "disposed", {
            get: function () {
                return this._disposed;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Notifier.prototype, "type", {
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Notifier.prototype, "listenerCount", {
            // счетчик прямых слушателей
            get: function () {
                return this._listeners ? this._listeners.length : -1;
            },
            enumerable: true,
            configurable: true
        });
        // установка фасада для цепочки вызовов
        Notifier.prototype.setFacade = function (facade) {
            this.facade = facade;
            return this;
        };
        // Послаем сообщение сначала в фасад, потом частным слушателям (для моделей)
        Notifier.prototype.sendEvent = function (name, data, changes, sub, error) {
            if (data === void 0) { data = null; }
            if (changes === void 0) { changes = null; }
            if (sub === void 0) { sub = null; }
            if (error === void 0) { error = null; }
            this.log('SendEvent: ' + name);
            if (this._disposed)
                throw Error('Model ' + this.name + ' is disposed and cant send event');
            var e = { name: name, sub: sub, data: data, changes: changes, error: error, target: this };
            if (this._listeners)
                this._sendToListners(e);
            if (this._facade)
                this._facade.eventHandler(e);
        };
        Notifier.prototype.log = function () {
            var messages = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                messages[_i - 0] = arguments[_i];
            }
            if (this.facade)
                this.facade.logger.add(this.name, messages);
            else
                console.log(this.name, messages);
            return this;
        };
        Notifier.prototype.registerHandler = function () {
        };
        Notifier.prototype.removeHandler = function () {
        };
        Notifier.prototype.bind = function (object, handler) {
            this.addListener(object, handler);
            return this;
        };
        Notifier.prototype.unbind = function (object) {
            this.removeListener(object);
            return this;
        };
        Notifier.prototype.addListener = function (object, handler) {
            if (!this._listeners)
                this._listeners = [];
            var hasListener = _.filter(this._listeners, function (v) { return v.handler === handler; });
            if (_.isEmpty(hasListener))
                this._listeners.push({ target: object, handler: handler });
            else
                this.log('Try duplicate listener ', object.name);
        };
        Notifier.prototype.removeListener = function (object) {
            var deletedOffset = 0;
            this._listeners.forEach(function (lo, i) {
                if (lo.target === object) {
                    this.splice(i - deletedOffset, 1);
                    deletedOffset++;
                }
            }, this._listeners);
        };
        Notifier.prototype.removeAllListeners = function () {
            this._listeners = null;
        };
        Notifier.prototype._sendToListners = function (e) {
            _.each(this._listeners, function (lo) { if (!lo.target.disposed)
                (lo.handler).call(lo.target, e); });
        };
        Notifier.prototype.dispose = function () {
            this.removeAllListeners();
            this._facade = null;
            this._disposed = true;
        };
        return Notifier;
    })();
    fmvc.Notifier = Notifier;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=notifier.js.map