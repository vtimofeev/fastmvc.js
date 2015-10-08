///<reference path="./d.ts" />

module ft {
    export var AttributePathId:string = 'data-path-id';
    var ComplexDomElementAttributes:string[] = ['style', 'class'];

    export class TemplateViewHelper implements ITemplateViewHelper {
        private idCounter:number = 0;
        private domElementPathIds:{[id:string]:ITemplateView} = {};


        public createTreeObject:IGetTreeObjectFunctor;
        public enterTreeObject:IGetTreeObjectFunctor;
        public exitTreeObject:IGetTreeObjectFunctor;
        public setDataTreeObject:IGetTreeObjectFunctor;

        constructor() {
            _.bindAll(this,
                'createTreeObjectFunc', 'initTreeElement', 'addTreeObjectFunc',
                'getTreeObject', 'setDataTreeObjectFunc', 'enterTreeObjectFunc', 'exitTreeObjectFunc'
            );

            this.createTreeObject = this.createTreeObjectFunctor();
            this.enterTreeObject = this.enterTreeObjectFunctor();
            this.exitTreeObject = this.exitTreeObjectFunctor();
            this.setDataTreeObject = this.setDataTreeObjectFunctor();
        }

        private functorTreeObject(treeObjGetter:IGetTreeObjectFunctor,
                                  treeObjFunctor:ITreeObjectFunctor,
                                  childrenTreeObjMapper:ITreeObjectFunctor|boolean/* reverse if true */,
                                  childrenModificator:IChildrenTreeObjectFunctor,
                                  functorName?:string) {

            var t = this;

            function instanceFunctor(data:IDomDef, root:TemplateView) {
                var treeObject = treeObjGetter(data, root);
                //console.log('[%s] object is ', data.path, treeObject);
                if (!treeObject) return null;
                if (this.isCommentElement(this.getDomElement(treeObject))) return treeObject;

                // execute tree object functor
                if (treeObjFunctor) treeObjFunctor(treeObject, data, root);

                // execute tree child mapper
                if (childrenTreeObjMapper) {
                    // create children mapper, or use this
                    var childrenMapperInstance:any = _.partial((childrenTreeObjMapper===true?instanceFunctor.bind(t):childrenTreeObjMapper),_, root);
                    var childrenMap:any[] = _.map(data.children, childrenMapperInstance, this);
                    // children result executor, appendChild for example
                    if (childrenModificator) {
                        var childrenModificatorInstance:any = _.partial(childrenModificator, _, _, treeObject, data, root);
                        _.each(childrenMap, (v,k)=>childrenModificatorInstance(v, data.children[k]), this);
                    }
                }
                return treeObject;
            }
            return instanceFunctor.bind(t);
        }

        private createTreeObjectFunctor():IGetTreeObjectFunctor {
            return this.functorTreeObject(
                this.createTreeObjectFunc,
                this.initTreeElement,
                true,
                this.addTreeObjectFunc,
                'create'
            )
        }

        private enterTreeObjectFunctor():IGetTreeObjectFunctor {
            return this.functorTreeObject(
                this.getTreeObject,
                this.enterTreeObjectFunc,
                true,
                null,
                'enter'
            )
        }

        private exitTreeObjectFunctor():IGetTreeObjectFunctor {
            return this.functorTreeObject(
                this.getTreeObject,
                this.exitTreeObjectFunc,
                true,
                this.removeTreeObject,
                'exit'
            )
        }

        private setDataTreeObjectFunctor():IGetTreeObjectFunctor {
            return this.functorTreeObject(
                this.getTreeObject,
                this.setDataTreeObjectFunc,
                true,
                null,
                'setdata'
            );
        }

        initTreeElement(value:TreeElement, data:IDomDef, root:ITemplateView) {
            if (value instanceof TemplateView) {
                if(value.inDocument) return;
                var view = (<ITemplateView>value);
                if(value !== root) view.createDom();
            }
        }

        getTreeObject(data:IDomDef, root:ITemplateView):TreeElement {
            return root.getTreeElementByPath(data.path);
        }

        createTreeObjectFunc(data:IDomDef, root:ITemplateView):TreeElement {
            var isIncluded:boolean = this.isTreeObjectIncluded(data, root);
            var result:TreeElement;
            var currentTreeElement = this.getTreeObject(data, root);
            var hasVirtual = currentTreeElement && this.isCommentElement(currentTreeElement);

            if (isIncluded) {
                if(!currentTreeElement || hasVirtual) {
                    result = this.isComponentDef(data) ? this.createComponentElement(data, root) : this.createDomElement(data.type, data, root);
                    this.createChildrenViewTreeObjecFunc(result, data, root);
                } else {
                    result = currentTreeElement;
                }
            } else {
                result = hasVirtual ? currentTreeElement : this.createDomElement('comment', data, root);
            }
            return result;
        }

