///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var Notifier = (function () {
        function Notifier(name, type) {
            if (type === void 0) { type = null; }
            this._disposed = false;
            this._name = name;
            this._type = type ? type : fmvc.TYPE_MODEL;
        }
        Object.defineProperty(Notifier.prototype, "facade", {
            get: function () {
                return this._facade;
            },
            set: function (value) {
                if (value) {
                    this._facade = value;
                    this.registerHandler();
                }
                else {
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
        // ������� ��������� ������� � �����, ����� ������� ���������� (��� �������)
        Notifier.prototype.sendEvent = function (name, data, sub, error, log) {
            if (data === void 0) { data = null; }
            if (sub === void 0) { sub = null; }
            if (error === void 0) { error = null; }
            if (log === void 0) { log = true; }
            var e = { name: name, sub: sub, data: data, error: error, target: this };
            if (log)
                this.log('Send event ' + name);
            if (this._facade)
                this._facade.eventHandler(e);
            if (this._listeners && this._listeners.length)
                this._sendToListners(name, data);
        };
        Notifier.prototype.log = function (message, level) {
            // @todo remove facade reference
            if (this._facade)
                this._facade.sendLog(this.name, message, level);
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
        Notifier.prototype.unbind = function (object, handler) {
            this.removeListener(object, handler);
            return this;
        };
        Notifier.prototype.addListener = function (object, handler) {
            if (!this._listeners)
                this._listeners = [];
            this._listeners.push({ target: object, handler: handler });
            return this;
        };
        Notifier.prototype.removeListener = function (object, handler) {
            var deleted = 0;
            this._listeners.forEach(function (lo, i) {
                if (lo.target === object) {
                    this.splice(i - deleted, 1);
                    deleted++;
                }
            }, this._listeners);
            return this;
        };
        Notifier.prototype.removeAllListeners = function () {
            this._listeners = null;
        };
        Notifier.prototype._sendToListners = function (event, data) {
            this._listeners.forEach(function (lo) {
                if (!lo.target.disposed)
                    (lo.handler).apply(lo.target, [event, data]);
            });
        };
        Notifier.prototype.dispose = function () {
            this.removeAllListeners();
            this.facade = null;
            this._disposed = true;
        };
        return Notifier;
    })();
    fmvc.Notifier = Notifier;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=notifier.js.map