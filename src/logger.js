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
            _super.call(this, facade, name);
            this._data = [];
            this._config = { filter: [], length: 100000, console: true };
            this._modules = [];
        }
        Logger.prototype.config = function (value) {
            this._config = value;
        };

        Logger.prototype.config = function () {
            this._config;
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
            var data = { name: name, message: message, level: level, date: new Date() };

            this._data.push(data);

            if (this._data.length > this._config.length * 2) {
                this._data.length = this._data.slice(this._config.length);
            }

            if (this._modules.indexOf(name) === -1) {
                this._modules.push(name);
            }

            if (this._config) {
                var filtres = this._config.filtres;
                if (filtres && filtres.length) {
                    if (filtres.indexOf(name) === -1)
                        return;
                }
                this.sendEvent('log', data);
            }
            return;
        };
        return Logger;
    })(fastmvc.Notifier);
    fastmvc.Logger = Logger;
})(fastmvc || (fastmvc = {}));
//@ sourceMappingURL=logger.js.map
