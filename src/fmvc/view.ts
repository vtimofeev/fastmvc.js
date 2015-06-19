///<reference path='./d.ts'/>
module fmvc {
    export var BrowserEvent = {
        CLICK: 'click',
        MOUSEOVER: 'mouseover',
        MOUSEOUT: 'mouseout'
    }

    export var State = {
        SELECTED: 'selected',
        HOVER: 'hover',
        FOCUSED: 'focused',
        DISABLED: 'disabled'
    };

    export var DomObjectType = {
        TEXT: 'text',
        TAG: 'tag',
        COMMENT: 'comment'
    };

    export var Filter = {
        FIRST: 'first',
        SECOND: 'second'
    };

    export class View extends fmvc.Notifier implements IView {
        private $root:any;
        private _mediator:fmvc.Mediator;

        private _model:fmvc.Model;
        private _data:any;

        public  dynamicPropertyValue:{[name:string]:any} = {}; // те которые были установлены
        public  elementPaths:{[name:string]:Element} = {};
        private componentPaths:{[name:string]:fmvc.View} = {};
        private handlers:{[id:string]:string} = {};

        // Invalidate properties
        private _invalidateTimeout:number = 0;
        private _invalidate:number = 0;
        private _inDocument:boolean = false;
        private _avaibleInheritedStates:string[] = null;

        // States object (view support multistates)
        private _states:{[id:string]:any};
        private _locale:string = 'ru';

        private parentView:fmvc.View;
        private parentElement:Element;
        private linkedViews:fmvc.View[];
        private childrenViews:fmvc.View[];

        // Elements
        public  element:Element; // root element
        public  childrenContainer:Element; // children container

        constructor(name:string, $root:any) {
            super(name, fmvc.TYPE_VIEW);
            _.bindAll(this, 'getDataStringValue', 'applyEventHandlers', 'invalidateHandler', 'getDataObjectValue');
            this.$root = $root;
            this.init();
            this.invalidateHandler = this.invalidateHandler.bind(this);
        }

        // @override
        public init():void {
        }

        public render(parent:Element) {
            this.parentElement = parent;
            this.createDom();
            this.parentElement.appendChild(this.element);
            this.updateDom();
            this.enterDocument();
            this.updateChildren();
        }

        public updateChildren() {
        }

        //------------------------------------------------------------------------------------------------
        // Dom
        //------------------------------------------------------------------------------------------------

        public createDom():fmvc.View {
            this.element = document.createElement('div');
            this.childrenContainer = this.element;
            return this;
        }


        public enableStates(states:string[]):void {
            this._states = {};
            _.each(states, function (value:string) {
                /*
                switch (value) {
                    case State.HOVER:
                        _.bindAll(this, 'setHoverTrue', 'setHoverFalse');
                        break;
                    case State.SELECTED:
                        _.bindAll(this, 'toggleSelected');
                        break;
                }*/

                this._states[value] = false;
            }, this);
        }

        public updateDom():void {
            if (!this.dynamicProperties) return;

            //this.element = document.createElement('div');
            _.each(this._states, function (stateValue:any, stateName:string) {
                if (this.dynamicProperties[stateName] && stateValue != this.dynamicPropertyValue[stateName]) this.updateDynamicProperty(stateName, stateValue);
            }, this);
            this.updateI18N();
            //this.updateData();
        }

        public updateI18N():void {
            if (!this.dynamicProperties) return;
            if (!this.i18n) return;

            _.each(this.i18n, function (value:any, name:string) {
                if (_.isObject(value)) {
                } else {
                    var prefix:string = 'i18n.';
                    this.dynamicProperties[prefix + name] ? this.updateDynamicProperty(prefix + name, value) : null;
                }
            }, this);

        }

