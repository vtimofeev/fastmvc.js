///<reference path='./../d.ts'/>
var ft;
(function (ft) {
    ft.BrowserEvent = {
        Change: 'change',
        Scroll: 'scroll',
        Focus: 'focus',
        Blur: 'blur'
    };
    ft.KeyboardEvent = {
        KeyUp: 'keyup',
        KeyDown: 'keydown',
    };
    ft.PointerEvent = {
        Click: 'click',
        MouseOver: 'mouseover',
        MouseOut: 'mouseout',
        MouseDown: 'mousedown',
        MouseUp: 'mouseup',
        MouseMove: 'mousemove'
    };
    ft.TouchEvent = {
        TouchStart: 'touchstart',
        TouchEnd: 'touchend',
        TouchMove: 'touchmove',
        TouchCancel: 'touchcancel'
    };
    ft.ResutEvent = {
        Act: 'act',
        DoubleAct: 'doubleact',
        LongAct: 'longact',
        PointerOver: 'pointerover',
        PointerMove: 'pointermove',
        PointerOut: 'pointerout',
        PointerDown: 'pointerdown',
        PointerUp: 'pointerup',
        Swipe: 'swipe',
        Pan: 'pan',
        Pinch: 'pinch',
    };
    ft.browserElementEvents = [ft.BrowserEvent.MOUSEOUT, ft.BrowserEvent.MOUSEOVER, ft.BrowserEvent.CLICK];
    ft.browserWindowEvents = [ft.BrowserEvent.KEYDOWN, ft.BrowserEvent.KEYUP, ft.BrowserEvent.MOUSEMOVE, ft.BrowserEvent.SCROLL];
    ft.specialEvents = [SpecialEvent.ACTION];
    var EventDispatcher = (function () {
        function EventDispatcher(viewHelper) {
            this.eventMap = {};
            this.viewHelper = viewHelper;
            _.bindAll(this, 'browserHandler');
            _.each(_.values(ft.BrowserEvent, ft.PointerEvent), this.on, this);
        }
        EventDispatcher.prototype.browserHandler = function (e) {
            //this.global.emit(e.type, e);
            var el = e.target || e.currentTarget;
            var pathId = el.getAttribute(ft.AttributePathId);
            var pathDefinition = this.viewHelper.getPathDefinitionByPathId(pathId);
            //console.log('Trigger ', e.type, pathId, pathDefinition);
            if (pathDefinition) {
                var event = this.getTreeEventByBrowserEvent(e.type, pathDefinition.data, pathDefinition.root, e);
                this.viewHelper.dispatchTreeEventDown(event);
            }
        };
        EventDispatcher.prototype.getTreeEventByBrowserEvent = function (name, def, view, e) {
            return { name: name, target: view, def: def, e: e, cancelled: false, prevented: false, depth: 1e2, executionHandlersCount: 0 };
        };
        EventDispatcher.prototype.getCustomTreeEvent = function (name, data, view, depth) {
            if (depth === void 0) { depth = 1; }
            return { name: name, target: view, def: view.domDef, previousTarget: null, currentTarget: view, data: data, cancelled: false, prevented: false, depth: depth, executionHandlersCount: 0 };
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