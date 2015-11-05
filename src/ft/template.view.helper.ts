///<reference path="./d.ts" />

module ft {
    export var AttributePathId:string = 'data-path-id';
    var svgNs:string = "http://www.w3.org/2000/svg";
    var ComplexDomElementAttributes:string[] = ['style', 'class'];
    var DomDefType:any = {
        Tag: 'tag',
        Svg: 'svg',
        Text: 'text',
        Comment: 'comment'
    };


    export class TemplateViewHelper implements ITemplateViewHelper {
        private idCounter:number = 0;
        public domElementPathIds:{[id:string]:ITemplateView} = {};

        constructor() {
        }

        public createTree(data:IDomDef, root:TemplateView):TreeElement {
            var treeElement:TreeElement = this.createTreeElement(data, root);
            root.setTreeElementPath(data.path, treeElement);

            var treeDomElement:HTMLElement = this.getDomElement(treeElement);
            var i:number;
            var childrenLength:number;

            if (this.isCommentElement(treeDomElement)) {
                return treeElement;
            }
            else {
                for (i = 0, childrenLength = (data.children ? data.children.length : 0); i < childrenLength; i++) {
                    var childrenTreeElement:TreeElement = this.createTree(data.children[i], root);
                    //console.log('CreateDom Append child', childrenTreeElement);
                    treeDomElement.appendChild(childrenTreeElement instanceof TemplateView ? childrenTreeElement.getElement() : childrenTreeElement);
                }
                return treeElement;
            }
        }

        public validateTree(data:IDomDef, root:TemplateView):void {
            var treeElement:TreeElement = this.getTreeElement(data, root);
            var treeDomElement:HTMLElement|Comment = this.getDomElement(treeElement);
            var included:boolean = this.isTreeObjectIncluded(data, root);
            var isComment:boolean = this.isCommentElement(treeDomElement);
            var newElement:TreeElement;
            var i:number;
            var childrenLength:number;

            if (isComment && included) {
                newElement = this.createTree(data, root);
                this.enterTree(data, root);
                treeDomElement.parentNode.replaceChild(treeDomElement, this.getDomElement(newElement));
            }
            else if (!isComment && !included) {
                this.exitTree(data, root);
                newElement = this.createTree(data, root);
                treeDomElement.parentNode.replaceChild(treeDomElement, this.getDomElement(newElement));
            }
            else if(!isComment) {
                for (i = 0, childrenLength = (data.children ? data.children.length : 0); i < childrenLength; i++) {
                    this.validateTree(data.children[i], root);
                }
            }
        }

        enterTree(data:IDomDef, root:ITemplateView):void {
            var treeElement:TreeElement = this.getTreeElement(data, root);

            if (treeElement instanceof TemplateView && treeElement !== root) {
                treeElement.enter();
            }

            var treeDomElement:HTMLElement = this.getDomElement(treeElement);

            if (this.isTagElement(treeDomElement)) {
                // Регистрация элемента для диспетчера
                this.registerDomElementId(treeDomElement.getAttribute(AttributePathId), data, root);

                this.enterChildrenView(data, root);

                var i:number;
                var childrenLength:number;
                for (i = 0, childrenLength = (data.children ? data.children.length : 0); i < childrenLength; i++) {
                    this.enterTree(data.children[i], root);
                }
            }
        }

        public exitTree(data:IDomDef, root:TemplateView):void {

            var treeElement:TreeElement = this.getTreeElement(data, root);
            //console.log('Exit ', treeElement, data, root);

            var i:number;
            var childrenLength:number;
            var domElement:HTMLElement = this.getDomElement(treeElement);
            var isComment:boolean = this.isCommentElement(domElement);
            if (!isComment) {
                this.exitChildrenView(data,root);
                for (i = 0, childrenLength = (data.children ? data.children.length : 0); i < childrenLength; i++) {
                    this.exitTree(data.children[i], root);
                }
            }

            if (treeElement instanceof TemplateView && treeElement !== root) {
                treeElement.exit();
            } else {
                var pathId:string = this.isTagElement(domElement) ? domElement.getAttribute(AttributePathId) : null;
                this.unregisterDomElementId(pathId);
            }
        }

