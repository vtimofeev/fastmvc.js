///<reference path="./d.ts" />

module ft {

    export class TemplateViewHelper implements ITemplateViewHelper {
        private idCounter:number = 0;
        private idMap:{[id:string]:ITemplateView} = {};

        public createTreeObject:IGetTreeObjectFunctor;
        public enterTreeObject:IGetTreeObjectFunctor;
        public exitTreeObject:IGetTreeObjectFunctor;
        public updateTreeObject:IGetTreeObjectFunctor;
        public setDataTreeObject:IGetTreeObjectFunctor;

        constructor() {
            _.bindAll(this,
                'createTreeObjectFunc', 'setElementPathToRoot', 'addTreeObjectFunc',
                'getTreeObject', 'setDataTreeObjectFunc'
            );


            this.createTreeObject = this.createTreeObjectFunctor();
            this.enterTreeObject = this.enterTreeObjectFunctor();
            this.exitTreeObject = this.exitTreeObjectFunctor();
            this.updateTreeObject = this.updateTreeObjectFunctor();
            this.setDataTreeObject = this.setDataTreeObjectFunctor();
        }

        private functorTreeObject(treeObjGetter:IGetTreeObjectFunctor,
                                  treeObjFunctor:ITreeObjectFunctor,
                                  childrenTreeObjMapper:ITreeObjectFunctor|boolean/* reverse if true */,
                                  childrenModificator:IChildrenTreeObjectFunctor,
                                  functorName?:string) {

            var t = this;

            function instanceFunctor(data:IDomDef, root:TemplateView) {
                console.log('[%s]', functorName, ' instanceFunctor data, root: ', data, root, ' getter, functorm childrenTree, modificator ', treeObjGetter, treeObjFunctor, childrenTreeObjMapper, childrenModificator);
                var treeObject = treeObjGetter(data, root);

                if (!treeObject) return null;
                if (this.isDomElementComment(this.getDomElement(treeObject))) return treeObject;

                // execute tree object functor
                if (treeObjFunctor) treeObjFunctor(treeObject, data, root);

                // execute tree child mapper
                if (childrenTreeObjMapper) {
                    // create children mapper, or use this
                    var childrenMapperInstance = _.partial(
                        childrenTreeObjMapper === true ? instanceFunctor.bind(t) : childrenTreeObjMapper,
                        _, root);

                    var childrenMap = _.map(data.children, childrenMapperInstance, this);

                    // children result executor, appendChild for example
                    if (childrenModificator) {
                        var childrenModificatorInstance = _.partial(childrenModificator, _, treeObject, data, root);
                        _.each(childrenMap, childrenModificatorInstance, this);
                    }
                }

                return treeObject;
            }

            return instanceFunctor.bind(t);
        }

        private createTreeObjectFunctor():IGetTreeObjectFunctor {
            return this.functorTreeObject(
                this.createTreeObjectFunc,
                this.setElementPathToRoot,
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
                null
            )
        }

        private updateTreeObjectFunctor():IGetTreeObjectFunctor {
            return this.functorTreeObject(
                this.updateTreeOfTreeObjectFunc,
                null,
                true,
                null,
                'update'
            )
        }

