var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fastmvc;
(function (fastmvc) {
    var Logger = (function (_super) {
        __extends(Logger, _super);
        function Logger(facade, name) {
            _super.call(this, name);
            this._data = [];
            this._config = { filter: [], length: 100000, console: true };
            this._modules = [];
            _super.prototype.facade.call(this, facade);
        }
        Logger.prototype.config = function (value) {
            this._config = value;
        };

        Logger.prototype.config = function () {
            this._config;
        };

        Logger.prototype.console = function (value) {
            this._config.console = value;
        };

        Logger.prototype.filtres = function (value) {
            this._config.filtres = value;
        };

        Logger.prototype.filtres = function () {
            this._config.filtres;
        };

        Logger.prototype.modules = function () {
            return this._modules;
        };

        Logger.prototype.saveLog = function (name, message, level) {
            if (typeof level === "undefined") { level = 0; }
            var data = { name: name, message: message, level: level, date: new Date() };

            this._data.push(data);

            if (this._data.length > this._config.length * 2) {
                this._data.length = this._data.slice(this._config.length);
            }

            if (this._modules.indexOf(name) === -1) {
                this._modules.push(name);
            }

            if (this._config && this._config.filtres && this._config.filtres.length && this._config.filtres.indexOf(name) === -1)
                return;

            if (this._config && this._config.console && console) {
                console.log('[' + name + '] ' + level + ' ' + message);
            }

            this.sendEvent('log', data);
            return;
        };
        return Logger;
    })(fastmvc.Notifier);
    fastmvc.Logger = Logger;
})(fastmvc || (fastmvc = {}));
//@ sourceMappingURL=logger.js.map
