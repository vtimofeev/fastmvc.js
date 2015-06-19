/**
 * Created by Vasily on 19.06.2015.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var EventDispatcher = (function (_super) {
        __extends(EventDispatcher, _super);
        function EventDispatcher() {
            _super.call(this, EventDispatcher.NAME, 'controller');
            this.elementHashMap = {};
            this.windowHashMap = {};
            _.bindAll(this, 'windowHandler');
        }
        EventDispatcher.prototype.listen = function (el, type, handler) {
            var id = el.getAttribute('id');
            if (!id || !type || !handler)
                return;
            var uid = id + ':' + type;
            if (!this.windowHashMap[type])
                this.createWindowListener(type);
            if (!this.elementHashMap[uid])
                this.elementHashMap[uid] = handler;
            return this;
        };
        EventDispatcher.prototype.unlisten = function (el, type) {
            var id = el.getAttribute('id');
            var uid = id + ':' + type;
            if (!id)
                return;
            delete this.elementHashMap[uid];
        };
        EventDispatcher.prototype.windowHandler = function (e) {
            var id = e.target.getAttribute('id');
            var uid = id + ':' + e.type;
            if (this.elementHashMap[uid])
                this.elementHashMap[uid](e);
        };
        EventDispatcher.prototype.createWindowListener = function (type) {
            //console.log('listen window type');
            this.windowHashMap[type] = true;
            window.addEventListener(type, this.windowHandler, true);
        };
        EventDispatcher.NAME = 'EventDispatcher';
        return EventDispatcher;
    })(fmvc.Notifier);
    fmvc.EventDispatcher = EventDispatcher;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=event.dispatcher.js.map