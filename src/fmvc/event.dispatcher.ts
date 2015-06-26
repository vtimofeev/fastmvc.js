/**
 * Created by Vasily on 19.06.2015.
 */


///<reference path='./d.ts'/>

module fmvc {

    export var BrowserEvent = {
        CLICK: 'click',
        KEYUP: 'keyup',
        KEYDOWN: 'keydown',

        MOUSEOVER: 'mouseover',
        MOUSEOUT: 'mouseout',
        CHANGE: 'change'
    };

    export var SpecialEvent = {
        ACTION: 'action',
        SWIPE: 'swipe',
        PAN: 'pan',
        PINCH: 'pinch',
        TAP: 'tap',
        DRAG: 'drag' // start,end,move
    };

    export var browserElementEvents:string[] = [BrowserEvent.MOUSEOUT, BrowserEvent.MOUSEOVER, BrowserEvent.CLICK];
    export var browserWindowEvents:string[] = [ BrowserEvent.KEYDOWN, BrowserEvent.KEYUP];
    export var specialEvents:string[] = [SpecialEvent.ACTION];


    export class EventDispatcher extends Notifier {
        public static NAME:string = 'EventDispatcher';
        //private elementIdMap = {};
        private executionMap = {};
        private windowHandlerMap = {};

        constructor() {
            super(EventDispatcher.NAME, 'controller');
            _.bindAll(this, 'browserHandler');
        }

        listen(el:Element, type:string, handler:Function, context?:any):EventDispatcher {
            var id = el.getAttribute('id');
            if(!id || !type || !handler) {
                console.warn('Incorrect listener on ' , el, id, type);
                return;
            }
            //if(!this.elementIdMap[id]) this.elementIdMap[id] = el;
            this.executionMap[id] = this.executionMap[id] || {};

            if(!this.executionMap[id][type]){
                this.executionMap[id][type] = {handler: handler, context: context};
                console.log(id, type, this.executionMap[id][type]);
                this.__createListener(el, id, type, handler, context);
            } else
            {
                console.warn('Cant listen cause exist ', id , type);
            }

            return this;
        }

        private __createListener(el:Element, id:string, type:string, handler:Function, context?:any):void {
            if(_.contains(browserWindowEvents, type))
                this.__createWindowListener(el, type);
            else if(_.contains(browserElementEvents, type))
                this.__createElementListener(el, type);
            else if(_.contains(specialEvents, type))
                this.__createSpecialListener(el, type);
            else
                console.warn('create listener for %s not found', type);
        }

        private __removeListener(el:Element, id:string, type:string) {
            var id = id || el.getAttribute('id');
            if(_.contains(browserElementEvents, type))  {
                el.removeEventListener(type, this.browserHandler)
            }
        }

        private __createElementListener(el:Element, type:string) {
            //console.log('Element listener of %s , %s' , el, type);
            el.addEventListener(type, this.browserHandler);
        }

        private __createWindowListener(el:Element, type:string) {
            //console.log('Browser listener of %s , %s' , el, type);
            if(!this.windowHandlerMap[type]) this.createWindowListener(type);
        }

        private __createSpecialListener(el, type) {
            console.warn('create special listener for %s not implemented', type);
        }

        unlistenAll(el) {
            var id = el.getAttribute('id');
            if(!id) return;

            _.each(this.executionMap[id], function(handlerObject, type:string) {
                el.removeEventListener(type, this.browserHandler);
                delete handlerObject.handler;
                delete handlerObject.context;
            }, this);

            delete this.executionMap[id];
            //delete this.elementIdMap[id];
        }

        unlisten(el:Element, type:string) {
            var id = el.getAttribute('id');
            if(!id) return;
            var handlerObject = this.executionMap[id][type];
            el.removeEventListener(type, this.browserHandler);
            delete handlerObject.handler;
            delete handlerObject.context;
            delete this.executionMap[id][type];
        }

        public browserHandler(e):void {
            var el:Element = e.currentTarget || e.target;
            var id:string = el.getAttribute('id');
            var type:string = e.type;

            if(!id) return;

            console.log(id, type, this.executionMap[id]);
            if(this.executionMap[id] && this.executionMap[id][type]) {
                var handlerObject:any = this.executionMap[id][type];
                handlerObject.handler.call(handlerObject.context,e);
            }
        }

        private createWindowListener(type:string) {
           this.windowHandlerMap[type] = true;
           window.addEventListener(type, this.browserHandler, true);
        }

    }
}
