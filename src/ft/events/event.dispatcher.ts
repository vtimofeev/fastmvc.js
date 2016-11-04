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
            this.keyboard = new ft.KeyboardModel();

            _.bindAll(this, 'browserHandler');
            var listenEvents:string[] = [].concat(_.values(ft.BrowserEvent), _.values(ft.PointerEvent), _.values(ft.KeyboardEvent),  _.values(ft.TouchEvent));
            _.each(listenEvents, this.on, this);
        }

        protected browserHandler(e:any):void {

            if(e.type === KeyboardEvent.KeyDown || e.type === KeyboardEvent.KeyUp) {
                this.keyboard.reset();
                this.keyboard.data = e;
                return;
            }

            //fix IOS bug `dublicated mouse events`
            if(this.pointer.onlyTouch && e.type.indexOf('mouse') > -1) {
                return;
            }

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
                var event:ITreeEvent = this.getTreeEventByBrowserEvent(pointerEvent.type || e.type, pathDefinition.data, pathDefinition.root, e, pointerEvent);
                this.viewHelper.dispatchTreeEventDown(event);

                if(sequenceEvent) {
                    var sequenceTreeEvent = this.getTreeEventByBrowserEvent(sequenceEvent.type, pathDefinition.data, pathDefinition.root, e, sequenceEvent);
                    this.viewHelper.dispatchTreeEventDown(sequenceTreeEvent);
                }
            }
        }

        private getTreeEventByBrowserEvent(type:string, def:IDomDef, view:TemplateView, e:any, pe:IPointerEvent):ITreeEvent {
            return {type: type, target:view, def: def, e: e, pe:pe, cancelled:false, prevented:false, depth: 1e2, executionHandlersCount: 0};
        }

        public getCustomTreeEvent(type:string, data:any, view:TemplateView, depth:number = 1):ITreeEvent {
            return {type: type, target:view, def: view.domDef, previousTarget: null, currentTarget:view, data:data, cancelled:false, prevented:false, depth: depth, executionHandlersCount: 0};
        }

        public getPointer():PointerModel {
            return this.pointer;
        }

        public getKeyboard():KeyboardModel {
            return this.keyboard;
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
            e.target = e.previousTarget = e.currentTarget = e.e = null;
        }
    }
}
