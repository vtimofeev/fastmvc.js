var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    fmvc.State = {
        SELECTED: 'selected',
        HOVERED: 'hovered',
        FOCUSED: 'focused',
        DISABLED: 'disabled'
    };
    fmvc.DomObjectType = {
        TEXT: 'text',
        TAG: 'tag',
        COMMENT: 'comment'
    };
    var View = (function (_super) {
        __extends(View, _super);
        function View(name, $root) {
            _super.call(this, name, fmvc.TYPE_VIEW);
            this.dynamicPropertyValue = {}; // те которые были установлены
            this.elementPaths = {};
            // Invalidate properties
            this._invalidateTimeout = 0;
            this._invalidate = 0;
            this._inDocument = false;
            this._avaibleInheritedStates = null;
            this.$root = $root;
            this.init();
            this.invalidateHandler = this.invalidateHandler.bind(this);
        }
        // Init, overrided method
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
        //------------------------------------------------------------------------------------------------
        // Dom
        //------------------------------------------------------------------------------------------------
        View.prototype.createDom = function () {
            this.element = document.createElement('div');
            this.childrenContainer = this.element;
        };
        View.prototype.createElementPathLinks = function (element, data, root) {
            if (!data.path)
                return;
            var path = data.path.split(',');
            path.splice(0, 1);
            this.elementPaths[data.path] = this.getElementByPath(element, path, root);
            ////console.log('Create path for ' , data.path, this.elementPaths[data.path]);
            _.each(data.children, function (data) {
                this.createElementPathLinks(element, data);
            }, this);
        };
        View.prototype.createStates = function (states) {
            this._states = {};
            _.each(states, function (value) {
                this._states[value] = false;
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
            this.updateData();
        };
        View.prototype.updateData = function () {
            if (!this.dynamicProperties)
                return;
            if (!this.data)
                return;
            _.each(this.data, function (value, name) {
                if (_.isObject(value)) {
                }
                else {
                    var prefix = 'data.';
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
        View.prototype.getDataStringValue = function (propertyName, propertyValue, templateString) {
            return templateString.replace('{' + propertyName + '}', propertyValue);
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
                else {
                    _.each(valueOrValues, function (stringValue) {
                        var result = GetValue(name, value, stringValue);
                        r += result;
                        if (each)
                            this.updatePathProperty(path, type, value, stringValue);
                    }, this);
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
            this._inDocument = true;
            if (!this.isDynamicStylesEnabled())
                this.enableDynamicStyle(true);
            var t = this;
            if (this.hasState('hover')) {
                this.element.addEventListener('mouseover', function () { return t.setState('hover', true); });
                this.element.addEventListener('mouseout', function () { return t.setState('hover', false); });
            }
            if (this.hasState('selected')) {
                this.element.addEventListener('click', function () { return t.setState('selected', !t.getState('selected')); });
            }
            this.delegateEventHandlers(true);
        };
        View.prototype.exitDocument = function () {
            this._inDocument = false;
            this.delegateEventHandlers(false);
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
                return;
            if (this._states[name] === value)
                return;
            this._states[name] = value;
            this.applyState(name, value);
            this.applyChildrenState(name, value);
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
                return this._avaibleInheritedStates ? this._avaibleInheritedStates : (this._avaibleInheritedStates = _.filter(_.map(this._states, function (v, k) { return k; }), function (k) { return this.inheritedStates.indexOf(k) > -1; }, this), this);
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
        View.prototype.isHovered = function () {
            return !!this.getState(fmvc.State.HOVERED);
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
            this.removeInvalidateTimeout();
            this._invalidate = this._invalidate | type;
            //this._invalidateTimeout = setTimeout(this.invalidateHandler, 20);
            this.invalidateHandler();
        };
        View.prototype.invalidateHandler = function () {
            this.removeInvalidateTimeout();
            //console.log('invalid ' , this._invalidate , this._inDocument);
            if (!this._invalidate || !this._inDocument)
                return;
            if (this._invalidate & 1)
                this.updateData();
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
            if (!this.childrenViews || !this.childrenViews.length)
                ;
            _.each(this.childrenViews, value, this);
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
                ////console.log('View: set data' , value);
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
            if (_.isBoolean(value))
                View.__isDynamicStylesEnabled = value;
            return View.__isDynamicStylesEnabled;
        };
        View.prototype.enableDynamicStyle = function (value) {
            var id = this.className + '__' + Math.random() + 'Style';
            if (value && !this.isDynamicStylesEnabled()) {
                ////console.log(' *** enable dynamic style *** ');
                var style = document.createElement('style');
                style.id = id; //@todo create method that setup className at the generator
                style.type = 'text/css';
                style.cssText = this.dynamicStyle;
                style.innerHTML = this.dynamicStyle;
                document.getElementsByTagName('head')[0].appendChild(style);
                this.isDynamicStylesEnabled(true);
            }
        };
        Object.defineProperty(View.prototype, "dynamicStyle", {
            get: function () {
                return this.jsTemplate ? this.jsTemplate.css : null;
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
        View.prototype.getElement = function (value, object) {
            var e = null;
            if (value.type === fmvc.DomObjectType.TAG) {
                e = document.createElement(value.tagName);
                _.each(value.staticAttributes, function (v) { e.setAttribute(v.name, v.value); });
                _.each(value.children, function (child, index) {
                    var ce = this.getElement(child, object);
                    if (ce)
                        e.appendChild(ce);
                }, this);
            }
            else if (value.type === fmvc.DomObjectType.TEXT)
                e = document.createTextNode(value.data || '');
            else
                e = document.createComment(value.path);
            object[value.path] = e;
            return e;
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
        View.__isDynamicStylesEnabled = false;
        View.__dynamicStyle = null;
        View.__dynamicStyleElement = null;
        View.__dynamicProperties = null;
        View.__element = null;
        View.__jsTemplate = null;
        View.__className = 'ViewClassName';
        View.__inheritedStates = [fmvc.State.DISABLED];
        return View;
    })(fmvc.Notifier);
    fmvc.View = View;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=view.js.map