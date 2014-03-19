module fastmvc {
    export class Model extends fastmvc.Notifier {
        private _data:any;

        constructor(name:string, data:any = null) {
            super(name);
            this._data = data;
        }

        public setData(value:any):void {
            this._data = value;
            this.log('Set ' + JSON.stringify(value));
            this.sendEvent(fastmvc.Event.MODEL_CREATE, this.data());
            this.sendEvent(fastmvc.Event.MODEL_CHANGE, this.data());
        }

        public data():any {
            return this._data;
        }

        public add(value:any, key?:string):boolean {
            var data:any = this._data;

            if (!data || !value) return false;

            if (key) {
                data[key] = value;
            }
            else {
                data.push(value);
            }

            this.sendEvent(fastmvc.Event.MODEL_ADD, this.data());
            this.sendEvent(fastmvc.Event.MODEL_CHANGE, this.data());
            return true;
        }

        public remove(value:any, key?:string):boolean {
            var data:any = this._data;
            var result:boolean = false;

            if(key)
            {
                if(data[key]) {
                    delete data[key];
                    result = true;
                }
            }
            else
            {
                var index:number = data.indexOf(value);
                if(index > -1) {
                    data.splice(index)
                    result = true;
                }
            }

            this.sendEvent(fastmvc.Event.MODEL_REMOVE, this.data());
            this.sendEvent(fastmvc.Event.MODEL_CHANGE, this.data());
            return result;
        }

        public update(value:any, key?:string):boolean
        {
            var data:any = this._data;
            var result:boolean = false;

            if(key)
            {
                if(data[key]) {
                    data[key] = value;
                    result = true;
                }
            }
            else
            {
                var index:number = data.indexOf(value);
                if(index > -1) {
                    data[index] = value;
                    result = true;
                }
            }

            this.sendEvent(fastmvc.Event.MODEL_UPDATE, this.data());
            this.sendEvent(fastmvc.Event.MODEL_CHANGE, this.data());
            return result;
        }

    }
}