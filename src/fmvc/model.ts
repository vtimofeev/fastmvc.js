///<reference path='./d.ts'/>
module fmvc {
    export interface IModelOptions {
        enabledState?:boolean;
        enabledEvents?:boolean;
        watchChanges?:boolean;
    }

    export var ModelState = {
        None: 'none',
        Parsing: 'parsing', // parsing from source
        Parsed: 'parsed', // parsed
        Loading: 'loading', // load from local/remote source
        Loaded: 'loaded', // load from local/remote source
        Updating: 'updating', // actualize changes @todo? можно исползовать syncing вместо loading/updating
        Syncing: 'syncing', // saving changes, updating actual data from remote ...
        Synced: 'synced', //
        Changed: 'changed', // changed in system
        Complete: 'complete',
        Error: 'error',
    };

    export class Model extends fmvc.Notifier {
        private _data:any;
        private _prevData:string;
        
        private _state:string = null;
        private _prevState:string;

        private _source:boolean = false;
        private _queue:ModelQueue = null;

        public enabledEvents:boolean = true;
        public enabledState:boolean = true;
        public watchChanges:boolean = true;

        constructor(name:string, data:any = {}, opts?:IModelOptions) {
            super(name);
            if (opts) _.extend(this, opts);
            if (data) this.data = data;
            if (data) this.setState(ModelState.Synced);
        }

        public setState(value:string):Model {
            if(!this.enabledState || this._state === value) return this;
            this._prevState = value;
            this._state = value;
            this.sendEvent(fmvc.Event.Model.StateChanged, this._state);
            return this;
        }

        public parseValue(value:any):any {
            var result = null;
            var prevData = this._data;
            var changes:{[id:string]:any} = null;
            var hasChanges:boolean = false;

            if (value instanceof Model) {
                throw Error('Cant set model data, data must be object, array or primitive');
            }

            if(_.isObject(prevData) && _.isObject(value) && this.watchChanges) {
                for (var i in value) {
                    if (prevData[i] !== value[i]) {
                        if (!changes) changes = {};
                        hasChanges = true;
                        changes[i] = value[i];
                        prevData[i] = value[i];
                    }
                }
                // if watch object property change
                if (hasChanges) this.sendEvent(fmvc.Event.Model.Changed, changes);
                result = prevData;
            }
            else {
                // primitive || array || object && !watchChanges , no data && any value (object etc)
                if (prevData !== value) {
                    result = (_.isObject(prevData) && _.isObject(value))?_.extend({}, prevData, value):value;
                }
            }
            return result;
        }

        public reset():Model {
            this._data = null;
            return this;
        }

        public set data(value:any) {
            this.setData(value);
        }

        public setData(value:any) {
            var previousData = this._data;
            var result = this.parseValue(value);

            // for primitive, arrays, objects with no changes
            // console.log('[' + this.name + ']: New prev, new data ' + this._data + ', ' + result);
            if(previousData !== result) {
                this._data = result;
                this.sendEvent(fmvc.Event.Model.Changed, this._data);
            }
        }

        public get data():any {
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

        public sendEvent(name:string, data:any = null, sub:string = null, error:any = null, log:boolean = true):void {
            if (this.enabledEvents) super.sendEvent(name, data, sub, error, log);
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
            if(create && this._queue) this._queue.dispose();
            return this._queue && !create?this._queue:(this._queue = new ModelQueue(this));
        }
    }

    export class TypeModel <T> extends Model {
        constructor(name:string, data:T, opts?:IModelOptions) {
            super(name, data, opts);
        }

        public get data():T {
            return <T> this.getData();
        }
    }

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
            if(!v) return this;
            if(!this._sources) this._sources = [];
            if(_.isArray(v)) {
                _.each(v, this.addSources, this);
            }
            else if(v instanceof Model) {
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
            if(this._sources && (index = this._sources.indexOf(v)) > -1) {
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
            this._resultMethods = _.flatten([].concat(this._resultMethods?this._resultMethods:[], values));
            this.throttleApplyChanges();
            return this;
        }

        applyChanges() {
            console.log('Apply changes ...' , this._sources, this._sourceMethod, this._resultMethods );
            if(!this._sources || !this._sources.length) this.setData(null);
            if(this._sourceMethod && this._sources.length === 1) throw new Error('SourceModel: source method not defined');

            var result = null;
            var sourcesResult = this._sourceMethod && this._sources.length > 1?(this._sourceMethod.apply(this, _.map(this._sources, (v:Model)=>v.data))):this._sources[0].data;
            console.log('SourceModel: Source Result is ', sourcesResult);
            if(sourcesResult) result = _.reduce(this._resultMethods, function(memo, method) { return method.call(this, memo); }, sourcesResult, this);
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
            this.model.setState(ModelState.Loading);
            this.async($.ajax, [object], $, { done: ModelState.Loaded, fault: ModelState.Error });
            return this;
        }

        loadXml(object:any):ModelQueue {
            var defaultAjaxRequestObject:any = _.defaults(object, {method: 'GET', dataType:'xml', data: { rnd: (Math.round(Math.random()*1000000)) }});
            return this.load(defaultAjaxRequestObject);
        }

        parse(method:any):ModelQueue {
            this.model.setState(ModelState.Parsing);
            this.sync(method, [this.model], this, { done: ModelState.Parsed, fault: ModelState.Error });
            return this;
        }

        async(getPromiseMethod:any, args:any[], context:any, states:any):ModelQueue {
            var deferred = $.Deferred();
            var queuePromise = this.setup();
            var t:ModelQueue = this;
            queuePromise.then(
                function done(value) {
                    (getPromiseMethod.apply(context, args)).then(
                        function successPromise(result) { console.log('Async success ', result); deferred.resolve(result);},
                        function faultPromise(result) { console.log('Async fault ', arguments);  deferred.reject(result); t.executeError(result); });
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

        complete(method:Function,  args?:any[], context?:any,  states?:any):void {
            this.sync(method, context, args, states);
        }

        executeError(err?:any):any {
            console.log('Product error ', arguments);
            if(this.error) {
                this.error.method.apply(this.error.context, this.error.args);
            }
        }

        fault(method:Function,  args?:any[], context?:any,  states?:any):ModelQueue {
            this.error = { method: method, args: args, context: context, states: states};
            return this;
        }

        setup() {
            var queueDeferred = $.Deferred();
            $.when(this.currentPromise).then(function doneQueue(value) {queueDeferred.resolve(value);}, function faultQueue() {queueDeferred.reject()});
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