///<reference path='./d.ts'/>

module fmvc {

    export class StorageModel<T extends fmvc.Model<any>> extends fmvc.Model<T> {
        protected modelClass:any;
        protected modelData:any;
        protected throttleGet:any;

        constructor(name:string, data:any, opts?:IModelOptions) {
            super(name, data || {}, opts);
            this.state = ModelState.Synced;
            this.throttleGet = _.throttle(_.bind(this.getImpl, this), 100, {leading:false});
        }

        setChildModel(modelClass:any, defaultData:any):void {
            this.modelClass = modelClass;
            this.modelData = defaultData;
        }

        protected getBaseModelInstance():T {
            return new (this.modelClass)(this.name + '_instance_' + this.count, this.modelData);
        }
    }



    export class DictionaryModel<T extends Model<any>> extends StorageModel<T> {

       getById(id:string):T {
           return this.data[id] || this.createById(id);
       }

       protected createById(id:string):T {
           var instance:T = this.getBaseModelInstance();
           this.data[id] = instance;
           instance.get({id: id});
           return instance;
       }

    }

    export class ArrayModel<T extends Model<any>> extends StorageModel<T> {

        push(...values:any[]):any {
        }

        pop():T {
            return null;
        }

        getBy(opts:any):IPromise {

        }

    }
}