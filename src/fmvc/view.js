var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fmvc;
(function (fmvc) {
    var View = (function (_super) {
        __extends(View, _super);
        function View(name, $base) {
            _super.call(this, name, fmvc.TYPE_VIEW);
            this.eventHandlers = {};
            this.items = [];
            this.$base = $base;
        }
        View.prototype.setData = function (data) {
            this.data = data;
            this.render();
        };

        View.prototype.getData = function () {
            return this.data;
        };

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
                        this.$base.on(handledEvents, eventClosure);
                    } else {
                        this.$base.on(handledEvents, selector, eventClosure);
                    }
                } else {
                    if (selector === '') {
                        this.$base.off(handledEvents);
                    } else {
                        this.$base(selector).on(handledEvents, selector);
                    }
                }
            }
        };

        View.prototype.log = function (message, level) {
            if (this._mediator)
                this._mediator.facade().saveLog(this.name(), message, level);
        };

        View.prototype.sendEvent = function (name, data, sub, error, global) {
            if (typeof data === "undefined") { data = null; }
            if (typeof sub === "undefined") { sub = null; }
            if (typeof error === "undefined") { error = null; }
            if (typeof global === "undefined") { global = false; }
            if (this._mediator)
                this._mediator.internalHandler({ name: name, data: data, global: global, target: this });
        };

        View.prototype.mediator = function (value) {
            this._mediator = value;
        };

        View.prototype.getProcessedData = function () {
            return this.data;
        };

        // Overrided method
        // Render
        View.prototype.render = function () {
        };

        // Overrided method
        // Handler
        View.prototype.eventHandler = function (name, e) {
            this.log('event ' + name);
            this.sendEvent(name, e);
        };

        // Overrided method
        // Destroy
        View.prototype.destroy = function () {
            this.delegateEventHandlers(false);
        };
        View.delegateEventSplitter = /^(\S+)\s*(.*)$/;
        return View;
    })(fmvc.Notifier);
    fmvc.View = View;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=view.js.map