        createChildrenViewTreeObjecFunc(object:TreeElement, data:IDomDef, root:ITemplateView):TreeElement {
            if(this.hasChildrenDef(data)) {
                var childrenView = new TemplateViewChildren();
                childrenView.domDef = data;
                childrenView.parent = root;

                var childrenData:any[] = data.params[TemplateParams.childrenData]?this.getExpressionValue(data.params[TemplateParams.childrenData], root):null;
                var childrenModel:fmvc.Model = data.params[TemplateParams.childrenModel]?this.getExpressionValue(data.params[TemplateParams.childrenModel]):null;
                if(childrenModel) childrenView.model = childrenModel;
                if(childrenData && _.isArray(childrenData)) childrenView.data = childrenData;

                childrenView.setElement(this.getDomElement(object));

                childrenView.createDom();
                root.setChildrenViewPath(data.path, childrenView);
            }
        }

        createComponentElement(data:IDomDef, root:TemplateView):ITemplateView {
            var ComponentConstructor:ITemplateConstructor = window[data.name];
            var result = ComponentConstructor('view-' + data.name + '-' + this.getNextId(), data.params);
            result.parent = root;
            result.domDef = data;
            return result;
        }

        createDomElement(type:string, data:IDomDef, root:TemplateView):HTMLElement|Comment|Text {
            switch (type) {
                case 'text':
                    return document.createTextNode(_.isString(data.data) ? data.data : '');
                case 'comment':
                    return document.createComment(data.path);
                default:
                    return document.createElement(data.name);
            }
        }

        getUpdateTreeTypeFunc(data:IDomDef, root:TemplateView):number {
            var isIncluded:boolean = this.isTreeObjectIncluded(data, root);
            var treeElement:TreeElement = this.getTreeObject(data, root);
            // 0 - skip, 1 - create, -1 - remove
            return ((isIncluded && treeElement && !this.isCommentElement(treeElement)) ? 0 : isIncluded ? 1 : -1);
        }


        enterTreeObjectFunc(object:TreeElement, data:IDomDef, root:ITemplateView) {
            if (object && object instanceof TemplateView && !object.inDocument) {
                object.enter();
            }

            if (this.hasChildrenView(data, root)) {
                var childrenView:TemplateViewChildren = root.getChildrenViewByPath(data.path);
                childrenView.enter();
                /*
                this.removeDataChildrenOfTreeObject(object, data, root);
                this.createDataChildrenOfTreeObject(object, data, root);
                */
            }
        }

        exitTreeObjectFunc(object:TreeElement, data:IDomDef, root:ITemplateView):TreeElement {
            var domElement = this.getDomElement(object);
            var pathId = this.isTagElement(domElement)?domElement.getAttribute(AttributePathId):null;
            this.unregisterDomElementId(pathId);
            root.setTreeElementPath(data.path, null);

            if (this.hasChildrenView(data, root)) {
                var childrenView:TemplateViewChildren = root.getChildrenViewByPath(data.path);
                childrenView.dispose();
            }

            if (object && object instanceof TemplateView) object.exit();
            return object;
        }

        updateDynamicTree(root:ITemplateView, group?:string):void {
            var dynamicTree:any = root.getTemplate().dynamicTree;
            var exArrays:any[];
            if(!group) {
                exArrays = _.map(dynamicTree, (v:IDynamicMap, group:string)=>this.getChangedExpressionNames(group, v, root), this);
            } else {
                exArrays = this.getChangedExpressionNames(group, dynamicTree[group], root);
            }

            var exNames:string[] = _.compose(_.compact, _.flatten)(exArrays);
            var tmpl = root.getTemplate();

            var exObjArrays:IExpression[] = _.map(exNames, (v:string)=>(tmpl.expressionMap[v]));
            _.each(exObjArrays, <any>_.partial(this.applyExpressionToHosts, _, root), this);
        }

        getChangedExpressionNames(group:string, map:IDynamicMap, root:ITemplateView):(string|string[])[] {
            return _.map(map, (exNames:string[], prorName:string)=>(root.isChangedDynamicProperty(prorName) ? exNames : null), this);
        }

