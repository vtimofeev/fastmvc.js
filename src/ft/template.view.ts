///<reference path="./d.ts" />

module ft {
    export var templateHelper:TemplateViewHelper;

    export class TemplateView extends fmvc.View implements ITemplateView {
        private _template:ITemplate;
        private _componentMapByPath;
        private _elementMapByPath;

        constructor(name:string, params?:ITemplateViewParams, template?:ITemplate) {
            super(name);
        }

        createDom() {
            ft.templateHelper.createDom(this);
        }

        getTemplate():ITemplate {
            return this._template;
        }

        getElementByPath(value:string):Element {
            return this._elementMapByPath?this._elementMapByPath[value]:null;
        }

        getComponentByPath(value:string):ITemplateView {
            return this._componentMapByPath?this._componentMapByPath[value]:null;
        }


        setTemplateElementProperty(name:string, value:HTMLElement|TemplateView) {
            if(!this[name]) {
                this[name] = value;
            } else {
                throw Error('Cant set ' + name + ' property, cause it exist ' + this[name]s);
            }

        }

        setPathOfCreatedElement(path:string,  value:HTMLElement|TemplateView) {
            if(_.isElement(value)) {
                if(!this._elementMapByPath) this._elementMapByPath = {};
                this._elementMapByPath[path] = value;
            }
            else {
                if(!this._componentMapByPath) this._componentMapByPath = {};
                this._componentMapByPath[path] = value;
            }
        }



    }

    export class TemplateViewHelper implements ITemplateViewHelper {

        public createTreeObjectInstance:IGetTreeObjectFunctor;
        public enterTreeObjectInstance:IGetTreeObjectFunctor;
        public exitTreeObjectInstance:IGetTreeObjectFunctor;
        public enterTreeObjectInstance:IGetTreeObjectFunctor;
        public setDataTreeObjectInstance:IGetTreeObjectFunctor;


        private functorTreeObject(
            treeObjGetter:IGetTreeObjectFunctor,
            treeObjFunctor:ITreeObjectFunctor,
            childrenTreeObjMapper:ITreeObjectFunctor|boolean/* reverse if true */,
            childrenModificator:IChildrenTreeObjectFunctro) {

            var t = this;

            function instanceFunctor(data:IDomDef, root:TemplateView) {
                var treeObject = treeObjGetter(data, root);
                if(!treeObject) return null;
                if(childrenTreeObjMapper) {
                    var childrenMapperInstance = _.partital(
                        childrenTreeObjMapper===true?instanceFunctor.bind(t):childrenTreeObjMapper,
                        _, root);

                    var childrenMap = _.map(data.children, childrenMapperInstance, this);
                    if(childrenModificator) {
                        var childrenModificatorInstance = _.partitial(childrenModificator,
                            _, treeObject, data, root);
                        _.each(childrenMap, childrenModificatorInstance, this);
                    }
                }

                return treeObject;
            }
            return instanceFunctor.bind(t);
        }

        private createTreeObjectFunctor():IGetTreeObjectFuctor {
            return this.functorTreeObject(
                this.createTreeObject,
                this.setElementPathToRoot,
                true,
                this.addTreeObject
            )
        }

        private enterTreeObjectFunctor():IGetTreeObjectFunctor {
            return this.functorTreeObject(
                this.getTreeObject,
                this.enterTreeObject,
                this,
                this.removeTreeObject
            )
        }

        private setDataTreeObjectFunctor():IGetTreeObjectFunctor {
            return this.functorTreeObject(
              this.getTreeObject,
              this.setDataTreeObject,
              this,
              null
            );
        }

        createDom(root:TemplateView) {
            //return this.createTreeObject(root.getTemplate().domTree, root);
        }

        setElementPathToRoot(value:Element|ITemplateView, data:IDomDef, root:TemplateView) {
            root.setPathOfCreatedElement(data.path, value);
            root.setTemplateElementProperty(data.link, value);
        }

