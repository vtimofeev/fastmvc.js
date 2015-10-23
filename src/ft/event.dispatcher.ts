///<reference path='./d.ts'/>
declare var EventEmitter:any;

module ft {
    export var BrowserEvent = {
        CLICK: 'click',
        KEYUP: 'keyup',
        KEYDOWN: 'keydown',
        MOUSEOVER: 'mouseover',
        MOUSEOUT: 'mouseout',
        MOUSEDOWN: 'mousedown',
        MOUSEUP: 'mouseup',
        CHANGE: 'change',
        MOUSEMOVE: 'mousemove'
    };

    export var SpecialEvent = {
        ACTION: 'action',
        SWIPE: 'swipe',
        PAN: 'pan',
        PINCH: 'pinch',
        TAP: 'tap',
        DRAG: 'drag' // start,end,move
    };

    export interface IEventEmitter3 {
        on(event, handler, context):void;
        once(event, handler, context):void;
        off(event, handler, context):void;
        emit(event, ...args:any[]):any;
    }

    export var browserElementEvents:string[] = [BrowserEvent.MOUSEOUT, BrowserEvent.MOUSEOVER, BrowserEvent.CLICK];
    export var browserWindowEvents:string[] = [ BrowserEvent.KEYDOWN, BrowserEvent.KEYUP,  BrowserEvent.MOUSEMOVE];
    export var specialEvents:string[] = [SpecialEvent.ACTION];


    export class EventDispatcher  {
        private eventMap:{[event:string]:boolean} = {};
        private viewHelper:TemplateViewHelper;
        public global:IEventEmitter3 = new EventEmitter();

        constructor(viewHelper:TemplateViewHelper) {
            this.viewHelper = viewHelper;
            _.bindAll(this, 'browserHandler');
            _.each(_.values(BrowserEvent), this.on, this);
        }

        public browserHandler(e:any):void {
            this.global.emit(e.type, e);
            var el:HTMLElement = e.target || e.currentTarget;


            var pathId:string = el.getAttribute(AttributePathId);
            var pathDefinition = this.viewHelper.getPathDefinitionByPathId(pathId);
            //console.log('Trigger ', e.type, pathId, pathDefinition);

            if (pathDefinition){
                var event:ITreeEvent = this.getTreeEventByBrowserEvent(e.type, pathDefinition.data, pathDefinition.root, e);
                this.viewHelper.dispatchTreeEventDown(event);
            }
        }




        private getTreeEventByBrowserEvent(name:string, def:IDomDef, view:ITemplateView, e:any):ITreeEvent {
            return {name: name, target:view, def: def, e: e, cancelled:false, prevented:false, depth: 1e2, executionHandlersCount: 0};
        }

        public getCustomTreeEvent(name:string, data:any, view:ITemplateView, depth:number = 1):ITreeEvent {
            return {name: name, target:view, previousTarget: null, currentTarget:view, data:data, cancelled:false, prevented:false, depth: depth, executionHandlersCount: 0};
        }

        public disposeEvent(e:ITreeEvent):void {
            return; e.target = e.previousTarget = e.currentTarget = e.e = null;
        }



        public on(type:string):void {
            if(this.eventMap[type]) return;
            window.addEventListener(type, this.browserHandler, true);
            this.eventMap[type] = true;

        }

        public off(type:string):void {
            this.eventMap[type] = false;
            window.removeEventListener(type, this.browserHandler);
        }
    }
}
