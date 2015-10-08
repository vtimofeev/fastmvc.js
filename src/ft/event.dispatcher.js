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
        function EventDispatcher(viewHelper) {
            this.eventMap = {};
            this.viewHelper = viewHelper;
            _.bindAll(this, 'browserHandler');
            _.each(_.values(ft.BrowserEvent), this.on, this);
        }
        EventDispatcher.prototype.browserHandler = function (e) {
            var el = e.target || e.currentTarget;
            var pathId = el.getAttribute(ft.AttributePathId);
            var pathDefinition = this.viewHelper.getPathDefinitionByPathId(pathId);
            //console.log('Trigger ', e.type, pathId, pathDefinition);
            if (pathDefinition) {
                var event = this.getTreeEventByEvent(e.type, pathDefinition.data, pathDefinition.root, e);
                this.viewHelper.dispatchTreeEventDown(event);
            }
            /*
            if(view) view.handleTreeEvent(this.getTreeEventByBrowserEvent(e, view));
            else if(pathId) console.warn('View not found for id: ' , pathId);
            */
        };
        /**
         * @param name
         * @param def
         * @param view
         * @param e
         * @returns {{name: string, target: ITemplateView, def: IDomDef, previousTarget: null, currentTarget: ITemplateView, e: any, cancelled: boolean, prevented: boolean, depth: number}}
         */
        EventDispatcher.prototype.getTreeEventByEvent = function (name, def, view, e) {
            return { name: name, target: view, def: def, e: e, cancelled: false, prevented: false, depth: 1e2 };
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