        getTreeObject(data:IDomDef, root:TemplateView):Element|ITemplateView {
            return this.isComponentDef(data)?root.getElementByPath(data):root.getComponentByPath(data);
        }

        createTreeObject(data:IDomDef, root:TemplateView):Element|ITemplateView {
            var isIncluded:boolean = this.isTreeObjectIncluded(data, root);
            return isIncluded?
                    (this.getTreeObject(data,root) || this.isComponentDef(data)?this.createComponentElement(data):this.createDomElement(data)):
                    null;
        }

        recreateTreeObject(data:IDomDef, root:TemplateView):Element|ITemplateView {
            var isIncluded:boolean = this.isTreeObjectIncluded(data, root);
            var treeObject:Element|ITemplateView = this.getTreeObject(data,root);

            // 0 - skip
            // 1 - create
            // -1 - remove
            return (isIncluded && treeObject)?0:isIncluded?1:-1;
        }




        enterTreeObject(object:Element|ITemplateView, data:IDomDef, root:ITemplateView) {
            if(object && object instanceof TemplateView) object.enter();
        }

        exitTreeObject(object:Element|ITemplateView,  data:IDomDef, root:ITemplateView) {
            if(object && object instanceof TemplateView) object.exit();
        }

        setDataTreeObject(object:Element|ITemplateView,  data:IDomDef, root:ITemplateView) {

        }

        addTreeObject(object:Element|ITemplateView, parent:Element|ITemplateView, data:IDomDef, root:ITemplateView) {
            this.getDomElement(parent).appendChild(this.getDomElement(object));
        }

        removeTreeObject(object:Element|ITemplateView, parent:Element|ITemplateView, data:IDomDef, root:ITemplateView) {
            this.getDomElement(parent).removeChild(this.getDomElement(object));
        }


        /*
        createTreeObject(data:IDomDef, root:TemplateView) {
            var currentObject:Element|ITemplate = this.isComponentDef(data)?this.createComponentElement(data):this.createDomElement(data);
            this.setElementPathToRoot(currentObject, data, root);

            var children = _.map(data.children, _.partitial(this.createTreeObject, _, root), this);
            _.each(children,
                    (childObject:Element|ITemplateView)=>
                        this.getDomElement(currentObject).appendChild(this.getDomElement(childObject))
                , this);

            return currentObject;
        }
        */

        getDomElement(value:Element|ITemplateView):Element {
            return _.isElement(value)?value:value.getElement();
        }


        isComponentDef(data:IDomDef):boolean {
            return false;
        }

        isTreeObjectInDom(data:IDomDef, root:ITemplateView):boolean {
            return false;
        }

        isTreeObjectIncluded(data:IDomDef, root:ITemplateView):boolean {
            if (!data.states) return true;
            else !!ExpressionHelper.execute.call(root, data.states);
        }
    }

    interface ITemplateViewHelper {
        createDom(view:TemplateView);
        updateDom(view:TemplateView);
    }

    interface ITemplateView extends fmvc.IView {
        createDom();
        enter();
        exit();
    }

    interface IDomDef {
        [attrName:string]:string|IExpressionName;
        tag:string; // system tag (creation step)
        path:string; // system path (creation step)
        link?:string; // system link
        children?:IDomDef[]; // system IDomDef children

        //special attributes
        states?:IExpressionName;
    }

    interface ITreeObjectFunctor {
        (object:Element|ITemplateView, data:IDomDef, root:ITemplateView):any
    }

    interface IChildrenTreeObjectFunctor {
        (object:Element|ITemplateView, parent:Element|ITemplateView, data:IDomDef, root:ITemplateView):any
    }


    interface IGetTreeObjectFunctor {
        (data:IDomDef, root:ITemplateView):Element|ITemplateView
    }

    interface IGetElementFunctor {
        (value:Element|ITemplateView):Element
    }


}
