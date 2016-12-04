///<reference path="./d.ts" />
///<reference path="./expression.ts" />
///<reference path="./events/pointer.model.ts" />
///<reference path="./events/keyboard.model.ts" />
///<reference path="./events/event.dispatcher.ts" />

///<reference path="./template.i.ts" />
///<reference path="./template.ts" />
///<reference path="./template.parser.ts" />

//@todo: children params changed

namespace ft {
    export var AttributePathId:string = 'data-path-id';

    const SvgNs:string = "http://www.w3.org/2000/svg",
        ComplexDomElementAttributes:string[] = ['style', 'class'],
        DomDefType:any = {
        Tag: 'tag',
        Svg: 'svg',
        Text: 'text',
        Comment: 'comment'
    };

    export class TemplateViewHelper {
        private idCounter:number = 0;

        constructor() {
        }

        public createTree(data:IDomDef, root:ft.TemplateView):TreeElement {
            var treeElement:TreeElement = this.createTreeElement(data, root);
            root.setTreeElementPath(data.path, treeElement);

            var treeDomElement:HTMLElement = this.getDomElement(treeElement);
            var i:number;
            var childrenLength:number;

            if (!this.isCommentElement(treeDomElement)) {

                for (i = 0, childrenLength = (data.children ? data.children.length : 0); i < childrenLength; i++) {
                    var childrenTreeElement:TreeElement = this.createTree(data.children[i], root);
                    //console.log('TreeDom append ', data, root);
                    treeDomElement.appendChild && treeDomElement.appendChild(childrenTreeElement instanceof ft.TemplateView ? childrenTreeElement.getElement() : <HTMLElement> childrenTreeElement);
                }

                this.createChildrenView(treeDomElement, data, root);


            }

            return treeElement;
        }
        

        public validateTree(data:IDomDef, root:ft.TemplateView):void {
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
                treeDomElement.parentNode.replaceChild(this.getDomElement(newElement), treeDomElement);
            }
            else if (!isComment && !included) {
                this.exitTree(data, root);
                newElement = this.createTree(data, root);
                treeDomElement.parentNode.replaceChild(this.getDomElement(newElement), treeDomElement);
            }
            else if(!isComment) {
                for (i = 0, childrenLength = (data.children ? data.children.length : 0); i < childrenLength; i++) {
                    this.validateTree(data.children[i], root);
                }

                root.childrenVMData && root.childrenVMData.forEach( (v:ft.TemplateView)=>this.validateTree(v.domDef, v) );
            }
        }

        enterTree(data:IDomDef, root:ft.TemplateView):void {
            var treeElement:TreeElement = this.getTreeElement(data, root);

            if (treeElement instanceof ft.TemplateView && treeElement !== root) {
                treeElement.enter();
            }

            var treeDomElement:HTMLElement = this.getDomElement(treeElement);

            if (this.isTagElement(treeDomElement)) {
                var i:number;
                var childrenLength:number;
                for (i = 0, childrenLength = (data.children ? data.children.length : 0); i < childrenLength; i++) {
                    this.enterTree(data.children[i], root);
                }

                root.childrenVMData && root.childrenVMData.forEach( (v:ft.TemplateView)=>v.enter() );
            }
        }

        public exitTree(data:IDomDef, root:ft.TemplateView):void {

            var treeElement:TreeElement = this.getTreeElement(data, root),
                i:number,
                childrenLength:number,
                domElement:HTMLElement = this.getDomElement(treeElement),
                isComment:boolean = this.isCommentElement(domElement);

            if (!isComment) {
                for (i = 0, childrenLength = (data.children ? data.children.length : 0); i < childrenLength; i++) {
                    this.exitTree(data.children[i], root);
                }

                root.childrenVMData && root.childrenVMData.forEach( (v:ft.TemplateView)=>v.exit() );
            }

            if (treeElement instanceof ft.TemplateView && treeElement !== root) {
                treeElement.exit();
            } else {
            }
        }

