///<reference path='./d.ts'/>
module fmvc {
    export interface IModelOptions {
        enabledState?:boolean;
        enabledEvents?:boolean;
        watchChanges?:boolean;
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
            return (this.getData());
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

        public sendEvent(name:string, data:any = null, changes:any = null, sub:string = null, error:any = null):void {
            if (this.enabledEvents) super.sendEvent(name, data, changes, sub, error);
        }

        public dispose() {
            super.dispose();
            // remove queue
        }

        //-----------------------------------------------------------------------------
        // Source model
        //-----------------------------------------------------------------------------

        //-----------------------------------------------------------------------------
        // Queue
        //-----------------------------------------------------------------------------
        public queue(create:boolean = false):ModelQueue {
            if (create && this._queue) this._queue.dispose();
            return this._queue && !create ? this._queue : (this._queue = new ModelQueue(this));
        }
    }

    /*
     export class TypeModel <T> extends Model {
     constructor(name:string, data:T, opts?:IModelOptions) {
     super(name, data, opts);
     }

     public get data():T {
     return <T>this.getData();
     }
     }
     */

    export class SourceModel extends Model {
        private _sources:Model[];
        private _sourceMethod:any;
        private _resultMethods:any[];
        private throttleApplyChanges:Function;

        constructor(name:string, source:Model|Model[], opts?:IModelOptions) {
            super(name, null, opts);
            this.throttleApplyChanges = _.throttle(_.bind(this.applyChanges, this), 100);
            this.addSources(source);
        }

        addSources(v:Model|Model[]):SourceModel {
            if (!v) return this;
            if (!this._sources) this._sources = [];
            if (_.isArray(v)) {
                _.each(v, this.addSources, this);
            }
            else if (v instanceof Model) {
                var m = <Model> v;
                m.bind(this, this.sourceChangeHandler);
                this._sources.push(m);
            } else {
                console.warn('Cant add source ', v);
            }
            return this;
        }

        removeSource(v:Model):SourceModel {
            var index:number = -1;
            if (this._sources && (index = this._sources.indexOf(v)) > -1) {
                this._sources.splice(index, 1);
                v.unbind(v);
            }
            return this;
        }

        sourceChangeHandler(e:IEvent):void {
            this.throttleApplyChanges();
        }

        setSourceMethod(value:any):SourceModel {
            this._sourceMethod = value;
            this.throttleApplyChanges();
            return this;
        }

        setResultMethods(...values:any[]):SourceModel {
            this._resultMethods = _.flatten([].concat(this._resultMethods ? this._resultMethods : [], values));
            this.throttleApplyChanges();
            return this;
        }

        applyChanges() {
            console.log('Apply changes ...', this._sources, this._sourceMethod, this._resultMethods);
            if (!this._sources || !this._sources.length) this.setData(null);
            if (this._sourceMethod && this._sources.length === 1) throw new Error('SourceModel: source method not defined');

            var result = null;
            var sourcesResult = this._sourceMethod && this._sources.length > 1 ? (this._sourceMethod.apply(this, _.map(this._sources, (v:Model)=>v.data))) : this._sources[0].data;
            console.log('SourceModel: Source Result is ', sourcesResult);
            if (sourcesResult) result = _.reduce(this._resultMethods, function (memo, method) {
                return method.call(this, memo);
            }, sourcesResult, this);
            console.log('SourceModel: Result is ', JSON.stringify(result));
            this.reset().setData(result);
        }
    }


    // Uses jQuery Deferred model
    export class ModelQueue {
        private model:fmvc.Model;
        private currentPromise:any;
        private error:any;


        constructor(model:fmvc.Model) {
            this.model = model;
        }

        load(object:any) {
            this.model.setState(ModelState.Syncing);
            this.async($.ajax, [object], $, {done: ModelState.Synced, fault: ModelState.Error});
            return this;
        }

        loadXml(object:any):ModelQueue {
            var defaultAjaxRequestObject:any = _.defaults(object, {
                method: 'GET',
                dataType: 'xml',
                data: {rnd: (Math.round(Math.random() * 1000000))}
            });
            return this.load(defaultAjaxRequestObject);
        }

        parse(method:any):ModelQueue {
            this.model.setState(ModelState.Parsing);
            this.sync(method, [this.model], this, {done: ModelState.Completed, fault: ModelState.Error});
            return this;
        }

        async(getPromiseMethod:any, args:any[], context:any, states:any):ModelQueue {
            var deferred = $.Deferred();
            var queuePromise = this.setup();
            var t:ModelQueue = this;
            queuePromise.then(
                function done(value) {
                    (getPromiseMethod.apply(context, args)).then(
                        function successPromise(result) {
                            console.log('Async success ', result);
                            deferred.resolve(result);
                        },
                        function faultPromise(result) {
                            console.log('Async fault ', arguments);
                            deferred.reject(result);
                            t.executeError(result);
                        });
                },
                function fault() {
                    deferred.reject();
                    t.executeError()
                }
            );
            this.currentPromise = deferred.promise();
            return this;
        }

        sync(method:Function, args?:any[], context?:any, states?:any):ModelQueue {
            var deferred = $.Deferred();
            var queuePromise = this.setup();
            var t = this;
            queuePromise.done(
                function doneQueue(value) {
                    var methodArgs = [value].concat(args);
                    var result = method.apply(context, methodArgs);
                    console.log('Call sync method ', result, ' args ', methodArgs)
                    if (result) deferred.resolve(result);
                    else {
                        deferred.reject();
                        t.executeError();
                    }
                });
            this.currentPromise = deferred.promise();
            return this;
        }

        complete(method:Function, args?:any[], context?:any, states?:any):void {
            this.sync(method, context, args, states);
        }

        executeError(err?:any):any {
            console.log('Product error ', arguments);
            if (this.error) {
                this.error.method.apply(this.error.context, this.error.args);
            }
        }

        fault(method:Function, args?:any[], context?:any, states?:any):ModelQueue {
            this.error = {method: method, args: args, context: context, states: states};
            return this;
        }

        setup() {
            var queueDeferred = $.Deferred();
            $.when(this.currentPromise).then(function doneQueue(value) {
                queueDeferred.resolve(value);
            }, function faultQueue() {
                queueDeferred.reject()
            });
            return queueDeferred.promise();
        }

        dispose() {
            this.model = null;
            this.currentPromise = null;
            this.error = null;
        }
    }

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
}