///<reference path='./d.ts'/>

namespace fmvc {

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

    export class Model<T extends any> extends fmvc.Notifier {
        private _count:number;
        private _data:T;
        private _changedData:T;

        private _state:string;
        private _prevState:string;
        private _remoteModel:string;

        public schemas:any;

        // model options
        public opts:IModelOptions = {
            event: true,
            state: true
        };

        constructor(name:string, data:any = null, opts?:IModelOptions) {
            super(name, TYPE_MODEL);

            opts && _.extend(this.opts, opts);
            var result = data || this.isLocalStorageEnabled() && JSON.parse(window.localStorage.getItem(this.name)) || null;
            this.setData(result);
            this.schemas = this.getSchemas();

        }

        protected getSchemas():any {
            return {};
        }

        public reset():Model<T> {
            this._data = null;
            this._state = ModelState.None;
            this.dispatchEvent({type: Event.Model.Changed});
            return this;
        }

        public isLocalStorageEnabled() {
            return this.opts &&  this.opts.localStorage && window.localStorage;
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
            this._prevState = this._state;
            this._state = value;
            this.dispatchEvent({type: Event.Model.StateChanged, data: this._state});
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
            if (this.isLocalStorageEnabled()) window.localStorage.setItem(this.name, JSON.stringify(this._data));

            this.dispatchEvent({type: Event.Model.Changed, data: this._data});
            return this;
        }

        public get changes():T|any {
            return this._changedData;
        }

        public set changes(value:T|any) {
            this.setChanges(<T>value);
        }

        public setChanges(value:T|any):Model<T> {
           // console.log('Set changes ', value);

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

                var hasChanges = !(this._changedData === null && this._changedData === undefined);
                this.state = hasChanges?ModelState.Changed:this._prevState;
            }

            return this;
        }

        public applyChanges(remoteData:any = null):T {
            var changes = this._changedData;

            if (_.isObject(changes) && _.isObject(this._data))
                _.extend(this._data, changes);
            else if(changes !== undefined)
                this._data = changes; // was array, string, number, boolean

            if(_.isObject(remoteData) && _.isObject(this._data))
                _.extend(this._data, remoteData);

            this._changedData = undefined;
            this.state = ModelState.Synced;

            this.saveLocal();
            this.dispatchEvent({type: Event.Model.Changed, data: this._data, changes: changes});

            return this.data;
        }

        public saveLocal() {
            if (this.isLocalStorageEnabled())  window.localStorage.setItem(this.name, JSON.stringify(this._data));
        }

        protected validate():boolean {
            return false;
        }

        getById(id:string):IPromise {
            return this.get({_ids: [id]});
        }

        get(query:any = null, from:any = null, limit:any = null, sort:any = null):IPromise {

            if(this.state === ModelState.Syncing) {
                return Promise.reject(`Cant execute GET of model, cause it is has state ${this.state}`);
            }


            this.state = ModelState.Syncing;
            if(!this.remoteTaskManager) throw 'Cant perform method, remoteTaskManager is not set';

            var p = this.remoteTaskManager.insert({
                model: this.getRemoteModel(),
                type: 'get',
                data: { query: query , from: from, limit: limit, sort: sort }
            });

            return p.then(this.getHandler.bind(this)).catch(this.remoteErrorHandler.bind(this));
        }

        save():IPromise {
            if(this.opts.validate && !this.validate()) return null;

            if(!this.remoteTaskManager) throw 'Cant perform method, remoteTaskManager is not set';

            if(this.state === ModelState.Syncing) {
                return Promise.reject(`Cant execute GET of model, cause it is has state ${this.state}`);
            }


            this.state = ModelState.Syncing;
            var p:IPromise,
                _id = this.data && (<T> this.data)._id;

            //console.log('Save ... ', this.changes, this.data);

            if(_id)
                p = this.remoteTaskManager.insert({
                    model: this.getRemoteModel(),
                    type: 'update',
                    data: { query: { _id: _id }, set: this.changes }
                });
            else
                p = this.remoteTaskManager.insert({
                    model: this.getRemoteModel(),
                    type: 'insert',
                    data: { data: _.extend(this.data, this.changes) }
                });

            return p.then(this.applyChanges.bind(this)).catch(this.remoteErrorHandler.bind(this));
        }

        delete():IPromise {
            if(this.state === ModelState.Syncing) {
                return Promise.reject(`Cant execute DELETE of model, cause it is has state ${this.state}`);
            }

            this.state = ModelState.Syncing;

            if(!this.remoteTaskManager) throw 'Cant perform method, remoteTaskManager is not set';

            var _id = this.data && (<T> this.data)._id,
                p:IPromise;

            if(!_id) throw `Cant delete ${this.name} cause _id isn't set `;

            p = this.remoteTaskManager.insert({
                model: this.getRemoteModel(),
                type: 'delete',
                data: { query: { _id: _id } }
            });

            return p.then(this.dispose.bind(this)).catch(this.remoteErrorHandler.bind(this));
        }


        public setRemoteModel(value:string) {
            this._remoteModel = value;
        }

        public getRemoteModel():string {
            return this._remoteModel;
        }

        protected getHandler(data:any):any {
            this.state = ModelState.Synced;
            this.data = data.length ?( (this instanceof ArrayModel) ? data : data[0] ) : data;
            return data;
        }

        protected remoteErrorHandler() {
            this.state = ModelState.Error;
        }

        dispatchEvent(e:IEvent):void {
            if (this.opts.event) super.dispatchEvent(e);
        }

        dispose(data:any = null):void {
            this.dispatchEvent({type: Event.Model.Disposed});
            this._changedData = null;
            this._data = null;
            super.dispose();
            return data;
        }

        toString():string {
            return 'model[' + this.name + '] data: ' + JSON.stringify(this.data);
        };

        get remoteTaskManager():RemoteTaskManager {
            return this.facade && this.facade.remoteTaskManager || window && window['remoteTaskManager'];
        }
    }

    export interface ILoggerConfig {
        filter?:string[];
        length?:number;
        console?:boolean;
    }


    export class Logger extends fmvc.Model<any> {
        private _config:any = {filter: [], length: 100000, console: true};
        private _modules:any = [];

        constructor(name:string, config?:ILoggerConfig) {
            super(name, []);
            if(config) this.config = config;
        }

        public set config(value:any) {
            _.extend(this._config, value);
        }

        public set console(value:boolean) {
            this._config.console = value;
        }

        public set filter(value:string[]) {
            this._config.filter = value;
        }

        public get modules():any {
            return this._modules;
        }

        public add(name:string, messages:any[] = null, level:number = 0):Logger {
            var data = {name: name, data: messages, level: level, date: new Date() };
            var dataArray:any[] = this.data;
            var config = this._config;
            dataArray.push(data);

            // add module
            if (this._modules.indexOf(name) === -1) this._modules.push(name);

            // exit if it has filters and has no the name in the array
            if (config.filter && config.filter.length && config.filter.indexOf(name) === -1) {
                return;
            }

            // console
            if (config && config.console && ('console' in window)) {
                console.log('[' + name + '] ' + level + ' ' , messages);
            }

            // clean: remove part of logs
            if (dataArray.length > config.length * 2) {
                dataArray.splice(0, dataArray.length - this._config.length);
            }

            // send event
            if(this.opts.event) this.dispatchEvent({type: 'log', data: data});
            return this;
        }
    }


    
}