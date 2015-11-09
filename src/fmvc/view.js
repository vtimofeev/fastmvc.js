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
    var ViewBindedMethods = {
        Validate: 'validate'
    };
    fmvc.frameExecution = 0;
    var nextFrameHandlers = [];
    var maxFrameCount = 5000;
    var waiting = false;
    var frameStep = 1;
    function requestFrameHandler() {
        if (waiting)
            return;
        waiting = true;
        window.requestAnimationFrame ? window.requestAnimationFrame(executeNextFrameHandlers) : setTimeout(executeNextFrameHandlers, 0);
    }
    function nextFrameHandler(handler, context) {
        var params = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            params[_i - 2] = arguments[_i];
        }
        var result = function () { return handler.apply(context, params); };
        nextFrameHandlers.push(result);
        requestFrameHandler();
    }
    fmvc.nextFrameHandler = nextFrameHandler;
    function executeNextFrameHandlers(time) {
        if (++fmvc.frameExecution % frameStep === 0) {
            var executedHandlers = nextFrameHandlers.splice(0, maxFrameCount);
            _.each(executedHandlers, function (v, k) { return v(); });
        }
        waiting = false;
        if (nextFrameHandlers.length)
            requestFrameHandler();
    }
    var View = (function (_super) {
        __extends(View, _super);
        function View(name) {
            _super.call(this, name, fmvc.TYPE_VIEW);
            this._states = {};
            this._invalidate = 0;
            this._isWaitingForValidate = false;
            this._inDocument = false;
            this._isDomCreated = false;
            _.bindAll(this, ViewBindedMethods.Validate);
        }
        Object.defineProperty(View.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            set: function (value) {
                this._parent = value;
            },
            enumerable: true,
            configurable: true
        });
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
        View.prototype.setStates = function (value) {
            _.each(value, this.setStateReverse, this);
            return this;
        };
        View.prototype.setStateReverse = function (value, name) {
            this.setState(name, value);
            return this;
        };
        View.prototype.setState = function (name, value) {
            if (this.disposed)
                return;
            var stateValue = this.getStateValue(name, value);
            if (this._states[name] === stateValue)
                return this;
            this._states[name] = stateValue;
            this.applyStateBinds(name, stateValue);
            this.invalidate(fmvc.InvalidateType.State);
            return this;
        };
        View.prototype.applyStateBinds = function (name, value) {
        };
        View.prototype.getStateValue = function (name, value) {
            return value;
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
                this.setData(value);
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.setData = function (value) {
            if (this._disposed)
                return this;
            if (this._data === value)
                return this;
            this._data = value;
            this.invalidate(fmvc.InvalidateType.Data);
            return this;
        };
        View.prototype.setModel = function (value) {
            if (this._disposed)
                return this;
            if (value != this._model) {
                if (this._model)
                    this._model.unbind(this);
                if (value && value instanceof fmvc.Model)
                    value.bind(this, this.modelChangeHandler);
                this.setData(value ? value.data : null);
                this._model = value;
            }
            return this;
        };
        Object.defineProperty(View.prototype, "app", {
            get: function () {
                return (this._mediator && this._mediator.facade) ? this._mediator.facade.model : (this.parent ? this.parent.app : null);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "inDocument", {
            get: function () {
                return this._inDocument;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "isDomCreated", {
            get: function () {
                return this._isDomCreated;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.createDom = function () {
            if (this._isDomCreated)
                return;
            this.beforeCreate();
            this.createDomImpl();
            this._isDomCreated = true;
            this.afterCreate();
        };
        View.prototype.createDomImpl = function () {
            this.setElement(document.createElement('div'));
        };
        View.prototype.enter = function () {
            if (this._inDocument) {
                throw new Error('Cant enter, it is in document');
            }
            this.enterImpl();
            this._inDocument = true;
            this.afterEnter();
        };
        View.prototype.enterImpl = function () {
            var _this = this;
            if (this._model)
                this._model.bind(this, this.modelChangeHandler);
            if (this._binds)
                this._binds.forEach(function (v) { return v.bind(_this, _this.invalidateApp); });
        };
        View.prototype.exit = function () {
            this.beforeExit();
            this.exitImpl();
            this._inDocument = false;
            this.afterExit();
        };
        View.prototype.modelChangeHandler = function (e) {
            this.setData(this.model.data);
            this.invalidateData(); //@todo check
            if (e && e.name === fmvc.Event.Model.Disposed)
                this.dispose(); //@todo analyze
        };
        View.prototype.exitImpl = function () {
            var _this = this;
            if (this._model)
                this._model.unbind(this);
            if (this._binds)
                this._binds.forEach(function (v) { return v.unbind(_this); });
        };
        View.prototype.beforeCreate = function () {
        };
        View.prototype.afterCreate = function () {
        };
        View.prototype.beforeEnter = function () {
        };
        View.prototype.afterEnter = function () {
        };
        View.prototype.beforeExit = function () {
        };
        View.prototype.afterExit = function () {
        };
        View.prototype.afterRender = function () {
        };
        View.prototype.beforeUnrender = function () {
        };
        View.prototype.invalidate = function (value) {
            this._invalidate = this._invalidate | value;
            if (!this._isWaitingForValidate) {
                this._isWaitingForValidate = true;
                nextFrameHandler(this.validate, this);
            }
        };
        Object.defineProperty(View.prototype, "isWaitingForValidate", {
            get: function () {
                return this._isWaitingForValidate;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.invalidateData = function () {
            this.invalidate(fmvc.InvalidateType.Data);
        };
        View.prototype.invalidateApp = function () {
            this.invalidate(fmvc.InvalidateType.App);
        };
        View.prototype.invalidateAll = function () {
            this.invalidate(fmvc.InvalidateType.App | fmvc.InvalidateType.Data | fmvc.InvalidateType.State);
        };
        View.prototype.validate = function () {
            if (!this._inDocument || !this._invalidate)
                return;
            if (this._invalidate & fmvc.InvalidateType.State)
                this.validateState();
            if (this._invalidate & fmvc.InvalidateType.Data)
                this.validateData();
            if (this._invalidate & fmvc.InvalidateType.App)
                this.validateApp();
            //if (this._invalidate & InvalidateType.Parent) this.validateParent();
            //if (this._invalidate & InvalidateType.Children) this.validateChildren();
            /*
             if(this._invalidate & InvalidateType.Template) this.validateTemplate();
             if(this._invalidate & InvalidateType.Theme) this.validateTheme();
             if(this._invalidate & InvalidateType.I18n) this.validateI18n();
             */
            this._invalidate = 0;
            this._isWaitingForValidate = false;
        };
        View.prototype.validateData = function () {
        };
        View.prototype.validateState = function () {
        };
        View.prototype.validateApp = function () {
        };
        View.prototype.render = function (parent, replaced) {
            var requiredValidate = this.isDomCreated;
            this.createDom();
            this.enter();
            if (requiredValidate)
                this.invalidateAll();
            if (replaced) {
                parent.replaceChild(this.getElement(), replaced);
            }
            else {
                parent.appendChild(this.getElement());
            }
            this.afterRender();
            return this;
        };
        View.prototype.unrender = function (replace) {
            this.exit();
            this.beforeUnrender();
            var parentElement = this.getElement().parentNode;
            if (!parentElement)
                return this;
            if (replace) {
                parentElement.replaceChild(replace, this.getElement());
            }
            else {
                parentElement.removeChild(this.getElement());
            }
            return this;
        };
        View.prototype.dispose = function () {
            this.exit();
            this.unrender();
            _super.prototype.dispose.call(this);
            // Clean refs
            this._states = null;
            this._parent = null;
            this._mediator = null;
            this._model = null;
            this._data = null;
            this._binds = null;
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
        View.prototype.unregisterBind = function (value) {
            var i = this._binds.indexOf(value);
            if (i > -1)
                this._binds.splice(i, 1);
            value.unbind(this);
        };
        View.prototype.registerBind = function (value) {
            if (!this._binds)
                this._binds = [];
            if (this._binds.indexOf(value) > -1)
                return;
            this._binds.push(value);
            if (this.inDocument)
                value.bind(this, this.invalidateApp);
        };
        return View;
    })(fmvc.Notifier);
    fmvc.View = View;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=view.js.map