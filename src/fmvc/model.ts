module fmvc {
    export class Model extends fmvc.Notifier {
        private _data:any;
        private _validator:any;

        constructor(name:string, data:any = null) {
            super(name);
            this._data = data;
        }

        public setData(value:any):void {
            //this._data = value;
            var data = this.getData();

            if (data) {
                for(var i in value) data[i] = value[i];
            }
            else {
                this._data = value;
            }

            this.sendEvent(fmvc.Event.MODEL_CHANGE, data);
        }

        public getData():any {
            return this._data;
        }

        public setValidator(value:any):void {
             this._validator = value;
        }

        public validate(value:any):boolean
        {
            var result = false;
            var error = {};

            if(!this._validator) result = true;
            else result = this._validator(value, this, error);
            this.sendEvent(fmvc.Event.MODEL_VALIDATE, result, null, error);
            return result;
        }

        public destroy()
        {

        }

    }

    export class ModelList extends fmvc.Notifier {
        private _data:any;

        constructor(name:string, data:any = null) {
            super(name);
            this.setData(data);
        }

        public setData(value:any):void {
            if(!this._data) this._data = [];
            for (var i in value)
            {
                this._data.push(this.createModel(value[i]));
            }
            this.sendEvent(fmvc.Event.MODEL_CHANGE, this.data());
        }

        public getData():any
        {
            return this._data;
        }

        private createModel(value:any):Model
        {
            return new Model(this.name + '-item', value);
        }

        public data():any {
            return this._data;
        }

        public add(value:any):boolean {
            this._data.push(this.createModel(value));
            this.sendEvent(fmvc.Event.MODEL_CHANGE, this.getData());
            return true;
        }

        public remove(value:any):boolean {
            var data:any = this._data;
            var result = false;
            var index:number = data.indexOf(value);

            if(index > -1) {
                data.splice(index, 1)
                result = true;
            }

            this.sendEvent(fmvc.Event.MODEL_CHANGE, this.getData());
            return result;
        }

        public update(value:any):boolean
        {
            var data:any = this._data;

            var result = false;
            var index:number = this.getIndexOfModelData(value);

            if(index > -1) {
                data[index].setData(value);
                result = true;
            }

            this.sendEvent(fmvc.Event.MODEL_CHANGE, this.getData());
            return result;
        }

        private getIndexOfModelData(value):number
        {
            for (var i in this._data)
            {
                var model:Model = this._data[i];
                console.log('Check ' + model.getData() + ', ' + value);
                if (model.getData() === value) return Number(i);
            }
            return -1;
        }

    }
}