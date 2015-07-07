///<reference path='./d.ts'/>
module fmvc {
    export interface IModelOptions {
        enabledState?:boolean;
        enabledEvents?:boolean;
        watchChanges?:boolean;
    }

    export var ModelState = {
        None: 'none',
        Loading: 'loading', // load from local/remote source
        Updating: 'updating', // actualize changes @todo? можно исползовать syncing вместо loading/updating
        Syncing: 'syncing', // saving changes, updating actual data from remote ...
        Synced: 'synced', //
        Changed: 'changed', // changed in system
        Error: 'error',
    };

    /*
        Загрузка данных
        var configModel = new Model('config', { default data } , { enabedState: true , state: 'synced' } );
        var loaderProxy = new LoaderProxy(configModel, configUrl);
        loaderProxy.load().then(function(data) {
         var parserProxy = new ParserProxy(data, parserFunction, configModel);
         parserProxy.parser().then(function() { });

         configModel(
            defaultConfig,
            { url : { load: [template], update: [template], remove: [template] },
              loadProxy: {} // universary queue manager,
              parserProxy: {} // parserFunction(data=>result),
              validateProxy: {} // validatorFunction
              onError
            }) // option init
            .load(callback?):Promise // load in model context
            .sync(callback?). // if changed -> save , if synced -> update
            .parse(callback?);
        });

     */

    export class Model extends fmvc.Notifier {
        private _data:any;
        private _previousState:string;
        private _previousData:string;
        private _state:string;

        public enabledEvents:boolean = true;
        public enabledState:boolean = false;
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
                    this._data = _.isObject(value)?_.extend(this._data, value) : value;
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