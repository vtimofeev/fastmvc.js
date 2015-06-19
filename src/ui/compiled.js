var fmvc;
(function (fmvc) {
    var Event = (function () {
        function Event() {
        }
        Event.MODEL_CHANGED = 'model.changed';
        Event.MODEL_CREATED = 'model.created';
        Event.MODEL_VALIDATED = 'model.validated';
        Event.MODEL_ADDED = 'model.added';
        Event.MODEL_UPDATED = 'model.updated';
        Event.MODEL_DELETED = 'model.deleted';
        return Event;
    })();
    fmvc.Event = Event;
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    fmvc.VERSION = '0.6.1';
    fmvc.TYPE_MEDIATOR = 'mediator';
    fmvc.TYPE_MODEL = 'model';
    fmvc.TYPE_VIEW = 'view';
    var Facade = (function () {
        function Facade(name) {
            this._name = '';
            this._objects = [];
            this._events = {};
            this._name = name;
            //this._logger = new fmvc.Logger(this, 'Log');
            //this.log('Start ' + name + ', fmvc ' + fmvc.VERSION);
            Facade._facades.push(name);
        }
        Facade.prototype.register = function (object) {
            object.facade(this);
            this.log('Register ' + object.name);
            if (this._objects.indexOf(object) < 0) {
                this._objects.push(object);
                if (object && ('events' in object)) {
                    var events = object.events();
                    for (var i in events) {
                        var event = events[i];
                        this.log('Add event listener ' + object.name);
                        if (this._events[event]) {
                            this._events[event].push(object);
                        }
                        else {
                            this._events[event] = [object];
                        }
                    }
                }
            }
        };
        Facade.prototype.getLogger = function () {
            return this._logger;
        };
        Facade.prototype.getObject = function (name) {
            for (var i in this._objects) {
                var object = this._objects[i];
                if (object && object.name === name)
                    return object;
            }
            return null;
        };
        Facade.prototype.eventHandler = function (e) {
            var objects = this._events[e.name];
            for (var i in objects) {
                var object = objects[i];
                object.eventHandler(e);
            }
        };
        Facade.prototype.log = function (message, level) {
            this.sendLog(this._name, message, level);
        };
        Facade.prototype.sendLog = function (name, message, level) {
            this._logger.saveLog(name, message, level);
        };
        Facade._facades = [];
        return Facade;
    })();
    fmvc.Facade = Facade;
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var Notifier = (function () {
        function Notifier(name, type) {
            if (type === void 0) { type = null; }
            this._disposed = false;
            this._name = name;
            this._type = type ? type : fmvc.TYPE_MODEL;
        }
        Object.defineProperty(Notifier.prototype, "facade", {
            get: function () {
                return this._facade;
            },
            set: function (value) {
                if (value) {
                    this._facade = value;
                    this.registerHandler();
                }
                else {
                    this.removeHandler();
                    this._facade = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Notifier.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Notifier.prototype, "disposed", {
            get: function () {
                return this._disposed;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Notifier.prototype, "type", {
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        Notifier.prototype.sendEvent = function (name, data, sub, error, log) {
            if (data === void 0) { data = null; }
            if (sub === void 0) { sub = null; }
            if (error === void 0) { error = null; }
            if (log === void 0) { log = true; }
            var e = { name: name, sub: sub, data: data, error: error, target: this };
            if (log)
                this.log('Send event ' + name);
            if (this._facade)
                this._facade.eventHandler(e);
            if (this._listeners && this._listeners.length)
                this.sendToListners(name, data);
        };
        Notifier.prototype.log = function (message, level) {
            // log messages
            if (this._facade)
                this._facade.sendLog(this.name, message, level);
        };
        Notifier.prototype.registerHandler = function () {
        };
        Notifier.prototype.removeHandler = function () {
        };
        Notifier.prototype.addListener = function (object, handler) {
            if (!this._listeners)
                this._listeners = [];
            this._listeners.push({ target: object, handler: handler });
        };
        Notifier.prototype.bind = function (bind, object, handler) {
            if (bind)
                this.addListener(object, handler);
            else
                this.removeListener(object, handler);
        };
        Notifier.prototype.removeListener = function (object, handler) {
            var deleted = 0;
            this._listeners.forEach(function (lo, i) {
                if (lo.target === object) {
                    this.splice(i - deleted, 1);
                    deleted++;
                }
            }, this._listeners);
        };
        Notifier.prototype.removeAllListeners = function () {
            this._listeners = null;
        };
        Notifier.prototype.sendToListners = function (event, data) {
            this._listeners.forEach(function (lo) {
                if (!lo.target.disposed)
                    (lo.handler).apply(lo.target, [event, data]);
            });
        };
        Notifier.prototype.dispose = function () {
            this.facade = null;
            this._listeners = null;
            this._disposed = true;
        };
        return Notifier;
    })();
    fmvc.Notifier = Notifier;
})(fmvc || (fmvc = {}));
/**
 * Created by Vasily on 19.06.2015.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var EventDispatcher = (function (_super) {
        __extends(EventDispatcher, _super);
        function EventDispatcher() {
            _super.call(this, EventDispatcher.NAME, 'controller');
            this.elementHashMap = {};
            this.windowHashMap = {};
            _.bindAll(this, 'windowHandler');
        }
        EventDispatcher.prototype.listen = function (el, type, handler) {
            var id = el.getAttribute('id');
            if (!id || !type || !handler)
                return;
            var uid = id + ':' + type;
            if (!this.windowHashMap[type])
                this.createWindowListener(type);
            if (!this.elementHashMap[uid])
                this.elementHashMap[uid] = handler;
        };
        EventDispatcher.prototype.unlisten = function (el, type) {
            var id = el.getAttribute('id');
            var uid = id + ':' + type;
            if (!id)
                return;
            delete this.elementHashMap[uid];
        };
        EventDispatcher.prototype.windowHandler = function (e) {
            var id = e.target.getAttribute('id');
            var uid = id + ':' + e.type;
            if (this.elementHashMap[uid])
                this.elementHashMap[uid](e);
        };
        EventDispatcher.prototype.createWindowListener = function (type) {
            console.log('listen window');
            window.addEventListener(type, this.windowHandler, true);
        };
        EventDispatcher.NAME = 'EventDispatcher';
        return EventDispatcher;
    })(fmvc.Notifier);
    fmvc.EventDispatcher = EventDispatcher;
})(fmvc || (fmvc = {}));
var fmvc;
(function (fmvc) {
    var Logger = (function (_super) {
        __extends(Logger, _super);
        function Logger(facade, name) {
            _super.call(this, name);
            this._data = [];
            this._config = { filter: [], length: 100000, console: true };
            this._modules = [];
            console.log('Construct facade logger ');
            this.facade = facade;
        }
        Logger.prototype.setConfig = function (value) {
            this._config = value;
        };
        Logger.prototype.console = function (value) {
            this._config.console = value;
        };
        Logger.prototype.setFilter = function (value) {
            this._config.filter = value;
        };
        Logger.prototype.modules = function () {
            return this._modules;
        };
        Logger.prototype.saveLog = function (name, message, level) {
            if (level === void 0) { level = 0; }
            var data = { name: name, message: message, level: level, date: new Date() };
            this._data.push(data);
            // clean logs
            if (this._data.length > this._config.length * 2) {
                this._data.length = this._data.slice(this._config.length);
            }
            if (this._modules.indexOf(name) === -1) {
                this._modules.push(name);
            }
            // send log event
            // exit if it has filters and has no the name in the array
            if (this._config && this._config.filter && this._config.filter.length && this._config.filter.indexOf(name) === -1) {
                return;
            }
            // console
            if (this._config && this._config.console && ('console' in window)) {
                console.log('[' + name + '] ' + level + ' ' + message);
            }
            // log
            this.sendEvent('log', data, null, null, false);
            return;
        };
        return Logger;
    })(fmvc.Notifier);
    fmvc.Logger = Logger;
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(name, data, isEvents) {
            if (data === void 0) { data = {}; }
            if (isEvents === void 0) { isEvents = true; }
            _super.call(this, name);
            this._data = data;
            this._isEvents = isEvents;
            if (isEvents)
                this.sendEvent(fmvc.Event.MODEL_CREATED, this.data);
        }
        Object.defineProperty(Model.prototype, "data", {
            get: function () {
                return this._data;
            },
            set: function (value) {
                var data = this._data;
                var changedFields = null;
                var hasChanges = false;
                if (data) {
                    for (var i in value) {
                        if (data[i] != value[i]) {
                            if (!changedFields)
                                changedFields = [];
                            changedFields.push(i);
                            hasChanges = true;
                            data[i] = value[i];
                        }
                    }
                }
                else {
                    this._data = value;
                }
                if (hasChanges && this._isEvents)
                    this.sendEvent(fmvc.Event.MODEL_CHANGED, this._data);
            },
            enumerable: true,
            configurable: true
        });
        Model.prototype.addValidator = function (value) {
            this._validators = this._validators ? this._validators : [];
            if (this._validators.indexOf(value) >= 0)
                throw 'Cant add validator to model';
            this._validators.push(value);
        };
        Model.prototype.removeValidator = function (value) {
            var index = this._validators ? this._validators.indexOf(value) : -1;
            if (index >= 0)
                this._validators.splice(index, 1);
        };
        Model.prototype.validate = function (value) {
            var result = false;
            var error = {};
            for (var i in this._validators) {
                var validator = this._validators[i];
                value = validator.execute(value);
                if (!value) {
                    result = false;
                    break;
                }
            }
            this.sendEvent(fmvc.Event.MODEL_VALIDATED, result, null, error);
            return result;
        };
        Model.prototype.destroy = function () {
        };
        return Model;
    })(fmvc.Notifier);
    fmvc.Model = Model;
    var Validator = (function () {
        function Validator(name, fnc) {
            this.name = null;
            this.fnc = null;
            this.name = name;
            this.fnc = fnc;
        }
        Validator.prototype.execute = function (data) {
            this.fnc.call(data, data);
        };
        return Validator;
    })();
    fmvc.Validator = Validator;
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var ModelList = (function (_super) {
        __extends(ModelList, _super);
        function ModelList(name, data) {
            if (data === void 0) { data = null; }
            _super.call(this, name);
            this.data = data;
        }
        Object.defineProperty(ModelList.prototype, "data", {
            get: function () {
                return this._data;
            },
            set: function (value) {
                if (!this._data)
                    this._data = [];
                for (var i in value) {
                    this._data.push(this.createModel(value[i]));
                }
                this.sendEvent(fmvc.Event.MODEL_CHANGED, this.data);
            },
            enumerable: true,
            configurable: true
        });
        ModelList.prototype.createModel = function (value) {
            return new fmvc.Model(this.name + '-item', value);
        };
        ModelList.prototype.add = function (value) {
            this._data.push(this.createModel(value));
            this.sendEvent(fmvc.Event.MODEL_CHANGED, this.data);
            return true;
        };
        ModelList.prototype.remove = function (value) {
            var data = this._data;
            var result = false;
            var index = data.indexOf(value);
            if (index > -1) {
                data.splice(index, 1);
                result = true;
            }
            this.sendEvent(fmvc.Event.MODEL_CHANGED, this.data);
            return result;
        };
        ModelList.prototype.update = function (value) {
            var data = this._data;
            var result = false;
            var index = this.getIndexOfModelData(value);
            if (index > -1) {
                data[index].setData(value);
                result = true;
            }
            this.sendEvent(fmvc.Event.MODEL_CHANGED, this.data);
            return result;
        };
        ModelList.prototype.getIndexOfModelData = function (value) {
            for (var i in this._data) {
                var model = this._data[i];
                console.log('Check ' + model.data + ', ' + value);
                if (model.data === value)
                    return Number(i);
            }
            return -1;
        };
        return ModelList;
    })(fmvc.Notifier);
    fmvc.ModelList = ModelList;
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    fmvc.BrowserEvent = {
        CLICK: 'click',
        MOUSEOVER: 'mouseover',
        MOUSEOUT: 'mouseout'
    };
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
        function View(name, $root) {
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
            _.bindAll(this, 'getDataStringValue', 'applyEventHandlers', 'invalidateHandler', 'getDataObjectValue');
            this.$root = $root;
            this.init();
            this.invalidateHandler = this.invalidateHandler.bind(this);
        }
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
        //------------------------------------------------------------------------------------------------
        // Dom
        //------------------------------------------------------------------------------------------------
        View.prototype.createDom = function () {
            this.element = document.createElement('div');
            this.childrenContainer = this.element;
            return this;
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
            if (!(element && element.nodeType !== 8))
                return; // virtual element or comment
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
            if (!this.isDynamicStylesEnabled())
                this.enableDynamicStyle(true);
            var t = this;
            if (this.hasState(fmvc.State.HOVER)) {
                //this.element.addEventListener(BrowserEvent.MOUSEOVER, ()=>t.setState(State.HOVER, true));
                //this.element.addEventListener(BrowserEvent.MOUSEOUT, ()=>t.setState(State.HOVER, false));
                this.dispatcher.listen(this.element, fmvc.BrowserEvent.MOUSEOVER, function () { return t.setState(fmvc.State.HOVER, true); });
                this.dispatcher.listen(this.element, fmvc.BrowserEvent.MOUSEOUT, function () { return t.setState(fmvc.State.HOVER, false); });
            }
            if (this.hasState(fmvc.State.SELECTED)) {
                //this.element.addEventListener(BrowserEvent.CLICK, ()=>t.setState(State.SELECTED, !t.getState(State.SELECTED)));
                this.dispatcher.listen(this.element, fmvc.BrowserEvent.CLICK, function () { return t.setState(fmvc.State.SELECTED, false); });
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
                            //console.log('remove listener ', e, value.tagName, path, eventType);
                            //e.removeEventListener(eventType, this.applyEventHandlers);
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
                return;
            if (this._states[name] === value)
                return;
            this._states[name] = value;
            this.applyState(name, value);
            this.applyChildrenState(name, value);
            this.applyChangeStateElement(this.jsTemplate, this.elementPaths);
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
                return null;
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
                //style.cssText = this.dynamicStyle;
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
                    var component = new (ui[value.tagName.split('.')[1]])();
                    this.componentPaths[value.path] = component;
                    e = component.createDom().element;
                }
                else {
                    e = document.createElement(value.tagName);
                    _.each(value.staticAttributes, function (v) {
                        e.setAttribute(v.name, v.value);
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
        View.__isDynamicStylesEnabled = false;
        View.__jsTemplate = null;
        View.__formatter = {};
        View.__messageFormat = {};
        View.__className = 'View';
        View.__inheritedStates = [fmvc.State.DISABLED];
        View.Counters = { element: { added: 0, removed: 0 } };
        View.dispatcher = new fmvc.EventDispatcher();
        return View;
    })(fmvc.Notifier);
    fmvc.View = View;
    setInterval(function () {
        console.log(JSON.stringify(View.Counters));
    }, 3000);
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var ViewList = (function (_super) {
        __extends(ViewList, _super);
        function ViewList(name, $root) {
            _super.call(this, name, $root);
        }
        Object.defineProperty(ViewList.prototype, "childrenConstructor", {
            set: function (value) {
                this.ChildrenConstructor = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewList.prototype, "dataset", {
            get: function () {
                return this._dataset;
            },
            set: function (value) {
                this._dataset = value;
                this.invalidate(8);
            },
            enumerable: true,
            configurable: true
        });
        ViewList.prototype.applyChildrenState = function (name, value) {
            if (!this.avaibleInheritedStates || this.avaibleInheritedStates.indexOf(name) === -1)
                return;
            this.forEachChild(function (view, index) {
                this.applyViewState(name, value, view, index);
            });
        };
        ViewList.prototype.applyViewState = function (name, value, view, index) {
            view.setState(name, value);
        };
        ViewList.prototype.updateChildren = function () {
            if (!this.inDocument)
                return;
            var children = this.removeAllChildren() || [];
            _.each(this.dataset, function (value, index) {
                var view = children[index] || new this.ChildrenConstructor();
                view.data = value;
                _.each(this.avaibleInheritedStates, function (name) {
                    view.setState(name, this.getState(name));
                }, this);
                if (!view.inDocument) {
                    this.addChild(view);
                }
            }, this);
        };
        return ViewList;
    })(fmvc.View);
    fmvc.ViewList = ViewList;
})(fmvc || (fmvc = {}));
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var Mediator = (function (_super) {
        __extends(Mediator, _super);
        function Mediator(facade, name, views) {
            if (views === void 0) { views = null; }
            _super.call(this, name, fmvc.TYPE_MEDIATOR);
            this.facade = facade;
            this.initViews(views);
        }
        Mediator.prototype.initViews = function (views) {
            if (views) {
                if (views.length) {
                    for (var i in views) {
                        this.initView(views[i]);
                    }
                    this.views = views;
                }
                else {
                    this.initView(views);
                    this.views = [views];
                }
            }
            else {
                this.log('Has no views on init');
            }
        };
        Mediator.prototype.initView = function (view) {
            this.log('Init view ' + view.name);
            view.mediator = this;
            view.init();
        };
        Mediator.prototype.getView = function (name) {
            for (var i in this.views) {
                if (this.views[i].name() == name)
                    return this.views[i];
            }
            return null;
        };
        Mediator.prototype.events = function () {
            return [];
        };
        Mediator.prototype.internalHandler = function (e) {
            if (e && e.global) {
                this.facade.eventHandler(e);
            }
            else {
                this.eventHandler(e);
            }
        };
        Mediator.prototype.eventHandler = function (e) {
            this.log('Handled ' + e.name + ' from ' + e.target.name + ":" + e.target.type);
            switch (e.target.type()) {
                case fmvc.TYPE_MEDIATOR:
                    this.mediatorEventHandler(e);
                    break;
                case fmvc.TYPE_MODEL:
                    this.modelEventHandler(e);
                    break;
                case fmvc.TYPE_VIEW:
                    this.viewEventHandler(e);
                    break;
            }
        };
        Mediator.prototype.modelEventHandler = function (e) {
        };
        Mediator.prototype.mediatorEventHandler = function (e) {
        };
        Mediator.prototype.viewEventHandler = function (e) {
        };
        return Mediator;
    })(fmvc.Notifier);
    fmvc.Mediator = Mediator;
})(fmvc || (fmvc = {}));
///<reference path='./event.ts'/>
///<reference path='./facade.ts'/>
///<reference path='./notifier.ts'/>
///<reference path='./event.dispatcher.ts'/>
///<reference path='./logger.ts'/>
///<reference path='./model.ts'/>
///<reference path='./model.list.ts'/>
///<reference path='./view.i.ts'/>
///<reference path='./view.ts'/>
///<reference path='./view.list.ts'/>
///<reference path='./mediator.ts'/>
///<reference path='../../../DefinitelyTyped/lodash/lodash.d.ts'/>
///<reference path='../../src/fmvc/d.ts'/>
/* start object */
var ui;
(function (ui) {
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(name, $root) {
            _super.call(this, name, $root);
            /* create states */
            this.createStates(["hover", "selected", "disabled", "error", "open"]);
        }
        Button.prototype.createDom = function () {
            this.element = this.templateElement;
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        };
        Button.prototype.isDynamicStylesEnabled = function (value) {
            if (_.isBoolean(value))
                Button.__isDynamicStylesEnabled = value;
            return Button.__isDynamicStylesEnabled;
        };
        Object.defineProperty(Button.prototype, "i18n", {
            get: function () {
                return this.jsTemplate.i18n ? this.jsTemplate.i18n[this.locale] : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "jsTemplate", {
            get: function () {
                return Button.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Button.__isDynamicStylesEnabled = false;
        Button.__jsTemplate = {
            "path": "0",
            "type": "tag",
            "staticAttributes": [{
                "name": "class",
                "value": "button"
            }],
            "dynamicSummary": {
                "selected": {
                    "class": {
                        "0": "button-{selected}"
                    }
                },
                "disabled": {
                    "class": {
                        "0": "button-{disabled}"
                    }
                },
                "hover": {
                    "class": {
                        "0": "button-{hover}"
                    }
                },
                "error": {
                    "class": {
                        "0": "button-{error}"
                    }
                },
                "open": {
                    "class": {
                        "0": "button-{open}"
                    }
                }
            },
            "tagName": "div",
            "extend": "fmvc.View",
            "createStates": ["hover", "selected", "disabled", "error", "open"],
            "className": "Button",
            "css": "button{display:inline-block;min-width:120px;width:100;background-color:#000;color:#fff;font-size:1}.button-hover{background-color:#008000}.button-selected{font-weight:bold;border-bottom:2px solid #000}"
        };
        return Button;
    })(fmvc.View);
    ui.Button = Button;
})(ui || (ui = {}));
///<reference path='../../src/fmvc/d.ts'/>
/* start object */
var ui;
(function (ui) {
    var UserView = (function (_super) {
        __extends(UserView, _super);
        function UserView(name, $root) {
            _super.call(this, name, $root);
            /* create states */
            this.createStates(["hover", "selected", "disabled"]);
        }
        UserView.prototype.createDom = function () {
            this.element = this.templateElement;
            this.close2 = this.elementPaths["0,23"];
            this.close = this.elementPaths["0,25"];
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        };
        UserView.prototype.isDynamicStylesEnabled = function (value) {
            if (_.isBoolean(value))
                UserView.__isDynamicStylesEnabled = value;
            return UserView.__isDynamicStylesEnabled;
        };
        Object.defineProperty(UserView.prototype, "i18n", {
            get: function () {
                return this.jsTemplate.i18n ? this.jsTemplate.i18n[this.locale] : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UserView.prototype, "jsTemplate", {
            get: function () {
                return UserView.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        UserView.__isDynamicStylesEnabled = false;
        UserView.__jsTemplate = {
            "path": "0",
            "type": "tag",
            "staticAttributes": [{
                "name": "style",
                "value": "background-color:blue;color: red;"
            }, {
                "name": "class",
                "value": "userview"
            }],
            "children": [{
                "path": "0,1",
                "type": "tag",
                "children": [{
                    "path": "0,1,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.firstname": ["F: {data.firstname}"]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,3",
                "type": "tag",
                "children": [{
                    "path": "0,3,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.secondname": ["S: {data.secondname}"]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,5",
                "type": "tag",
                "children": [{
                    "path": "0,5,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.age": ["A: {data.age}"]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,7",
                "type": "tag",
                "children": [{
                    "path": "0,7,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "i18n.template": ["{i18n.template}"]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,9",
                "type": "tag",
                "children": [{
                    "path": "0,9,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.firstname": [{
                                "args": {
                                    "VALUE": "data.firstname"
                                },
                                "filters": [
                                    ["i18n", "template"]
                                ],
                                "source": "{replace}"
                            }]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,11",
                "type": "tag",
                "children": [{
                    "path": "0,11,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.age": [{
                                "args": {
                                    "AGE": "data.age",
                                    "FIRST": "data.firstname"
                                },
                                "filters": [
                                    ["i18n", "template"]
                                ],
                                "source": "Hello man ! Yo Yo {replace}"
                            }],
                            "data.firstname": [{
                                "args": {
                                    "AGE": "data.age",
                                    "FIRST": "data.firstname"
                                },
                                "filters": [
                                    ["i18n", "template"]
                                ],
                                "source": "Hello man ! Yo Yo {replace}"
                            }]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,13",
                "type": "tag",
                "children": [{
                    "path": "0,13,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.age": [{
                                "args": {
                                    "AGE": "data.age",
                                    "FIRST": "data.firstname"
                                },
                                "filters": [
                                    ["i18n", "template2"]
                                ],
                                "source": "{replace}"
                            }],
                            "data.firstname": [{
                                "args": {
                                    "AGE": "data.age",
                                    "FIRST": "data.firstname"
                                },
                                "filters": [
                                    ["i18n", "template2"]
                                ],
                                "source": "{replace}"
                            }]
                        },
                        "bounds": null
                    }
                }],
                "handlers": {
                    "mouseover": "overText",
                    "mouseout": "outText"
                },
                "tagName": "div"
            }, {
                "path": "0,15",
                "type": "tag",
                "children": [{
                    "path": "0,15,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.value": ["The value is {data.value}"]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,17",
                "type": "tag",
                "children": [{
                    "path": "0,17,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.coordinates.x": ["Cooridnates {data.coordinates.x} & {data.coordinates.y}"]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,19",
                "type": "tag",
                "handlers": {
                    "change": "set,data.value,{data.value}",
                    "keydown": "changeValueOnKeyUp",
                    "keyup": "changeValueOnKeyDown",
                    "click": "stopPropagation"
                },
                "bounds": {
                    "value": {
                        "data.value": "{data.value}"
                    }
                },
                "tagName": "input",
                "states": ["selected"]
            }, {
                "path": "0,21",
                "type": "tag",
                "children": [{
                    "path": "0,21,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.firstname": [{
                                "args": {
                                    "VALUE": "data.firstname"
                                },
                                "filters": ["second", "first"],
                                "source": "{replace} The Text Of The button"
                            }]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "ui.Button"
            }, {
                "path": "0,23",
                "type": "tag",
                "staticAttributes": [{
                    "name": "class",
                    "value": "close"
                }],
                "children": [{
                    "path": "0,23,0",
                    "type": "text",
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.firstname": [{
                                "args": {
                                    "VALUE": "data.firstname"
                                },
                                "filters": ["first"],
                                "source": "{replace} Close Text get from ."
                            }]
                        },
                        "bounds": null
                    }
                }],
                "tagName": "div",
                "states": ["selected", ["custom", "one"]]
            }, {
                "path": "0,25",
                "type": "tag",
                "staticAttributes": [{
                    "name": "class",
                    "value": "close"
                }, {
                    "name": "style",
                    "value": "background-color:red"
                }],
                "tagName": "div",
                "states": ["hover", "touch"]
            }, {
                "path": "0,27",
                "type": "comment",
                "data": " Comment "
            }],
            "links": [{
                "name": "close2",
                "value": "0,23"
            }, {
                "name": "close",
                "value": "0,25"
            }],
            "dynamicSummary": {
                "selected": {
                    "selected": {
                        "0": "{selected}"
                    },
                    "class": {
                        "0": "userview-{selected}"
                    }
                },
                "top": {
                    "style": {
                        "0": " top:{top}px"
                    }
                },
                "disabled": {
                    "class": {
                        "0": "userview-{disabled}"
                    }
                },
                "hover": {
                    "class": {
                        "0": "userview-{hover}"
                    }
                },
                "data.firstname": {
                    "data": {
                        "0,1,0": "F: {data.firstname}",
                        "0,9,0": {
                            "args": {
                                "VALUE": "data.firstname"
                            },
                            "filters": [
                                ["i18n", "template"]
                            ],
                            "source": "{replace}"
                        },
                        "0,11,0": {
                            "args": {
                                "AGE": "data.age",
                                "FIRST": "data.firstname"
                            },
                            "filters": [
                                ["i18n", "template"]
                            ],
                            "source": "Hello man ! Yo Yo {replace}"
                        },
                        "0,13,0": {
                            "args": {
                                "AGE": "data.age",
                                "FIRST": "data.firstname"
                            },
                            "filters": [
                                ["i18n", "template2"]
                            ],
                            "source": "{replace}"
                        },
                        "0,21,0": {
                            "args": {
                                "VALUE": "data.firstname"
                            },
                            "filters": ["second", "first"],
                            "source": "{replace} The Text Of The button"
                        },
                        "0,23,0": {
                            "args": {
                                "VALUE": "data.firstname"
                            },
                            "filters": ["first"],
                            "source": "{replace} Close Text get from ."
                        }
                    }
                },
                "data.secondname": {
                    "data": {
                        "0,3,0": "S: {data.secondname}"
                    }
                },
                "data.age": {
                    "data": {
                        "0,5,0": "A: {data.age}",
                        "0,11,0": {
                            "args": {
                                "AGE": "data.age",
                                "FIRST": "data.firstname"
                            },
                            "filters": [
                                ["i18n", "template"]
                            ],
                            "source": "Hello man ! Yo Yo {replace}"
                        },
                        "0,13,0": {
                            "args": {
                                "AGE": "data.age",
                                "FIRST": "data.firstname"
                            },
                            "filters": [
                                ["i18n", "template2"]
                            ],
                            "source": "{replace}"
                        }
                    }
                },
                "i18n.template": {
                    "data": {
                        "0,7,0": "{i18n.template}"
                    }
                },
                "data.value": {
                    "data": {
                        "0,15,0": "The value is {data.value}"
                    },
                    "value": {
                        "0,19": "{data.value}"
                    }
                },
                "data.coordinates.x": {
                    "data": {
                        "0,17,0": "Cooridnates {data.coordinates.x} & {data.coordinates.y}"
                    }
                }
            },
            "tagName": "div",
            "extend": "fmvc.View",
            "createStates": ["hover", "selected", "disabled"],
            "className": "UserView",
            "i18n": {
                "ru": {
                    "title": "Карточка пользователя",
                    "username": "Завут пацанчика/у {VALUE}",
                    "age": "Уже {VALUE} стукнуло",
                    "balance": "На текущий момент у него/нее {VALUE} бабосов",
                    "template": "Какой то щаблон без всего",
                    "template2": "Шаблон RU. Юзеру {AGE, plural, one {# год} few {# года} many {# лет} other {# лет}} , {FIRST} - FIRST"
                },
                "en": {
                    "title": "The user card",
                    "username": "His/her name is {VALUE}",
                    "age": "She/he is {VALUE} ages",
                    "balance": "She/he has {VALUE, plural, one {# ruble} other {# rubles}"
                }
            },
            "css": ".userview{background-color:#808080;font-size:16px;line-height:24px;display:inline-block;width:200px}.userview-selected{border:1px solid #f00}.userview-hover{font-weight:bold;background-color:#0e90d2 !important;border:1px solid #00f}.userview-disabled{font-color:#f00;text-decoration:underline}"
        };
        return UserView;
    })(fmvc.View);
    ui.UserView = UserView;
})(ui || (ui = {}));
