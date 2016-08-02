///<reference path='./d.ts'/>

module fmvc {
    export interface IModelOptions {
        type?:string // типы хранилища StorageModelType, например по ключу (key) или массив элементов (array)
        state?:boolean;
        event?:boolean;
        validate?:boolean;
        forceApplyChanges?:boolean;
    }

    export interface IModelData {
        _id?:string;
    }

    export interface IPromise {
        resolve(value:any):IPromise;
        reject(value?:any):IPromise;
        then(onSuccess:any, onError?:any):IPromise;
        catch(onError:any):IPromise;
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


    export class Model<T extends IModelData> extends Notifier {
        private _count:number;
        private _data:T;
        private _changedData:T;

        private _state:string;
        private _prevState:string;

        public schemas:any;

        // model options
        public opts:IModelOptions = {
            event: true,
            state: true,
            validate: false
        };

        constructor(name:string, data:any = null, opts?:IModelOptions) {
            super(name, TYPE_MODEL);

            opts && _.extend(this.opts, opts);
            data && this.setData(data);

            this.schemas = this.getSchemas();
        }

        protected getSchemas():any {
            return {};
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
        public set count(value:number) {
            this._count = value;
        }

        public get count():number {
            return this._count || (this.data && this.data instanceof Array) ? (<any>this.data).length : -1;
        }

        public get length():number {
            return _.isArray(this.data) ? (<any>this.data).length : -1;
        }

        public get data():T {
            return this._data;
        }

        public set data(value:T) {
            this.setData(value);
        }

        public setData(value:T):Model<T> {
            if (this._data === value || this.disposed) return;
            this._data = value;
            this.sendEvent(Event.Model.Changed, this._data);
            return this;
        }

        public get changes():T|any {
            return this._changedData;
        }

        public set changes(value:T|any) {
            this.setChanges(<T>value);
        }

        public setChanges(value:T|any):Model<T> {
            if (this._data === value || this.disposed) return;

            if (!this.getRemoteModel()  || this.opts.forceApplyChanges) {
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

            return this;
        }

        public applyChanges(remoteData:any = null):void {
            var changes = this._changedData;

            if (_.isObject(changes) && _.isObject(this._data))
                _.extend(this._data, changes);
            else if(changes !== undefined)
                this._data = changes; // was array, string, number, boolean

            if(_.isObject(remoteData) && _.isObject(this._data))
                _.extend(this._data, remoteData);

            this._changedData = undefined;
            this.state = ModelState.Synced;
            this.sendEvent(Event.Model.Changed, this._data, changes);

        }

        protected validate():boolean {
            return false;
        }

        getById(id:string):IPromise {
            return this.get({_ids: [id]});
        }

        get(getQuery:any, sort:any = null, limit:any = null ):IPromise {
            this.state = ModelState.Syncing;
            if(!this.remoteTaskManager) throw 'Cant perform method, remoteTaskManager is not set';

            var p = this.remoteTaskManager.insert({
                model: this.getRemoteModel(),
                type: 'get',
                data: { query: getQuery , sort: sort, limit: limit }
            });

            return p.then(this.getHandler.bind(this)).catch(this.remoteErrorHandler.bind(this));
        }

        save():IPromise {
            if(this.opts.validate && !this.validate()) return null;

            if(!this.remoteTaskManager) throw 'Cant perform method, remoteTaskManager is not set';

            this.state = ModelState.Syncing;
            var p:IPromise,
                _id = this.data && (<T> this.data)._id;

            if(this.changes)
                p = this.remoteTaskManager.insert({
                    model: this.getRemoteModel(),
                    type: 'update',
                    data: { query: { _id: _id }, set: this.changes }
                });
            else
                p = this.remoteTaskManager.insert({
                    model: this.getRemoteModel(),
                    type: 'insert',
                    data: this.data
                });

            return p.then(this.applyChanges.bind(this)).catch(this.remoteErrorHandler.bind(this));
        }

        delete():IPromise {
            this.state = ModelState.Syncing;

            if(!this.remoteTaskManager) throw 'Cant perform method, remoteTaskManager is not set';

            var _id = this.data && (<T> this.data)._id,

                p:IPromise = this.remoteTaskManager.insert({
                model: this.getRemoteModel(),
                type: 'delete',
                data: { query: { _id: _id } }
            });


            return p.then(this.dispose.bind(this)).catch(this.remoteErrorHandler.bind(this));
        }

        protected getRemoteModel():string {
            return null;
        }

        protected getHandler(data:any):any {
            this.state = ModelState.Synced;
            this.data = data;
            return data;
        }

        protected remoteErrorHandler() {
            this.state = ModelState.Error;
        }

        sendEvent(name:string, data:any = null, changes:any = null, sub:string = null, error:any = null):void {
            if (this.opts.event) super.sendEvent(name, data, changes, sub, error);
        }

        dispose(data:any = null):void {
            this.sendEvent(Event.Model.Disposed);
            this._changedData = null;
            this._data = null;
            super.dispose();
            return data;
        }

        get remoteTaskManager():RemoteTaskManager {
            return this.facade && this.facade.remoteTaskManager || window && window['remoteTaskManager'];
        }
    }

}