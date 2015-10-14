///<reference path="./d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ft;
(function (ft) {
    ft.templateHelper = new ft.TemplateViewHelper();
    var localeFormatterCache = {};
    var templateFormatterChache = {};
    var expression = new ft.Expression();
    var dispatcher = new ft.EventDispatcher(ft.templateHelper);
    var timers = { createDom: 0, enter: 0, setData: 0, validate: 0 };
    var counters = { createDom: 0, enter: 0, setData: 0, validate: 0, validateState: 0, validateData: 0, validateApp: 0 };
    setInterval(function () { return console.log('Statistic timers', JSON.stringify(timers), ' counters ', JSON.stringify(counters), ' frames ', fmvc.frameExecution); }, 5000);
    //console.log(dispatcher);
    function getFormatter(value, locale) {
        if (locale === void 0) { locale = 'en'; }
        return templateFormatterChache[value] || compileFormatter(value, locale);
    }
    function compileFormatter(value, locale) {
        var mf = localeFormatterCache[locale] || (localeFormatterCache[locale] = new MessageFormat(this.locale));
        return (templateFormatterChache[value] = mf.compile(value));
    }
    function getTime() {
        return (new Date()).getTime();
    }
    var TemplateView = (function (_super) {
        __extends(TemplateView, _super);
        function TemplateView(name, params, template) {
            _super.call(this, name);
            // Maps of current class values, by path and css name
            this._cssClassMap = {}; // map of component classes
            // Properties map
            this._prevDynamicProperiesMap = {};
            this._dynamicPropertiesMap = {};
            this._template = template;
            this.setParameters(params);
        }
        Object.defineProperty(TemplateView.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            set: function (value) {
                this._parent = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "domDef", {
            get: function () {
                return this._domDef;
            },
            set: function (value) {
                this._domDef = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "localDomDef", {
            get: function () {
                return this.getTemplate().domTree;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "i18n", {
            get: function () {
                return this._i18n;
            },
            set: function (value) {
                this._i18n = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "selected", {
            get: function () {
                return this.getState('selected');
            },
            set: function (value) {
                this.setState('selected', value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "disabled", {
            get: function () {
                return this.getState('disabled');
            },
            set: function (value) {
                this.setState('disabled', value);
            },
            enumerable: true,
            configurable: true
        });
        TemplateView.prototype.cleanParameters = function () {
            this._params = null;
        };
        TemplateView.prototype.setParameters = function (value) {
            this._params = _.defaults(this._params || {}, value);
        };
        TemplateView.prototype.applyParameters = function () {
            _.each(this._params, this.applyParameter, this);
        };
        TemplateView.prototype.applyParameter = function (value, key) {
            var ctx = this.parent || this;
            switch (key) {
                case ft.TemplateParams.setData:
                    this.data = this.getParameterValue(value, ctx);
                    break;
                case ft.TemplateParams.setModel:
                    this.model = this.getParameterValue(value, ctx);
                    break;
                case ft.TemplateParams.setStateSelected:
                    this.setState('selected', !!this.getParameterValue(value, ctx, this));
                    break;
                case ft.TemplateParams.setStateDisabled:
                    this.setState('disabled', !!this.getParameterValue(value, ctx, this));
                    break;
                case ft.TemplateParams.stateHandlers:
                    this.stateHandlers(value.split(','));
                    break;
                case ft.TemplateParams.states:
                    break;
                default:
                    // direct set parameters for root
                    if (key in this) {
                        if (_.isFunction(this[key]))
                            this[key](value);
                        else
                            this[key] = value;
                    }
                    else {
                    }
                    break;
            }
        };
        TemplateView.prototype.getParameterValue = function (value, ctx, child) {
            if (child)
                ctx.ctx = child;
            return _.isObject(value) ? ctx.getExpressionValue(value) : value;
        };
        TemplateView.prototype.setTreeElementPath = function (path, value) {
            if (!this._treeElementMapByPath)
                this._treeElementMapByPath = {};
            this._treeElementMapByPath[path] = value;
        };
        TemplateView.prototype.isChangedDynamicProperty = function (name) {
            var value = expression.getContextValue(name, this);
            var r = !(this._prevDynamicProperiesMap[name] === value);
            return r;
        };
        TemplateView.prototype.setDynamicProperty = function (name, value) {
            this._dynamicPropertiesMap[name] = value;
        };
        TemplateView.prototype.createDom = function () {
            if (this._element)
                return;
            var start = getTime();
            var parentParams = this.domDef ? this.domDef.params : null;
            var localParams = this.localDomDef ? this.localDomDef.params : null;
            this.setParameters(_.extend({}, localParams, parentParams));
            var e = ft.templateHelper.createTreeObject(this._template.domTree, this);
            var element = e instanceof TemplateView ? e.getElement() : e;
            this.setElement(element);
            this.setTreeElementPath('0', this);
            counters.createDom++;
            timers.createDom += getTime() - start;
        };
        TemplateView.prototype.enter = function () {
            if (this.inDocument) {
                return console.warn('Error, try to re-enter ', this.name);
            }
            var start = getTime();
            _super.prototype.enter.call(this);
            this.applyParameters();
            //templateHelper.setDataTreeObject(this._template.domTree, this);
            //console.log('Setup data ', this.getElement());
            //counters.setData++;
            ft.templateHelper.enterTreeObject(this._template.domTree, this);
            this.invalidate(fmvc.InvalidateType.Data);
            this.invalidate(fmvc.InvalidateType.State);
            timers.enter += getTime() - start;
            counters.enter++;
        };
        TemplateView.prototype.stateHandlers = function (value) {
            var _this = this;
            var stateHandlers = {
                hover: {
                    mouseover: this.mouseoverHandler,
                    mouseout: this.mouseoutHandler
                },
                selected: {
                    click: this.clickHandler
                }
            };
            _.each(value, function (state) { return _.each(stateHandlers[state], function (handler, event) { return _this.on(event, handler); }, _this); }, this);
        };
        TemplateView.prototype.mouseoverHandler = function (e) {
            if (!!this.getState('disabled'))
                return;
            this.setState('hover', true);
        };
        TemplateView.prototype.mouseoutHandler = function (e) {
            if (!!this.getState('disabled'))
                return;
            this.setState('hover', false);
        };
        TemplateView.prototype.clickHandler = function (e) {
            if (!!this.getState('disabled'))
                return;
            this.setState('selected', !this.getState('selected'));
        };
        TemplateView.prototype.exit = function () {
            if (!this.inDocument) {
                return console.warn('Error, try re-exit');
            }
            ft.templateHelper.exitTreeObject(this._template.domTree, this);
            this.parent = null;
            this.domDef = null;
            _super.prototype.exit.call(this);
            this._cssClassMap = null;
            this._dynamicPropertiesMap = null;
            this._prevDynamicProperiesMap = null;
            this._dynamicPropertiesMap = null;
            this._localHandlers = null;
            this._params = null;
            this._treeElementMapByPath = null;
            this._template = null;
            this._i18n = null;
        };
        TemplateView.prototype.getTemplate = function () {
            return this._template;
        };
        TemplateView.prototype.getDomDefinitionByPath = function (path) {
            return this._template.pathMap[path];
        };
        TemplateView.prototype.getTreeElementByPath = function (value) {
            return this._treeElementMapByPath ? this._treeElementMapByPath[value] : null;
        };
        TemplateView.prototype.getExpressionValue = function (ex) {
            var exObj = this.getTemplate().expressionMap[ex.name];
            var result = expression.execute(exObj, this.getTemplate().expressionMap, this);
            return result;
        };
        TemplateView.prototype.getCssClassExpressionValue = function (ex) {
            var exObj = this.getTemplate().expressionMap[ex.name];
            var result = expression.execute(exObj, this.getTemplate().expressionMap, this, true);
            return result;
        };
        TemplateView.prototype.getPathClassValue = function (path, name) {
            return this._cssClassMap[path + '-' + name] || null;
        };
        TemplateView.prototype.setPathClassValue = function (path, name, value) {
            this._cssClassMap[path + '-' + name] = value;
        };
        TemplateView.prototype.setTreeElementLink = function (name, value) {
            if (!this[name]) {
                this[name] = value;
                if (!value) {
                    delete this[name];
                }
            }
            else {
                throw Error('Can not set name:' + name + ' property, cause it exists ' + this[name]);
            }
        };
        TemplateView.prototype.getChildrenViewByPath = function (path) {
            return this._dataChildren ? this._dataChildren[path] : null;
        };
        TemplateView.prototype.setChildrenViewPath = function (path, children) {
            if (!this._dataChildren)
                this._dataChildren = {};
            this._dataChildren[path] = children;
        };
        TemplateView.prototype.getFormattedMessage = function (name, args) {
            var formattedTemplate = (this._template && this._template.i18n && this._template.i18n[name]) ? this._template.i18n[name] : null
                || (this._i18n && this._i18n[name]) ? this._i18n[name] : null;
            if (!formattedTemplate)
                return 'Error: TemplateView.getFormattedMessage, formattedTemplate not found';
            var formatter = getFormatter(formattedTemplate);
            return formatter(args);
        };
        TemplateView.prototype.canValidate = function (type) {
            var result = this.inDocument;
            return result;
        };
        TemplateView.prototype.validate = function () {
            var start = getTime();
            if (!_.isEmpty(this._dynamicPropertiesMap)) {
                _.extend(this._prevDynamicProperiesMap, this._dynamicPropertiesMap);
                this._dynamicPropertiesMap = {};
            }
            ft.templateHelper.createTreeObject(this._template.domTree, this);
            _super.prototype.validate.call(this);
            var result = getTime() - start;
            counters.validate++;
            timers.validate += result;
        };
        TemplateView.prototype.validateApp = function () {
            if (this.canValidate(fmvc.InvalidateType.App)) {
                counters.validateApp++;
                ft.templateHelper.updateDynamicTree(this, 'app');
            }
        };
        TemplateView.prototype.validateData = function () {
            if (this.canValidate(fmvc.InvalidateType.Data)) {
                counters.validateData++;
                ft.templateHelper.updateDynamicTree(this, 'data');
            }
        };
        TemplateView.prototype.validateState = function () {
            if (this.canValidate(fmvc.InvalidateType.Data)) {
                counters.validateState++;
                ft.templateHelper.updateDynamicTree(this, 'state');
            }
        };
        TemplateView.prototype.validateParent = function () {
        };
        TemplateView.prototype.validateChildren = function () {
        };
        TemplateView.prototype.eval = function (value) {
            var r = null;
            try {
                r = eval(value);
            }
            catch (e) {
                r = '{' + value + '}';
            }
            return r;
        };
        TemplateView.prototype.evalHandler = function (value, e) {
            var r = eval(value);
            return r;
        };
        TemplateView.prototype.appendTo = function (value) {
            if (value instanceof TemplateView) {
                value.append(this);
            }
            else {
                this.render(value);
            }
            return this;
        };
        TemplateView.prototype.append = function (value, ln) {
            value.parent = this;
            ft.templateHelper.extendTree(value, ln, this);
            return this;
        };
        TemplateView.prototype.on = function (event, handler, path) {
            if (path === void 0) { path = '0'; }
            if (!this._localHandlers)
                this._localHandlers = {};
            if (path && !this._localHandlers[path])
                this._localHandlers[path] = {};
            var handlers = this._localHandlers[path][event] ? this._localHandlers[path][event] : [];
            handlers.push(handler);
            this._localHandlers[path][event] = handlers;
        };
        TemplateView.prototype.off = function (event, path) {
            if (path === void 0) { path = '0'; }
            if (!path)
                path = '0';
            delete this._localHandlers[path][event];
        };
        TemplateView.prototype.trigger = function (e, path) {
            var _this = this;
            if (path === void 0) { path = '0'; }
            var h = this._localHandlers ? this._localHandlers[path] : null;
            if (h && h[e.name]) {
                var handlers = h[e.name];
                _.each(handlers, function (v) { return v.call(_this, e); }, this);
            }
        };
        TemplateView.prototype.handleTreeEvent = function (e) {
            e.currentTarget = this; // previous dispatch
            e.depth--;
            if (!e.cancelled)
                this.trigger(e); // dispatch to this component(dynamic handlers);
            if (e.prevented && e.e)
                e.e.preventDefault();
            e.previousTarget = this;
        };
        // custom event this.send(name, data), send stateChange event
        TemplateView.prototype.dispatchTreeEvent = function (e) {
            e.target = this;
            e.def = e.def || this.localDomDef;
            ft.templateHelper.dispatchTreeEventDown(e);
        };
        TemplateView.prototype.getCustomTreeEvent = function (name, data, depth) {
            if (data === void 0) { data = null; }
            if (depth === void 0) { depth = 1; }
            return dispatcher.getCustomTreeEvent(name, data, this, depth);
        };
        TemplateView.prototype.internalHandler = function (type, e) {
            if (this.parent)
                this.parent.internalHandler(type, e);
        };
        return TemplateView;
    })(fmvc.View);
    ft.TemplateView = TemplateView;
})(ft || (ft = {}));
//# sourceMappingURL=template.view.js.map