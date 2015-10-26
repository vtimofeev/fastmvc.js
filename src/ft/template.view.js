///<reference path="./d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
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
    ft.expression = new ft.Expression();
    var dispatcher = new ft.EventDispatcher(ft.templateHelper);
    var timers = { createDom: 0, enter: 0, setData: 0, validate: 0 };
    var LifeState = {
        Init: 'init',
        Create: 'create',
        Active: 'active',
        Enter: 'enter',
        Exit: 'exit',
        Dispose: 'dispose'
    };
    var State = {
        Selected: 'selected',
        Focused: 'focused',
        Hover: 'hover',
        Disabled: 'disabled',
        Value: 'value',
        Custom: 'custom',
        Base: 'base',
        Life: 'life',
        CreateTime: 'createTime'
    };
    var TmplDict = {
        childrenDot: 'children.',
        on: 'on',
        states: 'states',
        createDelay: 'createDelay',
        class: 'class'
    };
    ft.FunctorType = {
        Create: 'create',
        Enter: 'enter',
        Exit: 'exit'
    };
    ft.DynamicTreeGroup = {
        App: 'app',
        Data: 'data',
        State: 'state'
    };
    ft.counters = { expression: 0, expressionEx: 0, expressionCtx: 0, multiExpression: 0, createDom: 0, enter: 0, setData: 0, validate: 0, validateState: 0, validateData: 0, validateApp: 0 };
    setInterval(function () { return console.log('Statistic timers', JSON.stringify(timers), ' counters ', JSON.stringify(ft.counters), ' frames ', fmvc.frameExecution); }, 5000);
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
            // Set special type of node, when component is created by TemplateViewChildren
            this._isChildren = false;
            this._template = template;
            this._constructorParams = params;
            //this.setParameters(_.extend({}, template.domTree.params, params));
            this.life = LifeState.Init;
        }
        Object.defineProperty(TemplateView.prototype, "globalEmitter", {
            ////////////////////////////////////////////////////////////////
            // Internal
            ////////////////////////////////////////////////////////////////
            get: function () {
                return dispatcher.global;
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
        Object.defineProperty(TemplateView.prototype, "isChildren", {
            get: function () {
                return this._isChildren;
            },
            set: function (value) {
                this._isChildren = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "base", {
            ////////////////////////////////////////////////////////////////        
            // States
            ////////////////////////////////////////////////////////////////
            // Состояние отвечающее за базовый класс
            get: function () {
                return this.getState(State.Base);
            },
            set: function (value) {
                this.setState(State.Base, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "value", {
            // Состояние отвечающее за значение
            get: function () {
                return this.getState(State.Value);
            },
            set: function (value) {
                this.setState(State.Value, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "custom", {
            // Состояние кастомное
            get: function () {
                return this.getState(State.Custom);
            },
            set: function (value) {
                this.setState(State.Custom, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "hover", {
            // Состояние отвечающее за базовый класс
            get: function () {
                return this.getState(State.Hover);
            },
            set: function (value) {
                this.setState(State.Hover, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "selected", {
            // Состояние отвечающее за тип выбранный (лучше использовать от данных)
            get: function () {
                return this.getState(State.Selected);
            },
            set: function (value) {
                this.setState(State.Selected, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "focused", {
            // Состояние отвечает за наличие пользовательского фокуса
            get: function () {
                return this.getState(State.Focused);
            },
            set: function (value) {
                this.setState(State.Focused, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "disabled", {
            // Состояние забокированный
            get: function () {
                return this.getState(State.Disabled);
            },
            set: function (value) {
                this.setState(State.Disabled, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "life", {
            // Состояние жизненного цикла компонента
            get: function () {
                return this.getState(State.Life);
            },
            set: function (value) {
                this.setState(State.Life, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateView.prototype, "createTime", {
            // Состояние жизненного цикла компонента
            get: function () {
                return this.getState(State.CreateTime);
            },
            set: function (value) {
                this.setState(State.CreateTime, value);
            },
            enumerable: true,
            configurable: true
        });
        ////////////////////////////////////////////////////////////////
        // Parameters
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.setParameters = function (value) {
            this._resultParams = _.defaults(this._resultParams || {}, value);
        };
        TemplateView.prototype.getParameters = function () {
            return this._resultParams;
        };
        TemplateView.prototype.applyParameters = function () {
            _.each(this._resultParams, this.applyParameter, this);
        };
        TemplateView.prototype.applyParameter = function (value, key) {
            switch (key) {
                case TmplDict.states: // Internal "include" parameters
                case TmplDict.createDelay:
                case TmplDict.class:
                    break;
                case ft.TemplateParams.stateHandlers:
                    this.stateHandlers(_.isString(value) ? (value.split(',')) : value); //@todo move to parser
                    break;
                default:
                    if (key.indexOf(TmplDict.childrenDot) === 0) {
                        return;
                    }
                    else if (key.indexOf(TmplDict.on) === 0) {
                        var t = this;
                        this.on(key.substring(2), (_.isString(value) ? function (e) { t.internalHandler(value, e); } : value));
                    }
                    else if (key in this) {
                        if (_.isFunction(this[key]))
                            this[key](value);
                        else {
                            this[key] = this.getParameterValue(value, key, this); //@todo check value type of states (boolean,number,...etc)
                        }
                    }
                    else {
                        console.warn(this.name + '.applyParameter: Cant set template view parameter, not found ', key);
                    }
                    break;
            }
        };
        TemplateView.prototype.getParameterValue = function (value, key) {
            var r = _.isObject(value) ? this.getExpressionValue(value) : value;
            //console.log(this.name + ' :: apply parameter ', key, ' result=', r, value, value.context);
            return r;
        };
        ////////////////////////////////////////////////////////////////
        // Mappings
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.getTreeElementByPath = function (value) {
            return this._treeElementMapByPath ? this._treeElementMapByPath[value] : null;
        };
        TemplateView.prototype.setTreeElementPath = function (path, value) {
            if (!this._treeElementMapByPath)
                this._treeElementMapByPath = {};
            this._treeElementMapByPath[path] = value;
        };
        TemplateView.prototype.getPathClassValue = function (path, name) {
            return this._cssClassMap[path + '-' + name] || null;
        };
        TemplateView.prototype.setPathClassValue = function (path, name, value) {
            this._cssClassMap[path + '-' + name] = value;
        };
        TemplateView.prototype.getChildrenViewByPath = function (path) {
            var result = this._dataChildren ? this._dataChildren[path] : null;
            var c;
            result = result || (c = this.getTreeElementByPath(path), (c instanceof TemplateView ? c.getDefaultChildrenView() : null));
            return result;
        };
        TemplateView.prototype.setChildrenViewPath = function (path, childrenView) {
            if (!this._dataChildren)
                this._dataChildren = {};
            this._dataChildren[path] = childrenView;
        };
        TemplateView.prototype.getDomDefinitionByPath = function (path) {
            return this._template.pathMap[path];
        };
        TemplateView.prototype.getTemplate = function () {
            return this._template;
        };
        TemplateView.prototype.getDefaultChildrenView = function () {
            return this._dataChildren ? _.values(this._dataChildren)[0] : null;
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
        ////////////////////////////////////////////////////////////////
        // Dynamic properties
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.getDynamicProperty = function (name) {
            return this._dynamicPropertiesMap[name];
        };
        TemplateView.prototype.setDynamicProperty = function (name, value) {
            this._dynamicPropertiesMap[name] = value;
        };
        TemplateView.prototype.isChangedDynamicProperty = function (name) {
            var value = ft.expression.getContextValue(name, this);
            var r = !(this._prevDynamicProperiesMap[name] === value);
            return r;
        };
        ////////////////////////////////////////////////////////////////
        // Lifecycle
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.createDom = function () {
            if (this._element)
                return;
            this.beforeCreate();
            this.life = LifeState.Create;
            var start = getTime();
            this.setState(State.CreateTime, (new Date()).getTime());
            this.createParameters();
            var e = ft.templateHelper.createTreeObject(this._template.domTree, this);
            var element = e instanceof TemplateView ? e.getElement() : e;
            this.setElement(element);
            this.setTreeElementPath('0', this);
            this.afterCreate();
            ft.counters.createDom++;
            timers.createDom += getTime() - start;
        };
        TemplateView.prototype.createParameters = function () {
            var localParams = this.localDomDef ? this.localDomDef.params : null;
            if (this.isChildren) {
                this.setParameters(_.extend({}, localParams, this._constructorParams));
            }
            else {
                var parentParams = ft.templateHelper.applyFirstContextToExpressionParameters(this.domDef ? this.domDef.params : null, this.parent);
                this.setParameters(_.extend({}, localParams, parentParams, this._constructorParams));
            }
            //console.log(this.name , ' has parameters is ', this.getParameters())
        };
        TemplateView.prototype.enter = function () {
            var _this = this;
            if (this.inDocument) {
                return console.warn('Error, try to re-enter ', this.name);
            }
            var start = getTime();
            this.beforeEnter();
            this.life = LifeState.Enter;
            this.applyParameters();
            _super.prototype.enter.call(this);
            ft.templateHelper.enterTreeObject(this._template.domTree, this);
            this.invalidate(fmvc.InvalidateType.Data | fmvc.InvalidateType.App | fmvc.InvalidateType.State);
            this.afterEnter();
            timers.enter += getTime() - start;
            ft.counters.enter++;
            setTimeout(function () { _this.life = LifeState.Active; }, 50);
        };
        TemplateView.prototype.exit = function () {
            var _this = this;
            if (!this.inDocument) {
                return console.warn('Error, try re-exit');
            }
            this.beforeExit();
            ft.templateHelper.exitTreeObject(this._template.domTree, this);
            this.cleanDelays();
            this.parent = null;
            this.domDef = null;
            _super.prototype.exit.call(this);
            this._cssClassMap = null;
            this._dynamicPropertiesMap = null;
            this._prevDynamicProperiesMap = null;
            this._localHandlers = null;
            this._treeElementMapByPath = null;
            _.each(this._resultParams, function (v, k) { v.context = null; delete _this._resultParams[k]; });
            _.each(this._dataChildren, function (v, k) { return delete _this._dataChildren[k]; });
            _.each(this._treeElementMapByPath, function (v, k) { return delete _this._treeElementMapByPath[k]; });
            this.afterExit();
        };
        TemplateView.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this._resultParams = null;
            this._template = null;
            this._i18n = null;
        };
        ////////////////////////////////////////////////////////////////
        // Validators override
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.canValidate = function (type) {
            var result = this.inDocument;
            return result;
        };
        TemplateView.prototype.validate = function () {
            if (!this.inDocument)
                return;
            var start = getTime();
            if (!_.isEmpty(this._dynamicPropertiesMap)) {
                _.extend(this._prevDynamicProperiesMap, this._dynamicPropertiesMap);
                this._dynamicPropertiesMap = {};
            }
            this._dynamicPropertiesMap = {};
            if (this._template.hasStates)
                ft.templateHelper.createTreeObject(this._template.domTree, this);
            _super.prototype.validate.call(this);
            var result = getTime() - start;
            ft.counters.validate++;
            timers.validate += result;
        };
        TemplateView.prototype.validateApp = function () {
            if (this.canValidate(fmvc.InvalidateType.App)) {
                ft.counters.validateApp++;
                ft.templateHelper.updateDynamicTree(this, ft.DynamicTreeGroup.App);
            }
        };
        TemplateView.prototype.validateData = function () {
            if (this.canValidate(fmvc.InvalidateType.Data)) {
                ft.counters.validateData++;
                ft.templateHelper.updateDynamicTree(this, ft.DynamicTreeGroup.Data);
            }
        };
        TemplateView.prototype.validateState = function () {
            if (this.canValidate(fmvc.InvalidateType.State)) {
                ft.counters.validateState++;
                ft.templateHelper.updateDynamicTree(this, ft.DynamicTreeGroup.State);
            }
        };
        TemplateView.prototype.validateParent = function () {
        };
        TemplateView.prototype.validateChildren = function () {
        };
        ////////////////////////////////////////////////////////////////
        // Event maps (auto)
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.stateHandlers = function (value) {
            var _this = this;
            if (_.isString(value))
                value = value.split(',');
            var stateHandlers = {
                hover: {
                    mouseover: this.mouseoverHandler,
                    mouseout: this.mouseoutHandler
                },
                selected: {
                    click: this.clickHandler
                },
                focused: {
                    focus: this.focusHandler,
                    blur: this.blurHandler
                }
            };
            _.each(value, function (state) { return _.each(stateHandlers[state], function (handler, event) { return _this.on(event, handler); }, _this); }, this);
        };
        TemplateView.prototype.focusHandler = function (e) {
            if (!!this.getState(State.Disabled))
                return;
            this.setState(State.Focused, true);
        };
        TemplateView.prototype.blurHandler = function (e) {
            if (!!this.getState(State.Disabled))
                return;
            this.setState(State.Focused, false);
        };
        TemplateView.prototype.mouseoverHandler = function (e) {
            if (!!this.getState(State.Disabled))
                return;
            this.setState(State.Hover, true);
        };
        TemplateView.prototype.mouseoutHandler = function (e) {
            if (!!this.getState(State.Disabled))
                return;
            this.setState(State.Hover, false);
        };
        TemplateView.prototype.clickHandler = function (e) {
            if (!!this.getState(State.Disabled))
                return;
            this.setState(State.Selected, !this.getState(State.Selected));
        };
        ////////////////////////////////////////////////////////////////
        // Events
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.handleTreeEvent = function (e) {
            e.currentTarget = this; // previous dispatch
            e.depth--;
            this.trigger(e); // dispatch to this component(dynamic handlers);
            if (e.prevented && e.e)
                e.e.preventDefault();
            e.previousTarget = this;
        };
        TemplateView.prototype.trigger = function (e, path) {
            var _this = this;
            if (path === void 0) { path = '0'; }
            var h = this._localHandlers ? this._localHandlers[path] : null;
            if (h && h[e.name]) {
                var handlers = h[e.name];
                _.each(handlers, function (v) { v.call(_this, e); e.executionHandlersCount++; }, this);
            }
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
            //console.log('Internal handler ... ', type, e);
            if (this.parent)
                this.parent.internalHandler(type, e);
        };
        TemplateView.prototype.globalHandler = function (events, handler) {
            var _this = this;
            _.each(_.isArray(events) ? events : [events], function (v) { return _this.globalEmitter.on(events, handler); });
        };
        ////////////////////////////////////////////////////////////////
        // Expressions
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.getExpressionByName = function (name) {
            var value = this._template.expressionMap ? this._template.expressionMap[name] : null;
            value = value || (this.parent ? this.parent.getExpressionByName(name) : null);
            return value;
        };
        TemplateView.prototype.getExpressionValue = function (ex) {
            var exName = ex.name;
            if (this._dynamicPropertiesMap[exName])
                return this._dynamicPropertiesMap[exName];
            var exObj = this.getExpressionByName(exName);
            var result = ft.expression.execute(exObj, ex.context || this);
            return result;
        };
        TemplateView.prototype.getCssClassExpressionValue = function (ex) {
            var exObj = this.getExpressionByName(ex.name);
            var result = ft.expression.execute(exObj, ex.context || this, true);
            return result;
        };
        ////////////////////////////////////////////////////////////////
        // Utils (message formatter)
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.getFormattedMessage = function (name, args) {
            var formattedTemplate = (this._template && this._template.i18n && this._template.i18n[name]) ? this._template.i18n[name] : null
                || (this._i18n && this._i18n[name]) ? this._i18n[name] : null;
            if (!formattedTemplate)
                return 'Error: TemplateView.getFormattedMessage, formattedTemplate not found';
            var formatter = getFormatter(formattedTemplate);
            return formatter(args);
        };
        TemplateView.prototype.evalHandler = function (value, e) {
            var r = null;
            try {
                r = eval(value);
            }
            catch (e) {
                r = '{' + value + '}';
            }
            return r;
        };
        /*
        appendTo(value:ITemplateView|Element):TemplateView {
            if (value instanceof TemplateView) {
                value.append(this);
            }
            else {
                this.render(<Element> value);
            }
            return this;
        }

        append(value:ITemplateView, ln?:string):TemplateView {
            value.parent = this;
            templateHelper.extendTree(value, ln, this);
            return this;
        }
        */
        ////////////////////////////////////////////////////////////////
        // Delay of creation tree elements
        ////////////////////////////////////////////////////////////////
        TemplateView.prototype.isDelay = function (data, functor) {
            var result = false;
            if (functor === ft.FunctorType.Create) {
                var delayValue = Number(data.params[functor + 'Delay']); //@todo apply types move to parser
                result = ((new Date()).getTime() - this.createTime) < delayValue;
            }
            return result;
        };
        TemplateView.prototype.setDelay = function (data, functor) {
            var delayName = data.path + ':' + functor;
            if (!this._delays)
                this._delays = {};
            if (this._delays[delayName])
                return; // next enter -> return
            var delayValue = Number(data.params[functor + 'Delay']) - ((new Date()).getTime() - this.createTime);
            var t = this;
            this._delays[delayName] = setTimeout(function delayedFunctor() {
                if (!t.inDocument)
                    return;
                switch (functor) {
                    case ft.FunctorType.Create:
                        ft.templateHelper.createTreeObject(t.getDomDefinitionByPath(data.parentPath) || t.domDef, t);
                        ft.templateHelper.enterTreeObject(t.getDomDefinitionByPath(data.parentPath) || t.domDef, t);
                        return;
                }
            }, delayValue);
        };
        TemplateView.prototype.cleanDelays = function () {
            _.each(this._delays, function (v, k) { return clearTimeout(v); });
        };
        return TemplateView;
    })(fmvc.View);
    ft.TemplateView = TemplateView;
})(ft || (ft = {}));
//# sourceMappingURL=template.view.js.map