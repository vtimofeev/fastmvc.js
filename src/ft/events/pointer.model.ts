///<reference path='./../d.ts'/>

namespace ft {
    export interface IPointerEvent {
        type:string;
        sequence?:number;
        clientX:number;
        clientY:number;
        time?:number;
        isComposite?:boolean;

        /*@todo: Удалить?
        alt:boolean;
        shift:boolean;
        control:boolean;
        */
    }

    export var PointerEvent = {
        MouseOver: 'mouseover',
        MouseOut: 'mouseout',
        MouseDown: 'mousedown',
        MouseUp: 'mouseup',
        MouseMove: 'mousemove',
        Click: 'click'
    };

    export var TouchEvent = {
        TouchStart: 'touchstart',
        TouchEnd: 'touchend',
        TouchMove: 'touchmove',
        TouchCancel: 'touchcancel'
    };

    export var CompositeEvent = {
        Action: 'action', // click - tap
        DoubleAction: 'doubleaction',
        LongAction: 'longaction',

        PointerOver: 'pointerover',
        PointerMove: 'pointermove',
        PointerOut: 'pointerout',
        PointerDown: 'pointerdown',
        PointerUp: 'pointerup',

        Swipe: 'swipe',
        Pan: 'pan',
        Pinch: 'pinch',
    };

    var EventTransform = {
        mouseover: 'pointerover',
        mouseout: 'pointerout',
        mousedown: 'pointerdown',
        mouseup: 'pointerup',
        mousemove: 'pointermove',
        touchstart: 'pointerdown',
        touchmove: 'pointermove',
        touchend: 'pointerup',
        touchcancel: 'pointerup'
    };

    export class PointerModel extends fmvc.Model<IPointerEvent> {
        public static Name:string = 'PointerModel';

        public  onlyTouch:boolean = false;
        private target:HTMLElement;
        private sequence:IPointerEvent[];
        private sequenceLastDownIndex:number;
        private sequenceTime:number;

        constructor(data:any, opts:fmvc.IModelOptions) {
            super(PointerModel.Name, data, opts);
        }

        public enablePointerEventsByClassName(value:boolean, className:string = 'root'):void {

            if(window) Array.prototype.slice.call(window.document.getElementsByClassName(className))
                        .forEach(
                        (el)=>{
                            el.style.pointerEvents=(value?'auto':'none');
                            el.style.cursor=(value?'auto':'pointer');
                            el.style.msUserSelect=(value?'auto':'none');
                            el.style.webkitUserSelect=(value?'auto':'none');
                        }
                    );
        }

        public tryTransformToCompositeEvent(e:any):IPointerEvent|any {
            var transformName:string = EventTransform[e.type];
            var isTouch:boolean = e.type.indexOf('touch')===0;
            var eventData:any;

            if(isTouch) {
                this.onlyTouch = true;
                eventData = e.touches?(e.touches[0]||(e.changedTouches && e.changedTouches[0])):null;
                if(!eventData) this.log('Incorrect touch event data ', e);
            } else {
                eventData = e;
            }

            var result:IPointerEvent = {type: transformName, clientX: eventData.clientX, clientY: eventData.clientY, time: e.timeStamp, isComposite: true};
            return transformName?result:e;
        }


        public addSequenceEvent(e:IPointerEvent, target:HTMLElement):IPointerEvent {
            if(!this.isSequenceEvent(e.type)) return null;

            if(this.target !== target ) {
                this.target = target;
                this.sequence = [];
                this.sequenceLastDownIndex = -1;
                this.sequenceTime = e.time;
            }


            if(e.type === CompositeEvent.PointerDown) this.sequenceLastDownIndex = this.sequence.length;
            this.sequence.push(e);

            return this.analyzeSequence(e);
        }

        protected isSequenceEvent(name:string):boolean {
            return name === CompositeEvent.PointerMove || name === CompositeEvent.PointerUp || name === CompositeEvent.PointerDown;
        }

        protected analyzeSequence(e:IPointerEvent):IPointerEvent {
            if(e.type === CompositeEvent.PointerUp) {

                var firstEvent:IPointerEvent = this.sequence[this.sequenceLastDownIndex] || this.sequence[0];
                return this.getSequenceEvent(e.time - firstEvent.time, Math.abs(e.clientX - firstEvent.clientX), Math.abs(e.clientY - firstEvent.clientY), e);
            }
            return null;
        }

        protected getSequenceEvent(time:number, diffX:number, diffY:number, e:IPointerEvent):IPointerEvent {
            if(time < 1000 && diffX < 10 && diffY < 10 ) return {type: CompositeEvent.Action, sequence: 1, clientX: e.clientX, clientY: e.clientY };
            return null;
        }


    }
}
