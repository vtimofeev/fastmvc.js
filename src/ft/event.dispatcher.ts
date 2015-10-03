///<reference path='./d.ts'/>

module ft {
    export var BrowserEvent = {
        CLICK: 'click',
        KEYUP: 'keyup',
        KEYDOWN: 'keydown',
        MOUSEOVER: 'mouseover',
        MOUSEOUT: 'mouseout',
        MOUSEDOWN: 'mousedown',
        MOUSEUP: 'mouseup',
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


    export class EventDispatcher  {
        private eventMap:{[event:string]:boolean} = {};
        private idMap;

        constructor (idMap:any) {
            this.idMap = idMap;
            _.bindAll(this, 'browserHandler');
            _.each(_.values(BrowserEvent), this.on, this);
        }

        public browserHandler(e):void {
            //console.log('Browser ', e.type,  e.target);
            var el:HTMLElement = e.target || e.currentTarget;
            var id:string = el.getAttribute('id');

            var view:ITemplateView = this.idMap[id];
            if(view) view.handleTreeEvent(this.getTreeEventByBrowserEvent(e, view));
            else if(id) console.warn('View not found for id: ' , id);
        }

        private getTreeEventByBrowserEvent(e, view:ITemplateView):ITreeEvent {
            return {name: e.type, target:view, previousTarget: null, currentTarget:view, e: e, cancelled:false, prevented:false, depth: 1e2};
        }

        public getCustomTreeEvent(name:string, data:any, view:ITemplateView, depth:number = 1):ITreeEvent {
            return {name: e.type, target:view, previousTarget: null, currentTarget:view, data:data, cancelled:false, prevented:false, depth: depth};
        }

        public disposeEvent(e:ITreeEvent) {
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
