///<reference path='./d.ts'/>


module fmvc {
    export interface IModelOptions {
        type?:string // типы хранилища StorageModelType, например по ключу (key) или массив элементов (array)
        state?:boolean;
        event?:boolean;
        validate?:boolean;
        remote?:boolean; // удаленная модель, требует сохранения
    }

    export interface IPromise {
        then(onSuccess:Function, onReject?:Function):IPromise;
        catch(onRejects:Function):IPromise;
    }


    export var ModelState = {
        None: 'none',
        Syncing: 'syncing',
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


    export class Model<T> extends Notifier {
        private _data:T;
        private _changedData:T;
        private _invalid:{[name:string]:string[]}; // object only

        private _state:string;
        private _prevState:string;

        // model options
        protected opts:IModelOptions = {
            event: true,
            state: true,
            validate: false,
            remote: false
        };


        constructor(name:string, data:any = null, opts?:IModelOptions) {
            super(name, TYPE_MODEL);
            opts && _.extend(this.opts, opts);
            data && this.setData(data);
        }

        public reset():Model<T> {
            this._data = null;
            this._state = ModelState.None;
            this.sendEvent(Event.Model.Changed);
            return this;
        }

        /** states */
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
            if (!this.opts.state || this._state === value) return this;
            this._prevState = value;
            this._state = value;
            this.sendEvent(Event.Model.StateChanged, this._state);
            return this;
        }


        /** data layer */
        public get count():number {
            return (this.data && this.data instanceof Array) ? (<any>this.data).length : -1;
        }


        public get length():number {
            return _.isArray(this.data) ? (<any>this.data).length : -1;
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
            this.sendEvent(Event.Model.Changed, this._data);
        }

        public get changes():T|any {
            return this._changedData;
        }

        public set changes(value:T|any) {
            this.setChanges(<T>value);
        }

        public setChanges(value:T|any):void {
            if (this._data === value || this.disposed) return;

            if (!this.opts.remote) {
                this._changedData = value;
                this.applyChanges();
            }
            else {
                if (_.isObject(value) && _.isObject(this._data))
                    this._changedData = <T>_.extend(this._changedData || {}, value);
                else
                    this._changedData = value;

                this.state = ModelState.Changed;
            }
        }

        protected applyChanges():void {
            var changes = this._changedData;


            if (_.isObject(changes) && _.isObject(this._data))
                _.extend(this._data, changes);
            else
                this._data = changes; // was array, string, number, boolean


            this._changedData = null;
            this.state = ModelState.Synced;
            this.sendEvent(Event.Model.Changed, this._data, changes);
        }

        public get(opts?:any):IPromise {
            this.state = ModelState.Syncing;
            var p = this.getImpl(opts);
            p.then(this.getHandler).catch(this.remoteErrorHandler);
            return p;
        }

        protected validate():boolean {
            return false;
        }

        public save(opts?:IModelOptions):IPromise {
            if((this.opts.validate || opts.validate) && !this.validate()) return null;

            this.state = ModelState.Syncing;
            var p = this.saveImpl(opts);
            p.then(this.applyChanges).catch(this.remoteErrorHandler);
            return p;
        }

        public delete():IPromise {
            this.state = ModelState.Syncing;
            var p = this.deleteImpl();
            p.then(this.dispose).catch(this.remoteErrorHandler);
            return p;
        }

        protected getHandler(data:any|T) {
            this.state = ModelState.Synced;
            this.setData(data);
        }

        protected remoteErrorHandler() {
            this.state = ModelState.Error;
        }

        protected deleteImpl():IPromise {
            return null;
        }

        protected saveImpl(opts?:any):IPromise {
            return null;
        }

        protected getImpl(opts:any):IPromise {
            return null;
        }

        public sendEvent(name:string, data:any = null, changes:any = null, sub:string = null, error:any = null):void {
            if (this.opts.event) super.sendEvent(name, data, changes, sub, error);
        }

        public dispose():void {
            this.sendEvent(Event.Model.Disposed);
            this._changedData = null;
            this._data = null;
            super.dispose();
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