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
                'getTreeObject', 'setDataTreeObjectFunc', 'enterTreeObjectFunc'
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
                //console.log('[%s]', functorName, ' instanceFunctor data, root: ', data, root, ' getter, functorm childrenTree, modificator ', treeObjGetter, treeObjFunctor, childrenTreeObjMapper, childrenModificator);
                var treeObject = treeObjGetter(data, root);

                if (!treeObject) return null;
                //console.log('Check for ', functorName, ' treeObject ', treeObject);
                if (this.isDomElementComment(this.getDomElement(treeObject))) return treeObject;

                // execute tree object functor
                if (treeObjFunctor) treeObjFunctor(treeObject, data, root);

                // execute tree child mapper
                if (childrenTreeObjMapper) {
                    // create children mapper, or use this
                    var childrenMapperInstance:any = _.partial(
                        childrenTreeObjMapper === true ? instanceFunctor.bind(t) : childrenTreeObjMapper,
                        _, root);

                    var childrenMap:any[] = _.map(data.children, childrenMapperInstance, this);

                    // children result executor, appendChild for example
                    if (childrenModificator) {
                        var childrenModificatorInstance:any = _.partial(childrenModificator, _, treeObject, data, root);
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

        private isTagElement(e:Element):Boolean {
            return e && e.nodeType === 1;
        }

        private isDomElementComment(e:Element):Boolean {
            return e && e.nodeType === 8;
        }

        getIdMap():{[id:string]:ITemplateView} {
            return this.idMap;
        }

        // Simple commands
        setElementPathToRoot(value:TreeElement, data:IDomDef, root:ITemplateView) {

            this.initIfComponent(value, data, root);
            root.setPathOfCreatedElement(data.path, value);
            //if (data.link) root.setTemplateElementProperty(data.link, value);
        }

        initIfComponent(value:TreeElement, data:IDomDef, root:ITemplateView) {
            if (value instanceof TemplateView) {
                if(value.inDocument) return;
                //console.log('Init component on create, ', value, value.getElement());
                var view = (<TemplateView>value);
                view.parent = root;

                if(data) {
                    view.parentDomDef = root.getDomDefinitionByPath(data.parentPath);
                    this.initTemplateParams(view, data, root);
                    this.initTemplateHandlers(view, data, root);
                }

                view.createDom();
                //console.log('Init complete on create, ', value, value.getElement());
            }
        }

        initTemplateParams(view:ITemplateView, data:IDomDef, root:ITemplateView) {
            _.each(data.params, _.partial(this.setTemplateParam,_ , _, view, root), this)
        }

        initTemplateHandlers(view:ITemplateView, data:IDomDef, root:ITemplateView) {
            _.each(data.handlers, (value,name)=>view.on(name, function() { view.evalHandler(value) }));
        }


        setTemplateParam(value:any, key:string, view:ITemplateView, root:ITemplateView) {
            console.log('Set template params', value, key, view, root);
            switch (key) {
                case TemplateParams.ln:
                    if(root[value]) throw 'Can set template param ' + key + ', cause it exist';
                    root[value] = view;
                    break;
                case TemplateParams.setData:
                    view.data = this.getExpressionValue(value, root);
                    break;
                case TemplateParams.setModel:
                    view.model = this.getExpressionValue(value, root);
                    break;
                case TemplateParams.setStateSelected:
                    console.log('State selected:' , this.getExpressionValue(value, root));
                    view.setState('selected', !!this.getExpressionValue(value, root));
                    break;
            }
        }

        getTreeObject(data:IDomDef, root:TemplateView):TreeElement {
            return this.isComponentDef(data) ? root.getComponentByPath(data.path) : root.getElementByPath(data.path);
        }

        createTreeObjectFunc(data:IDomDef, root:TemplateView):TreeElement {
            var isIncluded:boolean = this.isTreeObjectIncluded(data, root);
            var result:TreeElement;
            if (isIncluded) {
                //@todo should get or maybe no?
                result = this.getTreeObject(data, root) || (this.isComponentDef(data) ? this.createComponentElement(data, root) : this.createDomElement(data.type, data, root));
            } else {
                result = this.createDomElement('comment', data, root);
            }
            return result;
        }

        removeDataChildrenOfTreeObject(object:TreeElement, data:IDomDef, root:ITemplateView) {
            var children = root.getDataChildrenByPath(data.path);
            //console.log('Remove children ', children);
            _.each(children, (child:ITemplateView)=>child.dispose());
            //@todo use object pool
        }

        createDataChildrenOfTreeObject(object:TreeElement, data:IDomDef, root:ITemplateView) {
            //@todo use object pool
            //console.log('Create data children start');

            var className:string = data.params[TemplateParams.childrenClass];
            var ViewClass:any = <ITemplateConstructor> (global[className]);
            if (!ViewClass) throw 'Children class ' + className + ' not found';

            var childrenData:any[] = data.params[TemplateParams.childrenData]?this.getExpressionValue(data.params[TemplateParams.childrenData], root):null;
            var childrenModel:fmvc.Model = data.params[TemplateParams.childrenModel]?this.getExpressionValue(data.params[TemplateParams.childrenModel]):null;

            var childrenMap:ITemplateView[] = _.map(childrenData, (v:any)=>new ViewClass(className + '-' + this.getNextId(), {data: v}));
            var parentElement = this.getDomElement(object);

            _.each(childrenMap, function (child:ITemplateView) {
                this.initIfComponent(child, null, root);
                child.parentDomDef = data;
                child.enter();
                parentElement.appendChild(child.getElement());
            }, this);

            //console.log('Create data children ex, data, map ', data.params.childrendata, childrenData, root.data, childrenMap);

            if(!_.isEmpty(childrenMap)) root.setDataChildrenByPath(data.path, childrenMap);
        }


        createComponentElement(data:IDomDef, root:TemplateView):ITemplateView {
            var ComponentConstructor:ITemplateConstructor = window[data.name];
            var result = ComponentConstructor('view-' + data.name + '-' + this.getNextId(), data.params);
            //console.log('ComponentConstructor: ', data.name, ComponentConstructor, result);
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


        updateTreeOfTreeObjectFunc(data:IDomDef, root:TemplateView):TreeElement {
            var updateType:number = this.getUpdateTreeTypeFunc(data, root);
            ////console.log('Update func for: ', data.path, updateType, data, root);
            if (updateType === 1) return (this.createTreeObject(data, root), this.enterTreeObject(data, root), this.setDataTreeObject(data, root));
            else if (updateType === -1) return (this.exitTreeObject(data, root));
        }

        getUpdateTreeTypeFunc(data:IDomDef, root:TemplateView):number {
            var isIncluded:boolean = this.isTreeObjectIncluded(data, root);
            var treeObject:TreeElement = this.getTreeObject(data, root);

            // 0 - skip, N1 - create, -1 - remove
            return ((isIncluded && treeObject) ? 0 : isIncluded ? 1 : -1);
        }

        enterTreeObjectFunc(object:TreeElement, data:IDomDef, root:ITemplateView) {
            if (object && object instanceof TemplateView) {
                object.enter();
            }

            //console.log('!! Enter for tree element createDataChildren ', this.hasDataChildren(data), data.attribs, data.params);
            if (this.hasDataChildren(data)) this.createDataChildrenOfTreeObject(object, data, root);
        }

        hasDataChildren(data:IDomDef):boolean {
            return !!(data.params
            && data.params[TemplateParams.childrenClass] // has constructor
            && (data.params[TemplateParams.childrenData] || data.params[TemplateParams.childrenModel]) // has data
            );
        }

        exitTreeObjectFunc(object:TreeElement, data:IDomDef, root:ITemplateView) {
            if (object && object instanceof TemplateView) object.exit();
        }

        updateDynamicTree(root:ITemplateView):void {
            //console.log('Update start');
            var dynamicTree:any = root.getTemplate().dynamicTree;
            //console.log('Update start 1');
            var exArrays:any[] = _.map(dynamicTree, (v:IDynamicMap, group:string)=>this.getChangedExpressionNames(group, v, root), this);


            var exNames:string[] = _.compose(_.compact, _.flatten)(exArrays);
            //console.log('Changed values (expression): ', exNames);
            var tmpl = root.getTemplate();

            var exObjArrays:IExpression[] = _.map(exNames, (v:string)=>(tmpl.expressionMap[v]));
            _.each(exObjArrays, <any>_.partial(this.applyExpressionToHosts, _, root), this);
        }

        getChangedExpressionNames(group:string, map:IDynamicMap, root:ITemplateView):(string|string[])[] {
            return _.map(map, (exNames:string[], prorName:string)=>(root.isChangedDynamicProperty(prorName) ? exNames : null), this);
        }


        getEventPath(e:ITreeEvent):string {
            var previousElement = (e.previousTarget instanceof TemplateView)?(<ITemplateView>e.previousTarget).getElement().parentNode:null;
            var el = <HTMLElement> previousElement || e.e.target;
            console.log('Get event path, ', e.name, el.getAttribute('data-path'));
            return el.getAttribute('data-path');
        }

        dispatchTreeEvent(e:ITreeEvent, path?:string ) {
            // side effect tree event
            this.execEventDefsFromPathToRoot(e, path?path:this.getEventPath(e));
        }

        private execEventDefsFromPathToRoot(e:ITreeEvent, path:string):void {
            var view = <ITemplateView> e.currentTarget;
            var template = view.getTemplate();
            var def:IDomDef = template.pathMap[path];

            console.log('execute for path %s, name %s, parent %s, canceled %s', def.path, e.name, def.parentPath, !!e.cancelled);
            // Выполняем событие на текущем уровне
            this.executeEventDef(e, def, view);

            while ((def = template.pathMap[def.parentPath]) && !e.cancelled) {
                // Выполняем для дочерних, присваивая def родителю
                this.executeEventDef(e, def, view);
            }
        }

        private executeEventDef(e:ITreeEvent, def:IDomDef, view:ITemplateView):void {
            console.log("executeEventOnDef, def, event name ", def, e.name);
            if(e instanceof TemplateView) {
                (<ITemplateView>e).handleTreeEvent(e);
            } else {
                if (!(def.handlers && def.handlers[e.name])) return null;
            }

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
            //console.log('Apply value: ', host.group, host.key, host.path, value);
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
                        case 'childrendata':
                            var domDef = root.getDomDefinitionByPath(host.path);
                            //console.log('Domdef on childrendata change', domDef, el);
                            this.removeDataChildrenOfTreeObject(el, domDef, root);
                            this.createDataChildrenOfTreeObject(el, domDef, root);
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
            //console.log('Set data tree object: object, data ', object, data);
            //set all dom attributes

           if (this.isTagElement(domElement) && !(object instanceof TemplateView) ) {
                // simple attributes (id, title, name...)
               var attribs = data.attribs;
               var attrsResult = attribs?_.reduce(attribs,
                   (r:any, value:ExpressionValue, key:string)=>(this.specialDomAttrs.indexOf(key) < 0 ? (r[key] = this.getSimpleOrExpressionValue(value, root)) : null, r), {}, this):{};

                attrsResult.id = this.getElementId(domElement, attribs);
                attrsResult['data-path'] = data.path;

                //console.log('Set attrs to ', domElement.nodeType);
                this.setDomAttrs(attrsResult, domElement);
                this.addIdToMap(attrsResult.id, root);

                // class
                if (attribs && attribs.class) {
                    var classesValues = this.getPropertyValues('attribs', 'class', data, root);
                    // side effect, root add map enabled classes
                    this.setDomElementClasses(classesValues, domElement, data, root);
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

        setTagElementAttributes(attrs, element:TreeElement) {


        }

        getElementId(element, attribs?) {
            return (attribs && attribs.id) ? attribs.id : ('el-' + this.getNextId());
        }

        getNextId():string {
            return (this.idCounter++).toString(36);
        }

        addTreeObjectFunc(object:TreeElement, parent:TreeElement, parentData:IDomDef, root:ITemplateView) {

            var parentElement = this.getDomElement(parent);
            //console.log('Check for parent ... obj, parentEl, parent ', object, parentElement, parent);
            if (!parentElement) throw 'Has no parent element';
            var objectElement = this.getDomElement(object) || this.getCommentElement(parentData);

            if (!object) this.setElementPathToRoot(objectElement, parentData, root); // todo rewrite and remove setElementPath
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
            console.log('Set dom attrs ', attrs, object);
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
            console.log('Check include for state ', states, ' result ', this.getExpressionValue(states, root) );
            return !!this.getExpressionValue(states, root);
        }


    }

}
