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
    var expression = new ft.Expression();
    var dispatcher = new ft.EventDispatcher(ft.templateHelper.idMap);
    console.log(dispatcher);
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
            this._classMap = {};
            this._prevDynamicProperiesMap = {};
            this._dynamicPropertiesMap = {};
            this._extendTree = {};
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
            ft.templateHelper.setDataTreeObject(this._template.domTree, this);
            this.setElement(e);
        };
        TemplateView.prototype.enter = function () {
            var _this = this;
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
        };
        TemplateView.prototype.getTemplate = function () {
            return this._template;
        };
        TemplateView.prototype.getElementByPath = function (value) {
            return this._elementMap ? this._elementMap[value] : null;
        };
        TemplateView.prototype.getComponentByPath = function (value) {
            return this._componentMap ? this._componentMap[value] : null;
        };
        TemplateView.prototype.getValue = function (value) {
            return undefined;
        };
        TemplateView.prototype.getExpressionValue = function (ex) {
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
                if (!this._componentMap)
                    this._componentMap = {};
                this._componentMap[path] = value;
            }
            else {
                if (!this._elementMap)
                    this._elementMap = {};
                this._elementMap[path] = value;
            }
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
            if (this.canValidate())
                ft.templateHelper.updateDynamicTree(this);
        };
        TemplateView.prototype.validateRecreateTree = function () {
            //templateHelper.createTreeObject(this._template.domTree, this);
        };
        TemplateView.prototype.validateData = function () {
            //if (this.canValidate(fmvc.InvalidateType.Data))
        };
        TemplateView.prototype.eval = function (value) {
            var r = eval(value);
            return r;
        };
        TemplateView.prototype.evalHandler = function (value, e) {
            console.log('event handler: ', value, e);
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
            this._dynamicHandlers[path][event] = handler;
        };
        TemplateView.prototype.off = function (event, path) {
            if (path === void 0) { path = '0'; }
            if (!path)
                path = '0';
            delete this._dynamicHandlers[path][event];
        };
        TemplateView.prototype.trigger = function (e, path) {
            if (path === void 0) { path = '0'; }
            var h = this._dynamicHandlers ? this._dynamicHandlers[path] : null;
            console.log('Trigger ', e, h);
            if (h && h[e.name])
                h[e.name].call(this, e);
        };
        TemplateView.prototype.handleTreeEvent = function (e) {
            e.currentTarget = this; // previous dispatch
            e.depth--;
            ft.templateHelper.dispatchTreeEvent(e); // dispatch to tree
            if (!e.cancelled)
                this.trigger(e); // dispatch to this component(dynamic handlers);
            if (e.prevented && e.e)
                e.e.preventDefault();
            e.previousTarget = this;
            if (e.depth > 0 && !e.cancelled && this.parent)
                this.dispatchTreeEvent(e); // dispatch to parent
            else
                dispatcher.disposeEvent(e);
        };
        // custom event this.send(name, data), send stateChange event
        TemplateView.prototype.dispatchTreeEvent = function (e) {
            if (this.parent)
                this.parent.handleTreeEvent(e); // dispatch to parent
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
            console.log('Internal handler ', type, e);
        };
        return TemplateView;
    })(fmvc.View);
    ft.TemplateView = TemplateView;
})(ft || (ft = {}));
//# sourceMappingURL=template.view.js.map