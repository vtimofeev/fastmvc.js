///<reference path='./d.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fmvc;
(function (fmvc) {
    fmvc.global = window || {};
    console.log('Global is ' + fmvc.global);
    fmvc.State = {
        SELECTED: 'selected',
        HOVER: 'hover',
        FOCUSED: 'focused',
        DISABLED: 'disabled',
        OPEN: 'open'
    };
    fmvc.DomObjectType = {
        TEXT: 'text',
        TAG: 'tag',
        COMMENT: 'comment'
    };
    fmvc.Filter = {
        FIRST: 'first',
        SECOND: 'second'
    };
    var View = (function (_super) {
        __extends(View, _super);
        function View(name, modelOrData, jsTemplate) {
            _super.call(this, name, fmvc.TYPE_VIEW);
            this._data = null;
            this.dynamicPropertyValue = {}; // те которые были установлены
            this.elementPaths = {};
            this.componentPaths = {};
            this.handlers = {};
            // Invalidate properties
            this._invalidateTimeout = 0;
            this._invalidate = 0;
            this._inDocument = false;
            this._avaibleInheritedStates = null;
            this._locale = 'ru';
            this._id = null;
            this.tmp = {};
            this.expr = Expression.instance();
            _.bindAll(this, 'getDataStringValue', 'applyEventHandlers', 'invalidateHandler', 'appModelHandler' /*, 'getDataObjectValue'*/);
            this.template = this.jsTemplate;
            if (modelOrData) {
                if (modelOrData.type === fmvc.TYPE_MODEL)
                    this.model = modelOrData;
                else
                    this.data = modelOrData;
            }
            this.enableStates(null);
            this.initTemplate(jsTemplate);
            this.init();
            this.invalidateHandler = this.invalidateHandler.bind(this);
        }
        View.prototype.initTemplate = function (templateExtention) {
            if (templateExtention)
                this.template = (_.extend(_.clone(this.template), templateExtention));
            if (this.template && this.template.enableStates)
                this.enableStates(this.template.enableStates);
        };
        // @override
        View.prototype.init = function () {
        };
        View.prototype.render = function (parent) {
            this.parentElement = parent;
            this.createDom();
            this.parentElement.appendChild(this.element);
            this.updateDom();
            this.enterDocument();
            this.updateChildren();
        };
        View.prototype.updateChildren = function () {
        };
        Object.defineProperty(View.prototype, "id", {
            // @memorize
            get: function () {
                if (!this._id) {
                    this._id = (_.property('staticAttributes')(this.jsTemplate) ? this.jsTemplate.staticAttributes['id'] : null) || ViewHelper.getId();
                }
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        //------------------------------------------------------------------------------------------------
        // Dom
        //------------------------------------------------------------------------------------------------
        View.prototype.createDom = function () {
            this.element = document.createElement('div');
            this.childrenContainer = this.element;
            return this;
        };
        View.prototype.enableStates = function (states) {
            this._states = {};
            this._statesType = {};
            _.each(states, function (value) {
                if (_.isString(value)) {
                    var svalue = (value);
                    this._states[svalue] = false;
                }
                else if (_.isObject(value)) {
                    var ivalue = (value);
                    this._statesType[ivalue.name] = ivalue.type;
                    this._states[ivalue.name] = ivalue.value || ivalue.default;
                }
            }, this);
        };
        View.prototype.updateDom = function () {
            if (!this.dynamicProperties)
                return;
            //this.element = document.createElement('div');
            _.each(this._states, function (stateValue, stateName) {
                if (this.dynamicProperties[stateName] && stateValue != this.dynamicPropertyValue[stateName])
                    this.updateDynamicProperty(stateName, stateValue);
            }, this);
            this.updateI18N();
            //this.updateData();
        };
        View.prototype.updateI18N = function () {
            if (!this.dynamicProperties)
                return;
            if (!this.i18n)
                return;
            _.each(this.i18n, function (value, name) {
                if (_.isObject(value)) {
                }
                else {
                    var prefix = 'i18n.';
                    this.dynamicProperties[prefix + name] ? this.updateDynamicProperty(prefix + name, value) : null;
                }
            }, this);
        };
        View.prototype.updateData = function (data, prefix, depth) {
            if (prefix === void 0) { prefix = 'data.'; }
            if (depth === void 0) { depth = 0; }
            if (!this.dynamicProperties || !data || !depth)
                return;
            depth--;
            _.each(data, function (value, name) {
                var nextPrefix = prefix + name + '.';
                if (_.isObject(value) && depth) {
                    this.updateData(value, nextPrefix, depth);
                }
                else {
                    this.dynamicProperties[prefix + name] ? this.updateDynamicProperty(prefix + name, value) : null;
                }
            }, this);
        };
        View.prototype.updateApp = function () {
            if (!this.dynamicProperties || !this.app)
                return;
            var appProps = _.filter(_.keys(this.dynamicProperties), function (v) { return v.indexOf('app.') === 0; });
            _.each(appProps, function (name) {
                this.updateAppProp(name);
            }, this);
        };
        View.prototype.updateAppProp = function (name) {
            var appValue = eval('this.' + name);
            this.updateDynamicProperty(name, appValue);
        };
        View.prototype.updatePaths = function (paths, type, name, value, GetValue, each) {
            _.each(paths, function (valueOrValues, path) {
                var r = '';
                if (_.isString(valueOrValues)) {
                    var result = GetValue(name, value, valueOrValues);
                    r += result;
                    if (each)
                        this.updatePathProperty(path, type, name, value, result, valueOrValues);
                }
                else if (_.isArray(valueOrValues)) {
                    _.each(valueOrValues, function (stringValue) {
                        var result = GetValue(name, value, stringValue);
                        r += result;
                        if (each)
                            this.updatePathProperty(path, type, name, value, stringValue);
                    }, this);
                }
                else if (_.isObject(valueOrValues)) {
                    var result = GetValue(name, value, valueOrValues);
                    r += result;
                    if (each)
                        this.updatePathProperty(path, type, name, value, result);
                }
                if (!each)
                    this.updatePathProperty(path, type, name, value, r);
            }, this);
        };
        View.prototype.updateDynamicProperty = function (name, value) {
            var domPropsObject = this.dynamicProperties[name];
            this.dynamicPropertyValue[name] = value;
            if (!domPropsObject)
                return;
            _.each(domPropsObject, function (pathsAndValues, type) {
                var GetValue = null;
                var each = false;
                switch (type) {
                    case 'class':
                        GetValue = this.getClassStringValue;
                        each = true;
                        break;
                    case 'style':
                        GetValue = this.getDataStringValue;
                        break;
                    case 'data':
                        GetValue = this.getDataStringValue;
                        break;
                    default:
                        GetValue = this.getDataStringValue;
                        break;
                }
                this.updatePaths(pathsAndValues, type, name, value, GetValue, each);
            }, this);
        };
        View.prototype.updatePathProperty = function (path, type, name, value, resultValue, template) {
            var element = this.elementPaths[path];
            if (!(element && element.nodeType !== 8 /* comment */))
                return; // virtual element or comment
            //console.log('updated element ', path, type, value, resultValue);
            switch (type) {
                case 'selected':
                    var view = this.componentPaths[path];
                    if (view) {
                        console.log('Selected: path %s, type %s, name %s, result %s ', path, type, name, resultValue, _.isString(resultValue), view);
                        view.setState(type, (resultValue === 'false' ? false : !!resultValue));
                    }
                    break;
                case 'class':
                    console.log('Class: path %s, type %s, name %s, value %s, result %s, template %s, ', path, type, name, value, resultValue, template, this);
                    var prevClassValue;
                    // удаляем предыдушее значение для sting типов значения классов
                    if (template && !!(prevClassValue = this.tmp[template])) {
                        if (prevClassValue === resultValue)
                            return;
                        element.classList.toggle(prevClassValue, false);
                        this.tmp[template] = resultValue;
                    }
                    try {
                        element.classList.toggle(resultValue, !!value);
                    }
                    catch (e) {
                        console.log(e);
                    }
                    View.Counters.update.class++;
                    break;
                case 'style':
                    var style = resultValue.split(':');
                    var propName = style[0].trim();
                    style.splice(0, 1);
                    var propValue = style.join(':');
                    element.style[propName] = propValue;
                    View.Counters.update.style++;
                    break;
                case 'data':
                    //console.log('Set data ', element, element.nodeType, element.textContent);
                    if (element.nodeType === 3 && element.textContent != resultValue)
                        element.textContent = resultValue;
                    View.Counters.update.data++;
                    break;
                default:
                    element.setAttribute(type, resultValue);
                    View.Counters.update.other++;
                    break;
            }
        };
        View.prototype.getElementByPath = function (element /* Element */, path, root) {
            if (root === void 0) { root = false; }
            if (!this.element)
                throw Error('cant get element by path');
            //console.log('get path of ' , path, element);
            if (root)
                return element;
            if (path && path.length && element && element.childNodes.length) {
                var index = path.splice(0, 1)[0];
                return this.getElementByPath(element.childNodes[parseInt(index, 10)], path);
            }
            else {
                return element;
            }
        };
        Object.defineProperty(View.prototype, "inDocument", {
            get: function () {
                return this._inDocument;
            },
            enumerable: true,
            configurable: true
        });
        //------------------------------------------------------------------------------------------------
        // Event handlers
        //------------------------------------------------------------------------------------------------
        View.prototype.enterDocument = function () {
            var _this = this;
            if (this._inDocument)
                return;
            this._inDocument = true;
            var t = this;
            if (!this.isDynamicStylesEnabled())
                this.enableDynamicStyle(true);
            ViewHelper.setIfNotExistAttribute(this.element, 'id', this.id);
            if (this.hasState(fmvc.State.HOVER)) {
                this.dispatcher.listen(this.element, fmvc.BrowserEvent.MOUSEOVER, function () { return t.setState(fmvc.State.HOVER, true); });
                this.dispatcher.listen(this.element, fmvc.BrowserEvent.MOUSEOUT, function () { return t.setState(fmvc.State.HOVER, false); });
            }
            if (this.hasState(fmvc.State.SELECTED)) {
                this.dispatcher.listen(this.element, fmvc.BrowserEvent.CLICK, function () { return t.setState(fmvc.State.SELECTED, !t.getState(fmvc.State.SELECTED)); });
            }
            this.enterDocumentElement(this.jsTemplate, this.elementPaths);
            this.invalidate(1 | 2);
            var appModels = _.filter(_.keys(this.dynamicProperties), function (v) { return v.indexOf('app.') === 0; });
            var modelNames = _.map(appModels, function (v) { return v.split('.')[1]; });
            _.each(modelNames, function (n) { return (_this.app[n]).bind(_this, _this.appModelHandler); }, this);
        };
        View.prototype.appModelHandler = function (e) {
            var _this = this;
            if (!this._inDocument)
                return;
            console.log('AppModelHandler: ', e.target.name, ' view: ', this.name, ', ', JSON.stringify(e.target.data));
            var modelName = e.target.name;
            var appProps = _.filter(_.keys(this.dynamicProperties), function (v) { return v.indexOf('app.' + modelName) === 0; });
            _.each(appProps, function (n) { return _this.updateAppProp(n); }, this);
            this.applyChangeStateElement(this.jsTemplate, this.elementPaths);
        };
        View.prototype.exitDocument = function () {
            var _this = this;
            var appModels = _.filter(_.keys(this.dynamicProperties), function (v) { return v.indexOf('app.') === 0; });
            var modelNames = _.map(appModels, function (v) { return v.split('.')[1]; });
            _.each(modelNames, function (n) { return (_this.app[n]).unbind(_this, _this.appModelHandler); }, this);
            this.dispatcher.unlistenAll(this.element);
            this._inDocument = false;
        };
        View.prototype.applyEventHandlers = function (e) {
            var path = e.currentTarget.getAttribute('data-path');
            var name = this.handlers[path][e.type];
            e.stopPropagation();
            if (name === 'stopPropagation') {
                e.stopPropagation();
            }
            else {
                if (name.indexOf(',')) {
                    var commands = name.split(',');
                    if (commands[0] === 'set') {
                        var objectTo = commands[1].split('.');
                        var objectProperty = objectTo[1].trim();
                        if (this.model) {
                            var result = {};
                            result[objectProperty] = e.target.value;
                            this.model.data = result;
                        }
                        if (this._data) {
                            this._data[objectProperty] = e.target.value;
                        }
                    }
                }
            }
            this.elementEventHandler(name, e);
        };
        // @to override with custom actions
        // if(name==='any') make something
        // if(name==='exit') make exit
        View.prototype.elementEventHandler = function (name, e) {
            //console.log('Event to handle ', name, e);
            this.mediator.viewEventHandler({ name: name, target: this, event: e });
        };
        View.prototype.enterDocumentElement = function (value, object) {
            if (!value || !object)
                return;
            var path = value.path;
            var e = object[value.path];
            var isTag = e.nodeType === 1;
            var c = this.componentPaths[value.path];
            //if(c) console.log('Create listeners ? ', c , e, value.handlers);
            if (c)
                c.enterDocument();
            if (value.type === fmvc.DomObjectType.TAG && isTag) {
                //console.log('EnterDocument ', value.tagName, value.path);
                _.each(value.children, function (child, index) {
                    this.enterDocumentElement(child, object);
                }, this);
                // add global handlers if not exist
                //if(c) console.log('Create listeners : ', c , e, value.handlers);
                if (value.handlers) {
                    var id = value.staticAttributes ? value.staticAttributes['id'] : null || ViewHelper.getId();
                    ViewHelper.setIfNotExistAttribute(e, 'id', id);
                    _.each(value.handlers, function (name, eventType) {
                        if (!this.handlers[path] || !this.handlers[path][eventType]) {
                            if (!this.handlers[path])
                                this.handlers[path] = {};
                            this.handlers[path][eventType] = name;
                            e.setAttribute('data-path', path);
                            this.dispatcher.listen(e, eventType, this.applyEventHandlers);
                        }
                    }, this);
                }
                else {
                }
            }
        };
        View.prototype.exitDocumentElement = function (value, object) {
            if (!value || !object)
                return;
            var path = value.path;
            var e = object[value.path];
            var isTag = e.nodeType === 1;
            var c = this.componentPaths[value.path];
            if (c)
                c.exitDocument();
            if (value.type === fmvc.DomObjectType.TAG && isTag) {
                //console.log('ExitDocument ', value.tagName, value.path);
                _.each(value.children, function (child, index) {
                    this.exitDocumentElement(child, object);
                }, this);
                // add global handlers if not exist
                if (value.handlers) {
                    _.each(value.handlers, function (name, eventType) {
                        //console.log('try remove listener ', e, value.tagName, path, eventType);
                        if (this.handlers[path] && this.handlers[path][eventType]) {
                            this.dispatcher.unlisten(e, eventType);
                            delete this.handlers[path][eventType];
                        }
                    }, this);
                }
            }
        };
        View.prototype.applyChangeStateElement = function (value, object) {
            if (!value || !object)
                return;
            var e = object[value.path];
            if (e) {
                _.each(value.children, function (child, index) {
                    this.applyChangeStateElement(child, object);
                }, this);
            }
            var isStated = !!value.states;
            if (!isStated)
                return;
            var isIncluded = value.states ? this.isStateEnabled(value.states) : true;
            //this.log(['Apply change state element: ' , value.path, isIncluded, value.states].join(', '));
            var isEnabled = (e.nodeType === 1);
            //console.log('path, included, enabled ', value.tagName, value.path, isIncluded, isEnabled);
            if (isIncluded && !isEnabled) {
                var newElement = this.getElement(value, object);
                var parentNode = e.parentNode;
                //console.log('Replace and disable ', e, value.path);
                parentNode.replaceChild(newElement, e);
                object[value.path] = newElement;
                this.enterDocumentElement(value, object);
                View.Counters.element.removed++;
            }
            else if (!isIncluded && isEnabled) {
                this.exitDocumentElement(value, object);
                var newElement = this.getElement(value, object);
                var parentNode = e.parentNode;
                //console.log('Replace and enable ', e, value.path);
                //console.log('Replace node on Comment ');
                parentNode.replaceChild(newElement, e);
                object[value.path] = newElement;
                View.Counters.element.removed++;
            }
            else {
            }
        };
        View.prototype.getFormattedMessage = function (value, data) {
            View.__formatter[value] = View.__formatter[value] ? View.__formatter[value] : this.getCompiledFormatter(value);
            return (View.__formatter[value](data));
        };
        View.prototype.getCompiledFormatter = function (value) {
            View.__messageFormat[this.locale] = View.__messageFormat[this.locale] ? View.__messageFormat[this.locale] : new MessageFormat(this.locale);
            return View.__messageFormat[this.locale].compile(value);
        };
        //------------------------------------------------------------------------------------------------
        // States
        //------------------------------------------------------------------------------------------------
        View.prototype.hasState = function (name) {
            return _.isBoolean(this._states[name]);
        };
        View.prototype.setStates = function (value) {
            var _this = this;
            _.each(value, function (v, k) { return _this.setState(k, v); }, this);
            return this;
        };
        View.prototype.setState = function (name, value) {
            if (!(name in this._states))
                return this;
            if (name in this._statesType)
                value = View.getTypedValue(value, this._statesType[name]);
            if (this._states[name] === value)
                return this;
            console.log('Set state ... ', name, value);
            this._states[name] = value;
            this.applyState(name, value);
            this.applyChildrenState(name, value);
            this.applyChangeStateElement(this.jsTemplate, this.elementPaths);
            return this;
        };
        View.prototype.getState = function (name) {
            return this._states[name];
        };
        View.prototype.applyState = function (name, value) {
            if (!this.dynamicProperties)
                return;
            if (this._inDocument)
                this.updateDynamicProperty(name, value);
        };
        View.prototype.applyChildrenState = function (name, value) {
        };
        View.prototype.applyChildState = function () {
        };
        Object.defineProperty(View.prototype, "avaibleInheritedStates", {
            get: function () {
                var _this = this;
                if (!this._avaibleInheritedStates) {
                    this._avaibleInheritedStates = _.filter(_.map(this._states, function (v, k) { return k; }), function (k) { return _this.inheritedStates.indexOf(k) > -1; }, this);
                }
                return this._avaibleInheritedStates;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "inheritedStates", {
            get: function () {
                return View.__inheritedStates;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "isSelected", {
            get: function () {
                return !!this.getState(fmvc.State.SELECTED);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "isHover", {
            get: function () {
                return !!this.getState(fmvc.State.HOVER);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "isFocused", {
            get: function () {
                return !!this.getState(fmvc.State.FOCUSED);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "isDisabled", {
            get: function () {
                return !!this.getState(fmvc.State.DISABLED);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "isOpen", {
            get: function () {
                return !!this.getState(fmvc.State.OPEN);
            },
            enumerable: true,
            configurable: true
        });
        //------------------------------------------------------------------------------------------------
        // VALIDATE
        //------------------------------------------------------------------------------------------------
        View.prototype.invalidate = function (type) {
            this._invalidate = this._invalidate | type;
            if (!this._invalidateTimeout)
                this._invalidateTimeout = setTimeout(this.invalidateHandler, 20);
        };
        View.prototype.invalidateHandler = function () {
            var _this = this;
            this.removeInvalidateTimeout();
            //console.log('invalid ' , this._invalidate , this._inDocument);
            if (!this._invalidate || !this._inDocument)
                return;
            if (this._invalidate & 1) {
                if (_.isObject(this.data))
                    this.updateData(this.data, 'data.', 2);
                else
                    this.updateDynamicProperty('data', this.data);
                this.updateApp();
            }
            if (this._invalidate & 2)
                _.each(this._states, function (value, key) { return value ? _this.applyState(key, value) : null; }, this);
            if (this._invalidate & 4) {
                this.updateChildren();
            }
            this._invalidate = 0;
        };
        View.prototype.removeInvalidateTimeout = function () {
            clearTimeout(this._invalidateTimeout);
            this._invalidateTimeout = null;
        };
        Object.defineProperty(View.prototype, "mediator", {
            get: function () {
                return this._mediator;
            },
            //------------------------------------------------------------------------------------------------
            // Mediator
            //------------------------------------------------------------------------------------------------
            set: function (value) {
                this._mediator = value;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.setMediator = function (value) {
            this._mediator = value;
            return this;
        };
        //------------------------------------------------------------------------------------------------
        // Children
        //------------------------------------------------------------------------------------------------
        View.prototype.forEachChild = function (value) {
            if (!this.childrenViews || !this.childrenViews.length) {
                return;
            }
            _.each(this.childrenViews, (value), this);
        };
        View.prototype.addChild = function (value) {
            this.childrenViews = this.childrenViews ? this.childrenViews : [];
            this.childrenViews.push(value);
            value.render(this.childrenContainer);
        };
        View.prototype.removeChildFrom = function (index) {
            if (!(this.childrenViews && this.childrenViews.length))
                return null;
            var result = this.childrenViews.splice(index); //_.filter(this.childrenViews, (view:View, key:number)=>(key>=index?view.dispose():null) );
            _.each(result, function (v) { return v.dispose(); });
            return result;
        };
        View.prototype.removeAllChildren = function () {
            _.each(this.childrenViews, function (view) { return view.dispose(); });
            var result = this.childrenViews;
            this.childrenViews = [];
            return result;
        };
        View.prototype.removeChildAt = function (value) {
        };
        Object.defineProperty(View.prototype, "data", {
            get: function () {
                return this._model ? this._model.data : (this._data === null ? View.__emptyData : this._data);
            },
            //------------------------------------------------------------------------------------------------
            // Data & model
            //------------------------------------------------------------------------------------------------
            set: function (value) {
                console.log('View %s set data %s', this.name, value);
                this._data = value;
                this.invalidate(1);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "model", {
            set: function (data) {
                this._model = data;
                this.data = data.data;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "app", {
            get: function () {
                return (this._mediator && this._mediator.facade) ? this._mediator.facade.model : null;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.setModel = function (value, listen) {
            this.model = value;
            if (listen)
                this._model.bind(this, this.modelHandler);
        };
        View.prototype.modelHandler = function (e) {
            console.log('modelHandler ', arguments, this._model);
            this.invalidate(1);
        };
        Object.defineProperty(View.prototype, "locale", {
            get: function () {
                return this._locale;
            },
            set: function (value) {
                this._locale = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "i18n", {
            get: function () {
                return this.jsTemplate && this.jsTemplate.i18n && this.locale ? this.jsTemplate.i18n[this.locale] : null;
            },
            enumerable: true,
            configurable: true
        });
        //------------------------------------------------------------------------------------------------
        // Local methods, overrides
        //------------------------------------------------------------------------------------------------
        View.prototype.sendEvent = function (name, data, sub, error, global) {
            if (data === void 0) { data = null; }
            if (sub === void 0) { sub = null; }
            if (error === void 0) { error = null; }
            if (global === void 0) { global = false; }
            if (this._mediator)
                this._mediator.internalHandler({ name: name, data: data, global: global, target: this });
        };
        View.prototype.log = function (message, level) {
            if (this._mediator)
                this._mediator.facade.logger.add(this.name, message, level);
            else {
                console.log('[c]', this.name, message, level);
            }
            return this;
        };
        // Overrided
        View.prototype.viewEventsHandler = function (name, e) {
            this.log('event ' + name);
            this.sendEvent(name, e);
        };
        //
        View.prototype.eventHandler = function (name, e) {
            console.log(e, e.currentTarget);
            this.viewEventsHandler(name, e);
        };
        // Overrided
        View.prototype.dispose = function () {
            if (this.model)
                this.model.unbind(this);
            this.exitDocument();
            if (this.element.parentNode)
                this.element.parentNode.removeChild(this.element);
            _super.prototype.dispose.call(this);
            return this;
        };
        Object.defineProperty(View.prototype, "dynamicProperties", {
            /* Overrided by generator */
            get: function () {
                return this.jsTemplate ? this.jsTemplate.dynamicSummary : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "isDynamicStylesAvaible", {
            get: function () {
                return !!(this.jsTemplate && this.jsTemplate.css);
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.isDynamicStylesEnabled = function (value) {
            if (!(this.jsTemplate && this.jsTemplate.css))
                return false;
            if (_.isBoolean(value))
                this.jsTemplate.css.enabled = value;
            return this.jsTemplate.css.enabled;
        };
        View.prototype.enableDynamicStyle = function (value) {
            var id = this.className + '__' + Math.random() + 'Style';
            if (this.isDynamicStylesAvaible && value && !this.isDynamicStylesEnabled()) {
                console.log(' *** enable dynamic style *** ', this.jsTemplate.css);
                var style = document.createElement('style');
                style.id = id; //@todo create method that setup className at the generator
                style.type = 'text/css';
                //style.cssText = this.dynamicStyle;
                style.innerHTML = this.dynamicStyle;
                document.getElementsByTagName('head')[0].appendChild(style);
                this.isDynamicStylesEnabled(true);
            }
        };
        Object.defineProperty(View.prototype, "dynamicStyle", {
            get: function () {
                return this.jsTemplate && this.jsTemplate.css ? this.jsTemplate.css.content : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "templateElement", {
            get: function () {
                this.elementPaths = {};
                return this.getElement(this.jsTemplate, this.elementPaths);
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.isStateEnabled = function (states) {
            return this.executeExpression(states);
        };
        View.prototype.executeEval = function (value) {
            return eval(value);
        };
        View.prototype.getVarValue = function (v, ex) {
            if (v.indexOf('data.') === 0) {
                var varName = v.replace('data.', '');
                return (this.data && this.data[varName]) ? this.data[varName] : null;
            }
            else if (v.indexOf('app.') === 0) {
                return eval('this.' + v);
            }
            else if (v.indexOf('$') === 0) {
                var varEx = ex.expressions[parseInt(v.replace('$', ''), 10)];
                return (typeof varEx === 'string') ? this.executeEval(varEx) : this.expr.executeExpression(this, varEx);
            }
            else if (v.indexOf('.') === -1 || v.indexOf('state.') === 0) {
                var varName = v.replace('state.', '');
                return this.getState(varName);
            }
            else
                throw new Error('Not supported variable in ' + this.name + ', ' + v);
        };
        View.prototype.getElement = function (value, object) {
            var e = null;
            var n = null;
            var isIncluded = value.states ? this.isStateEnabled(value.states) : true;
            if (isIncluded && value.type === fmvc.DomObjectType.TAG) {
                if (value.tagName.indexOf('.') > -1) {
                    //console.log('Create component, ' , value.tagName, value.path);
                    var componentPath = value.tagName.split('.');
                    var component = new (fmvc.global[componentPath[0]][componentPath[1]])();
                    component.mediator = this.mediator;
                    component.setStates(value.attribs);
                    this.componentPaths[value.path] = component;
                    if (value.link)
                        this[value.link] = component;
                    e = component.createDom().element;
                }
                else {
                    //console.log('Create element ', value.tagName, value.path);
                    e = document.createElement(value.tagName);
                    _.each(value.staticAttributes, function (v, key) {
                        e.setAttribute(key, v);
                    });
                }
                _.each(value.children, function (child, index) {
                    var ce = this.getElement(child, object);
                    if (ce)
                        e.appendChild(ce);
                }, this);
            }
            else if (value.type === fmvc.DomObjectType.TEXT)
                n = document.createTextNode((_.isString(value.data) ? value.data : ''));
            else
                n = document.createComment(value.path);
            View.Counters.element.added++;
            object[value.path] = e || n;
            return (e || n);
        };
        Object.defineProperty(View.prototype, "jsTemplate", {
            get: function () {
                return View.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "className", {
            get: function () {
                return View.__className;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "dispatcher", {
            get: function () {
                return View.dispatcher;
            },
            enumerable: true,
            configurable: true
        });
        View.getTypedValue = function (s, type) {
            switch (type) {
                case fmvc.Type.String:
                    return _.isString(s) ? s : String(s);
                case fmvc.Type.Int:
                    return parseInt(s, 10);
                case fmvc.Type.Float:
                    return parseFloat(s);
                case fmvc.Type.Boolean:
                    return !!(s === true || s === 'true');
            }
        };
        View.__isDynamicStylesEnabled = false;
        View.__jsTemplate = null;
        View.__formatter = {};
        View.__messageFormat = {};
        View.__className = 'View';
        View.__inheritedStates = [fmvc.State.DISABLED];
        View.__emptyData = {};
        View.Counters = { element: { added: 0, removed: 0, handlers: 0 }, update: { class: 0, data: 0, style: 0, other: 0 } };
        View.dispatcher = new fmvc.EventDispatcher();
        View.Name = 'View';
        return View;
    })(fmvc.Notifier);
    fmvc.View = View;
    var ViewHelper = (function () {
        function ViewHelper() {
        }
        ViewHelper.getId = function (name) {
            if (name === void 0) { name = View.Name; }
            return 'id_' + (View.Counters.element.handlers++);
        };
        ViewHelper.checkElementAttribute = function (el, name, value) {
            if (!el || !name)
                return;
            if (el.getAttribute(name) !== String(value)) {
                el.setAttribute(name, value);
            }
        };
        ViewHelper.setIfNotExistAttribute = function (el, name, value) {
            if (!el || !name)
                return;
            if (!el.getAttribute(name)) {
                el.setAttribute(name, value);
                return true;
            }
            return false;
        };
        ViewHelper.hhmmss = function (value) {
            value = parseInt(value);
            var hours = Math.floor(value / 3600);
            value -= hours * 3600;
            var minutes = Math.floor(value / 60);
            value -= minutes * 60;
            var seconds = Math.floor(value % 60);
            var hoursStr = String((hours < 10) ? "0" + hours : hours);
            var minutesStr = String((minutes < 10) ? "0" + minutes : minutes);
            var secondsStr = String((seconds < 10) ? "0" + seconds : seconds);
            var values = value >= 3600 ? [hoursStr, minutesStr, secondsStr] : [minutesStr, secondsStr];
            return values.join(":");
        };
        return ViewHelper;
    })();
    fmvc.ViewHelper = ViewHelper;
    setInterval(function () { console.log(JSON.stringify(View.Counters)); }, 3000);
})(fmvc || (fmvc = {}));
//# sourceMappingURL=view.js.map