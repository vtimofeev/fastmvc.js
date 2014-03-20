///<
var fastmvc;
(function (fastmvc) {
    var Notifier = (function () {
        function Notifier(name, type) {
            if (typeof type === "undefined") { type = null; }
            this._name = name;
            this._type = type ? type : fastmvc.TYPE_MODEL;
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

        Notifier.prototype.sendEvent = function (name, data, sub, error) {
            if (typeof data === "undefined") { data = null; }
            if (typeof sub === "undefined") { sub = null; }
            if (typeof error === "undefined") { error = null; }
            var e = { name: name, sub: sub, data: data, error: error, target: this };
            this.log('Send event ' + name);
            if (this._facade)
                this._facade.eventHandler(e);
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
        return Notifier;
    })();
    fastmvc.Notifier = Notifier;
})(fastmvc || (fastmvc = {}));
//# sourceMappingURL=notifier.js.map
