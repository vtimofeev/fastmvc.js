///<reference path='./d.ts'/>

module fmvc {
   var RepoModelType = {
       Id: 'id',
       Sorted: 'sorted'
   };


   export class RepoModel<T extends fmvc.Model<any>> extends fmvc.Model<T> {
       private modelClass:any;
       private modelData:any;
       private throttleGet:any;

       constructor(name:string, data:any, opts?:IModelOptions) {
           super(name, data || {}, opts);
           this.state = ModelState.Synced;
           this.throttleGet = _.throttle(_.bind(this.getImpl, this), 100, {leading:false});
       }

       setRepoModel(modelClass:any, defaultData:any):void {
           this.modelClass = modelClass;
           this.modelData = defaultData;
       }

       protected ModelClass():Function {
           return this.modelClass;
       }

       protected getModelDefaultData():any {
           return this.modelData || null;
       }

       getById(id:string):T {
           return this.data[id] || this.createById(id);
       }

       protected createById(id:string):T {
           var data = _.extend({id: id}, this.getModelDefaultData());
           var instance:T = <T>(new this.ModelClass(this.name + '_instance_' + this.count, data));
           this.data[id] = instance;
           instance.get({id: id});
           return instance;
       }

       protected getImpl():IPromise {
           return null;
       }

       mgetBySortedField(field:string, sortDirection:string, fromIndex:any, toIndex:any):T[] {
           return null;
       }

       protected mgetBySortedFieldImpl():IPromise {
           return null;
       }





    }
}