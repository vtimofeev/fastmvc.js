var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    fmvc.InvalidateType = {
        Data: 1,
        App: 2,
        State: 4,
        Parent: 8,
        Children: 16,
        Template: 32,
        Theme: 64,
        I18n: 128,
        All: (1 | 2 | 4 | 8 | 16 | 32 | 64 | 128)
    };
    var View = (function (_super) {
        __extends(View, _super);
        function View(name) {
            _super.call(this, name, fmvc.TYPE_VIEW);
            this._states = {};
            this._invalidate = 0;
            this._isWaitingForValidate = false;
            this._inDocument = false;
            _.bindAll(this, 'validate');
        }
        // Properties: mediator, data, model
        View.prototype.getElement = function () {
            return this._element;
        };
        View.prototype.setElement = function (value) {
            if (this._element)
                throw Error('Cant set element of the fmvc.View instance ' + this.name);
            this._element = value;
        };
        View.prototype.setMediator = function (value) {
            this._mediator = value;
            return this;
        };
        Object.defineProperty(View.prototype, "mediator", {
            get: function () {
                return this._mediator;
            },
            set: function (value) {
                this.setMediator(value);
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.setState = function (name, value) {
            if (this._states[name] === value)
                return this;
            this._states[name] = value;
            this.invalidate(fmvc.InvalidateType.State);
            return this;
        };
        View.prototype.getState = function (name) {
            return this._states[name];
        };
        Object.defineProperty(View.prototype, "model", {
            get: function () {
                return this._model;
            },
            set: function (value) {
                this.setModel(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "data", {
            get: function () {
                return this._data;
            },
            set: function (value) {
                this.setData = value;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.setData = function (value) {
            this._data = value;
            return this;
        };
        View.prototype.setModel = function (value) {
            this._model = value;
            this.setData(value ? value.data : null);
            return this;
        };
        Object.defineProperty(View.prototype, "inDocument", {
            get: function () {
                return this._inDocument;
            },
            enumerable: true,
            configurable: true
        });
        // events
        View.prototype.getEventNameByDomEvent = function (e) {
            return '';
        };
        View.prototype.domHandler = function (e) {
            this.sendEvent(this.getEventNameByDomEvent(e), e);
        };
        // lifecycle
        View.prototype.createDom = function () {
            this.setElement(document.createElement('div'));
        };
        View.prototype.enter = function () {
            if (this._inDocument)
                throw new Error('Cant enter, it is in document');
            this._inDocument = true;
            this.invalidate(fmvc.InvalidateType.Data | fmvc.InvalidateType.Children);
        };
        View.prototype.exit = function () {
            this._inDocument = false;
        };
        Object.defineProperty(View.prototype, "isWaitingForValidate", {
            get: function () {
                return this._isWaitingForValidate;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.invalidate = function (value) {
            this._invalidate = this._invalidate | value;
            if (!this._isWaitingForValidate) {
                this._isWaitingForValidate = true;
                setTimeout(this.validate, 0);
            }
        };
        View.prototype.validate = function () {
            if (this._invalidate & fmvc.InvalidateType.Data)
                this.validateData();
            if (this._invalidate & fmvc.InvalidateType.State)
                this.validateState();
            if (this._invalidate & fmvc.InvalidateType.Parent)
                this.validateParent();
            if (this._invalidate & fmvc.InvalidateType.Children)
                this.validateChildren();
            /*
            if(this._invalidate & InvalidateType.App) this.validateApp();
            if(this._invalidate & InvalidateType.Template) this.validateTemplate();
            if(this._invalidate & InvalidateType.Theme) this.validateTheme();
            if(this._invalidate & InvalidateType.I18n) this.validateI18n();
            */
            this._invalidate = 0;
            this._isWaitingForValidate = false;
        };
        View.prototype.validateData = function () { };
        View.prototype.validateState = function () { };
        View.prototype.validateParent = function () { };
        View.prototype.validateChildren = function () { };
        /*
        public validateApp():void {}
        public validateTemplate():void {}
        public validateTheme():void {}
        public validateI18n():void {}
        */
        View.prototype.render = function (element) {
            if (this._inDocument)
                throw new Error('Cant render view, it is in document');
            this.createDom();
            this.enter();
            return this;
        };
        // Overrides of Notifier
        View.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        View.prototype.sendEvent = function (name, data, sub, error, global) {
            if (data === void 0) { data = null; }
            if (sub === void 0) { sub = null; }
            if (error === void 0) { error = null; }
            if (global === void 0) { global = false; }
            var e = { name: name, data: data, global: global, target: this };
            if (this.mediator)
                this.mediator.internalHandler(e);
        };
        View.prototype.log = function () {
            var messages = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                messages[_i - 0] = arguments[_i];
            }
            if (this.mediator && this.mediator.facade)
                this.mediator.facade.logger.add(this.name, messages);
            return this;
        };
        return View;
    })(fmvc.Notifier);
    fmvc.View = View;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=view.js.map