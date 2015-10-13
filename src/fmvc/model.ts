///<reference path='./d.ts'/>
module fmvc {
    export interface IModelOptions {
        enabledState?:boolean;
        enabledEvents?:boolean;
        watchChanges?:boolean;
        history?:boolean;
    }

    export var ModelState = {
        None: '',
        Parsing: 'parsing', // parsing from source
        Syncing: 'syncing', // load from local/remote source
        Synced: 'synced',
        Changed: 'changed',
        Completed: 'completed',
        Error: 'error',
    };

    export class Model extends fmvc.Notifier implements IModelOptions {
        // data, state, prevState
        private _data:any;
        private _state:string;
        private _changes:any;
        private _prevState:string;

        // queue
        private _queue:ModelQueue = null;

        // model options
        public enabledEvents:boolean = true;
        public enabledState:boolean = true;
        public watchChanges:boolean = true;

        constructor(name:string, data:any = {}, opts?:IModelOptions) {
            super(name, TYPE_MODEL);
            if (opts) _.extend(this, opts);
            if (data) this.data = data;
            if (data) this.setState(ModelState.Completed);
        }

        public setState(value:string):Model {
            if (!this.enabledState || this._state === value) return this;
            this._prevState = value;
            this._state = value;
            this.sendEvent(fmvc.Event.Model.StateChanged, this._state);
            return this;
        }

        public parseValueAndSetChanges(value:any):any {
            if (value instanceof Model) throw Error('Cant set model data, data must be object, array or primitive');

            var result = null;
            var prevData = this._data;
            var changes:{[id:string]:any} = null;
            var hasChanges:boolean = false;
            this.setChanges(null);

            if (_.isArray(value)) {
                result = value.concat([]); //clone of array
            }
            else if (_.isObject(prevData) && _.isObject(value) && this.watchChanges) {
                // check changes and set auto data
                for (var i in value) {
                    if (prevData[i] !== value[i]) {
                        if (!changes) changes = {};
                        hasChanges = true;
                        changes[i] = value[i];
                        prevData[i] = value[i];
                    }
                }
                this.setChanges(changes);
                result = prevData;
            }
            else {
                result = (_.isObject(value)) ? _.extend((prevData ? prevData : {}), value) : value; // primitive || array || object && !watchChanges , no data && any value (object etc)
            }
            return result;
        }

        public reset():Model {
            this._data = null;
            this._changes = null;
            this._state = ModelState.None;
            this.sendEvent(Event.Model.Changed);
            return this;
        }

        public set data(value:any) {
            this.setData(value);
        }

        private setChanges(value:any) {
            this._changes = value;
       }

        public setData(value:any) {
            if (this._data === value) return;
            const result:any = this.parseValueAndSetChanges(value);
            if (this._data !== result || this._changes) {
                this._data = result;
                this.sendEvent(fmvc.Event.Model.Changed, this._data, this._changes);
            }
        }

        public get changes():any {
            return this._changes;
        }

        public get data():any {
            return this.getData();
        }

        public get d():any {
            return this.getData();
        }

        public getData():any {
            return this._data;
        }


        public get state():string {
            return this._state;
        }

        public get prevState():string {
            return this._prevState;
        }

        public get count():any {
            return _.isArray(this.data)?this.data.length:0;
        }

        public sendEvent(name:string, data:any = null, changes:any = null, sub:string = null, error:any = null):void {
            if (this.enabledEvents) super.sendEvent(name, data, changes, sub, error);
        }

        public dispose() {
            this._queue?this._queue.dispose():null;
            this._queue = null;
            super.dispose();
        }

        //-----------------------------------------------------------------------------
        // Queue
        //-----------------------------------------------------------------------------
        public queue(create:boolean = false):ModelQueue {
            if (create && this._queue) this._queue.dispose();
            return this._queue && !create ? this._queue : (this._queue = new ModelQueue(this));
        }
    }


    /*
    export class Validator {
        name:string = null;
        fnc:Function = null;

        constructor(name:string, fnc:Function) {
            this.name = name;
            this.fnc = fnc;
        }

        execute(data:any):any {
            this.fnc.call(data, data);
        }
    }
    */
}