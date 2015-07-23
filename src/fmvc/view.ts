///<reference path='./d.ts'/>

module fmvc {
    export var global:any = window || {};
    console.log('Global is ' + global);

    export var State = {
        SELECTED: 'selected',
        HOVER: 'hover',
        FOCUSED: 'focused',
        DISABLED: 'disabled',
        OPEN: 'open'
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

    export class View extends Notifier implements IView {
        private _mediator:Mediator;
        private _model:Model;
        private _data:any = null;

        public  dynamicPropertyValue:{[name:string]:any} = {}; // те которые были установлены
        public  elementPaths:{[name:string]:Element} = {};
        private componentPaths:{[name:string]:View} = {};
        private handlers:{[id:string]:string} = {};

        // Invalidate properties
        private _invalidateTimeout:number = 0;
        private _invalidate:number = 0;
        private _inDocument:boolean = false;
        private _avaibleInheritedStates:string[] = null;

        // States object (view support multistates)
        private _states:{[id:string]:any};
        private template:IRootDomObject;
        private _statesType:{[id:string]:any};
        private _locale:string = 'ru';
        private _id:string = null;

        private parentView:View;
        private parentElement:Element;
        private linkedViews:View[];
        private childrenViews:View[];
        private tmp = {};


        // Elements
        public  element:Element; // root element
        public  childrenContainer:Element; // children container

        constructor(name:string, modelOrData?:fmvc.Model|any, jsTemplate?:IDomObject) {
            super(name, TYPE_VIEW);
            _.bindAll(this, 'getDataStringValue', 'applyEventHandlers', 'invalidateHandler', 'appModelHandler'/*, 'getDataObjectValue'*/);
            this.template = this.jsTemplate;

            if(modelOrData) {
                if(modelOrData.type === TYPE_MODEL) this.model = modelOrData;
                else this.data = modelOrData;
            }

            this.enableStates(null);
            this.initTemplate(jsTemplate);
            this.init();
            this.invalidateHandler = this.invalidateHandler.bind(this);
        }

        public initTemplate(templateExtention:IDomObject) {
            if(templateExtention) this.template = <IRootDomObject> (_.extend(_.clone(this.template), templateExtention));
            if(this.template && this.template.enableStates) this.enableStates(this.template.enableStates);
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

        // @memorize
        public get id():string {
            if(!this._id) {
                this._id = (_.property('staticAttributes')(this.jsTemplate)?this.jsTemplate.staticAttributes['id']:null) || ViewHelper.getId();
            }
            return this._id;
        }

        //------------------------------------------------------------------------------------------------
        // Dom
        //------------------------------------------------------------------------------------------------

        public createDom():View {
            this.element = document.createElement('div');
            this.childrenContainer = this.element;
            return this;
        }

        public enableStates(states:(string|ITypeNameValue)[]):void {
            this._states = {};
            this._statesType = {};

            _.each(states, function (value:(string|ITypeNameValue)) {
                if(_.isString(value)) {
                    var svalue:string = <string>(value);
                    this._states[svalue] = false;
                }
                else if(_.isObject(value)) {
                    var ivalue:ITypeNameValue = <ITypeNameValue>(value);
                    this._statesType[ivalue.name] = ivalue.type;
                    this._states[ivalue.name] = ivalue.value || ivalue.default;

                }
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
                    this.dynamicProperties[prefix + name] ? this.updateDynamicProperty(prefix + name, value) : null;
                }
            }, this);
        }

        public updateApp():void {
            if (!this.dynamicProperties || !this.app) return;
            var appProps = _.filter(_.keys(this.dynamicProperties), (v)=>v.indexOf('app.') === 0);
            _.each(appProps, function (name:string) {
                this.updateAppProp(name);
            }, this);
        }

        public updateAppProp(name:string):void {
            var appValue = eval('this.' + name);
            this.updateDynamicProperty(name, appValue);
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

        public getDataStringValue(propertyName, propertyValue, strOrExOrMEx):string {
            if (_.isString(strOrExOrMEx)) {
                return strOrExOrMEx.replace('{' + propertyName + '}', propertyValue);
            }
            else if (_.isObject(strOrExOrMEx)) {
                return this.executeMultiExpression(strOrExOrMEx);
            }
        }

        public executeFilters(value:any, filters:string[]):any {
            if(!filters || !filters.length) return value;

            return _.reduce(filters,
                function(memo:any, filter:string, index:number) {
                if (filter.indexOf('i18n.') === 0) return this.getFormattedMessage(this.i18n[filter.replace('i18n.', '')],memo);
                else return this.executePlainFilter(filter, memo);
            }, value, this);
        }

        public executePlainFilter(filter:string, value:string):string {
            switch (filter) {
                case 'hhmmss':
                    return ViewHelper.hhmmss(value);
                case Filter.FIRST:
                    return 'first:' + value;
                    break;
                case Filter.SECOND:
                    return 'second:' + value;
                    break;
            }
            return value;
        }

        /*
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
                    return this.executePlainFilter(filter, reducedValue);
                }
            };

            return _.reduce(templateObject.filters, getFilterValue, propertyValue, this);
        }
        */

        public updatePaths(paths, type, name, value, GetValue:Function, each:Boolean) {
            _.each(paths, function (valueOrValues:any, path:string) {
                var r = '';
                if (_.isString(valueOrValues)) {
                    var result = GetValue(name, value, valueOrValues);
                    r += result;
                    if (each) this.updatePathProperty(path, type, name, value, result, valueOrValues);
                }
                else if (_.isArray(valueOrValues)) {
                    _.each(valueOrValues, function (stringValue) {
                        var result = GetValue(name, value, stringValue);
                        r += result;
                        if (each) this.updatePathProperty(path, type, name, value, stringValue);
                    }, this);
                }
                else if (_.isObject(valueOrValues)) {
                    var result = GetValue(name, value, valueOrValues);
                    r += result;
                    if (each) this.updatePathProperty(path, type, name, value, result);
                }

                if (!each) this.updatePathProperty(path, type, name, value, r);
            }, this);

        }

        public updateDynamicProperty(name:string, value:any) {
            var domPropsObject = this.dynamicProperties[name];
            this.dynamicPropertyValue[name] = value;
            if (!domPropsObject) return;

            _.each(domPropsObject, function (pathsAndValues:any, type:string) {
                var GetValue = null;
                var each:Boolean = false;
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
        }

        public updatePathProperty(path, type, name:string, value, resultValue, template?:string) {
            var element:Element = this.elementPaths[path];
            if (!(element && element.nodeType !== 8 /* comment */)) return; // virtual element or comment
            //console.log('updated element ', path, type, value, resultValue);

            switch (type) {
                case 'selected':
                    var view:fmvc.View = this.componentPaths[path];
                    if(view) {
                        console.log('Selected: path %s, type %s, name %s, result %s ', path, type, name, resultValue, _.isString(resultValue), view);
                        view.setState(type, (resultValue === 'false' ? false : !!resultValue) );
                    }
                    break;

                case 'class':
                    console.log('Class: path %s, type %s, name %s, value %s, result %s, template %s, ', path, type, name, value, resultValue, template, this);
                    var prevClassValue:string;

                    // удаляем предыдушее значение для sting типов значения классов
                    if(template && !!(prevClassValue = this.tmp[template])) {
                        if(prevClassValue === resultValue) return;
                        element.classList.toggle(prevClassValue, false);
                        this.tmp[template] = resultValue;
                    }

                    try {
                        element.classList.toggle(resultValue, !!value);
                    }
                    catch(e) {
                        console.log(e);
                    }
                    View.Counters.update.class++;
                    break;

                case 'style':
                    var style = resultValue.split(':');
                    var propName = style[0].trim();
                    style.splice(0,1);
                    var propValue = style.join(':');
                    (<HTMLElement>element).style[propName] = propValue;
                    View.Counters.update.style++;
                    break;

                case 'data':
                    //console.log('Set data ', element, element.nodeType, element.textContent);
                    if (element.nodeType === 3 && element.textContent != resultValue) element.textContent = resultValue;
                    View.Counters.update.data++;
                    break;
                default:
                    element.setAttribute(type, resultValue);
                    View.Counters.update.other++;
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

            ViewHelper.setIfNotExistAttribute(this.element, 'id', this.id);

            if (this.hasState(State.HOVER)) {
                this.dispatcher.listen(this.element, BrowserEvent.MOUSEOVER, ()=>t.setState(State.HOVER, true));
                this.dispatcher.listen(this.element, BrowserEvent.MOUSEOUT, ()=>t.setState(State.HOVER, false));
            }

            if (this.hasState(State.SELECTED)) {
                this.dispatcher.listen(this.element, BrowserEvent.CLICK, ()=>t.setState(State.SELECTED, !t.getState(State.SELECTED)));
            }

            this.enterDocumentElement(this.jsTemplate, this.elementPaths);

            this.invalidate(1 | 2);

            var appModels = _.filter(_.keys(this.dynamicProperties), (v:string)=>v.indexOf('app.')===0);
            var modelNames = _.map(appModels, (v)=>v.split('.')[1]);

            _.each(modelNames, (n:string)=><Model>(this.app[n]).bind(this, this.appModelHandler), this);
        }

        public appModelHandler(e)
        {
            if(!this._inDocument) return;
            console.log('AppModelHandler: ', e.target.name, ' view: ', this.name, ', ' , JSON.stringify(e.target.data));
            var modelName = e.target.name;
            var appProps = _.filter(_.keys(this.dynamicProperties), (v:string)=>v.indexOf('app.' + modelName)===0);
            _.each(appProps,(n:string)=>this.updateAppProp(n), this);
             this.applyChangeStateElement(this.jsTemplate, this.elementPaths);
        }

        public exitDocument() {
            var appModels = _.filter(_.keys(this.dynamicProperties), (v:string)=>v.indexOf('app.')===0);
            var modelNames = _.map(appModels, (v)=>v.split('.')[1]);
            _.each(modelNames, (n:string)=><Model>(this.app[n]).unbind(this, this.appModelHandler), this);


            this.dispatcher.unlistenAll(this.element);
            this._inDocument = false;
        }


        public applyEventHandlers(e:any) {
            var path:string = e.currentTarget.getAttribute('data-path');
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
            //console.log('Event to handle ', name, e);
            this.mediator.viewEventHandler( { name:name, target:this, event: e } );
        }

        public enterDocumentElement(value:IDomObject, object:any):any {
            if (!value || !object) return;


            var path = value.path;
            var e:HTMLElement = object[value.path];
            var isTag = e.nodeType === 1;
            var c:View = this.componentPaths[value.path];
            //if(c) console.log('Create listeners ? ', c , e, value.handlers);

            if(c) c.enterDocument();

            if (value.type === DomObjectType.TAG && isTag) {
                //console.log('EnterDocument ', value.tagName, value.path);
                _.each(value.children, function (child:IDomObject, index) {
                    this.enterDocumentElement(child, object);
                }, this);

                // add global handlers if not exist
                //if(c) console.log('Create listeners : ', c , e, value.handlers);
                if(value.handlers) {
                    var id:string = value.staticAttributes?value.staticAttributes['id']:null || ViewHelper.getId();
                    ViewHelper.setIfNotExistAttribute(e, 'id', id);

                    _.each(value.handlers, function (name:string, eventType:string) {
                        if (!this.handlers[path] || !this.handlers[path][eventType]) {
                            if (!this.handlers[path]) this.handlers[path] = {};
                            this.handlers[path][eventType] = name;
                            e.setAttribute('data-path', path);
                            this.dispatcher.listen(e, eventType, this.applyEventHandlers);
                        }
                    }, this);
                }
                else {
                    //e.style['pointer-events'] = 'none';
                }
            }
        }

        public exitDocumentElement(value:IDomObject, object:any):any {
            if (!value || !object) return;

            var path = value.path;
            var e:Element = object[value.path];
            var isTag = e.nodeType === 1;
            var c:View = this.componentPaths[value.path];
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
            //this.log(['Apply change state element: ' , value.path, isIncluded, value.states].join(', '));
            var isEnabled = (e.nodeType === 1);
            //console.log('path, included, enabled ', value.tagName, value.path, isIncluded, isEnabled);

            if(isIncluded && !isEnabled) {
                var newElement = this.getElement(value, object);
                var parentNode = e.parentNode;
                //console.log('Replace and disable ', e, value.path);
                parentNode.replaceChild(newElement,e);
                object[value.path] = newElement;
                this.enterDocumentElement(value, object);
                View.Counters.element.removed++;
            }
            else if(!isIncluded && isEnabled) {
                this.exitDocumentElement(value, object);
                var newElement = this.getElement(value, object);
                var parentNode = e.parentNode;
                //console.log('Replace and enable ', e, value.path);
                //console.log('Replace node on Comment ');
                parentNode.replaceChild(newElement,e);
                object[value.path] = newElement;
                View.Counters.element.removed++;
            } else {
                //console.log('Nothing replace');
            }
        }


        public getFormattedMessage(value:string, data?:any):string {
            View.__formatter[value] = View.__formatter[value] ? View.__formatter[value] : this.getCompiledFormatter(value);
            return <string> (View.__formatter[value](data));
        }

        public getCompiledFormatter(value:string):Function {
            View.__messageFormat[this.locale] = View.__messageFormat[this.locale] ? View.__messageFormat[this.locale] : new MessageFormat(this.locale);
            return View.__messageFormat[this.locale].compile(value);
        }


        //------------------------------------------------------------------------------------------------
        // States
        //------------------------------------------------------------------------------------------------
        public hasState(name:string):boolean {
            return _.isBoolean(this._states[name]);
        }

        public setStates(value:any):View {
            _.each(value,(v,k)=>this.setState(k,v), this);
            return this;
        }

        public setState(name:string, value:any):View {
            if (!(name in this._states)) return this;
            if (name in this._statesType) value = View.getTypedValue(value, this._statesType[name]);


            if (this._states[name] === value) return this;
            console.log('Set state ... ' , name, value );
            this._states[name] = value;


            this.applyState(name, value);
            this.applyChildrenState(name, value);
            this.applyChangeStateElement(this.jsTemplate, this.elementPaths);
            return this;
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
                this._avaibleInheritedStates = _.filter(_.map(this._states, (v:any, k:string)=>k), (k:string)=>this.inheritedStates.indexOf(k)>-1, this);
            }

            return this._avaibleInheritedStates;
        }

        public get inheritedStates():string[] {
            return View.__inheritedStates;
        }

        public get isSelected():boolean {
            return !!this.getState(State.SELECTED);
        }

        public get isHover():boolean {
            return !!this.getState(State.HOVER);
        }

        public get isFocused():boolean {
            return !!this.getState(State.FOCUSED);
        }

        public get isDisabled():boolean {
            return !!this.getState(State.DISABLED);
        }

        public get isOpen():boolean {
            return !!this.getState(State.OPEN);
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

            if (this._invalidate & 1) {
                if(_.isObject(this.data)) this.updateData(this.data, 'data.', 2);
                else this.updateDynamicProperty('data', this.data);

                this.updateApp();
            }

            if (this._invalidate & 2) _.each(this._states, (value, key)=>value?this.applyState(key, value):null, this);


            if (this._invalidate & 4) {
                this.updateChildren();
            }

            this._invalidate = 0;
        }

        private removeInvalidateTimeout() {
            clearTimeout(this._invalidateTimeout);
            this._invalidateTimeout = null;
        }


        //------------------------------------------------------------------------------------------------
        // Mediator
        //------------------------------------------------------------------------------------------------

        public set mediator(value:Mediator) {
            this._mediator = value;
        }


        public setMediator(value:Mediator):View {
            this._mediator = value;
            return this;
        }

        public get mediator():Mediator {
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

        public addChild(value:View):void {
            this.childrenViews = this.childrenViews ? this.childrenViews : [];
            this.childrenViews.push(value);
            value.render(this.childrenContainer);
        }

        public removeChildFrom(index:number):View[] {
            if(!(this.childrenViews && this.childrenViews.length)) return null;
            var result:View[] = this.childrenViews.splice(index);//_.filter(this.childrenViews, (view:View, key:number)=>(key>=index?view.dispose():null) );
            _.each(result, (v:View)=>v.dispose());
            return result;
        }

        public removeAllChildren():View[] {
            _.each(this.childrenViews, (view:View)=>view.dispose());
            var result = this.childrenViews;
            this.childrenViews = [];
            return result;
        }

        public removeChildAt(value:View):void {
        }

        //------------------------------------------------------------------------------------------------
        // Data & model
        //------------------------------------------------------------------------------------------------
        public set data(value:any) {
            console.log('View %s set data %s', this.name , value);
            this._data = value;
            this.invalidate(1);
        }

        public get data():any {
            return this._model?this._model.data:(this._data === null?View.__emptyData:this._data);
        }

        public set model(data:Model) {
            this._model = data;
            this.data = data.data;
        }

        public get app():any {
            return (this._mediator && this._mediator.facade)?this._mediator.facade.model:null;
        }

        public setModel(value:Model, listen?:boolean) {
            this.model = value;
            if(listen) this._model.bind(this, this.modelHandler);
        }

        public modelHandler(e:IEvent):void {
            console.log('modelHandler ', arguments , this._model);

            this.invalidate(1);
        }


        public set locale(value:string) {
            this._locale = value;
        }

        public get locale():string {
            return this._locale;
        }

        public get i18n():any {
            return this.jsTemplate && this.jsTemplate.i18n && this.locale?this.jsTemplate.i18n[this.locale]:null;
        }


        //------------------------------------------------------------------------------------------------
        // Local methods, overrides
        //------------------------------------------------------------------------------------------------

        public sendEvent(name:string, data:any = null, sub:string = null, error:any = null, global:boolean = false):void {
            if (this._mediator) this._mediator.internalHandler({name: name, data: data, global: global, target: this});
        }

        public log(message:string, level?:number):View {
            if (this._mediator) this._mediator.facade.logger.add(this.name, message, level);
            else {
                console.log('[c]', this.name, message, level)
            }
            return this;
        }

        // Overrided
        public viewEventsHandler(name:string, e:any):void {
            this.log('event ' + name);
            this.sendEvent(name, e);
        }

        //
        public eventHandler(name:string, e:any):void {
            console.log(e, e.currentTarget);
            this.viewEventsHandler(name, e);
        }

        // Overrided
        public dispose():View {
            if (this.model) this.model.unbind(this);
            this.exitDocument();
            if (this.element.parentNode) this.element.parentNode.removeChild(this.element);
            super.dispose();
            return this;
        }

        /* Overrided by generator */
        public get dynamicProperties():IDynamicSummary {
            return this.jsTemplate ? this.jsTemplate.dynamicSummary : null;
        }

        public get isDynamicStylesAvaible():boolean {
            return !!(this.jsTemplate && this.jsTemplate.css);
        }

        public isDynamicStylesEnabled(value?:boolean):boolean {
            if(!(this.jsTemplate && this.jsTemplate.css)) return false;
            if (_.isBoolean(value) ) this.jsTemplate.css.enabled = value;
            return this.jsTemplate.css.enabled;
        }

        public enableDynamicStyle(value:boolean) {
            var id = this.className + '__' + Math.random() + 'Style';
            if (this.isDynamicStylesAvaible && value && !this.isDynamicStylesEnabled()) {
                console.log(' *** enable dynamic style *** ', this.jsTemplate.css);
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
            return this.jsTemplate && this.jsTemplate.css ? this.jsTemplate.css.content : null;
        }

        public get templateElement():Element {
            this.elementPaths = {};
            return this.getElement(this.jsTemplate, this.elementPaths);
        }

        public isStateEnabled(states:any):boolean {
            return this.executeExpression(states);
        }

        private executeEval(value:string):any {
            return eval(value);
        }

        public getVarValue(v:string, ex:IExpression):any {
            if(v.indexOf('data.') === 0) {
                var varName:string = v.replace('data.','');
                return (this.data && this.data[varName])?this.data[varName]:null;
            }
            else if(v.indexOf('app.') === 0) {
                return eval('this.'+ v);
            }
            else if(v.indexOf('$') === 0) {
                var varEx:IExpression|string = ex.expressions[parseInt(v.replace('$', ''),10)];
                return (typeof varEx === 'string')?this.executeEval(varEx):this.executeExpression(<IExpression> varEx);
            }
            else if(v.indexOf('.') === -1 || v.indexOf('state.') === 0) {
                var varName:string = v.replace('state.','');
                return this.getState(varName);
            }
            else throw new Error('Not supported variable in ' + this.name + ', ' + v);
        }

        public executeMultiExpression(mex:IMultiExpression):string {
            //console.log('------------------------------ ?* --------------------------' , mex);
            //console.log(mex);
            return _.reduce(mex.vars,
                function (memo:string, value:string) {
                    return memo.replace('{'+value+'}',this.getVarValue(value, mex));
                }, mex.result || '{$0}', this);
        }


        public executeExpression(ex:IExpression):any {
            //console.log(ex);
            var r:any = null;

            // we create object to send to first filter (like i18n method) that returns a string value
            if(ex.args && ex.filters) {
                r = {};
                _.each(ex.args,(v:string,k:string)=>r[k]=this.getVarValue(v,ex),this);
            }
            // other way we search first positive result of values
            else if(ex.values)
            {
                var i = 0, length = ex.values.length;
                while(!r && i < length) {
                    r = this.getVarValue(ex.values[i], ex);
                    //this.log(['Search positive ' + i + ' value in [', ex.values[i], ']=',  r].join(''));
                    i++;
                }
            }
            else throw Error('Expression must has args and filter or values');

            console.log([this.name , ' ... ExecuteExpression ' , ex, '  result=', JSON.stringify(r), ', of content: ', ex.content].join(''), ex);
            r = this.executeFilters(r, ex.filters);
            return r;
        }

        public getElement(value:IDomObject, object:any):Element {
            var e:Element = null;
            var n:Node = null;
            var isIncluded = value.states ? this.isStateEnabled(value.states) : true;
            if (isIncluded && value.type === DomObjectType.TAG) {
                if(value.tagName.indexOf('.') > -1) {
                    //console.log('Create component, ' , value.tagName, value.path);

                    var componentPath = value.tagName.split('.');
                    var component:View = new (global[componentPath[0]][componentPath[1]])();
                    component.mediator = this.mediator;
                    component.setStates(value.attribs);
                    this.componentPaths[value.path] = component;
                    if(value.link) this[value.link] = component;
                    e = component.createDom().element;


                } else {
                    //console.log('Create element ', value.tagName, value.path);
                    e = document.createElement(value.tagName);
                    _.each(value.staticAttributes, function (v,key) {
                        e.setAttribute(key, v);
                    });

                    //if(value.handlers || String(value.path) === '0') ViewHelper.checkElementAttribute(e, 'id',   'id-' + View.Counters.element.added);
                }

                _.each(value.children, function (child:IDomObject, index) {
                    var ce = this.getElement(child, object);
                    if (ce) e.appendChild(ce);
                }, this);
            }
            else if (value.type === DomObjectType.TEXT) n = document.createTextNode( (_.isString(value.data)?value.data:'') );
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

        public get dispatcher():EventDispatcher {
            return View.dispatcher;
        }

        public static getTypedValue(s:any, type:string):any {
            switch (type) {
                case Type.String:
                    return _.isString(s)?s:String(s);
                case Type.Int:
                    return parseInt(s,10);
                case Type.Float:
                    return parseFloat(s);
                case Type.Boolean:
                    return !!(s === true || s === 'true');
            }
        }

        private static __isDynamicStylesEnabled:boolean = false;
        private static __jsTemplate:any = null;
        private static __formatter:{[value:string]:Function} = {};
        private static __messageFormat:{[locale:string]:any} = {};
        private static __className:string = 'View';
        private static __inheritedStates:string[] = [State.DISABLED];
        private static __emptyData:any = {};
        static Counters = { element: {added: 0, removed: 0, handlers: 0}, update: {class: 0, data: 0, style: 0, other: 0}};
        static dispatcher = new EventDispatcher();
        static Name = 'View';
    }


    export class ViewHelper {
        public static getId(name:string = View.Name):string {
            return 'id_' + (View.Counters.element.handlers++);
        }

        public static checkElementAttribute(el:Element, name:string, value:string) {
            if(!el || !name) return;
            if(el.getAttribute(name) !== String(value)) {
                el.setAttribute(name, value);
            }
        }

        public static setIfNotExistAttribute(el:Element, name:string, value:string):boolean {
            if(!el || !name) return;
            if(!el.getAttribute(name)) {
                el.setAttribute(name, value);
                return true;
            }
            return false;
        }

        public static hhmmss(value:any) {
            value = parseInt(value);
            var hours = Math.floor(value / 3600);
            value -= hours * 3600;
            var minutes = Math.floor(value / 60);
            value -= minutes * 60;
            var seconds = Math.floor(value % 60);

            var hoursStr:string = String((hours < 10) ? "0" + hours : hours);
            var minutesStr:string = String((minutes < 10) ? "0" + minutes : minutes);
            var secondsStr:string = String((seconds < 10) ? "0" + seconds : seconds);
            var values = value >= 3600 ? [ hoursStr, minutesStr, secondsStr ] : [ minutesStr, secondsStr ];
            return values.join(":");
        }

    }
    setInterval(function() { console.log(JSON.stringify(View.Counters))}, 3000);
}
