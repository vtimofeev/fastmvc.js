module fmvc {

    export class View extends fmvc.Notifier implements IView {
        private static delegateEventSplitter = /^(\S+)\s*(.*)$/;
        private _mediator:fmvc.Mediator;

        public $base:any;
        public eventHandlers:any = {};
        public data:any;
        public items:any = [];

        constructor(name:string, $base:any) {
            super(name, fmvc.TYPE_VIEW);
            this.$base = $base;
        }

        public setData(data:any):void {
            this.data = data;
            this.render();
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
            var _t:View = this;

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

        public mediator(value:fmvc.Mediator) {
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
        public viewEventsHandler(name:string, e:any):void {
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
        init():void;
        render():void;

        setModel(value:fmvc.Model):void;
        getModel():fmvc.Model;

        setMediator(value:fmvc.Mediator):void;
        getMediator():fmvc.Mediator;

        destroy():void;
        eventHandler(name:string, e:any):void;
    }


}
