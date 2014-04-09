var fmvc;
(function (fmvc) {
    var Notifier = (function () {
        function Notifier(name, type) {
            if (typeof type === "undefined") { type = null; }
            this._name = name;
            this._type = type ? type : fmvc.TYPE_MODEL;
        }
        Notifier.prototype.setFacade = function (value) {
            this._facade = value;
        };

        Notifier.prototype.facade = function () {
            return this._facade;
        };

        Notifier.prototype.name = function () {
            return this._name;
        };

        Notifier.prototype.type = function () {
            return this._type;
        };

        Notifier.prototype.sendEvent = function (name, data, sub, error, log) {
            if (typeof data === "undefined") { data = null; }
            if (typeof sub === "undefined") { sub = null; }
            if (typeof error === "undefined") { error = null; }
            if (typeof log === "undefined") { log = true; }
            var e = { name: name, sub: sub, data: data, error: error, target: this };
            if (log)
                this.log('Send event ' + name);
            if (this._facade)
                this._facade.eventHandler(e);
            if (this._listeners && this._listeners.length)
                this.sendToListners(name, data);
        };

        Notifier.prototype.log = function (message, level) {
            // log messages
            if (this._facade)
                this._facade.saveLog(this.name(), message, level);
        };

        Notifier.prototype.registerHandler = function () {
        };

        Notifier.prototype.removeHandler = function () {
        };

        Notifier.prototype.addListener = function (object, handler) {
            if (!this._listeners)
                this._listeners = [];
            this._listeners.push({ 'object': object, 'handler': handler });
        };

        Notifier.prototype.removeListener = function (object, handler) {
        };

        Notifier.prototype.removeAllListeners = function () {
        };

        Notifier.prototype.sendToListners = function (event, data) {
            for (var i in this._listeners) {
                var lo = this._listeners[i];
                (lo.handler).apply(lo.object, [event, data]);
            }
        };
        return Notifier;
    })();
    fmvc.Notifier = Notifier;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=notifier.js.map
