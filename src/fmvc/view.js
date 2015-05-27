var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var View = (function (_super) {
        __extends(View, _super);
        function View(name, $root) {
            _super.call(this, name, fmvc.TYPE_VIEW);
            this.eventHandlers = {};
            this.$root = $root;
        }
        // Overrided method
        // Init
        View.prototype.init = function (items) {
            this.delegateEventHandlers(true);
        };
        View.prototype.delegateEventHandlers = function (init) {
            var _t = this;
            this.log('Events: ' + (JSON.stringify(this.eventHandlers)));
            for (var commonHandlerData in this.eventHandlers) {
                var eventName = this.eventHandlers[commonHandlerData];
                var match = commonHandlerData.match(View.delegateEventSplitter);
                var handledEvents = match[1];
                var selector = match[2];
                // add handlers
                if (init) {
                    this.log('Add listeners [' + handledEvents + '] of the [' + selector + ']');
                    var eventClosure = function (name) {
                        return function (e) {
                            _t.eventHandler(name, e);
                        };
                    }(eventName);
                    if (selector === '') {
                        this.$root.on(handledEvents, eventClosure);
                    }
                    else {
                        this.$root.on(handledEvents, selector, eventClosure);
                    }
                }
                else {
                    if (selector === '') {
                        this.$root.off(handledEvents);
                    }
                    else {
                        this.$root(selector).on(handledEvents, selector);
                    }
                }
            }
        };
        View.prototype.log = function (message, level) {
            if (this._mediator)
                this._mediator.facade.sendLog(this.name, message, level);
        };
        View.prototype.sendEvent = function (name, data, sub, error, global) {
            if (data === void 0) { data = null; }
            if (sub === void 0) { sub = null; }
            if (error === void 0) { error = null; }
            if (global === void 0) { global = false; }
            if (this._mediator)
                this._mediator.internalHandler({ name: name, data: data, global: global, target: this });
        };
        Object.defineProperty(View.prototype, "mediator", {
            get: function () {
                return this._mediator;
            },
            set: function (value) {
                this._mediator = value;
            },
            enumerable: true,
            configurable: true
        });
        // Overrided method
        // Render
        View.prototype.render = function () {
        };
        // Overrided method
        // Handler
        View.prototype.viewEventsHandler = function (name, e) {
            this.log('event ' + name);
            this.sendEvent(name, e);
        };
        View.prototype.eventHandler = function (name, e) {
            this.viewEventsHandler(name, e);
        };
        View.prototype.add = function (value) {
        };
        View.prototype.remove = function (value) {
        };
        View.prototype.removeAt = function (value) {
        };
        Object.defineProperty(View.prototype, "model", {
            get: function () {
                return this._model;
            },
            /////////////////////////////////////////////////////////////////////////////
            // Model related methods
            /////////////////////////////////////////////////////////////////////////////
            set: function (data) {
                this._model = data;
                this.render();
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.setModel = function (value, events) {
            if (events === void 0) { events = false; }
            this.model = value;
            if (events)
                this.model.addListener(this, this.modelHandler);
        };
        View.prototype.modelHandler = function (name, e) {
        };
        // Overrided method
        // Destroy
        View.prototype.destroy = function () {
            if (this.model)
                this.model.removeListener(this);
            this.delegateEventHandlers(false);
        };
        View.delegateEventSplitter = /^(\S+)\s*(.*)$/;
        return View;
    })(fmvc.Notifier);
    fmvc.View = View;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=view.js.map