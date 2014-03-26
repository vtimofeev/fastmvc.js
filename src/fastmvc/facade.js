var fastmvc;
(function (fastmvc) {
    fastmvc.VERSION = '0.1.0';

    fastmvc.TYPE_MEDIATOR = 'mediator';
    fastmvc.TYPE_MODEL = 'model';
    fastmvc.TYPE_VIEW = 'view';

    var Facade = (function () {
        function Facade(name) {
            this._name = '';
            this._objects = [];
            this._events = {};
            this._name = name;
            this._logger = new fastmvc.Logger(this, 'Log');
            this.log('Start ' + name + ', fastmvc ' + fastmvc.VERSION);
            Facade._facades.push(name);
        }
        Facade.prototype.register = function (object) {
            object.setFacade(this);
            this.log('Register ' + object.name());

            if (this._objects.indexOf(object) < 0) {
                this._objects.push(object);
                if (object && ('events' in object)) {
                    var events = object.events();
                    for (var i in events) {
                        var event = events[i];
                        this.log('Add event listener ' + object.name());
                        if (this._events[event]) {
                            this._events[event].push(object);
                        } else {
                            this._events[event] = [object];
                        }
                    }
                }
            }
        };

        Facade.prototype.getLogger = function () {
            return this._logger;
        };

        Facade.prototype.getObject = function (name) {
            for (var i in this._objects) {
                var object = this._objects[i];
                if (object && object.name() === name)
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
            this.saveLog(this._name, message, level);
        };

        Facade.prototype.saveLog = function (name, message, level) {
            this._logger.saveLog(name, message, level);
        };
        Facade._facades = [];
        return Facade;
    })();
    fastmvc.Facade = Facade;
})(fastmvc || (fastmvc = {}));
//# sourceMappingURL=facade.js.map
