///<reference path="./d.ts" />

module ft {
    export class TemplateChildrenView extends ft.TemplateView {
        // children array
        private _children:ITemplateView[];

        // child context expression execution
        public child:ITemplateView;
        public childIndex:number;
        public childrenLength:number;

        //
        protected childrenLocalParams:any;

        constructor(name:string, params:ITemplateViewParams, template:ITemplate) {
            super(name, params, {domTree:{}});
        }

        private createChildren():void {
            var def:IDomDef = this.domDef;
            var className:string = def.params[TemplateParams.childrenClass];
            var ComponentContructorFunc:any = <ITemplateConstructor> (window[className]);
            if (!ComponentContructorFunc) throw 'Children class ' + className + ' not found' ;

            var prevChildren = this._children;

            var childrenViews:ITemplateView[] = _.map(this.data, function (v:any, k:number) {
                var child = prevChildren && prevChildren.length ? (prevChildren.splice(0, 1)[0]) : ComponentContructorFunc(this.parent.name + ':' + className + '-' + k, this.childrenLocalParams);
                child.isChildren = true;
                if (v instanceof fmvc.Model) child.model = v;
                else child.data = v;
                return child;
            }, this);
            this._children = childrenViews;


            _.each(prevChildren, (v:ITemplateView)=>v.dispose());

            _.each(this._children, function (child:ITemplateView) {
                child.parent = this.parent;
                child.domDef = def;
                if (!child.inDocument) {
                    //child.applyParameters();
                    child.createDom();
                    child.enter();
                    this.getElement().appendChild(child.getElement());
                }

                child.invalidateData();
                child.invalidateApp();
                //child.validate();
            }, this);

            //if(def.params[TemplateParams.childrenSetStateSelected]) this.checkSelected();
            //if(def.params[TemplateParams.childrenSetStateDisabled]) this.checkDisabled();
        }


        protected executeExpression(value:ft.IExpression):any {
            return expression.execute(value, this.parent);
        }

        protected setChildContext(child:ITemplateView, index:number):void {
            this.parent.child = child;
            this.parent.childIndex = index;
        }

        private getChildrenLocalParams(params:any) {
            var r:any = {};
            _.each(params, (v:any, key:string)=> {
                if (key === 'data' || key === 'model') return;
                if (this.isChildrenParamName(key) && !_.isObject(v))  r[this.getChildrenParamName(key)] = v;
            });
            return r;
        }

        private getChildrenExpressionParams(params:any) {
            var r:any = {};
            _.each(params, (v:any, key:string)=> {
                if (key === 'data' || key === 'model') return;
                if (this.isChildrenParamName(key) && _.isObject(v))  r[key] = v;
            });
            return r;
        }

        private isChildrenParamName(value:string):boolean {
            return value.indexOf('children.') === 0;
        }

        private getChildrenParamName(value:string):string {
            return value.substring(9);
        }


        getChildExpressionValue(ex:ft.IExpressionName):any {
                var exName = ex.name;
                var exObj:IExpression = this.getExpressionByName(exName);
                var result = this.executeExpression(exObj);
                return result;
        }

        protected applyChildrenParameters():void {
            var params:any = this.getChildrenExpressionParams(this._params);
            this.parent.childrenLength = this._children ? this._children.length : 0;

            _.each(this._children, (child:ITemplateView, index:number)=> {
                if (child.disposed) return;

                this.setChildContext(child, index);
                _.each(params, (value:IExpressionName, key:string)=> {
                    var childValue:any = this.getChildExpressionValue(value);
                    var childParamName:string = this.getChildrenParamName(key);
                    child.applyParameter(childValue, childParamName);
                });
            }, this);
        }

        // Executes when applyValueToHost executed
        public applyChildrenParameter(value:IExpressionName|any, key:string):void {
            var value:any = this._params[key];
            _.each(this._children, function (child:ITemplateView, index:number) {
                if (child.disposed) return;
                this.setChildContext(child, index);
                var childValue:any = _.isObject(value) ? this.getChildExpressionValue(value) : value;
                var childParamName:string = this.getChildrenParamName(key);
                child.applyParameter(childValue, childParamName);
            }, this);

            this.setChildContext(null, 0);
        }

        /*
         checkDisabled() {
         _.each(this._children, function (child:ITemplateView) {
         if(!child.disposed) child.applyParameter(this.domDef.params[TemplateParams.childrenSetStateDisabled], TemplateParams.setStateDisabled);
         }, this);
         }
         */


        // virtual
        createDom() {
            if (!this.getElement()) throw 'Cant create children dom, cause not set element directly';
        }

        enter() {
            if (this.inDocument) return;
            this.childrenLocalParams = this.getChildrenLocalParams(this.getParameters());

            this.applyParameters();
            this.createChildren();
            this.applyChildrenParameters();
            super.enter();
        }


        exit() {
            _.each(this._children, function (child:ITemplateView) {
                child.exit();
            }, this);
        }


        validateData() {
            this.createChildren();
        }

        validateState() {
        }

        unrender() {
        }

        dispose() {
            super.dispose();
            this.domDef = null;
            this.parent = null;
        }
    }

}
