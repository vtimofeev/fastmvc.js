///<reference path="./d.ts" />

namespace ft {
    export class TemplateChildrenView extends ft.TemplateView {

        private _children:TemplateView[]; // active children array
        protected childrenLocalParams:any;

        constructor(name:string, params:TemplateViewParams, template:any) {
            super(name, params, template);
        }

        private createChildren():void {
            var def:IDomDef = this.domDef;
            var parentDef:IDomDef = this.parent && this.parent.domDef;
            var className:string = (parentDef ? parentDef.params[TemplateParams.childrenClass] : null) || def.params[TemplateParams.childrenClass];
            var prevChildren = this._children;
            var data:any = this.getParameterValue(this.getParameters()['children.data']) || this.data || this.parent.data;
            //console.log('CreateChildren', this.data, this.parent);

            var childrenViews:TemplateView[] = _.map(data, function (v:any, k:number) {
                var child = prevChildren && prevChildren.length ? (prevChildren.splice(0, 1)[0]) : templateManager.createInstance(className, this.parent.name + ':' + className + '-' + k, this.childrenLocalParams);
                if (v instanceof fmvc.Model) child.model = v;
                else child.data = v;
                return child;
            }, this);
            this._children = childrenViews;

            _.each(prevChildren, (v:TemplateView)=>v.dispose());
            this.applyChildrenParameters();

            _.each(this._children, function (child:TemplateView) {
                child.parent = this.parent;
                child.domDef = def;

                if (!child.inDocument) {
                    child.isChildren = true;
                    child.createDom();
                    this.getElement().appendChild(child.getElement());
                }

                if(this.inDocument && !child.inDocument) child.enter();

            }, this);


        }


        protected setCurrentChildToExecutionContext(child:TemplateView, index:number, length:number, context:any):void {


            !context.cc && (context.cc = {});

            context.cc.child = child;
            context.cc.childIndex = index;
            context.cc.childrenLength = length;

            context.child = child;
            context.childIndex = index;
            context.childrenLength = length;
        }

        private getChildrenLocalParams(params:any):any {
            var r:any = {};
            _.each(params, (v:any, key:string)=> {
                if (key === 'data' || key === 'model') return;
                if (this.isChildrenParamName(key) && !_.isObject(v))  r[this.getChildrenParamName(key)] = v;
            });
            return r;
        }

        private getChildrenExpressionParams(params:any):any {
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

        protected applyChildrenParameters():void {
            var params:any = this.getChildrenExpressionParams(this.getParameters());
            var length = this._children ? this._children.length : 0;
            _.each(this._children, (child:TemplateView, index:number)=> {
                if (child.disposed) return;
                _.each(params, (value:IExpressionName, key:string)=> {
                    this.setCurrentChildToExecutionContext(child, index, length, value.context || this.parent);
                    var childParamName:string = this.getChildrenParamName(key);
                    if (childParamName === 'data' || childParamName === 'model') return;
                    var childValue:any = this.getExpressionValue(value);
                    child.applyParameter(childValue, childParamName);
                });
            }, this);
        }

        public applyChildrenParameter(value:IExpressionName|any, key:string):void { // Executes when applyValueToHost
            var value:any = this._resultParams[key];
            var length = this._children ? this._children.length : 0;

            _.each(this._children, function (child:TemplateView, index:number) {
                //console.log('Apply children param ... ', value, key );
                if (child.disposed) return;
                this.setCurrentChildToExecutionContext(child, index, length, value.context || this.parent);
                var childValue:any = _.isObject(value) ? this.getExpressionValue(value) : value;
                var childParamName:string = this.getChildrenParamName(key);
                //console.log('Result children param ... ', childValue, childParamName );
                child.applyParameter(childValue, childParamName);
            }, this);
        }

        beforeCreate() {
            this.createParameters();
            this.applyParameters();
            this.childrenLocalParams = this.getChildrenLocalParams(this.getParameters());
        }

        createDom() { // virtual
            if (!this.getElement()) throw 'Cant create children dom, cause not set element directly';
            this.beforeCreate();
            this.createChildren();
        }

        enterImpl() {
            _.each(this._children, function (child:TemplateView) {
                child.enter();
            }, this);
        }

        exitImpl() {
            _.each(this._children, function (child:TemplateView) {
                child.exit();
            }, this);
        }

        validateData() {
            //console.log('CreateChildren:validateData', this.data, this.parent);
            this.createChildren();
        }

        validateState() {
        }

        dispose() {
            super.dispose();
            this.domDef = null;
            this.parent = null;
        }
    }
}