        private exitTreeObjectFunctor():IGetTreeObjectFunctor {
            return this.functorTreeObject(
                this.getTreeObject,
                this.exitTreeObjectFunc,
                true,
                this.removeTreeObject
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

        private isDomElementComment(e:Element):Boolean {
            return e.nodeType === 8;
        }

        getIdMap():{[id:string]:ITemplateView} {
            return this.idMap;
        }

        // Simple commands
        setElementPathToRoot(value:TreeElement, data:IDomDef, root:TemplateView) {
            root.setPathOfCreatedElement(data.path, value);
            if (data.link) root.setTemplateElementProperty(data.link, value);
        }

        getTreeObject(data:IDomDef, root:TemplateView):TreeElement {
            return this.isComponentDef(data) ? root.getComponentByPath(data.path) : root.getElementByPath(data.path);
        }

        createTreeObjectFunc(data:IDomDef, root:TemplateView):TreeElement {
            var isIncluded:boolean = this.isTreeObjectIncluded(data, root);
            return isIncluded ?
                (this.getTreeObject(data, root)
                || this.isComponentDef(data) ? this.createComponentElement(data, root) : this.createDomElement(data.type, data, root))
                : this.createDomElement('comment', data, root);
        }

        createComponentElement(data:IDomDef, root:TemplateView):ITemplateView {
            return null;
        }

        createDomElement(type:string, data:IDomDef, root:TemplateView):Element {
            switch (type) {
                case 'text':
                    return document.createTextNode(_.isString(data.data) ? data.data : '');
                case 'comment':
                    return document.createComment(data.path);
                default:
                    return document.createElement(data.name);
            }
        }



        updateTreeOfTreeObjectFunc(data:IDomDef, root:TemplateView):TreeElement {
            var updateType:number = this.getUpdateTreeTypeFunc(data, root);
            if (updateType === 1) return (this.createTreeObject(data, root), this.enterTreeObject(data, root), this.setDataTreeObject(data, root));
            else if (updateType === -1) return (this.exitTreeObject(data, root));
        }

        getUpdateTreeTypeFunc(data:IDomDef, root:TemplateView):Number {
            var isIncluded:boolean = this.isTreeObjectIncluded(data, root);
            //var treeObject:TreeElement = this.getTreeObject(data, root);

            // 0 - skip, N1 - create, -1 - remove
            return ((isIncluded && treeObject) ? 0 : isIncluded ? 1 : -1);
        }

        enterTreeObjectFunc(object:TreeElement, data:IDomDef, root:ITemplateView) {
            if (object && object instanceof TemplateView) {
                object.enter();
            }
        }

        exitTreeObjectFunc(object:TreeElement, data:IDomDef, root:ITemplateView) {
            if (object && object instanceof TemplateView) object.exit();
        }


        updateDynamicTree(root:ITemplateView):void {
            var dynamicTree:IDynamicTree = root.getTemplate().dynamicTree;
            var exArrays:any[] = _.map(dynamicTree, (v:any, group:string)=>this.getChangedExpressionNames(group, v, root), this);
            var exNames:string[] = _.compose(_.compact, _.flatten)(exArrays);
            var tmpl = root.getTemplate();

            var exObjArrays:IExpression[] = _.map(exNames, (v:string)=>(tmpl.expressionMap[v]));
            var expressionFunctor:{(value:IExpression):void} =  _.partial(this.applyExpressionToHosts, _, root);
            _.each(exObjArrays, expressionFunctor, this);
        }

        getChangedExpressionNames(group:string, map:IDynamicMap, root:ITemplateView) {
            return _.map(map, (exNames:string[], prorName:string)=>(root.isChangedDynamicProperty(prorName) ? exNames : null), this);
        }


        getEventPath(e:ITreeEvent):string {
            var el = <HTMLElement> (e.previousTarget?e.previousTarget.getElement().parent:e.e.target);
            return el.getAttribute('data-path');
        }

        dispatchTreeEvent(e:ITreeEvent) {
            // side effect tree event
            this.execEventDefsFromPathToRoot(e, this.getEventPath(e));
        }

        private execEventDefsFromPathToRoot(e:ITreeEvent, path:string):void {
            var view = <ITemplateView> e.currentTarget;
            var template = view.getTemplate();
            var def:IDomDef = template.pathMap[path];
            this.executeEventDef(e, def, view);

            console.log('execute ', e.name, !!e.cancelled, 'path', def.path);
            while((def = template.pathMap[def.parentPath]) && !e.cancelled) {
                console.log('execute ', e.name, !!e.cancelled, 'path', def.path);
                this.executeEventDef(e, def, view);
            }
        }

        private executeEventDef(e:ITreeEvent, def:IDomDef, view:ITemplateView):void {
            if(!(def.handlers && def.handlers[e.name])) return null;
            view.evalHandler(def.handlers[e.name], e);

        }


        applyExpressionToHosts(exObj:IExpression, root:ITemplateView):void {
            var result;
            var el:HTMLElement;
            _.each(exObj.hosts, (host:IExpressionHost)=>(
                result = result || (host.key === 'class' ? root.getClassExpressionValue(exObj) : root.getExpressionValue(exObj)),
                    el = root.getElementByPath(host.path),
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
                    return;

                case 'data':
                    el.textContent = value;
                    return;
            }
        }

        setDataTreeObjectFunc(object:TreeElement, data:IDomDef, root:ITemplateView) {
            var domElement = <HTMLElement> this.getDomElement(object);

            // set all dom attributes
            var attribs;
            var hasHandlers = !!data.handlers;

            if ((attribs = (data.attribs || (hasHandlers?{}:null)))) {
                // simple attributes (id, title, name...)
                var attrsResult = _.reduce(attribs, (r:any, value:ExpressionValue, key:string)=>(this.specialDomAttrs.indexOf(key) < 0 ? (r[key] = this.getSimpleOrExpressionValue(value, root)) : null, r), {}, this);

                console.log('ATTRIBS: was , is ' , data.attribs, attribs);
                if(hasHandlers) {
                    console.log('HANDLERS!!!', data);
                    attrsResult.id = this.getElementId(domElement, attribs);
                    attrsResult['data-path'] = data.path;
                }

                 console.log('Set attrs to ', domElement.nodeType);
                this.setDomAttrs(attrsResult, domElement);
                this.addIdToMap(attrsResult.id, root);

                // class
                if (attribs.class) {
                    var classesValues = this.getPropertyValues('attribs', 'class', data, root);
                    // side effect, root add map enabled classes
                    this.setDomElementClasses(classesValues, domElement, data, root);
                }
                // style
                if (attribs.style) {
                    var stylesValues = this.getPropertyValues('attribs', 'style', data, root);
                    this.setDomElementStyles(stylesValues, domElement, root);
                }
            }

            // data
            if (data.data) {
                domElement.textContent = this.getSimpleOrExpressionValue(data.data, root);
            }
        }

        getElementId(element, attribs?) {
            return (attribs && attribs.id)?attribs.id:('el-'+(this.idCounter++).toString(36));
        }

        addTreeObjectFunc(object:TreeElement, parent:TreeElement, data:IDomDef, root:ITemplateView) {
            var parentElement = this.getDomElement(parent);
            if (!parentElement) throw 'Has no parent element';
            var objectElement = this.getDomElement(object) || this.getCommentElement(data);

            if (!object) this.setElementPathToRoot(objectElement, data, root); // todo rewrite and remove setElementPath
            parentElement.appendChild(objectElement);
        }

        removeTreeObject(object:TreeElement, parent:TreeElement, data:IDomDef, root:ITemplateView) {
            this.getDomElement(parent).replaceChild(this.getDomElement(object), this.getCommentElement(data));
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
            return _.isObject(value) ? root.getClassExpressionValue(<IExpressionName> value) : value;
        }


        getExpressionValue(value:IExpressionName, root:ITemplateView):any {
            return root.getExpressionValue(value);
        }

        /*
         applyClassExpressionValue(value:any, ex:IExpressionName, root:ITemplateView):any {
         return _.isBoolean(value)  root.getExpressionValue(value);
         }
         */

        addIdToMap(id:string, view:ITemplateView):void {
            this.idMap[id] = view;
        }

        getCommentElement(data:IDomDef):Comment {
            return document.createComment(data.path);
        }

        // ------------------------------------------------------------------------------------------------------------
        // Utilites
        // ------------------------------------------------------------------------------------------------------------

        private _excludedDomAttrs;
        get excludedDomAttrs():string[] {
            return this._excludedDomAttrs ? this._excludedDomAttrs : (this._excludedDomAttrs = [].concat(this.systemDataAttrs, this.specialDomAttrs));
        }

        get systemDataAttrs():string[] {
            return ['tag', 'path', 'link', 'ln', 'states', 'children'];
        }

        get specialDomAttrs():string[] {
            return ['style', 'class'];
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
            return <HTMLElement> (value ? 'getElement' in value ? value.getElement() : value : null);
        }

        isComponentDef(data:IDomDef):boolean {
            return data.type && data.name && (data.name.indexOf('.') > 0);
        }

        isTreeObjectIncluded(data:IDomDef, root:ITemplateView):boolean {
            if (!data.states) return true;
            else !!this.getExpressionValue(data.states, root);
        }
    }

}
