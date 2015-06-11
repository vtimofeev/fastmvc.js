///<reference path='./d.ts'/>
module fmvc {
    export class ViewList extends fmvc.View {
        private _modelList:fmvc.ModelList;

        private _dataset:any[];
        public ChildrenConstructor:Function;

        constructor(name:string, $root:any) {
              super(name, $root);
        }

        set childrenConstructor(value:Function) {
            this.ChildrenConstructor = value;
        }

        set dataset(value:any[]) {
            this._dataset = value;
            this.invalidate(8);
        }

        get dataset():any[] {
            return this._dataset;
        }

        public applyChildrenState(name:string, value:any):void {
            if(!this.avaibleInheritedStates || this.avaibleInheritedStates.indexOf(name) === -1) return;
            this.forEachChild(function(view:fmvc.View, index:number) { this.applyViewState(name, value, view, index); });
        }

        public applyViewState(name:string, value:any, view:fmvc.View, index:number):void {
            view.setState(name, value);
        }

        updateChildren() {
            if(!this.inDocument) return;
            var children = this.removeAllChildren() || [];
            _.each(this.dataset, function(value, index) {
                var view:fmvc.View = children[index] || new this.ChildrenConstructor();
                view.data = value;
                _.each(this.avaibleInheritedStates, function(name:string) {view.setState(name, this.getState(name));}, this);
                if(!view.inDocument) {
                    this.addChild(view);
                }
            }, this)
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
