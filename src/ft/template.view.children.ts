///<reference path="./d.ts" />

module ft {
    export class TemplateViewChildren extends fmvc.View  {
        private _children:ITemplateView[];
        private _domDef:IDomDef;
        private _parent:ITemplateView;

        get domDef():IDomDef {
            return this._domDef;
        }

        set domDef(value:IDomDef) {
            this._domDef = value;
        }

        get parent():ITemplateView {
            return this._parent;
        }

        set parent(value:ITemplateView) {
            this._parent = value;
        }

        private createChildren():void {
            var def:IDomDef = this.domDef;
            var className:string = def.params[TemplateParams.childrenClass];
            var ViewClass:any = <ITemplateConstructor> (global[className]);
            if (!ViewClass) throw 'Children class ' + className + ' not found';

            var prevChildren = this._children;
            var childrenViews:ITemplateView[] = _.map(this.data, function (v:any, k:number) {
                var params = {};
                if (v instanceof fmvc.Model) {
                    params['model'] = v;
                }
                else {
                    params['data'] = v;
                }

                if(def.params[TemplateParams.childrenEnableStateHandlers]) params[TemplateParams.enableStateHandlers] = def.params[TemplateParams.childrenEnableStateHandlers];

                var child = prevChildren && prevChildren.length?prevChildren.pop():new ViewClass(className + '-' + k, null);
                child.cleanParameters();
                child.setParameters(params);
                return child;
            }, this);
            this._children = childrenViews;

            _.each(prevChildren, (v:ITemplateView)=>v.dispose());

            _.each(this._children, function (child:ITemplateView) {
                child.parent = this.parent;
                child.domDef = def;
                child.createDom();
                this.getElement().appendChild(child.getElement());
                child.enter();
            }, this);

            if(def.params[TemplateParams.childrenSetStateSelected]) this.checkSelected();
        }

        checkSelected() {
            _.each(this._children, function (child:ITemplateView) {
                child.applyParameter(this.domDef.params[TemplateParams.childrenSetStateSelected], TemplateParams.setStateSelected)
            }, this);
        }

        // virtual
        createDom() {
            if (!this.getElement()) throw 'Cant create children dom, cause not set element directly';
        }

        enter() {
            if(this.inDocument) return;
            this.createChildren();
            /*
            _.each(this._children, function (child:ITemplateView) {
                child.enter();
            }, this);
            */
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