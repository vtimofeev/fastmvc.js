///<reference path='./d.ts'/>
module fmvc {

    export interface IModelOptions {
        enabledState?:boolean;
        enabledEvents?:boolean;
        history?:boolean;

        enabledChanges?:boolean;
        changes_autoCommit?:boolean;
    }

    export interface IPromise {
        then(onSuccess:Function, onReject:Function):IPromise;
        catch(onRejects):IPromise;
    }


    export var ModelState = {
        None: 'none',
        New: 'new',
        Parsing: 'parsing', // parsing from source
        Parsed: 'parsed',
        Syncing: 'syncing', // load from local/remote source
        Synced: 'synced',
        Changed: 'changed',
        Error: 'error',
    };

    export var ModelSyncedState = {

    };

    export class Model<T> extends fmvc.Notifier implements IModelOptions {
        // data, state, prevState
        private _data:T;
        private _changes:any;
        private _changedData:T;
        private _invalid:{[name:string]:string[]}; // object only


        private _state:string;
        private _prevState:string;

        // queue
        private _syncTimeout:number;
        private _queue:ModelQueue<T> = null;

        // model options
        public enabledEvents:boolean = true;
        public enabledState:boolean = true;
        public history:boolean = false;

        public enabledChanges:boolean = false; // re,validate & sync changes
        public changesAutoCommit:boolean = false; //
        public changesSyncToLocalStore:boolean = false;

        public syncOptThrottle:number = 1000;

        public syncToApi:boolean = false;
        public syncToLocalStorage:boolean = false;


        constructor(name:string, data:any = null, opts?:IModelOptions) {
            super(name, TYPE_MODEL);
            if (opts) _.extend(this, opts);
            if (data) this.data = data;
            if (data) this.setState(ModelState.New);
        }

        public reset():Model<T> {
            this._data = null;
            this._changes = null;
            this._state = ModelState.None;
            this.sendEvent(Event.Model.Changed);
            return this;
        }

        /*
         * Data layer
         */
        public get d():T {
            return this.getData();
        }

        public set d(value:T) {
            this.setData(value);
        }

        public get data():T {
            return this.getData();
        }

        public get invalid():any {
            return this._invalid;
        }


        public set data(value:T) {
            this.setData(value);
        }

        public getData():T {

            return this._data;
        }

        public setData(value:T):void {
            if (this._data === value || this.disposed) return;
            this._data = value;
            this.sendEvent(fmvc.Event.Model.Changed, this._data, this._changes);
        }

        public get changes():any {
            return this._changes;
        }

        public set changes(value:T|any) {
            this.setChanges(<T>value);
        }

        public setChanges(value:T|any):void {
            if (this._data === value || this.disposed) return;

            if (!this.enabledChanges) {
                this.applyChanges(value);
            }
            else {
                if(_.isObject(value) && _.isObject(this._data)) this._changedData = <T>_.extend(this._changedData || _.extend({}, this._data), value);
                else this._changedData = value;
                this.state = ModelState.Changed;

                if(this.changesAutoCommit) {
                    clearTimeout(this._syncTimeout);
                    this._syncTimeout = setTimeout(this.commit, this.syncOptThrottle);
                }

            }

        }

        protected applyChanges(changes:T|any):void {
            if(_.isObject(changes) && _.isObject(this._data)) _.extend(this._data, changes);
            else this._data = changes; // array, string, number, boolean

            this.state = ModelState.Synced;
            this.sendEvent(fmvc.Event.Model.Changed, this._data, this._changes);
        }

        public commit():boolean|IPromise {
            if(this._changedData) {
                var isValid = this.validate();

                if(isValid) {
                    return this.sync().then(this.applyChanges, this.syncErrorHandler);
                }
                return isValid;
            }

            return true;

        }

        protected sync():IPromise {
            this.state = ModelState.Syncing;
            return this.syncImpl();
        }

        protected syncImpl():IPromise {
            return null;
        }

        protected syncErrorHandler() {
            this.state = ModelState.Error;
        }

        protected validate():boolean {


        }


        /*
        public parseValueAndSetChanges(value:T):any {
            if (value instanceof Model) throw Error('Cant set model data, data must be object, array or primitive');
            var result = null;
            var prevData = _.clone(this._data);
            var changes:{[id:string]:any} = null;
            var hasChanges:boolean = false;

            if (_.isArray(value)) {
                result = (<any>value).concat([]); //clone of array
            }
            else if (this.changesWatch && _.isObject(prevData) && _.isObject(value)) {
                // check changes and set auto data
                for (var i in value) {
                    if (prevData[i] !== value[i]) {
                        if (!changes) changes = {};
                        hasChanges = true;
                        changes[i] = value[i];
                        prevData[i] = value[i];
                    }
                }
                this._changes = value;
                result = prevData;
            }
            else {
                result = (_.isObject(value)) ? _.extend((prevData ? prevData : {}), value) : value; // primitive || array || object && !watchChanges , no data && any value (object etc)
            }
            return result;
        }
        */


        /*
         *   Internal state layer
         */
        public get state():string {
            return this._state;
        }

        public get prevState():string {
            return this._prevState;
        }

        public set state(value:string) {
            this.setState(value);
        }

        public setState(value:string):Model<T> {
            if (!this.enabledState || this._state === value) return this;
            this._prevState = value;
            this._state = value;
            this.sendEvent(fmvc.Event.Model.StateChanged, this._state);
            return this;
        }

        public get length():number {
            return _.isArray(this.data) ? (<any>this.data).length : -1;
        }

        public sendEvent(name:string, data:any = null, changes:any = null, sub:string = null, error:any = null):void {
            if (this.enabledEvents) super.sendEvent(name, data, changes, sub, error);
        }

        public dispose():void {
            this.sendEvent(Event.Model.Disposed);
            this._queue ? this._queue.dispose() : null;
            this._queue = null;
            this._data = null;
            super.dispose();
        }

        //-----------------------------------------------------------------------------
        // Queue
        //-----------------------------------------------------------------------------
        public queue(create:boolean = false):ModelQueue<T> {
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