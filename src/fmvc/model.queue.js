///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    // It uses Zepto or JQuery deferred
    var ModelQueue = (function () {
        function ModelQueue(model) {
            this.model = model;
        }
        ModelQueue.prototype.load = function (object) {
            this.model.setState(fmvc.ModelState.Syncing);
            this.async($.ajax, [object], $, { done: fmvc.ModelState.Synced, fault: fmvc.ModelState.Error });
            return this;
        };
        ModelQueue.prototype.loadXml = function (object) {
            var defaultAjaxRequestObject = _.defaults(object, {
                method: 'GET',
                dataType: 'xml',
                data: { rnd: (Math.round(Math.random() * 1e9)) }
            });
            return this.load(defaultAjaxRequestObject);
        };
        ModelQueue.prototype.parse = function (method) {
            this.model.setState(fmvc.ModelState.Parsing);
            this.sync(method, [this.model], this, { done: fmvc.ModelState.Completed, fault: fmvc.ModelState.Error });
            return this;
        };
        ModelQueue.prototype.async = function (getPromiseMethod, args, context, states) {
            var deferred = $.Deferred();
            var queuePromise = this.setup();
            var t = this;
            queuePromise.then(function done(value) {
                (getPromiseMethod.apply(context, args)).then(function successPromise(result) {
                    console.log('Async success ', result);
                    deferred.resolve(result);
                }, function faultPromise(result) {
                    console.log('Async fault ', arguments);
                    deferred.reject(result);
                    t.executeError(result);
                });
            }, function fault() {
                deferred.reject();
                t.executeError();
            });
            this.currentPromise = deferred.promise();
            return this;
        };
        ModelQueue.prototype.sync = function (method, args, context, states) {
            var deferred = $.Deferred();
            var queuePromise = this.setup();
            var t = this;
            queuePromise.done(function doneQueue(value) {
                var methodArgs = [value].concat(args);
                var result = method.apply(context, methodArgs);
                console.log('Call sync method ', result, ' args ', methodArgs);
                if (result)
                    deferred.resolve(result);
                else {
                    deferred.reject();
                    t.executeError();
                }
            });
            this.currentPromise = deferred.promise();
            return this;
        };
        ModelQueue.prototype.complete = function (method, args, context, states) {
            this.sync(method, context, args, states);
        };
        ModelQueue.prototype.executeError = function (err) {
            console.log('Product error ', arguments);
            if (this.error) {
                this.error.method.apply(this.error.context, this.error.args);
            }
        };
        ModelQueue.prototype.fault = function (method, args, context, states) {
            this.error = { method: method, args: args, context: context, states: states };
            return this;
        };
        ModelQueue.prototype.setup = function () {
            var queueDeferred = $.Deferred();
            $.when(this.currentPromise).then(function doneQueue(value) {
                queueDeferred.resolve(value);
            }, function faultQueue() {
                queueDeferred.reject();
            });
            return queueDeferred.promise();
        };
        ModelQueue.prototype.dispose = function () {
            this.model = null;
            this.currentPromise = null;
            this.error = null;
        };
        return ModelQueue;
    })();
    fmvc.ModelQueue = ModelQueue;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=model.queue.js.map