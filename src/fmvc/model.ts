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
        Error: 'error',
    };

    export class Model extends fmvc.Notifier {
        private _data:any;
        private _previousState:string;
        private _previousData:string;
        private _state:string;

        public enabledEvents:boolean = true;
        public enabledState:boolean = true;
        public watchChanges:boolean = true;

        constructor(name:string, data:any = {}, opts?:IModelOptions) {
            super(name);
            if (opts) _.extend(this, opts);
            if (data) this.data = data;
            this.sendEvent(fmvc.Event.MODEL_CREATED, this.data);
        }

        public setState(value:string):Model {
            if(!this.enabledState || this._state === value) return this;
            this._previousState = value;
            this._state = value;
            this.sendEvent(fmvc.Event.MODEL_CHANGED, this._state);
            return this;
        }

        public set(value:any, direct:boolean = false, reset:boolean = false):Model {
            if(reset) this._data = null;
            if (direct) this._data = value;
            else this.data = value;
            return this;
        }

        public set data(value:any) {
            var data = this._data;
            var changes:{[id:string]:any} = null;
            var hasChanges:boolean = false;

            if (value instanceof Model) throw Error('Cant set model data, data must be object, array or primitive');
            //@todo check type of data and value

            if(_.isObject(data) && _.isObject(value) && this.watchChanges) {
                for (var i in value) {
                    if (data[i] !== value[i]) {
                        if (!changes) changes = {};
                        hasChanges = true;
                        changes[i] = value[i];
                        data[i] = value[i];
                    }
                }
            }
            else {
                // primitive || array || no data && any value (object etc)
                if (data !== value) {
                    hasChanges = true;
                    var resultData = (_.isObject(this._data) && _.isObject(value))?_.extend(this._data, value): value;
                    this._data = resultData;
                }
            }

            if (hasChanges) this.sendEvent(fmvc.Event.MODEL_CHANGED, changes || this._data);
        }

        public get data():any {
            return this._data;
        }


        public get state():string {
            return this._state;
        }

        public sendEvent(name:string, data:any = null, sub:string = null, error:any = null, log:boolean = true):void {
            if (this.enabledEvents) super.sendEvent(name, data, sub, error, log);
        }

        public destroy() {
        }

        //-----------------------------------------------------------------------------
        // Queue
        //-----------------------------------------------------------------------------

        public get queue():ModelQueue {
            return new ModelQueue(this);
        }


        //-----------------------------------------------------------------------------
        // VALIDATOR PATH
        //-----------------------------------------------------------------------------

        private _validators:Array<Validator>;

        public addValidator(value:Validator):void {
            this._validators = this._validators ? this._validators : [];
            if (this._validators.indexOf(value) >= 0) throw 'Cant add validator to model';
            this._validators.push(value);
        }

        public removeValidator(value:Validator):void {
            var index = this._validators ? this._validators.indexOf(value) : -1;
            if (index >= 0) this._validators.splice(index, 1);
        }

        public validate(value:any):boolean {
            var result = false;
            var error = {};

            for (var i in this._validators) {
                var validator:Validator = this._validators[i];
                value = validator.execute(value)
                if (!value) {
                    result = false;
                    break;
                }
            }
            this.sendEvent(fmvc.Event.MODEL_VALIDATED, result, null, error);
            return result;
        }
    }

    export class ModelQueue {
        private model:fmvc.Model;
        private currentPromise:any;

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
            queuePromise.then(
                function done(value) {
                    console.log('Call async method args ', args);
                    (getPromiseMethod.apply(context, args)).then(function successPromise(result) { console.log('Async success ', result); deferred.resolve(result);}, function faultPromise(result) { console.log('Async fault ', arguments);  deferred.reject(result);});
                },
                function fault() {
                    deferred.reject();
                }
            );
            this.currentPromise = deferred.promise();
            return this;
        }

        sync(method:Function, args?:any[], context?:any, states?:any):ModelQueue {
            var deferred = $.Deferred();
            var queuePromise = this.setup();
            queuePromise.done(
                function doneQueue(value) {
                    var methodArgs = [value].concat(args);

                    var result = method.apply(context, methodArgs);
                    console.log('Call sync method ', result, ' args ', methodArgs)
                    if (result) deferred.resolve(result);
                    else deferred.reject();
                });
            this.currentPromise = deferred.promise();
            return this;
        }

        complete(method:Function,  args?:any[], context?:any,  states?:any):void {
            this.sync(method, context, args, states);
        }

        setup() {
            var queueDeferred = $.Deferred();
            $.when(this.currentPromise).then(function doneQueue(value) {queueDeferred.resolve(value);}, function faultQueue() {queueDeferred.reject()});
            return queueDeferred.promise();
        }

        /*
        var Queue = function() {
        var lastPromise = null;

        this.add = function(obj, method, args, context) {
            var methodDeferred = $.Deferred();
            var queueDeferred = this.setup();
            if(context === undefined) { context = obj; }

            // execute next queue method
            queueDeferred.done(function() {


                // call actual method and wrap output in deferred
                setTimeout(function() {
                    obj[method].apply(context, args);
                    methodDeferred.resolve();
                }, 100);


            });
            lastPromise = methodDeferred.promise();
        };

        this.setup = function() {
            var queueDeferred = $.Deferred();

            // when the previous method returns, resolve this one
            $.when(lastPromise).always(function() {
                queueDeferred.resolve();
            });

            return queueDeferred.promise();
        }
        */

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