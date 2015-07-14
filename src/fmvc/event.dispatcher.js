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
    fmvc.BrowserEvent = {
        CLICK: 'click',
        KEYUP: 'keyup',
        KEYDOWN: 'keydown',
        MOUSEOVER: 'mouseover',
        MOUSEOUT: 'mouseout',
        CHANGE: 'change'
    };
    fmvc.SpecialEvent = {
        ACTION: 'action',
        SWIPE: 'swipe',
        PAN: 'pan',
        PINCH: 'pinch',
        TAP: 'tap',
        DRAG: 'drag' // start,end,move
    };
    fmvc.browserElementEvents = [fmvc.BrowserEvent.MOUSEOUT, fmvc.BrowserEvent.MOUSEOVER, fmvc.BrowserEvent.CLICK];
    fmvc.browserWindowEvents = [fmvc.BrowserEvent.KEYDOWN, fmvc.BrowserEvent.KEYUP];
    fmvc.specialEvents = [fmvc.SpecialEvent.ACTION];
    var EventDispatcher = (function (_super) {
        __extends(EventDispatcher, _super);
        function EventDispatcher() {
            _super.call(this, EventDispatcher.NAME, 'controller');
            //private elementIdMap = {};
            this.executionMap = {};
            this.windowHandlerMap = {};
            _.bindAll(this, 'browserHandler');
        }
        EventDispatcher.prototype.listen = function (el, type, handler, context) {
            var id = el.getAttribute('id');
            if (!id || !type || !handler) {
                console.warn('Incorrect listener on ', el, id, type);
                return;
            }
            this.executionMap[id] = this.executionMap[id] || {};
            var listenerData = { handler: handler, context: context };
            if (!this.executionMap[id][type]) {
                this.executionMap[id][type] = [listenerData];
            }
            else {
                this.executionMap[id][type].push(listenerData);
            }
            console.log('Create listener ', id, type, this.executionMap[id]);
            this.__createListener(el, id, type, handler, context);
            return this;
        };
        EventDispatcher.prototype.__createListener = function (el, id, type, handler, context) {
            if (_.contains(fmvc.browserWindowEvents, type))
                this.__createWindowListener(el, type);
            else if (_.contains(fmvc.browserElementEvents, type))
                this.__createElementListener(el, type);
            else if (_.contains(fmvc.specialEvents, type))
                this.__createSpecialListener(el, type);
            else
                console.warn('create listener for %s not found', type);
        };
        EventDispatcher.prototype.__removeListener = function (el, id, type) {
            var id = id || el.getAttribute('id');
            if (_.contains(fmvc.browserElementEvents, type)) {
                el.removeEventListener(type, this.browserHandler);
            }
        };
        EventDispatcher.prototype.__createElementListener = function (el, type) {
            //console.log('Element listener of %s , %s' , el, type);
            el.addEventListener(type, this.browserHandler);
        };
        EventDispatcher.prototype.__createWindowListener = function (el, type) {
            //console.log('Browser listener of %s , %s' , el, type);
            if (!this.windowHandlerMap[type])
                this.createWindowListener(type);
        };
        EventDispatcher.prototype.__createSpecialListener = function (el, type) {
            console.warn('create special listener for %s not implemented', type);
        };
        EventDispatcher.prototype.unlistenAll = function (el) {
            var id = el.getAttribute('id');
            if (!id)
                return;
            _.each(this.executionMap[id], function (handlerObjectsArray, type) {
                el.removeEventListener(type, this.browserHandler);
                _.each(handlerObjectsArray, function (handlerObject) {
                    delete handlerObject.handler;
                    delete handlerObject.context;
                });
            }, this);
            delete this.executionMap[id];
            //delete this.elementIdMap[id];
        };
        EventDispatcher.prototype.unlisten = function (el, type) {
            var id = el.getAttribute('id');
            if (!id || !this.executionMap[id]) {
                console.warn('Cant unlisten ', el, id, type);
                return;
            }
            var handlerObjectsArray = this.executionMap[id][type];
            el.removeEventListener(type, this.browserHandler);
            _.each(handlerObjectsArray, function (handlerObject) {
                delete handlerObject.handler;
                delete handlerObject.context;
            });
            delete this.executionMap[id][type];
        };
        EventDispatcher.prototype.browserHandler = function (e) {
            var el = e.currentTarget || e.target;
            var id = el.getAttribute('id');
            var type = e.type;
            if (!id)
                return;
            console.log(id, type, this.executionMap[id]);
            if (this.executionMap[id] && this.executionMap[id][type]) {
                var handlerObjectsArray = this.executionMap[id][type];
                _.each(handlerObjectsArray, function (handlerObject) {
                    handlerObject.handler.call(handlerObject.context, e);
                });
            }
        };
        EventDispatcher.prototype.createWindowListener = function (type) {
            this.windowHandlerMap[type] = true;
            window.addEventListener(type, this.browserHandler, true);
        };
        EventDispatcher.NAME = 'EventDispatcher';
        return EventDispatcher;
    })(fmvc.Notifier);
    fmvc.EventDispatcher = EventDispatcher;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=event.dispatcher.js.map