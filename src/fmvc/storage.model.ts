///<reference path='./d.ts'/>

namespace fmvc {


    export class StorageModel<T extends fmvc.Model<any>> extends fmvc.Model<T> {

        protected modelClass:any;
        protected modelData:any;

        constructor(name:string, data:any, opts?:IModelOptions) {
            super(name, data || {}, opts);
            this.state = ModelState.Synced;
        }

        setChildModel(modelClass:any, defaultData:any):void {
            this.modelClass = modelClass;
            this.modelData = defaultData;
        }

        protected getChildModelClass():any {
            return this.modelClass || fmvc.Model;
        }

        protected getChildModelData():any {
            return this.modelData || {};
        }

        protected getBaseModelInstance():T {
            return new (this.getChildModelClass())(this.name + '_instance_' + this.count, this.getChildModelData());
        }

        save():fmvc.IPromise {
            throw 'Method can not be implemented';
        }

        delete():fmvc.IPromise {
            throw 'Method can not be implemented';
        }

    }



    export class DictionaryModel<T extends fmvc.Model<any>> extends fmvc.StorageModel<T> {
        public getPromises:IPromise[] = [];


        protected getBaseModelInstance():T {
            this.count = this.count > -1?this.count + 1: 0;
            return super.getBaseModelInstance();
        }

        public getInstanceById(id:string):T {
            if(this.data[id]) return this.data[id];

           var instance:T = this.getBaseModelInstance();
           this.getPromises.push( instance.getById(id) );
           this.data[id] = instance;
           return instance;
       }

    }

    export class ArrayModel<T extends fmvc.Model<any>> extends fmvc.StorageModel<T> {
        public meta:fmvc.Model<any>;

        constructor(name:string, data:T[], opts?:IModelOptions) {
            super(name, data || [], opts);
            this.state = ModelState.Synced;
        }

        protected getHandler(data:any):any {
            this.state = ModelState.Synced;

            var models = data
                .filter( (item:any)=>{
                    var found = this.data && item && this.data.find( (v:any)=>v.data._id===item._id );
                    return !found;
                }, this)
                .map((item:any)=>{
                   var model = this.getBaseModelInstance();
                   model.data = item;
                   model.state = ModelState.Synced;
                   return model;
                }, this);
            
            if(data.meta) {
                this.meta = this.meta || new Model(this.name + '_meta', {});
                this.meta.changes = data.meta;
            }

            this.data = <any> [].concat(this.data || [], models);
            return data;
        }

    }

}