        dispatchTreeEventDown(e:ITreeEvent) {
            var def:IDomDef = <IDomDef> (e.currentDef || e.def);
            var view = <ITemplateView> (e.currentTarget || e.target);
            var template = view.getTemplate();

            // Execute current def handler
            this.triggerDefEvent(e);

            while ((def = template.pathMap[def.parentPath]) && !e.cancelled) {
                // Execute on defs tree in view template scope
                e.currentDef = def;
                this.triggerDefEvent(e);
            }

            // Execute local(dynamic) view handlers
            view.handleTreeEvent(e);

            // Send to parent template defs tree
            if (view.parent) {
                e.currentTarget = view.parent;
                e.currentDef = view.domDef;
                this.dispatchTreeEventDown(e);
            }
        }

        private triggerDefEvent(e:ITreeEvent):void {
            var def:IDomDef = <IDomDef> (e.currentDef || e.def);
            var view = <ITemplateView> (e.currentTarget || e.target);
            if (def.handlers && def.handlers[e.name]) view.evalHandler(def.handlers[e.name], e);
        }

        applyExpressionToHosts(exObj:IExpression, root:ITemplateView):void {
            var result;
            var el:HTMLElement;
            _.each(exObj.hosts, (host:IExpressionHost)=>(

                result = result || (host.key === 'class' ? root.getCssClassExpressionValue(exObj) : root.getExpressionValue(exObj)),
                    el = this.getDomElement(root.getTreeElementByPath(host.path)),
                    el && el.nodeType != 8 ? this.applyValueToHost(result, el, host, root) : null
            ), this);
        }


        applyValueToHost(value:any, el:HTMLElement, host:IExpressionHost, root:ITemplateView):any {
            switch (host.group) {
                case 'attribs':
                    switch (host.key) {
                        case 'style':
                            el.style[host.keyProperty] = (value ? value : '');
                            return;
                        case 'class':
                            var previousClassValue = root.getPathClassValue(host.path, host.keyProperty);
                            previousClassValue && previousClassValue !== value ? el.classList.toggle(previousClassValue, false) : null;
                            value ? el.classList.toggle(value, true) : null;
                            root.setPathClassValue(host.path, host.keyProperty, value)
                            return;
                        default:
                            var method = value ? el.setAttribute : el.removeAttribute;
                            if (host.key) method.call(el, host.key, value);
                            return;
                    }
                    return;

                case 'params':
                    switch (host.key) {
                        case TemplateParams.setStateSelected:
                            var view = root.getTreeElementByPath(host.path);
                            if(view) setTimeout(()=>view.setState('selected', !!value), 0);
                            return;
                        case TemplateParams.childrenData:
                            var childrenView = root.getChildrenViewByPath(host.path);
                            if(childrenView) {
                                childrenView.data = value;
                                childrenView.validate();
                            }
                            return;

                        case TemplateParams.childrenSetStateSelected:
                            var childrenView = root.getChildrenViewByPath(host.path);
                            if(childrenView) {
                                setTimeout(()=>childrenView.checkSelected());
                            }
                            return;

                    }
                    return;

                case 'data':
                    el.textContent = value;
                    return;
            }
        }

        setDataTreeObjectFunc(object:TreeElement, data:IDomDef, root:ITemplateView) {
            var domElement = <HTMLElement> this.getDomElement(object);

            //set all dom attributes
            if (this.isTagElement(domElement)) {
                // simple attributes (id, title, name...)
               var attribs = data.attribs;
               var attrsResult = attribs?_.reduce(attribs,
                   (r:any, value:ExpressionValue, key:string)=>(this.specialDomAttrs.indexOf(key) < 0 ? (r[key] = this.getSimpleOrExpressionValue(value, root)) : null, r), {}, this):{};

                //attrsResult.id = this.getElementId(domElement, attribs);
                var domElementPathId:string = this.getNextId();
                attrsResult[AttributePathId] = domElementPathId;

                this.setDomAttrs(attrsResult, domElement);
                this.registerDomElementId(domElementPathId, data, root);

                // class
                if (attribs && attribs.class) {
                    var classesValues = this.getPropertyValues('attribs', 'class', data, root);
                    this.setDomElementClasses(classesValues, domElement, data, root); // side effect, root add map enabled classes
                }
                // style
                if (attribs && attribs.style) {
                    var stylesValues = this.getPropertyValues('attribs', 'style', data, root);
                    this.setDomElementStyles(stylesValues, domElement, root);
                }
            }

            // data
            if (data.data) {
                domElement.textContent = this.getSimpleOrExpressionValue(data.data, root);
            }
        }

