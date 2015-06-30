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
    /*
    export var BrowserEvent = {
        CLICK: 'click',
        MOUSEOVER: 'mouseover',
        MOUSEOUT: 'mouseout'
    };
    */
    fmvc.State = {
        SELECTED: 'selected',
        HOVER: 'hover',
        FOCUSED: 'focused',
        DISABLED: 'disabled'
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
            _.bindAll(this, 'getDataStringValue', 'applyEventHandlers', 'invalidateHandler', 'getDataObjectValue');
            this.template = this.jsTemplate;
            if (modelOrData) {
                if (modelOrData.type === fmvc.TYPE_MODEL)
                    this.model = modelOrData;
                else
                    this.data = modelOrData;
            }
            this.initTemplate(jsTemplate);
            this.init();
            this.invalidateHandler = this.invalidateHandler.bind(this);
        }
        View.prototype.initTemplate = function (templateExtention) {
            if (templateExtention)
                this.template = (_.extend(_.clone(this.template), templateExtention));
            console.log('template: ', this.template);
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
                    this._states[ivalue.name] = ivalue.value;
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
                    //console.log('Set data ' , prefix + name);
                    this.dynamicProperties[prefix + name] ? this.updateDynamicProperty(prefix + name, value) : null;
                }
            }, this);
        };
        // @todo
        View.prototype.getStyleValue = function (name) {
        };
        View.prototype.getClassStringValue = function (propertyName, propertyValue, templateString) {
            if (_.isBoolean(propertyValue)) {
                return templateString.replace('{' + propertyName + '}', propertyName);
            }
            else {
                return templateString.replace('{' + propertyName + '}', propertyValue);
            }
        };
        View.prototype.getDataStringValue = function (propertyName, propertyValue, templateStringOrObject) {
            if (_.isString(templateStringOrObject)) {
                return templateStringOrObject.replace('{' + propertyName + '}', propertyValue);
            }
            else if (_.isObject(templateStringOrObject)) {
                return this.getDataObjectValue(propertyName, propertyValue, templateStringOrObject);
            }
        };
        View.prototype.executeComplexFilter = function (filterArrayData, value) {
        };
        View.prototype.executeFilter = function (filter, value) {
            switch (filter) {
                case fmvc.Filter.FIRST:
                    return 'first:' + value;
                    break;
                case fmvc.Filter.SECOND:
                    return 'second:' + value;
                    break;
            }
            return value;
        };
        View.prototype.getDataObjectValue = function (propertyName, propertyValue, templateObject) {
            var getFilterValue = function (reducedValue, filter) {
                if (_.isArray(filter)) {
                    if (filter[0] === 'i18n') {
                        var secondName = filter[1];
                        if (!this.i18n[secondName])
                            return 'Error:View.getDataObjectValue has no i18n property';
                        var data = {};
                        _.each(templateObject.args, function (value, key) {
                            if (value)
                                data[key] = this.data[value.replace('data.', '')];
                        }, this);
                        var result = this.getFormattedMessage(this.i18n[secondName], data);
                        return templateObject.source.replace('{replace}', result);
                    }
                    else {
                        return this.executeComplexFilter(filter, reducedValue);
                    }
                }
                else {
                    return this.executeFilter(filter, reducedValue);
                }
            };
            return _.reduce(templateObject.filters, getFilterValue, propertyValue, this);
        };
        View.prototype.updatePaths = function (paths, type, name, value, GetValue, each) {
            _.each(paths, function (valueOrValues, path) {
                var r = '';
                if (_.isString(valueOrValues)) {
                    var result = GetValue(name, value, valueOrValues);
                    r += result;
                    if (each)
                        this.updatePathProperty(path, type, value, result);
                }
                else if (_.isArray(valueOrValues)) {
                    _.each(valueOrValues, function (stringValue) {
                        var result = GetValue(name, value, stringValue);
                        r += result;
                        if (each)
                            this.updatePathProperty(path, type, value, stringValue);
                    }, this);
                }
                else if (_.isObject(valueOrValues)) {
                    var result = GetValue(name, value, valueOrValues);
                    r += result;
                    if (each)
                        this.updatePathProperty(path, type, value, result);
                }
                if (!each)
                    this.updatePathProperty(path, type, value, r);
            }, this);
        };
        View.prototype.updateDynamicProperty = function (name, value) {
            var domPropsObject = this.dynamicProperties[name];
            this.dynamicPropertyValue[name] = value;
            if (!domPropsObject)
                return;
            //console.log('Update dyn prop: ', domPropsObject, name, value);
            _.each(domPropsObject, function (pathsAndValues, type) {
                var GetValue = null;
                var each = false;
                switch (type) {
                    case 'class':
                        GetValue = this.getClassStringValue;
                        each = true;
                        break;
                    case 'style':
                        GetValue = this.getClassStringValue; //resultValue.replace('{' + name + '}', _.isBoolean(value) ? name : resultValue);
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
        View.prototype.updatePathProperty = function (path, type, value, resultValue) {
            var element = this.elementPaths[path];
            if (!(element && element.nodeType !== 8 /* comment */))
                return; // virtual element or comment
            //console.log('updated element ', path, type, value);
            switch (type) {
                case 'class':
                    element.classList.toggle(resultValue, value);
                    break;
                case 'style':
                    var style = resultValue.split(':');
                    var propName = style[0].trim();
                    element.style[propName] = style[1].trim();
                    break;
                case 'data':
                    //console.log('Set data ', element, element.nodeType, element.textContent);
                    if (element.nodeType === 3 && element.textContent != resultValue)
                        element.textContent = resultValue;
                    break;
                default:
                    element.setAttribute(type, resultValue);
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
            if (this._inDocument)
                return;
            this._inDocument = true;
            var t = this;
            if (!this.isDynamicStylesEnabled())
                this.enableDynamicStyle(true);
            ViewHelper.checkElementAttribute(this.element, 'id', this.id);
            if (this.hasState(fmvc.State.HOVER)) {
                this.dispatcher.listen(this.element, fmvc.BrowserEvent.MOUSEOVER, function () { return t.setState(fmvc.State.HOVER, true); });
                this.dispatcher.listen(this.element, fmvc.BrowserEvent.MOUSEOUT, function () { return t.setState(fmvc.State.HOVER, false); });
            }
            if (this.hasState(fmvc.State.SELECTED)) {
                this.dispatcher.listen(this.element, fmvc.BrowserEvent.CLICK, function () { return t.setState(fmvc.State.SELECTED, !t.getState(fmvc.State.SELECTED)); });
            }
            this.enterDocumentElement(this.jsTemplate, this.elementPaths);
            this.invalidate(1);
        };
        View.prototype.applyEventHandlers = function (e) {
            var path = e.target.getAttribute('data-path');
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
            console.log('Event to handle ', name);
        };
        View.prototype.enterDocumentElement = function (value, object) {
            if (!value || !object)
                return;
            var path = value.path;
            var e = object[value.path];
            var isTag = e.nodeType === 1;
            var c = this.componentPaths[value.path];
            if (c)
                c.enterDocument();
            if (value.type === fmvc.DomObjectType.TAG && isTag) {
                //console.log('EnterDocument ', value.tagName, value.path);
                _.each(value.children, function (child, index) {
                    this.enterDocumentElement(child, object);
                }, this);
                // add global handlers if not exist
                if (value.handlers) {
                    var id = value.staticAttributes ? value.staticAttributes['id'] : null || ViewHelper.getId();
                    ViewHelper.checkElementAttribute(e, 'id', id);
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
            var isEnabled = (e.nodeType === 1);
            //console.log('path, included, enabled ', value.tagName, value.path, isIncluded, isEnabled);
            if (isIncluded && !isEnabled) {
                var newElement = this.getElement(value, object);
                var parentNode = e.parentNode;
                //console.log('Replace node on Real ');
                parentNode.replaceChild(newElement, e);
                object[value.path] = newElement;
                this.enterDocumentElement(value, object);
                View.Counters.element.removed++;
            }
            else if (!isIncluded && isEnabled) {
                this.exitDocumentElement(value, object);
                var newElement = this.getElement(value, object);
                var parentNode = e.parentNode;
                //console.log('Replace node on Comment ');
                parentNode.replaceChild(newElement, e);
                object[value.path] = newElement;
                View.Counters.element.removed++;
            }
            else {
            }
        };
        View.prototype.exitDocument = function () {
            this._inDocument = false;
            this.delegateEventHandlers(false);
        };
        View.prototype.getFormattedMessage = function (value, data) {
            View.__formatter[value] = View.__formatter[value] ? View.__formatter[value] : this.getCompiledFormatter(value);
            return (View.__formatter[value](data));
        };
        View.prototype.getCompiledFormatter = function (value) {
            View.__messageFormat[this.locale] = View.__messageFormat[this.locale] ? View.__messageFormat[this.locale] : new MessageFormat(this.locale);
            return View.__messageFormat[this.locale].compile(value);
        };
        View.prototype.delegateEventHandlers = function (init) {
            /*
             private eventHandlers:any[];

             private static delegateEventSplitter = /^(\S+)\s*(.*)$/;
             var _t:View = this;
             this.log('Events: ' + (JSON.stringify(this.eventHandlers)));

             for (var commonHandlerData in this.eventHandlers) {
             var eventName:string = this.eventHandlers[commonHandlerData];
             var match:any = commonHandlerData.match(View.delegateEventSplitter);
             var handledEvents:string = match[1];
             var selector:string = match[2];

             // add handlers
             if (init) {
             this.log('Add listeners [' + handledEvents + '] of the [' + selector + ']');
             var eventClosure = function (name) {
             return function (e) {
             _t.eventHandler(name, e);
             };
             }(eventName);
             if (selector === '') {
             this.$root.on(handledEvents, eventClosure);
             } else {
             this.$root.on(handledEvents, selector, eventClosure);
             }
             }
             // remove handlers
             else {
             if (selector === '') {
             this.$root.off(handledEvents);
             } else {
             this.$root(selector).on(handledEvents, selector);
             }
             }
             }
             */
        };
        //------------------------------------------------------------------------------------------------
        // States
        //------------------------------------------------------------------------------------------------
        View.prototype.hasState = function (name) {
            return _.isBoolean(this._states[name]);
        };
        View.prototype.setState = function (name, value) {
            if (!(name in this._states))
                return this;
            if (name in this._statesType)
                value = View.getTypedValue(value, this._statesType[name]);
            if (this._states[name] === value)
                return this;
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
                if (!this._avaibleInheritedStates) {
                    this._avaibleInheritedStates = _.filter(_.map(this._states, function (v, k) {
                        return k;
                    }), function (k) {
                        return this.inheritedStates.indexOf(k) > -1;
                    }, this);
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
        View.prototype.isSelected = function () {
            return !!this.getState(fmvc.State.SELECTED);
        };
        View.prototype.isHover = function () {
            return !!this.getState(fmvc.State.HOVER);
        };
        View.prototype.isFocused = function () {
            return !!this.getState(fmvc.State.FOCUSED);
        };
        View.prototype.isDisabled = function () {
            return !!this.getState(fmvc.State.DISABLED);
        };
        //------------------------------------------------------------------------------------------------
        // VALIDATE
        //------------------------------------------------------------------------------------------------
        View.prototype.invalidate = function (type) {
            this._invalidate = this._invalidate | type;
            if (!this._invalidateTimeout)
                this._invalidateTimeout = setTimeout(this.invalidateHandler, 20);
        };
        View.prototype.invalidateHandler = function () {
            this.removeInvalidateTimeout();
            //console.log('invalid ' , this._invalidate , this._inDocument);
            if (!this._invalidate || !this._inDocument)
                return;
            if (this._invalidate & 1)
                this.updateData(this.data, 'data.', 2);
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
        View.prototype.removeChild = function (value) {
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
                return this._data;
            },
            //------------------------------------------------------------------------------------------------
            // Data & model
            //------------------------------------------------------------------------------------------------
            set: function (value) {
                //console.log('View: set data' , value);
                this._data = value;
                this.invalidate(1);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "model", {
            get: function () {
                return this._model;
            },
            set: function (data) {
                this._model = data;
                this.data = data.data;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.setModelWithListener = function (value) {
            this.model = value;
            this.model.bind(true, this, this.modelHandler);
        };
        View.prototype.modelHandler = function (name, data) {
            this.log('modelHandler ' + name);
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
                this._mediator.facade.sendLog(this.name, message, level);
        };
        // Overrided
        View.prototype.viewEventsHandler = function (name, e) {
            this.log('event ' + name);
            this.sendEvent(name, e);
        };
        //
        View.prototype.eventHandler = function (name, e) {
            this.viewEventsHandler(name, e);
        };
        // Overrided
        View.prototype.dispose = function () {
            if (this.model)
                this.model.bind(false, this, this.modelHandler);
            this.delegateEventHandlers(false);
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(View.prototype, "dynamicProperties", {
            /* Overrided by generator */
            get: function () {
                return this.jsTemplate ? this.jsTemplate.dynamicSummary : null;
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
            if (value && !this.isDynamicStylesEnabled()) {
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
            var statesLength = states.length;
            for (var i = 0; i < statesLength; i++) {
                var stateValue = states[i];
                return _.isArray(stateValue) ? this.getState(stateValue[0]) === stateValue[1] : !!this.getState(states[i]);
            }
            return false;
        };
        View.prototype.getElement = function (value, object) {
            var e = null;
            var n = null;
            var isIncluded = value.states ? this.isStateEnabled(value.states) : true;
            if (isIncluded && value.type === fmvc.DomObjectType.TAG) {
                if (value.tagName.indexOf('.') > -1) {
                    //console.log('Create component, ' + value.tagName);
                    var component = new (fmvc.global.ui[value.tagName.split('.')[1]])();
                    this.componentPaths[value.path] = component;
                    e = component.createDom().element;
                }
                else {
                    e = document.createElement(value.tagName);
                    _.each(value.staticAttributes, function (v, key) {
                        e.setAttribute(key, v);
                    });
                    if (value.handlers || String(value.path) === '0')
                        e.setAttribute('id', 'id-' + View.Counters.element.added);
                }
                _.each(value.children, function (child, index) {
                    var ce = this.getElement(child, object);
                    if (ce)
                        e.appendChild(ce);
                }, this);
            }
            else if (value.type === fmvc.DomObjectType.TEXT)
                n = document.createTextNode(value.data || '');
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
        View.Counters = { element: { added: 0, removed: 0, handlers: 0 } };
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
            if (el.getAttribute(name) !== String(value))
                el.setAttribute(name, value);
        };
        return ViewHelper;
    })();
    fmvc.ViewHelper = ViewHelper;
    setInterval(function () { console.log(JSON.stringify(View.Counters)); }, 3000);
})(fmvc || (fmvc = {}));
//# sourceMappingURL=view.js.map