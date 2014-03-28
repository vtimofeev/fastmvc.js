///<reference path='notifier.ts'/>
///<reference path='facade.ts'/>
///<reference path='mediator.ts'/>
///<reference path='model.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var fastmvc;
(function (fastmvc) {
    var BTView = (function (_super) {
        __extends(BTView, _super);
        function BTView(name, base, template) {
            _super.call(this, name, fastmvc.TYPE_VIEW);
            this.base = base;
            if (template)
                this.template = template;
            else
                this.template = bt.template('id:template-' + name);
        }
        BTView.prototype.init = function (items) {
            this.createInstance();

            // check, create links
            if (items && this.bi) {
                for (var i in items) {
                    this[items[i]] = this.bi[items[i]];
                }
            }

            // set initial data
            if (this.data) {
                this.bindData(true);
                this.render();
            }
        };

        BTView.prototype.createInstance = function () {
            this.log('Create template ' + this.template + ', ' + this.base);
            if (this.template) {
                this.bi = this.template.createInstance(null, this.eventHandler);
                if (this.base)
                    this.base.appendChild(this.bi.element);
            }
        };

        BTView.prototype.setData = function (data) {
            this.data = data;
            this.render();
            this.log('Set data');
        };

        BTView.prototype.bindData = function (value) {
            var data = this.data;
            if (data && ('addListener' in data) && value) {
                data.addListener(this, this.dataHandler);
            }

            this.log('Bind data ' + value);
        };

        BTView.prototype.dataHandler = function (event, data) {
            this.render();
        };

        BTView.prototype.log = function (message, level) {
            this._mediator.facade().saveLog(this.name(), message, level);
        };

        BTView.prototype.mediator = function (value) {
            this._mediator = value;
        };

        BTView.prototype.sendEvent = function (name, data, sub, error, global) {
            if (typeof data === "undefined") { data = null; }
            if (typeof sub === "undefined") { sub = null; }
            if (typeof error === "undefined") { error = null; }
            if (typeof global === "undefined") { global = false; }
            if (this._mediator)
                this._mediator.internalHandler({ name: name, data: data, global: global, target: this });
        };

        BTView.prototype.getProcessedData = function () {
            return this.data;
        };

        // Overrided method
        // Render
        BTView.prototype.render = function () {
            var data = this.data;
            if (this.bi) {
                var objectData = data ? ('getData' in data) ? data.getData() : data : null;
                for (var i in objectData) {
                    this.log('Render set' + i + ', ' + objectData[i]);
                    this.bi.set(i, objectData[i]);
                }
            }
            this.log('Render ' + this.bi);
        };

        // Overrided method
        // Handler
        BTView.prototype.eventHandler = function (name, e) {
            this.log('event ' + name);
            this.sendEvent(name, e);
        };

        BTView.prototype.destroy = function () {
            if (this.bi)
                this.bi.destroy();
        };
        return BTView;
    })(fastmvc.Notifier);
    fastmvc.BTView = BTView;

    var View = (function (_super) {
        __extends(View, _super);
        function View(name, $base) {
            _super.call(this, name, fastmvc.TYPE_VIEW);
            this.eventHandlers = {};
            this.$base = $base;
        }
        View.prototype.setData = function (data) {
            for (var i in data)
                this.data = data;
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
    })(fastmvc.Notifier);
    fastmvc.View = View;
})(fastmvc || (fastmvc = {}));
//# sourceMappingURL=view.js.map
