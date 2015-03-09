module fmvc {
    export class Model extends fmvc.Notifier {
        private _data:Object;
        private _isEvents:boolean;
        private _validators:Array<Validator>;

        constructor(name:string, data:Object = {}, isEvents:boolean = true) {
            super(name);
            this._data = data;
            this._isEvents = isEvents;
            if(isEvents) this.sendEvent(fmvc.Event.MODEL_CREATE, this.data);
        }

        public set data(value:Object):void {
            var data = this._data;
            var changedFields:Array<string> = null;

            var hasChanges:boolean = false;
            if (data) {
                for(var i in value) {
                    if(data[i] != value[i]) {
                        if(!changedFields) changedFields = [];
                        changedFields.push(i);
                        hasChanges = true;
                        data[i] = value[i];
                    }
                }
            }

            if(hasChanges && this._isEvents) this.sendEvent(fmvc.Event.MODEL_CHANGE, this._data);
        }

        public get data():any {
            return this._data;
        }

        public addValidator(value:Validator):void {
            this._validators = this._validators?this._validators:[];
            if(this._validators.indexOf(value) >= 0) throw 'Cant add validator to model';
            this._validators.push(value);
        }

        public removeValidator(value:Validator):void {
            var index = this._validators ? this._validators.indexOf(value) : -1;
            if (index >= 0) this._validators.splice(index, 1);
        }

        public validate(value:Object):boolean
        {
            var result = false;
            var error = {};

            for(var i in this._validators) {
                var validator:Validator = this._validators[i];
                value = validator.execute(value)
                if(!value) {
                    result = false;
                    break;
                }
            }

            this.sendEvent(fmvc.Event.MODEL_VALIDATE, result, null, error);
            return result;
        }

        public destroy()
        {

        }

    }

    export class ModelList extends fmvc.Notifier {
        private _items:Array<Model>;

        constructor(name:string, data:any = null) {
            super(name);
            this.setData(data);
        }

        public set data(value:any):void {
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

        public add(value:Validator):boolean {
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


    export class Validator {
        name:string = null;
        fnc:Function = null;

        constructor(name:string, fnc:Function) {
            this.name  = name;
            this.fnc = fnc;
        }

        execute(data:any):any {
            this.fnc.call(data, data);
        }
    }
}