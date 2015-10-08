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
        private viewHelper:TemplateViewHelper;

        constructor(viewHelper:TemplateViewHelper) {
            this.viewHelper = viewHelper;
            _.bindAll(this, 'browserHandler');
            _.each(_.values(BrowserEvent), this.on, this);
        }

        public browserHandler(e:any):void {
            var el:HTMLElement = e.target || e.currentTarget;

            var pathId:string = el.getAttribute(AttributePathId);
            var pathDefinition = this.viewHelper.getPathDefinitionByPathId(pathId);
            //console.log('Trigger ', e.type, pathId, pathDefinition);


            if (pathDefinition){
                var event:ITreeEvent = this.getTreeEventByEvent(e.type, pathDefinition.data, pathDefinition.root, e);
                this.viewHelper.dispatchTreeEventDown(event);
            }
            /*
            if(view) view.handleTreeEvent(this.getTreeEventByBrowserEvent(e, view));
            else if(pathId) console.warn('View not found for id: ' , pathId);
            */
        }


        /**
         * @param name
         * @param def
         * @param view
         * @param e
         * @returns {{name: string, target: ITemplateView, def: IDomDef, previousTarget: null, currentTarget: ITemplateView, e: any, cancelled: boolean, prevented: boolean, depth: number}}
         */
        private getTreeEventByEvent(name:string, def:IDomDef, view:ITemplateView, e:any):ITreeEvent {
            return {name: name, target:view, def: def, e: e, cancelled:false, prevented:false, depth: 1e2};
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
