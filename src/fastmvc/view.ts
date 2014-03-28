///<reference path='notifier.ts'/>
///<reference path='facade.ts'/>
///<reference path='mediator.ts'/>
///<reference path='model.ts'/>

declare var $:any;
declare var _:any;
declare var bt:any;

module fastmvc {

    export class BTView extends fastmvc.Notifier implements IView {
        private _mediator:any;
        public base:HTMLElement;
        public data:any;

        template:any;
        bi:any;

        constructor(name:string, base:any, template?:any) {
            super(name, fastmvc.TYPE_VIEW);
            this.base = base;
            if (template) this.template = template;
            else this.template = bt.template('id:template-' + name);
        }

        public init(items?:any):void {
            this.createInstance();

            // check, create links
            if (items && this.bi) {
                for (var i in items) {
                    this[items[i]] = this.bi[items[i]];
                }
            }

            // set initial data
            if (this.data) {
                this.bindData(true);
                this.render();
            }
        }

        createInstance():void {
            this.log('Create template ' + this.template + ', ' + this.base);
            if (this.template) {
                this.bi = this.template.createInstance(null, this.eventHandler);
                if (this.base) this.base.appendChild(this.bi.element);
            }
        }

        public setData(data:any):void {
            this.data = data;
            this.render();
            this.log('Set data');
        }

        public bindData(value:boolean):void {
            var data:fastmvc.Model = this.data;
            if (data && ('addListener' in data) && value) {
                data.addListener(this, this.dataHandler);
            }

            this.log('Bind data ' + value);
        }

        public dataHandler(event:string, data:any) {
            this.render();
        }

        public log(message:string, level?:number):void {
            this._mediator.facade().saveLog(this.name(), message, level);
        }

        public mediator(value:fastmvc.Mediator) {
            this._mediator = value;
        }

        public sendEvent(name:string, data:any = null, sub:string = null, error:any = null, global:boolean = false):void {
            if (this._mediator) this._mediator.internalHandler({name: name, data: data, global: global, target: this});
        }

        public getProcessedData() {
            return this.data;
        }

        // Overrided method
        // Render
        public render():void {
            var data = this.data;
            if (this.bi) {
                var objectData = data ? ('getData' in data) ? data.getData() : data : null;
                for (var i in objectData) {
                    this.log('Render set' + i + ', ' + objectData[i])
                    this.bi.set(i, objectData[i]);
                }
            }
            this.log('Render ' + this.bi);
        }

        // Overrided method
        // Handler
        public eventHandler(name:string, e:any):void {
            this.log('event ' + name);
            this.sendEvent(name, e);
        }

        public destroy() {
            if (this.bi) this.bi.destroy();
        }
    }


    export class View extends fastmvc.Notifier implements IView {
        private static delegateEventSplitter = /^(\S+)\s*(.*)$/;
        private _mediator:any;
        public $base:any;
        public eventHandlers:any = {};
        public data:any;

        constructor(name:string, $base:any) {
            super(name, fastmvc.TYPE_VIEW);
            this.$base = $base;
        }

        public setData(data:any):void {
            for (var i in data)
                this.data = data;
        }

        public getData():any {
            return this.data;
        }

        // Overrided method
        // Init
        public init(items?:any):void {
            this.delegateEventHandlers(true);
        }

        delegateEventHandlers(init:boolean) {
            var _t = this;

            this.log('Events: ' + (JSON.stringify(this.eventHandlers)));

            for (var commonHandlerData in this.eventHandlers) {
                var eventName:string = this.eventHandlers[commonHandlerData];
                var match:any = commonHandlerData.match(View.delegateEventSplitter);
                var handledEvents:string = match[1];
                var selector:string = match[2];

                // add handlers
                if (init) {
                    this.log('Add listeners [' + handledEvents + '] of the [' + selector + ']');
                    var eventClosure = function (name) {
                        return function (e) {
                            _t.eventHandler(name, e);
                        };
                    }(eventName);
                    if (selector === '') {
                        this.$base.on(handledEvents, eventClosure);
                    } else {
                        this.$base.on(handledEvents, selector, eventClosure);
                    }
                }
                // remove handlers
                else {
                    if (selector === '') {
                        this.$base.off(handledEvents);
                    } else {
                        this.$base(selector).on(handledEvents, selector);
                    }
                }
            }
        }

        public log(message:string, level?:number):void {
            if (this._mediator) this._mediator.facade().saveLog(this.name(), message, level);
        }


        public sendEvent(name:string, data:any = null, sub:string = null, error:any = null, global:boolean = false):void {
            if (this._mediator) this._mediator.internalHandler({name: name, data: data, global: global, target: this});
        }

        public mediator(value:fastmvc.Mediator) {
            this._mediator = value;
        }

        public getProcessedData() {
            return this.data;
        }

        // Overrided method
        // Render
        public render():void {
        }

        // Overrided method
        // Handler
        public eventHandler(name:string, e:any):void {
            this.log('event ' + name);
            this.sendEvent(name, e);
        }

        // Overrided method
        // Destroy
        public destroy():void {
            this.delegateEventHandlers(false);
        }
    }

    export interface IView {
        render():void;
        init(items?:any):void;
        setData(value:any):void;
        destroy():void;
        mediator(value:fastmvc.Mediator):void;
        eventHandler(name:string, e:any):void;
    }

}
