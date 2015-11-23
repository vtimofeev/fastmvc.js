///<reference path='./../d.ts'/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ft;
(function (ft) {
    ft.PointerEvent = {
        MouseOver: 'mouseover',
        MouseOut: 'mouseout',
        MouseDown: 'mousedown',
        MouseUp: 'mouseup',
        MouseMove: 'mousemove'
    };
    ft.TouchEvent = {
        TouchStart: 'touchstart',
        TouchEnd: 'touchend',
        TouchMove: 'touchmove',
        TouchCancel: 'touchcancel'
    };
    ft.CompositeEvent = {
        Action: 'action',
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
    var PointerModel = (function (_super) {
        __extends(PointerModel, _super);
        function PointerModel(data, opts) {
            _super.call(this, PointerModel.Name, data, opts);
        }
        PointerModel.prototype.tryTransformToCompositeEvent = function (e) {
            var transformName = EventTransform[e.type];
            var isTouch = e.type.indexOf('touch') === 0;
            var eventData;
            if (isTouch) {
                eventData = e.touches ? e.touches[0] : null;
                if (!eventData)
                    this.log('Incorrect touch event data ', e);
            }
            else {
                eventData = e;
            }
            var result = { name: transformName, clientX: eventData.clientX, clientY: eventData.clientY, time: e.timeStamp, isComposite: true };
            return transformName ? result : e;
        };
        PointerModel.prototype.addSequenceEvent = function (e, target) {
            if (!this.isSequenceEvent(e.name))
                return null;
            if (this.target !== target) {
                this.target = target;
                this.sequence = [];
                this.sequenceLastDownIndex = -1;
                this.sequenceTime = e.time;
            }
            if (e.name === ft.CompositeEvent.PointerDown)
                this.sequenceLastDownIndex = this.sequence.length;
            this.sequence.push(e);
            return this.analyzeSequence(e);
        };
        PointerModel.prototype.isSequenceEvent = function (name) {
            return name === ft.CompositeEvent.PointerMove || name === ft.CompositeEvent.PointerUp || name === ft.CompositeEvent.PointerDown;
        };
        PointerModel.prototype.analyzeSequence = function (e) {
            if (e.name === ft.CompositeEvent.PointerUp) {
                var firstEvent = this.sequence[this.sequenceLastDownIndex] || this.sequence[0];
                return this.getSequenceEvent(e.time - firstEvent.time, Math.abs(e.clientX - firstEvent.clientX), Math.abs(e.clientY - firstEvent.clientY), e);
            }
            return null;
        };
        PointerModel.prototype.getSequenceEvent = function (time, diffX, diffY, e) {
            if (time < 1000 && diffX < 10 && diffY < 10)
                return { name: ft.CompositeEvent.Action, sequence: 1, clientX: e.clientX, clientY: e.clientY };
            return null;
        };
        PointerModel.Name = 'PointerModel';
        return PointerModel;
    })(fmvc.Model);
    ft.PointerModel = PointerModel;
})(ft || (ft = {}));
//# sourceMappingURL=pointer.model.js.map