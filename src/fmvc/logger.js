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
        function Logger(name, config) {
            _super.call(this, name, [], { enabledEvents: false, watchChanges: false });
            this._config = { filter: [], length: 100000, console: true };
            this._modules = [];
            if (config)
                this.config = config;
            console.log('Construct facade logger ');
        }
        Object.defineProperty(Logger.prototype, "config", {
            set: function (value) {
                _.extend(this._config, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Logger.prototype, "console", {
            set: function (value) {
                this._config.console = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Logger.prototype, "filter", {
            set: function (value) {
                this._config.filter = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Logger.prototype, "modules", {
            get: function () {
                return this._modules;
            },
            enumerable: true,
            configurable: true
        });
        Logger.prototype.add = function (name, message, level) {
            if (level === void 0) { level = 0; }
            var data = { name: name, message: message, level: level, date: new Date() };
            var dataArray = this.data;
            var config = this._config;
            dataArray.push(data);
            // add module
            if (this._modules.indexOf(name) === -1)
                this._modules.push(name);
            // exit if it has filters and has no the name in the array
            if (config.filter && config.filter.length && config.filter.indexOf(name) === -1) {
                return;
            }
            // console
            if (config && config.console && ('console' in window)) {
                console.log('[' + name + '] ' + level + ' ' + message);
            }
            // clean: remove part of logs
            if (dataArray.length > config.length * 2) {
                dataArray.splice(0, dataArray.length - this._config.length);
            }
            // send event
            if (this.enabledEvents)
                this.sendEvent('log', data, null, null, false);
            return this;
        };
        return Logger;
    })(fmvc.Model);
    fmvc.Logger = Logger;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=logger.js.map