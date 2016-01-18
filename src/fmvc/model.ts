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
        then(onSuccess:Function, onReject?:Function):IPromise;
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

    export var ModelAction = {
        Get: 'get',
        Insert: 'insert',
        Update: 'update',
        Delete: 'delete',
        Add: 'add',
    };

    export class Model<T> extends fmvc.Notifier implements IModelOptions {
        // data, state, prevState
        private _data:T;
        private _changes:any;
        private _changedData:T;
        private _invalid:{[name:string]:string[]}; // object only

        private _currentTask:IPromise;

        private _state:string;
        private _prevState:string;


        // model options
        public enabledEvents:boolean = true;
        public enabledState:boolean = true;
        public enableValidate:boolean  = false;
        public enableCommit:boolean = false; // re,validate & sync changes
        public autoCommit:boolean = false; //

        public history:boolean = false;

        constructor(name:string, data:any = null, opts?:IModelOptions) {
            super(name, TYPE_MODEL);
            if (opts) _.extend(this, opts);
            if (data) {
                this.setData(data);
                this.setState(ModelState.New);
            }
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

        public get count():number {
            return (this.data && this.data instanceof Array)?(<any>this.data).length:-1;
        }

        public get data():T {
            return this.getData();
        }

        public get invalid():any {
            return this._invalid;
        }

        public get schemas():any {
            return this.getSchemas();
        }

        public getSchemas():any {
            return null;
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

            if (!this.enableCommit) {
                this.applyChanges(value);
            }
            else {
                if(_.isObject(value) && _.isObject(this._data))
                    this._changedData = <T>_.extend(this._changedData || {}/*_.extend({}, this._dat)a*/, value);
                else
                    this._changedData = value;

                this.state = ModelState.Changed;
                if(this.autoCommit) this.commit();
            }
        }

        protected applyChanges(changes:T|any):void {
            if(_.isObject(changes) && _.isObject(this._data))
                _.extend(this._data, changes);
            else
                this._data = changes; // was array, string, number, boolean

            this.state = ModelState.Synced;
            this.sendEvent(fmvc.Event.Model.Changed, this._data, changes);
        }

        public get(opts?:any):IPromise {
            this.state = ModelState.Syncing;
            return this.getImpl(opts);
        }

        public delete():IPromise {
            this.state = ModelState.Syncing;
            return this.deleteImpl();
        }

        protected deleteImpl():IPromise {
            var p = new Promise();
            p.then(this.dispose, this.remoteErrorHandler);
            p.resolve(null);
            return p;
        }

        protected getImpl(opts:any):IPromise {
            // must be overrided
            var p = new Promise();
            p.then(this.getHandler, this.remoteErrorHandler);
            p.resolve({});
            return p;
        }

        protected getHandler(data:any|T) {
            this.state = ModelState.Synced;
            this.setData(data);
        }

        protected remoteErrorHandler() {
            this.state = ModelState.Error;
        }

        public commit():boolean|IPromise {
            if(this._changedData) {
                var isValid = this.validate();
                if(isValid) {
                    return this.sync();
                }
                return isValid;
            }
            return true;
        }

        protected sync(opts?:any):IPromise {
            this.state = ModelState.Syncing;
            var p = this.syncImpl(opts);
            p.then(this.applyChanges).catch(this.remoteErrorHandler);
            return p;
        }

        protected syncImpl(opts?:any):IPromise {
            var p = new Promise();
            p.resolve(this.changes);
            return p;
        }

        protected syncErrorHandler() {
            this.state = ModelState.Error;
        }

        protected validate():boolean {

            return false;
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
            this._data = null;
            super.dispose();
        }

        //-----------------------------------------------------------------------------
        // Queue
        //-----------------------------------------------------------------------------
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