        private composeNames_updateDynamicTree = _.compose(_.union, _.compact, _.flatten);
        updateDynamicTree(root:ft.TemplateView, group?:string, propertyName?:string):void {
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


        // -----------------------------------------------------------------------------------------------------------
        // Creation
        // -----------------------------------------------------------------------------------------------------------

        private createTreeElement(data:IDomDef, root:ft.TemplateView):TreeElement {
            var isIncluded:boolean = this.isTreeObjectIncluded(data, root);
            var result:TreeElement = null;


            if (isIncluded) { // Элемент включен в дерево
                if (this.isComponentDef(data)) {
                    result = this.createComponentElement(data, root);
                } else {
                    result = this.createDomElement(data.type, data, root);
                }


            } else { // Элемент исключен из дерева
                result = this.createDomElement('comment', data, root);
            }


            if (data.params && data.params.ln) {
                root[data.params.ln] = result; // Установка ссылки на рутовый элемент
            }

            if (data.params && data.params.mlink) {
                root.mediator[data.params.mlink] = result;
            }

            return result;
        }


        createComponentElement(data:IDomDef, root:ft.TemplateView):ft.TemplateView {
            var dataParams:any = this.applyFirstContextToExpressionParameters(data.params, root);
            var result = templateManager.createInstance(data.name, 'view-' + data.name + '-' + this.getNextId(), dataParams);
            result.parent = root;
            result.domDef = data;
            if (result !== root) result.createDom();
            return result;
        }


        createDomElement(type:string, data:IDomDef, root:ft.TemplateView):HTMLElement|Comment|Text {
            var result:HTMLElement|Comment|Text;
            switch (type) {
                case DomDefType.Tag:
                    result = document.createElement(data.name);
                    this.initDomElement(result, data, root);
                    return result;
                case DomDefType.Text:
                    result = document.createTextNode('');
                    this.initTextElement(<Text> result, data, root);
                    return result;
                case DomDefType.Comment:
                    return document.createComment(data.path);
                case DomDefType.Svg:
                    result = document.createElementNS(SvgNs, data.name);
                    this.initDomElement(result, data, root);
                    return result;
                default:
                    throw 'Cant create dom element ' + type + ' of ' + data.path + ', ' + root.name;
            }
        }

        createChildrenView(object:Element, data:IDomDef, root:ft.TemplateView):TreeElement {
            if (this.hasChildrenDef(data)) {

                var chilrenName = root.name + ':ChildrenViewModel-' + this.getNextId(),
                    rootParams = root.getParameters(),
                    childrenParams = _.keys(rootParams).filter( v=>v.indexOf('children.')===0 ).reduce( (m, v)=>{ m[v.replace('children.', '')] = rootParams[v]; return m; } , {} ),
                    bindedParams = this.applyFirstContextToExpressionParameters(childrenParams, root),
                    childrenDataModel = bindedParams['data'] ? root.getParameterValue(bindedParams['data']) : root.getParameterValue(bindedParams['model']) || root.model || root.data,
                    sourceModels = [childrenParams['class'] || 'ui.Button', childrenDataModel, {}, bindedParams || {} ],
                    childrenViewModel ;

                if (!childrenDataModel) {
                    console.warn('Cant create childrenViewModel cause childrenDataModel not exists ', root.name);
                    return;
                }

                childrenViewModel = new ft.ChilrenViewModel(chilrenName, sourceModels);

                childrenViewModel.apply();

                root.childrenVM = childrenViewModel;
                root.childrenVMData && root.childrenVMData.forEach( (v:ft.TemplateView)=>{
                    v.createDom();
                    v.parent = root;
                    object.appendChild(v.getElement());
                });
            }
        }

        private initDomElement(object:TreeElement, data:IDomDef, root:ft.TemplateView) {
            var domElement = <HTMLElement> this.getDomElement(object);

            /* Процесс установки аттрибутов, в том числе с расчетом выражений, для конкретного узла Dom */
            if (this.isTagElement(domElement) && !domElement[AttributePathId]) {

               // Установка связей с данными узла
                domElement[AttributePathId] = {data: data, root: root};

                // Вычисление аттрибутов
                var attribs = data.attribs;
                var attrsResult = attribs ? _.reduce(attribs, (r:any, value:ExpressionValue, key:string)=>(this.specialDomAttrs.indexOf(key) < 0 ? (r[key] = this.getSimpleOrExpressionValue(value, root)) : null, r), {}, this) : {};

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
        private initTextElement(object:Text, data:IDomDef, root:ft.TemplateView) {
            if (data.data) {
                object.textContent = this.getSimpleOrExpressionValue(data.data, root);
            }
        }


        // -----------------------------------------------------------------------------------------------------------
        // Updates, apply value
        // -----------------------------------------------------------------------------------------------------------


        applyExpressionToHosts(exObj:IExpression, root:ft.TemplateView):void {
            var result;
            var el:HTMLElement;
            var i:number;
            var l = exObj.hosts.length;
            var host:IExpressionHost;

            for (i = 0; i < l; i++) {
                host = exObj.hosts[i];

                result = result || (host.key === 'class' ? root.getCssClassExpressionValue(exObj) : root.getExpressionValue(exObj));

                el = root.getTreeElementByPath(host.path);
                if (el && el.nodeType != 8) this.applyValueToHost(result, el, host, root);
            }
        }

        applyValueToHost(value:any, treeValue:TreeElement, host:IExpressionHost, root:ft.TemplateView):any {
            //if(host.group === 'params') console.log('Apply value to host ', value, host, root.name, treeValue);
            var key:string = host.key,
                el = this.getDomElement(treeValue),
                view = treeValue instanceof ft.TemplateView && treeValue;



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

                            if (previousClassValue !== value) {
                                previousClassValue && el.classList.toggle(previousClassValue, false);
                                value && el.classList.toggle(value, true);
                            }

                            root.setPathClassValue(host.path, host.keyProperty, value);
                            return;
                        default:
                            if (host.key) this.setElementAttribute(host.key, value, el);
                            return;
                    }
                    return;
                case 'params':
                    // Default params changed: Data: model, data; states: selected, focused, children, base, custom
                    if (view) {
                        view.applyParameter(view.getParameters()[key], key);
                    }
                    else {
                        console.warn('Cant apply parameter ', key, 'to', view, 'path', host.path);
                    }
                    return;

            }
        }


        // -----------------------------------------------------------------------------------------------------------
        // Attrs & values
        // -----------------------------------------------------------------------------------------------------------


        private getTreeElement(data:IDomDef, root:ft.TemplateView):TreeElement {
            return root.getTreeElementByPath(data.path);
        }

        isSvgNode(name:string):boolean {
            return name === 'svg' || name === 'circle' || false;
        }

        getPropertyValues(group:string, attrName:string, data:IDomDef, root:ft.TemplateView):IObj {
            var functor = (attrName === 'class') ? this.getClassSimpleOrExpressionValue : this.getSimpleOrExpressionValue;

            return _.reduce(data[group][attrName], (result:any, value:ExpressionValue, key:string)=>(
                result[key] = functor.call(this, value, root), result), {}, this);
        }

        getChangedExpressionNames(group:string, map:IDynamicMap, root:ft.TemplateView):(string|string[])[] {
            return _.map(map, (exNames:string[], propName:string)=>(root.isChangedDynamicProperty(propName) ? exNames : null), this);
        }

        getSimpleOrExpressionValue(value:ExpressionNameValue, root:ft.TemplateView) {
            return _.isObject(value) ? this.getExpressionValue(<IExpressionName> value, root) : value;
        }

        getClassSimpleOrExpressionValue(value:ExpressionNameValue, root:ft.TemplateView) {
            return _.isObject(value) ? root.getCssClassExpressionValue(<IExpressionName> value) : value;
        }


        getExpressionValue(value:IExpressionName, root:ft.TemplateView):any {
            return root.getExpressionValue(value);
        }

        // ------------------------------------------------------------------------------------------------------------
        // Utilites
        // ------------------------------------------------------------------------------------------------------------

        public applyFirstContextToExpressionParameters(params:any, context:ft.TemplateView):[{id:IExpressionName}] {
            if (!context) return params;

            var r:[{id:IExpressionName}] = {};
            _.each(params, (v:IExpressionName|any, k)=> {
                var isExpression = v instanceof ft.ExpressionName;

                if(isExpression) {
                    r[k] = !v.context?new ft.ExpressionName(v.name, context): v;
                } else {
                    r[k] = v;
                }
            });
            return r;
        }

        private hasDelay(data:IDomDef, root:ft.TemplateView, functorName:string) {
            return data.params && data.params[functorName + 'Delay'] && root.isDelay(data, functorName);
        }

        private isTagElement(e:Element|Comment):boolean {
            return e && e.nodeType === 1;
        }

        private isCommentElement(e:Element|Comment):boolean {
            return e && e.nodeType === 8;
        }

        getNextId():string {
            return (this.idCounter++).toString(36);
        }

        get specialDomAttrs():string[] {
            return ComplexDomElementAttributes;
        }

        setDomElementClasses(vals:IObj, object:HTMLElement, data:IDomDef, root:ft.TemplateView) {
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

        setDomElementStyles(vals:IObj, object:HTMLElement, root:ft.TemplateView) {
            _.each(vals, (value:any, name:string)=>object.style[name] = (value ? value : ''));
        }

        setDomElementAttributes(attrs:IObj, object:HTMLElement) {
            var name:string;

            for (name in attrs) {
                this.setDomElementAttribute(name, attrs[name], object)
            }
        }

        setSvgElementAttribute(name:string, value:any, object:HTMLElement) {

            
            var method:Function = value ? object.setAttributeNS : object.removeAttributeNS;
            method.call(object, null, name, value);
        }

        setElementAttribute(name:string, value:any, object:HTMLElement):void {


            var method = this.isSvgNode(object) ? this.setSvgElementAttribute : this.setDomElementAttribute;
            method.call(this, name, value, object);
        }

        setDomElementAttribute(name:string, value:any, object:HTMLElement) {

            if(name === 'innerHTML') {
                object[name] = value;
            } else {
                var method: Function = value ? object.setAttribute : object.removeAttribute;
                method.call(object, name, value);
            }

        }

        setSvgElementAttributes(attrs:IObj, object:HTMLElement) {
            for (name in attrs) {
                this.setSvgElementAttribute(name, attrs[name], object);
            }
        }

        getDomElement(value:TreeElement):HTMLElement {
            return <HTMLElement> (value instanceof ft.TemplateView ? value.getElement() : value);
        }

        isComponentDef(data:IDomDef):boolean {
            return data.type && data.name && (data.name.indexOf('.') > 0);
        }

        isTreeObjectIncluded(data:IDomDef, root:ft.TemplateView):boolean {
            var ifValue:any = data.params ? data.params[ft.TemplateParams.if] : null;
            var hasDelay:boolean = this.hasDelay(data, root, 'create');

            if (hasDelay) root.setDelay(data, 'create');

            if (!ifValue && !hasDelay) return true;

            return !hasDelay && !!root.getExpressionValue(ifValue);
        }


        hasChildrenDef(data:IDomDef):boolean {
            //@todo-check Зачем 3 переменной ui.Group
            return !!(data.params && data.params[ft.TemplateParams.childrenClass] && data.name !== 'ui.Group');
        }

        hasChildrenView(data:IDomDef, root:ft.TemplateView) {
            return !!root.getChildrenViewByPath(data.path);
        }


        //-------------------------------------------------------------------------------------------------
        // Event bubbling
        //-------------------------------------------------------------------------------------------------

        dispatchTreeEventDown(e:ITreeEvent) {
            var def:IDomDef = <IDomDef> (e.currentDef || e.def);
            var view = <TemplateView> (e.currentTarget || e.target);
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

             if (view.parent && view.domDef) {
                // exec event on parent
                def = view.domDef;
                e.currentTarget = view.parent;

                e.currentDef = def;
                this.triggerDefEvent(e);

                // check canceled
                e.cancelled = !!e.executionHandlersCount && e.type === 'click';

                // exec parent next domDef to root
                e.currentDef = def && def.parentPath ? (<TemplateView>view.parent).getTemplate().pathMap[def.parentPath] : null;
                if (!e.cancelled && e.currentDef) this.dispatchTreeEventDown(e);
            }
        }

        private triggerDefEvent(e:ITreeEvent):void {
            var def:IDomDef = <IDomDef> (e.currentDef || e.def);
            var view = <TemplateView> (e.currentTarget || e.target);

            if (!view.disabled && def.handlers && def.handlers[e.type]) {
                view.evalHandler(def.handlers[e.type], e);
                e.executionHandlersCount++;
            }
        }
    }
}
