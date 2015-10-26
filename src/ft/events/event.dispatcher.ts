///<reference path='./../d.ts'/>
declare var EventEmitter:any;

module ft {
    export var BrowserEvent = {
        Change: 'change',
        Scroll: 'scroll',

        Focus: 'focus',
        Blur: 'blur'
    };

    export var KeyboardEvent = {
        KeyUp: 'keyup',
        KeyDown: 'keydown',
    };

    export var PointerEvent = {
        Click: 'click',
        MouseOver: 'mouseover',
        MouseOut: 'mouseout',
        MouseDown: 'mousedown',
        MouseUp: 'mouseup',
        MouseMove: 'mousemove'
    };

    export var TouchEvent = {
        TouchStart: 'touchstart',
        TouchEnd: 'touchend',
        TouchMove: 'touchmove',
        TouchCancel: 'touchcancel'
    };

    export var ResutEvent = {
        Act: 'act', // click - tap
        DoubleAct: 'doubleact',
        LongAct: 'longact',

        PointerOver: 'pointerover',
        PointerMove: 'pointermove',
        PointerOut: 'pointerout',
        PointerDown: 'pointerdown',
        PointerUp: 'pointerup',

        Swipe: 'swipe',
        Pan: 'pan',
        Pinch: 'pinch',
    };

    export interface IEventEmitter3 {
        on(event, handler, context):void;
        once(event, handler, context):void;
        off(event, handler, context):void;
        emit(event, ...args:any[]):any;
    }

    export var browserElementEvents:string[] = [BrowserEvent.MOUSEOUT, BrowserEvent.MOUSEOVER, BrowserEvent.CLICK];
    export var browserWindowEvents:string[] = [ BrowserEvent.KEYDOWN, BrowserEvent.KEYUP,  BrowserEvent.MOUSEMOVE, BrowserEvent.SCROLL];
    export var specialEvents:string[] = [SpecialEvent.ACTION];


    export class EventDispatcher  {
        private eventMap:{[event:string]:boolean} = {};
        private viewHelper:TemplateViewHelper;
        //public global:IEventEmitter3 = <IEventEmitter3> new EventEmitter();
        private pointer:ft.PointerModel;
        private keyboard:ft.KeyboardModel;

        constructor(viewHelper:TemplateViewHelper) {
            this.viewHelper = viewHelper;
            _.bindAll(this, 'browserHandler');
            _.each(_.values(BrowserEvent,PointerEvent), this.on, this);
        }

        protected browserHandler(e:any):void {
            //this.global.emit(e.type, e);
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
            return {name: name, target:view, def: view.domDef, previousTarget: null, currentTarget:view, data:data, cancelled:false, prevented:false, depth: depth, executionHandlersCount: 0};
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
