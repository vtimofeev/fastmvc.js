///<reference path='./d.ts'/>

module fmvc {

    // It uses Zepto or JQuery deferred
    export class ModelQueue<T> {
        private model:fmvc.Model<T>;
        private currentPromise:any;
        private error:any;


        constructor(model:fmvc.Model<T>) {
            this.model = model;
        }

        load(object:any) {
            this.model.setState(ModelState.Syncing);
            this.async($.ajax, [object], $, {done: ModelState.Synced, fault: ModelState.Error});
            return this;
        }

        get promise():any {
            return this.currentPromise;
        }

        loadXml(object:any):ModelQueue<T> {
            var defaultAjaxRequestObject:any = _.defaults(object, {
                method: 'GET',
                dataType: 'xml',
                data: {rnd: (Math.round(Math.random() * 1e9))}
            });
            return this.load(defaultAjaxRequestObject);
        }

        parse(method:any):ModelQueue<T> {
            this.model.setState(ModelState.Parsing);
            this.sync(method, [this.model], this, {done: ModelState.Parsed, fault: ModelState.Error});
            return this;
        }

        async(getPromiseMethod:any, args:any[], context:any, states?:any):ModelQueue<T> {
            var deferred = $.Deferred();
            var queuePromise = this.setup();
            var t:ModelQueue<T> = this;
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

        sync(method:Function, args?:any[], context?:any, states?:any):ModelQueue<T> {
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

        fault(method:Function, args?:any[], context?:any, states?:any):ModelQueue<T> {
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
}