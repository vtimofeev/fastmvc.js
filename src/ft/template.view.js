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
    var dispatcher = new ft.EventDispatcher(ft.templateHelper.getIdMap());
    //console.log(dispatcher);
    function getFormatter(value, locale) {
        if (locale === void 0) { locale = 'en'; }
        return templateFormatterChache[value] || compileFormatter(value, locale);
    }
    function compileFormatter(value, locale) {
        var mf = localeFormatterCache[locale] || (localeFormatterCache[locale] = new MessageFormat(this.locale));
        return (templateFormatterChache[value] = mf.compile(value));
    }
    var TemplateView = (function (_super) {
        __extends(TemplateView, _super);
        function TemplateView(name, params, template) {
            _super.call(this, name);
            this._classMap = {}; // map of component classes
            this._prevDynamicProperiesMap = {};
            this._dynamicPropertiesMap = {};
            //console.log('Construct component: name,params,template ', name, params, template);
            this._template = template;
            params ? _.each(params, this.setParameter, this) : null;
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
        Object.defineProperty(TemplateView.prototype, "parentDomDef", {
            get: function () {
                return this._parentDomDef;
            },
            set: function (value) {
                this._parentDomDef = value;
            },
            enumerable: true,
            configurable: true
        });
        TemplateView.prototype.setParameter = function (value, name) {
            if (name in this) {
                _.isFunction(this[name]) ? this[name](value) : this[name] = value;
            }
            else {
                console.warn('Cant set parameter, not found in ', name, ' param ', name);
            }
        };
        TemplateView.prototype.isChangedDynamicProperty = function (name) {
            var value = expression.getContextValue(name, this);
            return !(this._prevDynamicProperiesMap[name] === value);
        };
        TemplateView.prototype.setDynamicProperty = function (name, value) {
            this._dynamicPropertiesMap[name] = value;
        };
        TemplateView.prototype.createDom = function () {
            var e = ft.templateHelper.createTreeObject(this._template.domTree, this);
            var element = e instanceof TemplateView ? e.getElement() : e;
            //templateHelper.setDataTreeObject(this._template.domTree, this);
            this.setElement(element);
        };
        TemplateView.prototype.enter = function () {
            var _this = this;
            if (this.inDocument)
                return console.warn('Error, try to reenter ', this.name);
            _super.prototype.enter.call(this);
            var stateHandlers = {
                hover: {
                    mouseover: function () { return _this.setState('hover', true); },
                    mouseout: function () { return _this.setState('hover', false); }
                },
                selected: {
                    click: function () { return _this.setState('selected', !_this.getState('selected')); }
                }
            };
            _.each(stateHandlers, function (v, state) { return _.each(v, function (handler, event) { return _this.on(event, handler); }, _this); }, this);
            ft.templateHelper.enterTreeObject(this._template.domTree, this);
            ft.templateHelper.setDataTreeObject(this._template.domTree, this);
        };
        TemplateView.prototype.exit = function () {
            _super.prototype.exit.call(this);
            this.parent = null;
            this.parentDomDef = null;
        };
        TemplateView.prototype.getTemplate = function () {
            return this._template;
        };
        TemplateView.prototype.getDomDefinitionByPath = function (path) {
            var parts = path.split(',').splice(1);
            return _.reduce(parts, function (m, v) { return (m.children[Number(v)]); }, this.getTemplate().domTree);
        };
        TemplateView.prototype.getElementByPath = function (value) {
            return this._elementMapByPath ? this._elementMapByPath[value] : null;
        };
        TemplateView.prototype.getComponentByPath = function (value) {
            return this._componentMapByPath ? this._componentMapByPath[value] : null;
        };
        TemplateView.prototype.getExpressionValue = function (ex) {
            console.log('getExpressionValue, object, ex', ex);
            var exObj = this.getTemplate().expressionMap[ex.name];
            var result = expression.execute(exObj, this.getTemplate().expressionMap, this);
            return result;
        };
        TemplateView.prototype.getClassExpressionValue = function (ex) {
            var exObj = this.getTemplate().expressionMap[ex.name];
            var result = expression.execute(exObj, this.getTemplate().expressionMap, this, true);
            return result;
        };
        TemplateView.prototype.getPathClassValue = function (path, name) {
            return this._classMap[path + '-' + name] || null;
        };
        TemplateView.prototype.setPathClassValue = function (path, name, value) {
            this._classMap[path + '-' + name] = value;
        };
        TemplateView.prototype.setTemplateElementProperty = function (name, value) {
            if (!this[name]) {
                this[name] = value;
                if (!value)
                    delete this[name];
            }
            else {
                throw Error('Can not set name:' + name + ' property, cause it exist ' + this[name]);
            }
        };
        TemplateView.prototype.setPathOfCreatedElement = function (path, value) {
            if ('getElement' in value) {
                if (!this._componentMapByPath)
                    this._componentMapByPath = {};
                this._componentMapByPath[path] = value;
            }
            else {
                if (!this._elementMapByPath)
                    this._elementMapByPath = {};
                this._elementMapByPath[path] = value;
            }
        };
        TemplateView.prototype.getDataChildrenByPath = function (path) {
            return this._dataChildrenMap ? this._dataChildrenMap[path] : null;
        };
        TemplateView.prototype.setDataChildrenByPath = function (path, children) {
            if (!this._dataChildrenMap)
                this._dataChildrenMap = {};
            this._dataChildrenMap[path] = children;
        };
        TemplateView.prototype.getFormattedMessage = function (name, args) {
            var formattedTemplate = (this._template && this._template.i18n && this._template.i18n[name]) ? this._template.i18n[name] : null
                || (this._i18n && this._i18n[name]) ? this._i18n[name] : null;
            if (!formattedTemplate)
                return 'Error: not found';
            var formatter = getFormatter(formattedTemplate);
            return formatter(args);
        };
        TemplateView.prototype.canValidate = function (type) {
            var result = this.inDocument;
            // if(type===fmvc.InvalidateType.Data) result = result && !!this.data;
            return result;
        };
        TemplateView.prototype.validate = function () {
            if (!_.isEmpty(this._dynamicPropertiesMap)) {
                _.extend(this._prevDynamicProperiesMap, this._dynamicPropertiesMap);
                this._dynamicPropertiesMap = {};
            }
            _super.prototype.validate.call(this);
            //console.log('Update tree ', this.inDocument);
            this.validateRecreateTree();
            if (this.canValidate())
                ft.templateHelper.updateDynamicTree(this);
        };
        TemplateView.prototype.validateRecreateTree = function () {
            ft.templateHelper.createTreeObject(this._template.domTree, this);
        };
        TemplateView.prototype.validateData = function () {
            //if (this.canValidate(fmvc.InvalidateType.Data))
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
            //console.log('event handler: ', value, e);
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
            if (!this._dynamicHandlers)
                this._dynamicHandlers = {};
            if (path && !this._dynamicHandlers[path])
                this._dynamicHandlers[path] = {};
            var handlers = this._dynamicHandlers[path][event] ? this._dynamicHandlers[path][event] : [];
            handlers.push(handler);
            this._dynamicHandlers[path][event] = handlers;
        };
        TemplateView.prototype.off = function (event, path) {
            if (path === void 0) { path = '0'; }
            if (!path)
                path = '0';
            delete this._dynamicHandlers[path][event];
        };
        TemplateView.prototype.trigger = function (e, path) {
            var _this = this;
            if (path === void 0) { path = '0'; }
            var h = this._dynamicHandlers ? this._dynamicHandlers[path] : null;
            console.log('Trigger ', e.currentTarget ? e.currentTarget.name : name, e, h);
            if (h && h[e.name]) {
                console.log('Has trigger ... ', h[e.name]);
                var handlers = h[e.name];
                _.each(handlers, function (v) { return v.call(_this, e); }, this);
            }
        };
        TemplateView.prototype.handleTreeEvent = function (e, path) {
            //console.log('Handle tree event ... ', e);
            e.currentTarget = this; // previous dispatch
            e.depth--;
            ft.templateHelper.dispatchTreeEvent(e, path); // dispatch to tree
            if (!e.cancelled)
                this.trigger(e); // dispatch to this component(dynamic handlers);
            if (e.prevented && e.e)
                e.e.preventDefault();
            e.previousTarget = this;
            if (e.depth > 0 && !e.cancelled)
                this.dispatchTreeEvent(e); // dispatch to parent
            else
                dispatcher.disposeEvent(e);
        };
        // custom event this.send(name, data), send stateChange event
        TemplateView.prototype.dispatchTreeEvent = function (e) {
            console.log('Try dispatch to parent tree event ...', this, this.parent);
            if (this.parent)
                this.parent.handleTreeEvent(e, this.parentDomDef ? this.parentDomDef.path : null); // dispatch to parent
        };
        TemplateView.prototype.getCustomTreeEvent = function (name, data, depth) {
            if (data === void 0) { data = null; }
            if (depth === void 0) { depth = 1; }
            return dispatcher.getCustomTreeEvent(name, data, this, depth);
        };
        TemplateView.prototype.sendTreeEvent = function (name, data, depth) {
            this.dispatchTreeEvent(this.getCustomTreeEvent(name, data, depth));
            this.sendEvent(name, data);
        };
        TemplateView.prototype.internalHandler = function (type, e) {
            console.log('Internal handler ', this, type, e);
            if (this.parent)
                this.parent.internalHandler(type, e);
        };
        return TemplateView;
    })(fmvc.View);
    ft.TemplateView = TemplateView;
})(ft || (ft = {}));
//# sourceMappingURL=template.view.js.map