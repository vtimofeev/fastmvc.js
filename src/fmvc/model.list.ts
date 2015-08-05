///<reference path='./d.ts'/>


module fmvc {
    export class ModelList extends Model {
        constructor(name:string, data:any = [], opts?:IModelOptions) {
            super(name, data, opts);
        }

        public parseValue(value:any):any {
            if (!_.isArray(value)) throw Error('Cant set modelList from not array data');
            var data = [];
            _.each(value, function(item) {
                var modelValue:Model  = (item instanceof Model)?item:this.getModel(item);
                data.push(modelValue);
            }, this);
            return data;
        }

        // @overrided
        public getModel(value:any):Model {
            return new Model(this.name + '-item', value);
        }

        public get count():number {
            var data = this.data;
            return (data && data.length)?data.length:0;
        }
        /*
            public add(value:any):boolean {
            this._data.push(this.getModel(value));
            this.sendEvent(fmvc.Event.MODEL_CHANGED, this.data);
            return true;
        }

        public remove(value:any):boolean {
            var data:any = this._data;
            var result = false;
            var index:number = data.indexOf(value);

            if (index > -1) {
                data.splice(index, 1)
                result = true;
            }

            this.sendEvent(fmvc.Event.MODEL_CHANGED, this.data);
            return result;
        }

        public update(value:any):boolean {
            var data:any = this._data;
            var result = false;
            var index:number = this.getIndexOfModelData(value);

            if (index > -1) {
                data[index].setData(value);
                result = true;
            }

            this.sendEvent(fmvc.Event.MODEL_CHANGED, this.data);
            return result;
        }

        private getIndexOfModel(value:any):number {
            for (var i in this._data) {
                var model:Model = this._data[i];
                console.log('Check ' + model.data + ', ' + value);
                if (model.data === value) return Number(i);
            }
            return -1;
        }
        */
    }
}