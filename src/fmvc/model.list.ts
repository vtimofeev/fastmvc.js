///<reference path='./d.ts'/>


module fmvc {
    export class ModelList extends fmvc.Notifier {
        private _data:Array<Model>;

        constructor(name:string, data:Array<Model> = null) {
            super(name);
            this.data = data;
        }

        public set data(value:Array<Model>) {
            if (!this._data) this._data = [];
            for (var i in value) {
                this._data.push(this.createModel(value[i]));
            }
            this.sendEvent(fmvc.Event.MODEL_CHANGED, this.data);
        }

        public get data():Array<Model> {
            return this._data;
        }


        private createModel(value:any):Model {
            return new Model(this.name + '-item', value);
        }

        public add(value:any):boolean {
            this._data.push(this.createModel(value));
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

        private getIndexOfModelData(value):number {
            for (var i in this._data) {
                var model:Model = this._data[i];
                console.log('Check ' + model.data + ', ' + value);
                if (model.data === value) return Number(i);
            }
            return -1;
        }
    }
}