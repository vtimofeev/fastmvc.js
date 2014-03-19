declare var $:any;
declare var _:any;

module fastmvc {

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

        public delegateEventHandlers(init:boolean) {
            var _t = this;

            this.log('Events: ' + (JSON.stringify(this.eventHandlers)));

            for (var commonHandlerData:string in this.eventHandlers) {
                var eventName:string = this.eventHandlers[commonHandlerData];
                var match:any = commonHandlerData.match(View.delegateEventSplitter);
                var handledEvents:string = match[1];
                var selector:string = match[2];

                // add handlers
                if (init) {
                    this.log('Add listeners [' + handledEvents + '] of the [' + selector + ']');
                    var eventClosure = function(name){ return function(e) { _t.eventHandler(name, e); }; }(eventName);
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
            this._mediator.facade().saveLog(this.name(), message, level);
        }

        public mediator(value:fastmvc.Mediator) {
            this._mediator = value;
        }

        public sendEvent(name:string, data:any = null, global:bool = false) {
            if (this._mediator) this._mediator.internalHandler({name: name, data: data, global: global, target: this});
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
    }

    export interface IView {
        render():void;
        eventHandler(name:string, e:any):void;
    }

}
