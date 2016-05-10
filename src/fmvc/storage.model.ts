///<reference path='./d.ts'/>

module fmvc {

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
            return this.modelClass;
        }

        protected getChildModelData():any {
            return this.modelData;
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


    export class DictionaryModel<T extends Model<any>> extends StorageModel<T> {
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

    export class ArrayModel<T extends Model<any>> extends StorageModel<T> {

        constructor(name:string, opts?:IModelOptions) {
            super(name, [], opts);
            this.state = ModelState.Synced;
        }

        protected getHandler(data:any):any {
            this.state = ModelState.Synced;

            var models = data.map((item)=>{
               var model = this.getBaseModelInstance();
               model.data = item;
               model.state = ModelState.Synced;
               return model;
            }, this);

            this.data = <any> [].concat(this.data, models);
            return data;
        }

    }

}