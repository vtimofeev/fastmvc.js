///<reference path='./d.ts'/>
var ft;
(function (ft) {
    ft.BrowserEvent = {
        CLICK: 'click',
        KEYUP: 'keyup',
        KEYDOWN: 'keydown',
        MOUSEOVER: 'mouseover',
        MOUSEOUT: 'mouseout',
        MOUSEDOWN: 'mousedown',
        MOUSEUP: 'mouseup',
        CHANGE: 'change'
    };
    ft.SpecialEvent = {
        ACTION: 'action',
        SWIPE: 'swipe',
        PAN: 'pan',
        PINCH: 'pinch',
        TAP: 'tap',
        DRAG: 'drag' // start,end,move
    };
    ft.browserElementEvents = [ft.BrowserEvent.MOUSEOUT, ft.BrowserEvent.MOUSEOVER, ft.BrowserEvent.CLICK];
    ft.browserWindowEvents = [ft.BrowserEvent.KEYDOWN, ft.BrowserEvent.KEYUP];
    ft.specialEvents = [ft.SpecialEvent.ACTION];
    var EventDispatcher = (function () {
        function EventDispatcher(idMap) {
            this.eventMap = {};
            this.idMap = idMap;
            _.bindAll(this, 'browserHandler');
            _.each(_.values(ft.BrowserEvent), this.on, this);
        }
        EventDispatcher.prototype.browserHandler = function (e) {
            //console.log('Browser ', e.type,  e.target);
            var el = e.target || e.currentTarget;
            var id = el.getAttribute('id');
            var view = this.idMap[id];
            if (view)
                view.handleTreeEvent(this.getTreeEventByBrowserEvent(e, view));
            else if (id)
                console.warn('View not found for id: ', id);
        };
        EventDispatcher.prototype.getTreeEventByBrowserEvent = function (e, view) {
            return { name: e.type, target: view, previousTarget: null, currentTarget: view, e: e, cancelled: false, prevented: false, depth: 1e2 };
        };
        EventDispatcher.prototype.getCustomTreeEvent = function (name, data, view, depth) {
            if (depth === void 0) { depth = 1; }
            return { name: e.type, target: view, previousTarget: null, currentTarget: view, data: data, cancelled: false, prevented: false, depth: depth };
        };
        EventDispatcher.prototype.disposeEvent = function (e) {
            return;
            e.target = e.previousTarget = e.currentTarget = e.e = null;
        };
        EventDispatcher.prototype.on = function (type) {
            if (this.eventMap[type])
                return;
            window.addEventListener(type, this.browserHandler, true);
            this.eventMap[type] = true;
        };
        EventDispatcher.prototype.off = function (type) {
            this.eventMap[type] = false;
            window.removeEventListener(type, this.browserHandler);
        };
        return EventDispatcher;
    })();
    ft.EventDispatcher = EventDispatcher;
})(ft || (ft = {}));
//# sourceMappingURL=event.dispatcher.js.map