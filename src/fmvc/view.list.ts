///<reference path='./d.ts'/>
module fmvc {
    export class ViewList extends fmvc.View {
        private _modelList:fmvc.ModelList;
        private childrenList:fmvc.View[];
        private childrenConstructor:Function;

        constructor(name:string, $root:any) {
              super(name, $root);
        }

        set modelList(value:fmvc.ModelList) {
            this._modelList = value;
        }

        get modelList():fmvc.ModelList {
            return this._modelList;
        }

        listAdd(view:fmvc.View) {
        }

        listRemove(view:fmvc.View) {
        }

        listRemoveAt(view:fmvc.View) {
        }
    }
}