        public updateData(data, prefix = 'data.', depth:number = 0):void {

            if (!this.dynamicProperties || !data || !depth) return;
            depth--;

            _.each(data, function (value:any, name:string) {
                var nextPrefix = prefix + name + '.';
                if (_.isObject(value) && depth) {
                    this.updateData(value,  nextPrefix , depth );
                } else {
                    //console.log('Set data ' , prefix + name);
                    this.dynamicProperties[prefix + name] ? this.updateDynamicProperty(prefix + name, value) : null;
                }
            }, this);
        }

        // @todo
        private getStyleValue(name:string) {
        }

        public getClassStringValue(propertyName, propertyValue, templateString):string {
            if (_.isBoolean(propertyValue)) {
                return templateString.replace('{' + propertyName + '}', propertyName);
            } else {
                return templateString.replace('{' + propertyName + '}', propertyValue);
            }
        }

        public getDataStringValue(propertyName, propertyValue, templateStringOrObject):string {
            if (_.isString(templateStringOrObject)) {
                return templateStringOrObject.replace('{' + propertyName + '}', propertyValue);
            }
            else if (_.isObject(templateStringOrObject)) {
                return this.getDataObjectValue(propertyName, propertyValue, templateStringOrObject);
            }
        }


        public executeComplexFilter(filterArrayData, value) {
        }

        public executeFilter(filter:string, value:string):string {
            switch (filter) {
                case Filter.FIRST:
                    return 'first:' + value;
                    break;
                case Filter.SECOND:
                    return 'second:' + value;
                    break;
            }
            return value;
        }

