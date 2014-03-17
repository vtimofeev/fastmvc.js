var fastmvc;
(function (fastmvc) {
    var Facade = (function () {
        function Facade() {
            this._objects = [];
        }
        Facade.prototype.register = function (object) {
            if (this._objects.indexOf(object) < 0) {
                this._objects.push(object);
            }
        };

        Facade.prototype.eventHandler = function (e) {
        };
        return Facade;
    })();
    fastmvc.Facade = Facade;
})(fastmvc || (fastmvc = {}));
//@ sourceMappingURL=facade.js.map