        private composeNames_updateDynamicTree = _.compose(_.union, _.compact, _.flatten);
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

            // console.log('Update dynamic tree ', root.name, exNames);
            var exObjArrays:IExpression[] = _.map(exNames, (v:string)=>(tmpl.expressionMap[v]));
            _.each(exObjArrays, (v, k)=>this.applyExpressionToHosts(v, root), this);
        }




        // -----------------------------------------------------------------------------------------------------------
        // Creation
        // -----------------------------------------------------------------------------------------------------------

        private createTreeElement(data:IDomDef, root:ITemplateView):TreeElement {
            var isIncluded:boolean = this.isTreeObjectIncluded(data, root);
            var result:TreeElement = null;


            if (isIncluded) { // Элемент включен в дерево
                if (this.isComponentDef(data)) {
                    result = this.createComponentElement(data, root);
                } else {
                    result = this.createDomElement(data.type, data, root);

                }
                this.createChildrenView(result, data, root);
            } else { // Элемент исключен из дерева
                result = this.createDomElement('comment', data, root);
            }


            if (data.params && data.params.ln) {
                root[data.params.ln] = result; // Установка ссылки на рутовый элемент
            }
            return result;
        }


        createComponentElement(data:IDomDef, root:TemplateView):ITemplateView {
            var dataParams:any = this.applyFirstContextToExpressionParameters(data.params, root);
            var result = templateManager.createInstance(data.name, 'view-' + data.name + '-' + this.getNextId(), dataParams);
            //console.log('CreateComponent ', data.name, result !== root, dataParams, result);
            result.parent = root;
            result.domDef = data;
            if (result !== root) result.createDom();
            return result;
        }


        createDomElement(type:string, data:IDomDef, root:TemplateView):HTMLElement|Comment|Text {
            var result:HTMLElement|Text;
            switch (type) {
                case DomDefType.Tag:
                    var result = document.createElement(data.name);
                    this.initDomElement(result, data, root);
                    return result;
                case DomDefType.Text:
                    var result = document.createTextNode('');
                    this.initTextElement(result, data, root);
                    return result;
                case DomDefType.Comment:
                    return document.createComment(data.path);
                case DomDefType.Svg:
                    result = document.createElementNS(svgNs, data.name);
                    this.initDomElement(result, data, root);
                    return result;
                default:
                    throw 'Cant create dom element ' + type + ' of ' + data.path + ', ' + root.name;
                    return null;
            }
        }

        createChildrenView(object:TreeElement, data:IDomDef, root:ITemplateView):TreeElement {
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

        private initDomElement(object:TreeElement, data:IDomDef, root:ITemplateView) {
            //console.log('Init dom element ', object, data, root);
            var domElement = <HTMLElement> this.getDomElement(object);
            //console.log(root.name, data.path, ' SetData');


            /* Процесс установки аттрибутов, в том числе с расчетом выражений, для конкретного узла Dom */
            if (this.isTagElement(domElement) && !domElement.getAttribute(AttributePathId)) {
                //console.log(root.name, data.path, ' ApplyData');

                // Вычисление аттрибутов
                var domElementPathId:string = this.getNextId();
                var attribs = data.attribs;
                var attrsResult = attribs ? _.reduce(attribs, (r:any, value:ExpressionValue, key:string)=>(this.specialDomAttrs.indexOf(key) < 0 ? (r[key] = this.getSimpleOrExpressionValue(value, root)) : null, r), {}, this) : {};


                // Установка глобального идентификатора элемента для событий
                attrsResult[AttributePathId] = domElementPathId;

                // Установка аттрибутов
                if (data.type === 'tag') {
                    this.setDomElementAttributes(attrsResult, domElement);
                }
                else {
                    this.setSvgElementAttributes(attrsResult, domElement);
                }


                // Установка классов
                if (attribs && attribs.class) {
                    var classesValues = this.getPropertyValues('attribs', 'class', data, root);
                    this.setDomElementClasses(classesValues, domElement, data, root); // side effect, root add map enabled classes
                }

                // Установка стилей
                if (attribs && attribs.style) {
                    var stylesValues = this.getPropertyValues('attribs', 'style', data, root);
                    this.setDomElementStyles(stylesValues, domElement, root);
                }
            }

        }

        /* Установка контента текстового элемента */
        private initTextElement(object:TreeElement, data:IDomDef, root:ITemplateView) {
            if (data.data) {
                object.textContent = this.getSimpleOrExpressionValue(data.data, root);
            }
        }

        // -----------------------------------------------------------------------------------------------------------
        // Children view
        // -----------------------------------------------------------------------------------------------------------


        private enterChildrenView(data:IDomDef, root:ITemplateView):void {
            if (!this.hasChildrenView(data, root)) return;

            var childrenView:TemplateChildrenView = root.getChildrenViewByPath(data.path);
            childrenView.enter();
        }

        private exitChildrenView(data:IDomDef, root:ITemplateView):void {
            if (!this.hasChildrenView(data, root)) return;

            var childrenView:TemplateChildrenView = root.getChildrenViewByPath(data.path);
            childrenView.exit();
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
                //console.log('Apply ', root.name, host.path, host.key, result);
                if (el && el.nodeType != 8) this.applyValueToHost(result, el, host, root);
            }
        }

