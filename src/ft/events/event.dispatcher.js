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
    /*
    export interface IEventEmitter3 {
        on(event, handler, context):void;
        once(event, handler, context):void;
        off(event, handler, context):void;
        emit(event, ...args:any[]):any;
    }
    */
    var EventDispatcher = (function () {
        function EventDispatcher(viewHelper) {
            this.eventMap = {};
            this.viewHelper = viewHelper;
            this.pointer = new ft.PointerModel(null, null);
            _.bindAll(this, 'browserHandler');
            var listenEvents = [].concat(_.values(ft.BrowserEvent), _.values(ft.PointerEvent), _.values(ft.KeyboardEvent), _.values(ft.TouchEvent));
            _.each(listenEvents, this.on, this);
        }
        EventDispatcher.prototype.browserHandler = function (e) {
            var target = e.target || e.currentTarget;
            var pathId = target.getAttribute ? target.getAttribute(ft.AttributePathId) : null;
            var pathDefinition = this.viewHelper.getPathDefinitionByPathId(pathId);
            var pointerEvent = this.pointer.tryTransformToCompositeEvent(e);
            if (pointerEvent.isComposite) {
                //console.log('New pointer event: ', pointerEvent.name);
                this.pointer.setData(pointerEvent);
            }
            if (pathDefinition) {
                var sequenceEvent = this.pointer.addSequenceEvent(pointerEvent, target);
                var event = this.getTreeEventByBrowserEvent(pointerEvent.name || e.type, pathDefinition.data, pathDefinition.root, e, pointerEvent);
                //console.log('dispatch composite event', pathDefinition.data.path, pointerEvent);
                this.viewHelper.dispatchTreeEventDown(event);
                if (sequenceEvent) {
                    var sequenceTreeEvent = this.getTreeEventByBrowserEvent(sequenceEvent.name, pathDefinition.data, pathDefinition.root, e, sequenceEvent);
                    //console.log('dispatch sequence event',  pathDefinition.data.path, sequenceEvent);
                    this.viewHelper.dispatchTreeEventDown(sequenceTreeEvent);
                }
            }
        };
        EventDispatcher.prototype.getTreeEventByBrowserEvent = function (name, def, view, e, pe) {
            return { name: name, target: view, def: def, e: e, pe: pe, cancelled: false, prevented: false, depth: 1e2, executionHandlersCount: 0 };
        };
        EventDispatcher.prototype.getCustomTreeEvent = function (name, data, view, depth) {
            if (depth === void 0) { depth = 1; }
            return { name: name, target: view, def: view.domDef, previousTarget: null, currentTarget: view, data: data, cancelled: false, prevented: false, depth: depth, executionHandlersCount: 0 };
        };
        EventDispatcher.prototype.getPointer = function () {
            return this.pointer;
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
        EventDispatcher.prototype.disposeEvent = function (e) {
            return;
            e.target = e.previousTarget = e.currentTarget = e.e = null;
        };
        return EventDispatcher;
    })();
    ft.EventDispatcher = EventDispatcher;
})(ft || (ft = {}));
//# sourceMappingURL=event.dispatcher.js.map