        addTreeObjectFunc(object:TreeElement,  data:IDomDef, parent:TreeElement, parentData:IDomDef, root:ITemplateView) {
            var objectElement = this.getDomElement(object);
            if (objectElement.parentElement) return;
            var parentElement = this.getDomElement(parent);
            if (!parentElement) throw 'Has no parent element';

            var previousObject = this.getTreeObject(data, root);
            var previousElement = previousObject?this.getDomElement(previousObject):null;

            if(previousObject && previousObject !== object) {
                parentElement.replaceChild(objectElement, previousElement);
                this.setDataTreeObjectFunc(object, data, root);
                if(object instanceof TemplateView) {
                    object.enter();
                }

            } else {
                parentElement.appendChild(objectElement);
            }

            if(previousObject && !this.isCommentElement(previousObject)) {
               this.exitTreeObject(data, root);
            }

            root.setTreeElementPath(data.path, object);
        }

        removeTreeObject(object:TreeElement, data:IDomDef, parent:TreeElement, parentData:IDomDef, root:ITemplateView) {
            //this.getDomElement(parent).replaceChild(this.getDomElement(object), this.getCommentElement(data));
        }

        // -----------------------------------------------------------------------------------------------------------
        // Attrs & values
        // -----------------------------------------------------------------------------------------------------------


        getPropertyValues(group:string, attrName:string, data:IDomDef, root:ITemplateView):IObj {
            var functor = (attrName === 'class') ? this.getClassSimpleOrExpressionValue : this.getSimpleOrExpressionValue;

            return _.reduce(data[group][attrName], (result:any, value:ExpressionValue, key:string)=>(
                result[key] = functor.call(this, value, root), result), {}, this);
        }

        getSimpleOrExpressionValue(value:ExpressionNameValue, root:ITemplateView) {
            return _.isObject(value) ? this.getExpressionValue(<IExpressionName> value, root) : value;
        }

        getClassSimpleOrExpressionValue(value:ExpressionNameValue, root:ITemplateView) {
            return _.isObject(value) ? root.getCssClassExpressionValue(<IExpressionName> value) : value;
        }


        getExpressionValue(value:IExpressionName, root:ITemplateView):any {
            return root.getExpressionValue(value);
        }

        registerDomElementId(id:string, data:IDomDef, root:ITemplateView):void {
            this.domElementPathIds[id] = {data: data, root:root};
        }

        unregisterDomElementId(id:string):void {
            if(id) {
                delete this.domElementPathIds[id];
            }
        }

        getPathDefinitionByPathId(id:string):{data:IDomDef, root:ITemplateView} {
            return this.domElementPathIds[id];
        }

        // ------------------------------------------------------------------------------------------------------------
        // Utilites
        // ------------------------------------------------------------------------------------------------------------

        private isTagElement(e:Element):Boolean {
            return e && e.nodeType === 1;
        }

        private isCommentElement(e:Element):Boolean {
            return e && e.nodeType === 8;
        }

        getNextId():string {
            return (this.idCounter++).toString(36);
        }

        get specialDomAttrs():string[] {
            return ComplexDomElementAttributes;
        }

        setDomElementClasses(vals:IObj, object:HTMLElement, data:IDomDef, root:ITemplateView) {
            var previousClassValue:string;
            _.each(vals,
                (value:any, name:string)=>
                    (
                        previousClassValue = root.getPathClassValue(data.path, name),
                            previousClassValue && previousClassValue !== value ? object.classList.toggle(previousClassValue, false) : null,
                            value ? object.classList.toggle(value, true) : null,
                            root.setPathClassValue(data.path, name, value)
                    )
            );
        }

        setDomElementStyles(vals:IObj, object:HTMLElement, root:ITemplateView) {
            _.each(vals, (value:any, name:string)=>object.style[name] = (value ? value : ''));
        }

        setDomAttrs(attrs:IObj, object:HTMLElement) {
            _.each(attrs, function (value:any, name:string) {
                var method = value ? object.setAttribute : object.removeAttribute;
                method.call(object, name, value);
            });
        }

        getDomElement(value:TreeElement):HTMLElement {
            return <HTMLElement> (value instanceof TemplateView ? value.getElement() : value);
        }

        isComponentDef(data:IDomDef):boolean {
            return data.type && data.name && (data.name.indexOf('.') > 0);
        }

        isTreeObjectIncluded(data:IDomDef, root:ITemplateView):boolean {
            var states:any = data.params?data.params[TemplateParams.states]:null;
            if (!states) return true;
            return !!this.getExpressionValue(states, root);
        }

        // -------------------------------- Children code @move --------------------------------------- //
        hasChildrenDef(data:IDomDef):boolean {
            return !!(data.params
                && data.params[TemplateParams.childrenClass] // has constructor
                && (data.params[TemplateParams.childrenData] || data.params[TemplateParams.childrenModel]) // has data
            );
        }

        hasChildrenView(data:IDomDef, root:ITemplateView) {
            return !!root.getChildrenViewByPath(data.path);
        }
    }
}
