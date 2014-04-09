///<reference path='notifier.ts'/>
///<reference path='facade.ts'/>
///<reference path='mediator.ts'/>
///<reference path='model.ts'/>
///<reference path='view.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var fmvc;
(function (fmvc) {
    var BasisView = (function (_super) {
        __extends(BasisView, _super);
        function BasisView(name, base, template) {
            _super.call(this, name, fmvc.TYPE_VIEW);
            this.base = base;
            _.bindAll(this, 'viewEventsHandler');
            if (template)
                this.template = template;
            else
                this.template = bt.template('id:template-' + name);
        }
        BasisView.prototype.init = function (items) {
            this.createInstance();

            // check, create links
            if (this.items && this.bi) {
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

        BasisView.prototype.createInstance = function () {
            this.log('Create template ' + this.template + ', ' + this.base);
            if (this.template) {
                this.test();
                this.bi = this.template.createTemplateInstance(null, this.eventHandler);
                if (this.base)
                    this.base.appendChild(this.bi.element);
            }
        };

        BasisView.prototype.setData = function (data) {
            this.data = data;
            this.render();
            this.log('Set data');
        };

        BasisView.prototype.bindData = function (value) {
            var data = this.data;
            if (data && ('addListener' in data) && value) {
                data.addListener(this, this.dataHandler);
            }

            this.log('Bind data ' + value);
        };

        BasisView.prototype.dataHandler = function (event, data) {
            this.render();
        };

        BasisView.prototype.log = function (message, level) {
            this._mediator.facade().saveLog(this.name(), message, level);
        };

        BasisView.prototype.mediator = function (value) {
            this._mediator = value;
        };

        BasisView.prototype.sendEvent = function (name, data, sub, error, global) {
            if (typeof data === "undefined") { data = null; }
            if (typeof sub === "undefined") { sub = null; }
            if (typeof error === "undefined") { error = null; }
            if (typeof global === "undefined") { global = false; }
            if (this._mediator)
                this._mediator.internalHandler({ name: name, data: data, global: global, target: this });
        };

        BasisView.prototype.getProcessedData = function () {
            return this.data;
        };

        // Overrided method
        // Render
        BasisView.prototype.render = function () {
            var data = this.data;
            if (!this.renderedData)
                this.renderedData = {};

            if (this.bi) {
                var objectData = data ? ('getData' in data) ? data.getData() : data : null;
                for (var i in objectData) {
                    var objectValue = objectData[i];
                    if (this.renderedData[i] != objectValue) {
                        this.bi.set(i, objectValue);
                        this.renderedData[i] = objectValue;
                    }
                }
            }
            this.log('Render ' + this.bi);
        };

        BasisView.prototype.test = function () {
            console.log('in super');
        };

        // Overrided method
        // Handler
        BasisView.prototype.eventHandler = function (name, e) {
            this.log('event ' + name);
            this.sendEvent(name, e);
        };

        BasisView.prototype.destroy = function () {
            if (this.base)
                this.base.removeChild(this.bi.element);
            if (this.data)
                this.bindData(false);
            if (this.bi)
                this.bi.destroy();
        };
        return BasisView;
    })(fmvc.Notifier);
    fmvc.BasisView = BasisView;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=basisView.js.map
