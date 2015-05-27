///<reference path='./d.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fmvc;
(function (fmvc) {
    var Logger = (function (_super) {
        __extends(Logger, _super);
        function Logger(facade, name) {
            _super.call(this, name);
            this._data = [];
            this._config = { filter: [], length: 100000, console: true };
            this._modules = [];
            this.facade = facade;
        }
        Logger.prototype.setConfig = function (value) {
            this._config = value;
        };
        Logger.prototype.console = function (value) {
            this._config.console = value;
        };
        Logger.prototype.setFilter = function (value) {
            this._config.filter = value;
        };
        Logger.prototype.modules = function () {
            return this._modules;
        };
        Logger.prototype.saveLog = function (name, message, level) {
            if (level === void 0) { level = 0; }
            var data = { name: name, message: message, level: level, date: new Date() };
            this._data.push(data);
            // clean logs
            if (this._data.length > this._config.length * 2) {
                this._data.length = this._data.slice(this._config.length);
            }
            if (this._modules.indexOf(name) === -1) {
                this._modules.push(name);
            }
            // send log event
            // exit if it has filters and has no the name in the array
            if (this._config && this._config.filter && this._config.filter.length && this._config.filter.indexOf(name) === -1) {
                return;
            }
            // console
            if (this._config && this._config.console && ('console' in window)) {
                console.log('[' + name + '] ' + level + ' ' + message);
            }
            // log
            this.sendEvent('log', data, null, null, false);
            return;
        };
        return Logger;
    })(fmvc.Notifier);
    fmvc.Logger = Logger;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=logger.js.map