        applyValueToHost(value:any, el:HTMLElement, host:IExpressionHost, root:ITemplateView):any {
            var key:string = host.key;

            //console.log('Apply to ', host.path, host.key, value);
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

                    var view:TemplateView|TemplateChildrenView;
                    if (key.indexOf('.') < 0) {
                        view = <TemplateView> root.getTreeElementByPath(host.path);
                        if (!(view instanceof TemplateView)) {
                            view = <TemplateChildrenView> root.getChildrenViewByPath(host.path);
                        }
                        view.applyParameter(view.getParameters()[key], key);
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


        private getTreeElement(data:IDomDef, root:ITemplateView):TreeElement {
            return root.getTreeElementByPath(data.path);
        }

        isSvgNode(name:string):boolean {
            return name === 'svg' || name === 'circle' || false;
        }

        getPropertyValues(group:string, attrName:string, data:IDomDef, root:ITemplateView):IObj {
            var functor = (attrName === 'class') ? this.getClassSimpleOrExpressionValue : this.getSimpleOrExpressionValue;

            return _.reduce(data[group][attrName], (result:any, value:ExpressionValue, key:string)=>(
                result[key] = functor.call(this, value, root), result), {}, this);
        }

        getChangedExpressionNames(group:string, map:IDynamicMap, root:ITemplateView):(string|string[])[] {
            return _.map(map, (exNames:string[], propName:string)=>(root.isChangedDynamicProperty(propName) ? exNames : null), this);
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
            //console.log('Register dom', id, data.path);
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

        public applyFirstContextToExpressionParameters(params:any, context:ITemplateView):IExpressionName {
            if (!context) return params;

            var r = {};
            _.each(params, (v:IExpressionName|any, k)=> {
                var isExpression = v instanceof ExpressionName;

                if(isExpression) {
                    r[k] = !v.context?new ExpressionName(v.name, context): v;
                } else {
                    r[k] = v;
                }
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
            for (name in attrs) {
                var value = attrs[name];
                var method = value ? object.setAttribute : object.removeAttribute;
                method.call(object, name, value);
            }
        }

        setSvgElementAttributes(attrs:IObj, object:HTMLElement) {
            for (name in attrs) {
                var value = attrs[name];
                var method = value ? object.setAttributeNS : object.removeAttributeNS;
                method.call(object, null, name, value);
            }
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
            console.log('Trigger def event, ', e.name, ' path ', def.path);


            if (!view.disabled && def.handlers && def.handlers[e.name]) {
                //console.log('Has trigger event, ', e.name, ' path ', def.path);
                view.evalHandler(def.handlers[e.name], e);
                e.executionHandlersCount++;
            }
        }
    }
}
