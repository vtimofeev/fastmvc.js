///<reference path="./d.ts" />

module ft {
    export var AttributePathId:string = 'data-path-id';
    var svgNs:string = "http://www.w3.org/2000/svg";
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
                'createTreeObjectFunc', 'addOrReplaceTreeObjectFunc',
                'getTreeObjectFunc', 'setDataTreeObjectFunc', 'enterTreeObjectFunc', 'exitTreeObjectFunc',
                'removeTreeObject'
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
                if (!treeObject) return null;
                if (this.isCommentElement(this.getDomElement(treeObject))) return treeObject;

                // execute tree object functor
                if (treeObjFunctor) treeObjFunctor(treeObject, data, root);

                // execute tree child mapper
                if (childrenTreeObjMapper) {
                    // create children mapper, or use this
                    var childrenMapperInstance:any = _.partial((childrenTreeObjMapper === true ? instanceFunctor.bind(t) : childrenTreeObjMapper), _, root);
                    var childrenMap:any[] = _.map(data.children, childrenMapperInstance, this);
                    // children result executor, appendChild for example
                    if (childrenModificator) {
                        var childrenModificatorInstance:any = _.partial(childrenModificator, _, _, treeObject, data, root);
                        _.each(childrenMap, (v, k)=>childrenModificatorInstance(v, data.children[k]), this);
                    }
                }
                return treeObject;
            }

            return instanceFunctor.bind(t);
        }

        private createTreeObjectFunctor():IGetTreeObjectFunctor {
            return this.functorTreeObject(
                this.createTreeObjectFunc,
                null,
                true,
                this.addOrReplaceTreeObjectFunc,
                'create'
            )
        }

        private enterTreeObjectFunctor():IGetTreeObjectFunctor {
            return this.functorTreeObject(
                this.getTreeObjectFunc,
                this.enterTreeObjectFunc,
                true,
                null,
                'enter'
            )
        }

        private exitTreeObjectFunctor():IGetTreeObjectFunctor {
            return this.functorTreeObject(
                this.getTreeObjectFunc,
                this.exitTreeObjectFunc,
                true,
                this.removeTreeObject,
                'exit'
            )
        }

        private setDataTreeObjectFunctor():IGetTreeObjectFunctor {
            return this.functorTreeObject(
                this.getTreeObjectFunc,
                this.setDataTreeObjectFunc,
                true,
                null,
                'setdata'
            );
        }

        getTreeObjectFunc(data:IDomDef, root:ITemplateView):TreeElement {
            return root.getTreeElementByPath(data.path);
        }

        createTreeObjectFunc(data:IDomDef, root:ITemplateView):TreeElement {
            var isIncluded:boolean = this.isTreeObjectIncluded(data, root);
            var result:TreeElement;
            var currentTreeElement = this.getTreeObjectFunc(data, root);
            var hasVirtual = currentTreeElement && this.isCommentElement(currentTreeElement);

            if (isIncluded) {
                if (!currentTreeElement || hasVirtual) {
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

        enterTreeObjectFunc(object:TreeElement, data:IDomDef, root:ITemplateView) {
            this.setDataTreeObjectFunc(object, data, root);

            if (object && object instanceof TemplateView && !object.inDocument) {
                object.enter();
            }

            if (this.hasChildrenView(data, root)) {
                var childrenView:TemplateChildrenView = root.getChildrenViewByPath(data.path);
                childrenView.enter();
            }


        }

        exitTreeObjectFunc(object:TreeElement, data:IDomDef, root:ITemplateView):TreeElement {
            var domElement = this.getDomElement(object);
            var pathId = this.isTagElement(domElement) ? domElement.getAttribute(AttributePathId) : null;
            this.unregisterDomElementId(pathId);

            if (this.hasChildrenView(data, root)) {
                var childrenView:TemplateChildrenView = root.getChildrenViewByPath(data.path);
                childrenView.dispose();
            }

            if (object && object instanceof TemplateView && !object === root) object.exit();
            return object;
        }

        private composeNames_updateDynamicTree = _.compose(_.compact, _.flatten);

        updateDynamicTreeFast(root:ITemplateView, group?:string, propertyName?:string):void {
            var tmpl = root.getTemplate();
            var dynamicTree:any = tmpl.dynamicTree;
            var map = root.getTemplate().expressionMap;
            for (var prop:string in dynamicTree) {
                for (var name in dynamicTree[prop]) {
                    for(var i in dynamicTree[prop][name]) {
                        var ex:IExpression = map[dynamicTree[prop][name][i]];
                        //console.log('Update tree ... ' ,ex, root);
                        this.applyExpressionToHosts(ex, root)
                    }
                }
            }
        }

        updateDynamicTree(root:ITemplateView, group?:string, propertyName?:string):void {
            var dynamicTree:any = root.getTemplate().dynamicTree;
            if (!dynamicTree) return;

            var expressionArrays:any[];

            if (!group) {
                expressionArrays = _.map(dynamicTree, (v:IDynamicMap, group:string)=>this.getChangedExpressionNames(group, v, root), this);
            } else {
                if (!dynamicTree[group]) return;
                if (propertyName) {
                    expressionArrays = root.isChangedDynamicProperty(propertyName) ? dynamicTree[group][propertyName] : null;
                } else {
                    expressionArrays = this.getChangedExpressionNames(group, dynamicTree[group], root);
                }
            }

            var exNames:string[] = this.composeNames_updateDynamicTree(expressionArrays);
            var tmpl = root.getTemplate();

            var exObjArrays:IExpression[] = _.map(exNames, (v:string)=>(tmpl.expressionMap[v]));
            _.each(exObjArrays, (v, k)=>this.applyExpressionToHosts(v, root), this);
        }

        getChangedExpressionNames(group:string, map:IDynamicMap, root:ITemplateView):(string|string[])[] {
            return _.map(map, (exNames:string[], propName:string)=>(root.isChangedDynamicProperty(propName) ? exNames : null), this);
        }


        setDataTreeObjectFunc(object:TreeElement, data:IDomDef, root:ITemplateView) {
            var domElement = <HTMLElement> this.getDomElement(object);

            //set all dom attributes
            if (this.isTagElement(domElement) && !domElement.getAttribute(AttributePathId)) {
                // simple attributes (id, title, name...)
                var attribs = data.attribs;
                var attrsResult = attribs ? _.reduce(attribs,
                    (r:any, value:ExpressionValue, key:string)=>(this.specialDomAttrs.indexOf(key) < 0 ? (r[key] = this.getSimpleOrExpressionValue(value, root)) : null, r), {}, this) : {};

                var domElementPathId:string = this.getNextId();
                attrsResult[AttributePathId] = domElementPathId;

                if (this.isSvgNode(data.name)) {
                    this.setDomElementAttributes(attrsResult, domElement);
                }
                else {
                    this.setSvgElementAttributes(attrsResult, domElement);
                }
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


        addOrReplaceTreeObjectFunc(object:TreeElement, data:IDomDef, parent:TreeElement, parentData:IDomDef, root:ITemplateView) {
            var objectElement = this.getDomElement(object);

            if (objectElement.parentNode) return;
            var parentElement = this.getDomElement(parent);
            if (!parentElement) throw 'Has no parent element';

            var previousObject = this.getTreeObjectFunc(data, root);
            var previousElement = previousObject ? this.getDomElement(previousObject) : null;

            if (previousObject && previousObject !== object) {
                if (object instanceof TemplateView) {
                    object.enter();
                    object.validate();
                }
                else {
                    this.setDataTreeObjectFunc(object, data, root);
                }
                parentElement.replaceChild(objectElement, previousElement);
            } else {
                //console.log('Append child. ', data.path, objectElement.parentNode, objectElement);
                parentElement.appendChild(objectElement);
            }

            if (previousObject && !this.isCommentElement(previousObject)) {
                this.exitTreeObject(data, root);
            }

            root.setTreeElementPath(data.path, object);
        }

        removeTreeObject(object:TreeElement, data:IDomDef, parent:TreeElement, parentData:IDomDef, root:ITemplateView) {
            //this.getDomElement(parent).replaceChild(this.getDomElement(object), this.getCommentElement(data));
            this.getDomElement(parent).removeChild(this.getDomElement(object));
            if (object instanceof TemplateView) object.setTreeElementPath(data.path, null);


        }


        // -----------------------------------------------------------------------------------------------------------
        // Creation
        // -----------------------------------------------------------------------------------------------------------

        createComponentElement(data:IDomDef, root:TemplateView):ITemplateView {
            var ComponentConstructor:ITemplateConstructor = window[data.name];
            var result = ComponentConstructor('view-' + data.name + '-' + this.getNextId(), this.applyFirstContextToExpressionParameters(data.params, root));
            result.parent = root;
            result.domDef = data;
            if (result !== root) result.createDom();
            return result;
        }


        createDomElement(type:string, data:IDomDef, root:TemplateView):HTMLElement|Comment|Text {
            var name:string = data.name;
            switch (type) {
                case 'text':
                    return document.createTextNode(_.isString(data.data) ? data.data : '');
                case 'comment':
                    return document.createComment(data.path);
                default:
                    if (name === 'svg' || name === 'circle') {
                        return document.createElementNS(svgNs, name);
                    }
                    else {
                        return document.createElement(name);
                    }
            }
        }

        createChildrenViewTreeObjecFunc(object:TreeElement, data:IDomDef, root:ITemplateView):TreeElement {
            if (this.hasChildrenDef(data)) {
                var childrenView = new TemplateChildrenView(root.name + ':ChildView-' + this.getNextId(), this.applyFirstContextToExpressionParameters(root.getParameters(), root));
                childrenView.domDef = data;
                childrenView.parent = root;
                childrenView.setElement(this.getDomElement(object));
                childrenView.createDom();
                childrenView.enter();
                root.setChildrenViewPath(data.path, childrenView);
            }
        }


        // -----------------------------------------------------------------------------------------------------------
        // Updates, apply value
        // -----------------------------------------------------------------------------------------------------------


        applyExpressionToHosts(exObj:IExpression, root:ITemplateView):void {
            var result;
            var el:HTMLElement;
            var i:number;
            var l = exObj.hosts.length;
            var host:IExpressionHost;

            for (i = 0; i < l; i++) {
                host = exObj.hosts[i];

                /*
                performance bench
                if(host.group === 'data') result = Math.round(Math.random()*100);
                 */
                result = result || (host.key === 'class' ? root.getCssClassExpressionValue(exObj) : root.getExpressionValue(exObj));


                el = this.getDomElement(root.getTreeElementByPath(host.path));
                if (el && el.nodeType != 8) this.applyValueToHost(result, el, host, root);
            }
        }

        applyValueToHost(value:any, el:HTMLElement, host:IExpressionHost, root:ITemplateView):any {
            var key:string = host.key;

            //console.log('Apply to ' , host.path, host.key, value);
            switch (host.group) {
                case 'data':
                    el.textContent = value;
                    return;

                case 'attribs':
                    switch (host.key) {
                        case 'style':
                            el.style[host.keyProperty] = (value ? value : '');
                            return;
                        case 'class':

                            var previousClassValue = root.getPathClassValue(host.path, host.keyProperty);
                            previousClassValue && previousClassValue !== value ? el.classList.toggle(previousClassValue, false) : null;
                            value ? el.classList.toggle(value, true) : null;
                            root.setPathClassValue(host.path, host.keyProperty, value);
                            return;
                        default:
                            if (this.isSvgNode(el.nodeName)) {
                                var method = value ? el.setAttributeNS : el.removeAttributeNS;
                                if (host.key) method.call(el, null, host.key, value);
                            } else {
                                var method = value ? el.setAttribute : el.removeAttribute;
                                if (host.key) method.call(el, host.key, value);
                            }
                            return;
                    }
                    return;
                case 'params':
                    // Default params changed: Data: model, data; states: selected, focused, children, base, custom
                    if (key.indexOf('.') < 0) {
                        var view = <TemplateView> root.getTreeElementByPath(host.path);
                        view.applyParameter(value, key, root);
                    }
                    // Children.params changed
                    else if (key.indexOf('children.') === 0) {

                        var childrenView = <TemplateChildrenView> root.getChildrenViewByPath(host.path);
                        if (!childrenView) {
                            console.warn('Has no ChildrenView instance and cant set hostValue ', host.path, key);
                            return;
                        }

                        if (key === 'children.data') {
                            childrenView.data = value;
                            //childrenView.validate();
                        }
                        else {
                            childrenView.applyChildrenParameter(value, key, root);
                        }
                    }
                    else {
                        console.warn('Not supported host parameter at applyToHost ', key, value, host.path);
                    }
                    return;
            }
        }


        // -----------------------------------------------------------------------------------------------------------
        // Attrs & values
        // -----------------------------------------------------------------------------------------------------------


        isSvgNode(name:string):boolean {
            return name === 'svg' || name === 'circle' || false;
        }

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
            this.domElementPathIds[id] = {data: data, root: root};
        }

        unregisterDomElementId(id:string):void {
            if (id) delete this.domElementPathIds[id];
        }

        getPathDefinitionByPathId(id:string):{data:IDomDef, root:ITemplateView} {
            return this.domElementPathIds[id];
        }

        // ------------------------------------------------------------------------------------------------------------
        // Utilites
        // ------------------------------------------------------------------------------------------------------------

        public applyFirstContextToExpressionParameters(params:any, context:ITemplateView) {
            if(!context) return params;

            var r = {};
            _.each(params, (v,k)=>{
                var isExpression = typeof v === 'object' && v.name;
                r[k]= isExpression?_.extend({},v):v;
                if(isExpression && !r[k].context) r[k].context = context;
            });
            return r;
        }

        private hasDelay(data:IDomDef, root:ITemplateView, functorName:string) {
            return data.params && data.params[functorName + 'Delay'] && root.isDelay(data, functorName);
        }

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
                (value:any, name:string)=> {
                    if (!object.classList) return;
                    previousClassValue = root.getPathClassValue(data.path, name);
                    previousClassValue && previousClassValue !== value ? object.classList.toggle(previousClassValue, false) : null,
                        value ? object.classList.toggle(value, true) : null,
                        root.setPathClassValue(data.path, name, value)
                }
            );
        }

        setDomElementStyles(vals:IObj, object:HTMLElement, root:ITemplateView) {
            _.each(vals, (value:any, name:string)=>object.style[name] = (value ? value : ''));
        }

        setDomElementAttributes(attrs:IObj, object:HTMLElement) {
            _.each(attrs, function (value:any, name:string) {
                var method = value ? object.setAttribute : object.removeAttribute;
                method.call(object, name, value);
            });
        }

        setSvgElementAttributes(attrs:IObj, object:HTMLElement) {
            _.each(attrs, function (value:any, name:string) {
                var method = value ? object.setAttributeNS : object.removeAttributeNS;
                method.call(object, null, name, value);
            });
        }


        getDomElement(value:TreeElement):HTMLElement {
            return <HTMLElement> (value instanceof TemplateView ? value.getElement() : value);
        }

        isComponentDef(data:IDomDef):boolean {
            return data.type && data.name && (data.name.indexOf('.') > 0);
        }

        isTreeObjectIncluded(data:IDomDef, root:ITemplateView):boolean {
            var states:any = data.params ? data.params[TemplateParams.states] : null;
            var hasDelay:Boolean = this.hasDelay(data, root, 'create');

            if (hasDelay) root.setDelay(data, 'create');

            if (!states && !hasDelay) return true;

            return !hasDelay && !!this.getExpressionValue(states, root);
        }


        hasChildrenDef(data:IDomDef):boolean {
            return !!(data.params && data.params[TemplateParams.childrenClass]);
        }

        hasChildrenView(data:IDomDef, root:ITemplateView) {
            return !!root.getChildrenViewByPath(data.path);
        }


        //-------------------------------------------------------------------------------------------------
        // Event bubbling
        //-------------------------------------------------------------------------------------------------

        dispatchTreeEventDown(e:ITreeEvent) {
            var def:IDomDef = <IDomDef> (e.currentDef || e.def);
            var view = <ITemplateView> (e.currentTarget || e.target);
            var template = view.getTemplate();

            // Execute current def handler
            this.triggerDefEvent(e);

            while (!e.cancelled && (def = template.pathMap[def.parentPath])) {
                // Execute on defs tree in view template scope
                e.currentDef = def;
                this.triggerDefEvent(e);
            }
            // Send to parent template defs tree

            view.handleTreeEvent(e);

            if (view.parent) {
                // exec event on parent
                def = view.domDef;
                e.currentTarget = view.parent;
                e.currentDef = def;
                this.triggerDefEvent(e);

                // check canceled
                e.cancelled = !!e.executionHandlersCount && e.name === 'click';

                // exec parent next domDef to root
                e.currentDef = def.parentPath ? view.parent.getTemplate().pathMap[def.parentPath] : null;
                if (!e.cancelled && e.currentDef) this.dispatchTreeEventDown(e);
            }
        }

        private triggerDefEvent(e:ITreeEvent):void {
            var def:IDomDef = <IDomDef> (e.currentDef || e.def);
            var view = <ITemplateView> (e.currentTarget || e.target);
            //console.log('Trigger def event, ', e.name, ' path ', def.path);


            if (!view.disabled && def.handlers && def.handlers[e.name]) {
                view.evalHandler(def.handlers[e.name], e);
                e.executionHandlersCount++;
            }
        }


    }
}
