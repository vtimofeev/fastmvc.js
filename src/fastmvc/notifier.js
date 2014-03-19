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

        Notifier.prototype.sendEvent = function (name, data) {
            if (typeof data === "undefined") { data = null; }
            var e = { name: name, data: data, target: this };
            this.log('Send event ' + name);
            if (this._facade)
                this._facade.eventHandler(e);
        };

        Notifier.prototype.log = function (message, level) {
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
//@ sourceMappingURL=notifier.js.map
