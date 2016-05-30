///<reference path='./../d.ts'/>

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


    export class EventDispatcher  {
        private eventMap:{[event:string]:boolean} = {};
        private viewHelper:TemplateViewHelper;
        private pointer:ft.PointerModel;
        private keyboard:ft.KeyboardModel;

        constructor(viewHelper:TemplateViewHelper) {
            this.viewHelper = viewHelper;
            this.pointer = new ft.PointerModel(null, null);

            _.bindAll(this, 'browserHandler');
            var listenEvents:string[] = [].concat(_.values(ft.BrowserEvent), _.values(ft.PointerEvent), _.values(ft.KeyboardEvent),  _.values(ft.TouchEvent));
            _.each(listenEvents, this.on, this);
        }

        protected browserHandler(e:any):void {
            var target:HTMLElement = e.target || e.currentTarget;

            var pathId:string = target.getAttribute?target.getAttribute(AttributePathId):null;
            var pathDefinition = this.viewHelper.getPathDefinitionByPathId(pathId);

            var pointerEvent:IPointerEvent = this.pointer.tryTransformToCompositeEvent(e);
            if(pointerEvent.isComposite) { // set global pointer data
                this.pointer.setData(pointerEvent);
                //e.preventDefault();
            }

            if (pathDefinition){
                var sequenceEvent:IPointerEvent = this.pointer.addSequenceEvent(pointerEvent, target);
                var event:ITreeEvent = this.getTreeEventByBrowserEvent(pointerEvent.name || e.type, pathDefinition.data, pathDefinition.root, e, pointerEvent);
                this.viewHelper.dispatchTreeEventDown(event);

                if(sequenceEvent) {
                    var sequenceTreeEvent = this.getTreeEventByBrowserEvent(sequenceEvent.name, pathDefinition.data, pathDefinition.root, e, sequenceEvent);
                    this.viewHelper.dispatchTreeEventDown(sequenceTreeEvent);
                }
            }
        }

        private getTreeEventByBrowserEvent(name:string, def:IDomDef, view:TemplateView, e:any, pe:IPointerEvent):ITreeEvent {
            return {name: name, target:view, def: def, e: e, pe:pe, cancelled:false, prevented:false, depth: 1e2, executionHandlersCount: 0};
        }

        public getCustomTreeEvent(name:string, data:any, view:TemplateView, depth:number = 1):ITreeEvent {
            return {name: name, target:view, def: view.domDef, previousTarget: null, currentTarget:view, data:data, cancelled:false, prevented:false, depth: depth, executionHandlersCount: 0};
        }

        public getPointer():PointerModel {
            return this.pointer;
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

        public disposeEvent(e:ITreeEvent):void {
            return; e.target = e.previousTarget = e.currentTarget = e.e = null;
        }
    }
}
