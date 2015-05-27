///<reference path='./d.ts'/>
module fmvc {
    export class Model extends fmvc.Notifier {
        private _data:any;
        private _isEvents:boolean;
        private _validators:Array<Validator>;

        constructor(name:string, data:any = {}, isEvents:boolean = true) {
            super(name);
            this._data = data;
            this._isEvents = isEvents;
            if(isEvents) this.sendEvent(fmvc.Event.MODEL_CREATED, this.data);
        }

        public set data(value:any) {
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

            if(hasChanges && this._isEvents) this.sendEvent(fmvc.Event.MODEL_CHANGED, this._data);
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

        public validate(value:any):boolean
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

            this.sendEvent(fmvc.Event.MODEL_VALIDATED, result, null, error);
            return result;
        }

        public destroy()
        {

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