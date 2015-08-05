///<reference path='./d.ts'/>
module fmvc {
    export class ViewList extends fmvc.View {
        private _dataset:any[];
        public ChildrenConstructor:Function = View;

        constructor(name:string) {
              super(name);
        }

        set childrenConstructor(value:Function) {
            this.ChildrenConstructor = value;
        }

        /*
        set dataset(value:any[]) {
            this._dataset = value;
            this.invalidate(8);
        }

        get dataset():any[] {
            return this._dataset;
        }
        */

        public applyChildrenState(name:string, value:any):void {
            if(!this.avaibleInheritedStates || this.avaibleInheritedStates.indexOf(name) === -1) return;
            this.forEachChild(function(view:fmvc.View, index:number) { this.applyViewState(name, value, view, index); });
        }

        public applyViewState(name:string, value:any, view:fmvc.View, index:number):void {
            view.setState(name, value);
        }

        updateChildren() {
            if(!this.inDocument) return;
            var children = this.removeChildFrom(this.data.length - 1) || [];
            console.log('Update children ... ', this._model, this.data);
            _.each(this.data, function(value:Model|any, index) {
                var view:fmvc.View =
                    (this.childrenViews&&this.childrenViews.length?this.childrenViews[index]:null)
                    || (children&&children.length?children.splice(0,1)[0]:null)
                    || new this.ChildrenConstructor(ViewList.Name + index);


                if(value instanceof Model) view.setModel(value, true);
                else view.data = value;

                console.log('Updated view ', view);


                _.each(this.avaibleInheritedStates, function(name:string) {view.setState(name, this.getState(name));}, this);

                if(!view.inDocument) {
                    this.addChild(view);
                }
            }, this)
        }

        public modelHandler(e:IEvent):void {
            //this.log('modelHandler ' + name);
            super.modelHandler(e);
            this.invalidate(4);
        }


        /*
        set modelList(value:fmvc.ModelList) {
            this._modelList = value;
        }

        get modelList():fmvc.ModelList {
            return this._modelList;
        }
        */
    }
}
