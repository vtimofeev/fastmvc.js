///<reference path='./d.ts'/>
module fmvc {
    export class View extends fmvc.Notifier implements IView
    {
        private static delegateEventSplitter = /^(\S+)\s*(.*)$/;
        private _mediator:fmvc.Mediator;


        private $root:any;
        private $rootChildren:any;

        private _model:fmvc.Model;
        private eventHandlers:any = {};
        private _states:string[];
        private children:fmvc.View[];

        constructor(name:string, $root:any) {
            super(name, fmvc.TYPE_VIEW);
            this.$root = $root;
        }

        // Overrided method
        // Init
        public init(items?:any):void {
            this.delegateEventHandlers(true);
        }

        private delegateEventHandlers(init:boolean):void {
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
                        this.$root.on(handledEvents, eventClosure);
                    } else {
                        this.$root.on(handledEvents, selector, eventClosure);
                    }
                }
                // remove handlers
                else {
                    if (selector === '') {
                        this.$root.off(handledEvents);
                    } else {
                        this.$root(selector).on(handledEvents, selector);
                    }
                }
            }
        }

        public log(message:string, level?:number):void {


            if (this._mediator) this._mediator.facade.sendLog(this.name, message, level);
        }

        public sendEvent(name:string, data:any = null, sub:string = null, error:any = null, global:boolean = false):void {
            if (this._mediator) this._mediator.internalHandler({name: name, data: data, global: global, target: this});
        }

        public set mediator(value:fmvc.Mediator) {
            this._mediator = value;
        }

        public get mediator():fmvc.Mediator {
            return this._mediator;
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


        public eventHandler(name:string, e:any):void {
            this.viewEventsHandler(name, e);
        }

        public add(value:fmvc.View):void {
        }

        public remove(value:fmvc.View):void {
        }

        public removeAt(value:fmvc.View):void {
        }

        /////////////////////////////////////////////////////////////////////////////
        // Model related methods
        /////////////////////////////////////////////////////////////////////////////
        set model(data:fmvc.Model) {
            this._model = data;
            this.render();
        }

        get model():fmvc.Model {
            return this._model;
        }

        setModel(value:fmvc.Model, events:boolean = false) {
            this.model = value;
            if (events) this.model.addListener(this, this.modelHandler);
        }

        public modelHandler(name, e):void {
        }

        // Overrided method
        // Destroy
        public destroy():void {
            if(this.model) this.model.removeListener(this);
            this.delegateEventHandlers(false);
        }
    }

    export interface IView {
        init():void;
        render():void;

        model:fmvc.Model; // get, set
        mediator:fmvc.Mediator; // get, set

        destroy():void;
        eventHandler(name:string, e:any):void;
    }


}