        public getDataObjectValue(propertyName, propertyValue, templateObject:any):string {
            var getFilterValue = function (reducedValue:string, filter:string | string[]):string {
                if(_.isArray(filter)) {
                    if(filter[0] === 'i18n') {
                        var secondName = filter[1];
                        if (!this.i18n[secondName]) return 'Error:View.getDataObjectValue has no i18n property';
                        var data:any = {};
                        _.each(templateObject.args, function (value:string, key:string) {
                            if (value) data[key] = this.data[value.replace('data.', '')];
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

        }

        public updatePaths(paths, type, name, value, GetValue:Function, each:Boolean) {
            _.each(paths, function (valueOrValues:any, path:string) {
                var r = '';
                if (_.isString(valueOrValues)) {
                    var result = GetValue(name, value, valueOrValues);
                    r += result;
                    if (each) this.updatePathProperty(path, type, value, result);
                }
                else if (_.isArray(valueOrValues)) {
                    _.each(valueOrValues, function (stringValue) {
                        var result = GetValue(name, value, stringValue);
                        r += result;
                        if (each) this.updatePathProperty(path, type, value, stringValue);
                    }, this);
                }
                else if (_.isObject(valueOrValues)) {
                    var result = GetValue(name, value, valueOrValues);
                    r += result;
                    if (each) this.updatePathProperty(path, type, value, result);
                }

                if (!each) this.updatePathProperty(path, type, value, r);
            }, this);

        }

        public updateDynamicProperty(name:string, value:any) {
            var domPropsObject = this.dynamicProperties[name];
            this.dynamicPropertyValue[name] = value;
            if (!domPropsObject) return;

            //console.log('Update dyn prop: ', domPropsObject, name, value);
            _.each(domPropsObject, function (pathsAndValues:any, type:string) {
                var GetValue = null;
                var each:Boolean = false;
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
        }

        public updatePathProperty(path, type, value, resultValue) {
            var element:Element = this.elementPaths[path];
            if (!(element && element.nodeType !== 8 /* comment */)) return; // virtual element or comment
            //console.log('updated element ', path, type, value);

            switch (type) {
                case 'class':
                    element.classList.toggle(resultValue, value);
                    break;

                case 'style':
                    var style = resultValue.split(':');
                    var propName = style[0].trim();
                    (<HTMLElement>element).style[propName] = style[1].trim();
                    break;

                case 'data':
                    //console.log('Set data ', element, element.nodeType, element.textContent);
                    if (element.nodeType === 3 && element.textContent != resultValue) element.textContent = resultValue;
                    break;
                default:
                    element.setAttribute(type, resultValue);
                    break;
            }
        }


        public getElementByPath(element:any /* Element */, path:number[], root:boolean = false):Element {
            if (!this.element) throw Error('cant get element by path');
            //console.log('get path of ' , path, element);
            if (root) return element;

            if (path && path.length && element && element.childNodes.length) {
                var index:any = path.splice(0, 1)[0];
                return this.getElementByPath(element.childNodes[parseInt(index, 10)], path);
            }
            else {
                return element;
            }
        }


        get inDocument():boolean {
            return this._inDocument;
        }

        //------------------------------------------------------------------------------------------------
        // Event handlers
        //------------------------------------------------------------------------------------------------


        public enterDocument() {
            if (this._inDocument) return;
            this._inDocument = true;
            var t = this;

            if (!this.isDynamicStylesEnabled()) this.enableDynamicStyle(true);

            if (this.hasState(State.HOVER)) {

                this.element.addEventListener(BrowserEvent.MOUSEOVER, ()=>t.setState(State.HOVER, true));
                this.element.addEventListener(BrowserEvent.MOUSEOUT, ()=>t.setState(State.HOVER, false));
                this.dispatcher.listen(this.element

                //this.element.addEventListener(BrowserEvent.MOUSEOVER, this.setHoverTrue);
                //this.element.addEventListener(BrowserEvent.MOUSEOUT, this.setHoverFalse);
                //this.dispatcher.listen(this.element, BrowserEvent.MOUSEOVER, ()=>t.setState(State.HOVER, true));
                //this.dispatcher.listen(this.element, BrowserEvent.MOUSEOUT, ()=>t.setState(State.HOVER, false));
            }

            if (this.hasState(State.SELECTED)) {

                this.element.addEventListener(BrowserEvent.CLICK, ()=>t.setState(State.SELECTED, false));
                //this.element.addEventListener(BrowserEvent.CLICK, this.toggleSelected);
                //this.dispatcher.listen(this.element, BrowserEvent.CLICK, ()=>t.setState(State.SELECTED, false));
            }

            this.enterDocumentElement(this.jsTemplate, this.elementPaths);
            this.invalidate(1);
        }

        public setHoverTrue() {
            this.setState(State.HOVER, true);
        }

        public setHoverFalse() {
            this.setState(State.HOVER, false);
        }

        public toggleSelected() {
            this.setState(State.SELECTED, !this.getState(State.SELECTED));
        }

        public applyEventHandlers(e:any) {
            var path:string = e.target.getAttribute('data-path');
            var name:string = this.handlers[path][e.type];

            e.stopPropagation();
            if(name === 'stopPropagation') {
               e.stopPropagation();
            } else {
                if(name.indexOf(',')) {
                    var commands = name.split(',');
                    if(commands[0] === 'set') {
                        var objectTo = commands[1].split('.');
                        var objectProperty = objectTo[1].trim();
                        if(this.model) {
                            var result = {};
                            result[objectProperty] = e.target.value;
                            this.model.data = result;
                        }
                        if(this._data) {
                            this._data[objectProperty] = e.target.value;
                        }
                    }
                }
            }

            this.elementEventHandler(name, e);
        }

        // @to override with custom actions
        // if(name==='any') make something
        // if(name==='exit') make exit
        public elementEventHandler(name:string, e:any) {
            console.log('Event to handle ', name);
        }

        public enterDocumentElement(value:IDomObject, object:any):any {
            if (!value || !object) return;

            var path = value.path;
            var e:Element = object[value.path];
            var isTag = e.nodeType === 1;
            var c:fmvc.View = this.componentPaths[value.path];
            if(c) c.enterDocument();

            if (value.type === DomObjectType.TAG && isTag) {
                //console.log('EnterDocument ', value.tagName, value.path);
                _.each(value.children, function (child:IDomObject, index) {
                    this.enterDocumentElement(child, object);
                }, this);

                // add global handlers if not exist
                if(value.handlers) {
                    _.each(value.handlers, function (name:string, eventType:string) {
                        if (!this.handlers[path] || !this.handlers[path][eventType]) {
                            if (!this.handlers[path]) this.handlers[path] = {};
                            this.handlers[path][eventType] = name;
                            e.setAttribute('data-path', path);
                            this.dispatcher.listen(e, eventType, this.applyEventHandlers);
                        }
                    }, this);
                } else {
                    if(path != '0') e.style['pointer-events'] = 'none';
                }
            }
        }

        public exitDocumentElement(value:IDomObject, object:any):any {
            if (!value || !object) return;

            var path = value.path;
            var e:Element = object[value.path];
            var isTag = e.nodeType === 1;
            var c:fmvc.View = this.componentPaths[value.path];
            if(c) c.exitDocument();

            if (value.type === DomObjectType.TAG && isTag) {
                //console.log('ExitDocument ', value.tagName, value.path);
                _.each(value.children, function (child:IDomObject, index) {
                    this.exitDocumentElement(child, object);
                }, this);

                // add global handlers if not exist
                if(value.handlers) {
                    _.each(value.handlers, function (name:string, eventType:string) {
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
        }


        public applyChangeStateElement(value:IDomObject, object:any):any {
            if (!value || !object) return;
            var e:Element = object[value.path];
            if(e) {
                _.each(value.children, function (child:IDomObject, index) {
                    this.applyChangeStateElement(child, object);
                }, this);
            }

            var isStated = !!value.states;
            if(!isStated) return;


            var isIncluded = value.states ? this.isStateEnabled(value.states) : true;
            var isEnabled = (e.nodeType === 1);
            //console.log('path, included, enabled ', value.tagName, value.path, isIncluded, isEnabled);

            if(isIncluded && !isEnabled) {
                var newElement = this.getElement(value, object);
                var parentNode = e.parentNode;
                //console.log('Replace node on Real ');
                parentNode.replaceChild(newElement,e);
                object[value.path] = newElement;
                this.enterDocumentElement(value, object);
                View.Counters.element.removed++;
            }
            else if(!isIncluded && isEnabled) {
                this.exitDocumentElement(value, object);
                var newElement = this.getElement(value, object);
                var parentNode = e.parentNode;
                //console.log('Replace node on Comment ');
                parentNode.replaceChild(newElement,e);
                object[value.path] = newElement;
                View.Counters.element.removed++;
            } else {
                //console.log('Nothing replace');
            }
        }

        public exitDocument() {
            this._inDocument = false;
            this.delegateEventHandlers(false);
        }

        public getFormattedMessage(value:string, data?:any):string {
            View.__formatter[value] = View.__formatter[value] ? View.__formatter[value] : this.getCompiledFormatter(value);
            return <string> (View.__formatter[value](data));
        }

        public getCompiledFormatter(value:string):Function {
            View.__messageFormat[this.locale] = View.__messageFormat[this.locale] ? View.__messageFormat[this.locale] : new MessageFormat(this.locale);
            return View.__messageFormat[this.locale].compile(value);
        }

        private delegateEventHandlers(init:boolean):void {
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
        }


        //------------------------------------------------------------------------------------------------
        // States
        //------------------------------------------------------------------------------------------------
        public hasState(name:string):boolean {
            return _.isBoolean(this._states[name]);
        }

        public setState(name:string, value:any) {
            if (!(name in this._states)) return;
            if (this._states[name] === value) return;
            this._states[name] = value;
            this.applyState(name, value);
            this.applyChildrenState(name, value);
            this.applyChangeStateElement(this.jsTemplate, this.elementPaths);
        }

        public getState(name:string):any {
            return this._states[name];
        }

        private applyState(name, value) {
            if (!this.dynamicProperties) return;
            if (this._inDocument) this.updateDynamicProperty(name, value);
        }

        public applyChildrenState(name, value):void {
        }

        private applyChildState() {
        }

        public get avaibleInheritedStates():string[] {
            if(!this._avaibleInheritedStates) {
                this._avaibleInheritedStates = _.filter(_.map(this._states, function (v, k) {
                    return k;
                }), function (k) {
                    return this.inheritedStates.indexOf(k) > -1;
                }, this);
            }

            return this._avaibleInheritedStates;
        }

        public get inheritedStates():string[] {
            return View.__inheritedStates;
        }

        public isSelected():boolean {
            return !!this.getState(State.SELECTED);
        }

        public isHover():boolean {
            return !!this.getState(State.HOVER);
        }

        public isFocused():boolean {
            return !!this.getState(State.FOCUSED);
        }

        public isDisabled():boolean {
            return !!this.getState(State.DISABLED);
        }

        //------------------------------------------------------------------------------------------------
        // VALIDATE
        //------------------------------------------------------------------------------------------------

        public invalidate(type:number) {
            this._invalidate = this._invalidate | type;
            if(!this._invalidateTimeout) this._invalidateTimeout = setTimeout(this.invalidateHandler, 20);
        }


        public invalidateHandler():void {
            this.removeInvalidateTimeout();
            //console.log('invalid ' , this._invalidate , this._inDocument);
            if (!this._invalidate || !this._inDocument) return;

            if (this._invalidate & 1) this.updateData(this.data, 'data.', 2);
            this._invalidate = 0;
        }

        private removeInvalidateTimeout() {
            clearTimeout(this._invalidateTimeout);
            this._invalidateTimeout = null;
        }


        //------------------------------------------------------------------------------------------------
        // Mediator
        //------------------------------------------------------------------------------------------------

        public set mediator(value:fmvc.Mediator) {
            this._mediator = value;
        }

        public get mediator():fmvc.Mediator {
            return this._mediator;
        }

        //------------------------------------------------------------------------------------------------
        // Children
        //------------------------------------------------------------------------------------------------

        public forEachChild(value:Function) {
            if(!this.childrenViews || !this.childrenViews.length)  {
                return;
            }

            _.each(this.childrenViews, <any>(value), this);
        }

        public addChild(value:fmvc.View):void {
            this.childrenViews = this.childrenViews ? this.childrenViews : [];
            this.childrenViews.push(value);
            value.render(this.childrenContainer);
        }

        public removeChild(value:fmvc.View):void {

        }

        public removeAllChildren():fmvc.View[] {
            _.each(this.childrenViews, (view:fmvc.View)=>view.dispose());
            var result = this.childrenViews;
            this.childrenViews = [];
            return result;
        }

        public removeChildAt(value:fmvc.View):void {
        }

        //------------------------------------------------------------------------------------------------
        // Data & model
        //------------------------------------------------------------------------------------------------
        public set data(value:any) {
            //console.log('View: set data' , value);
            this._data = value;
            this.invalidate(1);
        }

        public get data():any {
            return this._data;
        }

        public set model(data:fmvc.Model) {
            this._model = data;
            this.data = data.data;
        }

        public get model():fmvc.Model {
            return this._model;
        }


        public setModelWithListener(value:fmvc.Model) {
            this.model = value;
            this.model.bind(true, this, this.modelHandler);
        }

        public modelHandler(name:string, data:any):void {
            this.log('modelHandler ' + name);
            this.invalidate(1);
        }


        public set locale(value:string) {
            this._locale = value;
        }

        public get locale():string {
            return this._locale;
        }

        public get i18n():any {
            return null;
        }

        //------------------------------------------------------------------------------------------------
        // Local methods, overrides
        //------------------------------------------------------------------------------------------------

        public sendEvent(name:string, data:any = null, sub:string = null, error:any = null, global:boolean = false):void {
            if (this._mediator) this._mediator.internalHandler({name: name, data: data, global: global, target: this});
        }

        public log(message:string, level?:number):void {
            if (this._mediator) this._mediator.facade.sendLog(this.name, message, level);
        }

        // Overrided
        public viewEventsHandler(name:string, e:any):void {
            this.log('event ' + name);
            this.sendEvent(name, e);
        }

        //
        public eventHandler(name:string, e:any):void {
            this.viewEventsHandler(name, e);
        }

        // Overrided
        public dispose():void {
            if (this.model) this.model.bind(false, this, this.modelHandler);
            this.delegateEventHandlers(false);
            super.dispose();
        }

        /* Overrided by generator */
        public get dynamicProperties():IDynamicSummary {
            return this.jsTemplate ? this.jsTemplate.dynamicSummary : null;
        }

        public isDynamicStylesEnabled(value?:boolean):boolean {
            if (_.isBoolean(value)) View.__isDynamicStylesEnabled = value;
            return View.__isDynamicStylesEnabled;
        }

        public enableDynamicStyle(value:boolean) {
            var id = this.className + '__' + Math.random() + 'Style';
            if (value && !this.isDynamicStylesEnabled()) {
                ////console.log(' *** enable dynamic style *** ');
                var style:HTMLStyleElement = document.createElement('style');
                style.id = id; //@todo create method that setup className at the generator
                style.type = 'text/css';
                //style.cssText = this.dynamicStyle;
                style.innerHTML = this.dynamicStyle;
                document.getElementsByTagName('head')[0].appendChild(style);
                this.isDynamicStylesEnabled(true);
            }
        }

        public get dynamicStyle():string {
            return this.jsTemplate ? this.jsTemplate.css : null;
        }

        public get templateElement():Element {
            this.elementPaths = {};
            return this.getElement(this.jsTemplate, this.elementPaths);
        }

        public isStateEnabled(states:string[]):boolean {
            var statesLength = states.length;
            for(var i = 0; i < statesLength; i++) {
                var stateValue = states[i];
                return _.isArray(stateValue)?this.getState(stateValue[0]) === stateValue[1]:!!this.getState(states[i]);
            }
            return false;
        }

        public getElement(value:IDomObject, object:any):Element {
            var e:HTMLElement = null;
            var n:Node = null;
            var isIncluded = value.states ? this.isStateEnabled(value.states) : true;
            if (isIncluded && value.type === DomObjectType.TAG) {
                if(value.tagName.indexOf('.') > -1) {
                    //console.log('Create component, ' + value.tagName);
                    var component = new (ui[value.tagName.split('.')[1]])();
                    this.componentPaths[value.path] = component;
                    e = component.createDom().element;
                } else {
                    e = document.createElement(value.tagName);
                    _.each(value.staticAttributes, function (v) {
                        e.setAttribute(v.name, v.value);
                    });

                    if(value.handlers || String(value.path) === '0') e.setAttribute('id', 'id-' + View.Counters.element.added );
                }

                _.each(value.children, function (child:IDomObject, index) {
                    var ce = this.getElement(child, object);
                    if (ce) e.appendChild(ce);
                }, this);
            }
            else if (value.type === DomObjectType.TEXT) n = document.createTextNode(value.data || '');
            else n = document.createComment(value.path);
            View.Counters.element.added++;



            object[value.path] = e || n;
            return <Element>(e || n);
        }


        public get jsTemplate():IRootDomObject {
            return View.__jsTemplate;
        }

        public get className():any {
            return View.__className;
        }

        public get dispatcher():fmvc.EventDispatcher {
            return View.dispatcher;
        }

        private static __isDynamicStylesEnabled:boolean = false;
        private static __jsTemplate:any = null;
        private static __formatter:{[value:string]:Function} = {};
        private static __messageFormat:{[locale:string]:any} = {};
        private static __className:string = 'View';
        private static __inheritedStates:string[] = [State.DISABLED];
        static Counters = { element: {added: 0, removed: 0}};
        static dispatcher = new EventDispatcher();
    }

    setInterval(function() { console.log(JSON.stringify(View.Counters))}, 3000);
}
