///<reference path='./d.ts'/>
module fmvc {

    export var State = {
        SELECTED: 'selected',
        HOVERED: 'hovered',
        FOCUSED: 'focused',
        DISABLED: 'disabled'
    };

    export var DomObjectType = {
        TEXT: 'text',
        TAG: 'tag',
        COMMENT: 'comment'
    };

    export class View extends fmvc.Notifier implements IView {
        private $root:any;
        private _mediator:fmvc.Mediator;

        private _model:fmvc.Model;
        private _data:any;

        public  dynamicPropertyValue:{[name:string]:any} = {}; // те которые были установлены
        public  elementPaths:{[name:string]:Element} = {};
        private handlers:{[id:string]:string} = {};

        // Invalidate properties
        private _invalidateTimeout:number = 0;
        private _invalidate:number = 0;
        private _inDocument:Boolean = false;
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
            _.bindAll(this, 'getDataStringValue', 'applyEventHandlers');
            this.$root = $root;
            this.init();
            this.invalidateHandler = this.invalidateHandler.bind(this);
        }

        // Init, overrided method
        public init():void {

        }

        public render(parent) {
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

        public createDom():void {
            this.element = document.createElement('div');
            this.childrenContainer = this.element;
        }

        /*
         public createElementPathLinks(element, data, root) {
         if (!data.path) return;

         var path = data.path.split(',');
         path.splice(0, 1);
         this.elementPaths[data.path] = this.getElementByPath(element, path, root);
         ////console.log('Create path for ' , data.path, this.elementPaths[data.path]);
         _.each(data.children, function (data) {
         this.createElementPathLinks(element, data);
         }, this);
         }
         */

        public createStates(states:string[]):void {
            this._states = {};
            _.each(states, function (value:string) {
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
                    console.log('Set data ' , prefix + name);
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

        public getDataObjectValue(propertyName, propertyValue, templateObject:any):string {
            if (templateObject.method === 'i18n') {
                if (!this.i18n[templateObject.name]) return 'Error:View.getDataObjectValue has no i18n property';

                var data:any = {};
                _.each(templateObject.args, function (value, key) {
                    if (value) data[key] = this.data[value.replace('data.', '')];
                }, this);
                var result = this.getFormattedMessage(this.i18n[templateObject.name], data);
                return templateObject.source.replace('{replace}', result);
            }
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
                    element.style[propName] = style[1].trim();
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
            if (!this.isDynamicStylesEnabled()) this.enableDynamicStyle(true);

            var t = this;
            if (this.hasState('hover')) {
                this.element.addEventListener('mouseover', ()=>t.setState('hover', true));
                this.element.addEventListener('mouseout', ()=>t.setState('hover', false));
            }

            if (this.hasState('selected')) {
                this.element.addEventListener('click', ()=>t.setState('selected', !t.getState('selected')));
            }

            this.enterDocumentElement(this.jsTemplate, this.elementPaths);
        }

        public applyEventHandlers(e:any) {
            var name = this.handlers[e.target][e.type];

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

            var e:Element = object[value.path];

            if (value.type === DomObjectType.TAG) {
                console.log('EnterDocument ', value.tagName, value.path);
                _.each(value.children, function (child:IDomObject, index) {
                    var result = this.enterDocumentElement(child, object);
                }, this);

                // add global handlers if not exist
                if(value.handlers) {
                    _.each(value.handlers, function (name:string, eventType:string) {
                        if (!this.handlers[e] || !this.handlers[e][eventType]) {
                            if (!this.handlers[e]) this.handlers[e] = {};
                            this.handlers[e][eventType] = name;
                            console.log('add listener ', eventType);
                            e.addEventListener(eventType, this.applyEventHandlers);
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
            }
            else if(!isIncluded && isEnabled) {
                var newElement = this.getElement(value, object);
                var parentNode = e.parentNode;
                //console.log('Replace node on Comment ');
                parentNode.replaceChild(newElement,e);
                object[value.path] = newElement;
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
            return this._avaibleInheritedStates ? this._avaibleInheritedStates : (this._avaibleInheritedStates = _.filter(_.map(this._states, function (v, k) {
                return k;
            }), function (k) {
                return this.inheritedStates.indexOf(k) > -1;
            }, this), this);
        }

        public get inheritedStates():string[] {
            return View.__inheritedStates;
        }

        public isSelected():boolean {
            return !!this.getState(State.SELECTED);
        }

        public isHovered():boolean {
            return !!this.getState(State.HOVERED);
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
            this.removeInvalidateTimeout();
            this._invalidate = this._invalidate | type;
            //this._invalidateTimeout = setTimeout(this.invalidateHandler, 20);
            this.invalidateHandler();

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
            if (!this.childrenViews || !this.childrenViews.length);
            _.each(this.childrenViews, value, this);
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
            console.log('View: set data' , value);
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
                var style = document.createElement('style');
                style.id = id; //@todo create method that setup className at the generator
                style.type = 'text/css';
                style.cssText = this.dynamicStyle;
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
            var e:Element = null;
            var isIncluded = value.states ? this.isStateEnabled(value.states) : true;

            if (isIncluded && value.type === DomObjectType.TAG) {
                e = document.createElement(value.tagName);
                _.each(value.staticAttributes, function (v) {
                    e.setAttribute(v.name, v.value);
                });
                _.each(value.children, function (child:IDomObject, index) {
                    var ce = this.getElement(child, object);
                    if (ce) e.appendChild(ce);
                }, this);
            }
            else if (value.type === DomObjectType.TEXT) e = document.createTextNode(value.data || '');
            else e = document.createComment(value.path);
            object[value.path] = e;
            return e;
        }


        public get jsTemplate():IRootDomObject {
            return View.__jsTemplate;
        }

        public get className():any {
            return View.__className;
        }


        private static __isDynamicStylesEnabled:boolean = false;
        private static __jsTemplate:any = null;
        private static __formatter:{[value:string]:Function} = {};
        private static __messageFormat:{[locale:string]:any} = {};

        private static __className:string = 'View';
        private static __inheritedStates:string[] = [State.DISABLED];
    }

    export interface IView {
        init():void;
        invalidate(type:number):void;
        data:any;
        model:fmvc.Model; // get, set
        mediator:fmvc.Mediator; // get, set
        eventHandler(name:string, e:any):void;
    }

    export interface IRootDomObject extends IDomObject {
        className:string;
        css?:string;
        links?:{[name:string]:string/* path */}[];
        dynamicSummary?:IDynamicSummary;
    }

    interface INameValue {
        name:string;
        value:any;
    }

    export interface IDynamicSummary {
        [propertyName:string]:{[substance/* class, data, style any */:string]:any};
    }

    export interface IDomObject {
        path:string;
        type:string; // @tag/string/other
        tagName?:string; // tag name: div/br
        extend?:string;

        isVirtual:boolean;
        isComponent:boolean;

        createDom:Function;

        component?:fmvc.View;
        componentConstructor?:Function;

        element?:HTMLElement;
        virtualElement?:HTMLElement;

        createStates?:string[];
        states?:string[];

        staticAttributes?:INameValue[];

        handlers?:{[event:string]:string};
        children?:IDomObject[];
    }


}
