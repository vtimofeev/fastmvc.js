///<reference path="./d.ts" />

module ft {

    export class TemplateViewHelper implements ITemplateViewHelper {
        public createTreeObject:IGetTreeObjectFunctor;
        public enterTreeObject:IGetTreeObjectFunctor;
        public exitTreeObject:IGetTreeObjectFunctor;
        public updateTreeObject:IGetTreeObjectFunctor;
        public setDataTreeObject:IGetTreeObjectFunctor;

        constructor() {
            this.createTreeObject = this.createTreeObjectFunctor();
            this.enterTreeObject = this.enterTreeObjectFunctor();
            this.exitTreeObject = this.exitTreeObjectFunctor();
            this.updateTreeObject = this.updateTreeObjectFunctor();
            this.setDataTreeObject = this.setDataTreeObjectFunctor();
        }

        private functorTreeObject(
            treeObjGetter:IGetTreeObjectFunctor,
            treeObjFunctor:ITreeObjectFunctor,
            childrenTreeObjMapper:ITreeObjectFunctor|boolean/* reverse if true */,
            childrenModificator:IChildrenTreeObjectFunctor) {

            var t = this;

            function instanceFunctor(data:IDomDef, root:TemplateView) {
                var treeObject = treeObjGetter(data, root);
                if(!treeObject) return null;

                // tree child handler
                if(childrenTreeObjMapper) {
                    // create children mapper, or use this
                    var childrenMapperInstance = _.partial(
                        childrenTreeObjMapper===true?instanceFunctor.bind(t):childrenTreeObjMapper,
                        _, root);

                    var childrenMap = _.map(data.children, childrenMapperInstance, this);
                    // children result executor, appendChild for example
                    if(childrenModificator) {
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
                this.addTreeObjectFunc
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
                null
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
                null
            );
        }


        // Simple commands

        setElementPathToRoot(value:TreeElement, data:IDomDef, root:TemplateView) {
            root.setPathOfCreatedElement(data.path, value);
            root.setTemplateElementProperty(data.link, value);
        }

        getTreeObject(data:IDomDef, root:TemplateView):TreeElement {
            return this.isComponentDef(data)?root.getElementByPath(data.path):root.getComponentByPath(data.path);
        }

        createTreeObjectFunc(data:IDomDef, root:TemplateView):TreeElement {
            var isIncluded:boolean = this.isTreeObjectIncluded(data, root);
            return isIncluded?(this.getTreeObject(data,root) || this.isComponentDef(data)?this.createComponentElement(data, root):this.createDomElement(data, root)):null;
        }

        createComponentElement(data:IDomDef, root:TemplateView):ITemplateView {
            return null;
        }

        createDomElement(data:IDomDef, root:TemplateView):Element {
            return null;
        }

        updateTreeOfTreeObjectFunc(data:IDomDef, root:TemplateView):TreeElement {
            var updateType:number = this.getUpdateTreeTypeFunc(data, root);
            if(updateType === 1) return (this.createTreeObject(data, root), this.enterTreeObjec(data, root), this.setDataTreeObject(data, root));
            else if(updateType === -1) return (this.exitTreeObject(data, root));
        }

        getUpdateTreeTypeFunc(data:IDomDef, root:TemplateView):TreeElement {
            var isIncluded:boolean = this.isTreeObjectIncluded(data, root);
            var treeObject:TreeElement = this.getTreeObject(data,root);
            // 0 - skip, 1 - create, -1 - remove
            return (isIncluded && treeObject)?0:isIncluded?1:-1;
        }

        enterTreeObjectFunc(object:TreeElement, data:IDomDef, root:ITemplateView) {
            if(object && object instanceof TemplateView) object.enter();
        }

        exitTreeObjectFunc(object:TreeElement,  data:IDomDef, root:ITemplateView) {
            if(object && object instanceof TemplateView) object.exit();
        }

        setDataTreeObjectFunc(object:TreeElement,  data:IDomDef, root:ITemplateView) {
            var typeAttrs = {s: {}, d: {}};
            var domElement = <HTMLElement> this.getDomElement(object);
            _.each(data,
                (value:AttributeValue, key:string)=>(this.excludedDomAttrs.indexOf(key)<0)?_.isObject(value)?typeAttrs.d[key]=this.getAttrValue(value, root):typeAttrs.s[key]=value:null,
                this
            );
            _.each(typeAttrs, (attrs)=>this.setDomAttrs(attrs, domElement), this);
            if(data.class) this.setDomElementClasses(object, this.getAttrPropertyValues('class', data, root), root);
            if(data.style) this.setDomElementStyles(object, this.getAttrPropertyValues('style', data, root), root);
        }


        addTreeObjectFunc(object:TreeElement, parent:TreeElement, data:IDomDef, root:ITemplateView) {
            var parentElement = this.getDomElement(parent);
            if(!parentElement) throw 'Has no parent element';
            var objectElement = this.getDomElement(object) || this.getCommentElement(data);

            if(!object) this.setElementPathToRoot(objectElement, data, root); // todo rewrite and remove setElementPath
            parentElement.appendChild(objectElement);
        }

        removeTreeObject(object:TreeElement, parent:TreeElement, data:IDomDef, root:ITemplateView) {
            this.getDomElement(parent).replaceChild(this.getDomElement(object), this.getCommentElement(data));
        }

        // -----------------------------------------------------------------------------------------------------------
        // Attrs & values
        // -----------------------------------------------------------------------------------------------------------

        getAttrPropertyValues(attrName:string, data:IDomDef, root:ITemplateView):IObj {
            return _.reduce(data[attrName], (result:any, value:AttributeValue, key:string)=>(result[key] = this.getAttrValue(value, root), result), {}, this);
        }

        getAttrValue(value:AttributeValue, root:ITemplateView) {
            return _.isObject(value)?this.getExpressionValue(value, root):value;
        }

        getExpressionValue(value:IExpressionName, root:ITemplateView):any {
            return ExpressionHelper.execute.call(root, data.states);
        }

        getCommentElement(data:IDomDef):Comment {
            return document.createComment(data.path);
        }

        // ------------------------------------------------------------------------------------------------------------
        // Utilites
        // ------------------------------------------------------------------------------------------------------------

        private _excludedDomAttrs;
        get excludedDomAttrs():string[] {
            return this._excludedDomAttrs?this._excludedDomAttrs:(this._excludedDomAttrs = [].concat(this.systemDataAttrs, this.specialDomAttrs));
        }

        get systemDataAttrs():string[] {
            return ['tag', 'path', 'link', 'states', 'children'];
        }

        get specialDomAttrs():string[] {
            return ['style', 'class'];
        }

        setDomElementClasses(vals:IObj, object:HTMLElement, root:ITemplateView) {
            _.each(vals, (value:any, name:string)=>object.classList.toggle(_.isString(value)?value:name, !!value));
        }

        setDomElementStyles(vals:IObj, object:HTMLElement, root:ITemplateView) {
            _.each(vals, (value:any, name:string)=>object.style[name] = (value?value:''));
        }

        setDomAttrs(attrs:IObj, object:HTMLElement) {
            _.each(attrs, function(value:any, name:string) {
                var method = value?object.setAttribute:object.removeAttribute;
                method.call(object, name, value);
            });
        }

        getDomElement(value:TreeElement):Element {
            return value?_.isElement(value)?value:value.getElement():null;
        }

        isComponentDef(data:IDomDef):boolean {
            return !!(data.tag.indexOf('.') > 0);
        }

        isTreeObjectIncluded(data:IDomDef, root:ITemplateView):boolean {
            if (!data.states) return true;
            else !!this.getExpressionValue(data.states, root);
        }
    }

}
