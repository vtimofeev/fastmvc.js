///<reference path="../../src/fmvc/d.ts" />
///<reference path="../../src/ft/d.ts" />


module ui {
    export function validateMaxMin(value:number, min:number, max:number) {
        return value < min ? min : value > max ? max : value;
    }

    export var HSliderDefinition = {
        className: 'ui.HSlider',
        content: '<div .base="hslider" .value=".5" class="{state.base}-container {state.base}-{state.selected} {state.base}-{state.hover}" >' +
        '<div class="{state.base}-bg" style="width: {(state.value*100)}%;"></div>' +
        '<ft.Button .base="hslider-button" onpointerdown="{this.dragStart(e);}" style="left: {(state.value*100)}%;"/>' +
        '</div>',
        mixin: {
            dragStart: function dragStart(e:ft.ITreeEvent) {
                console.log('HSlider start', e);
                this.startX = e.pe.clientX;
                this.startSize = this.bg.offsetWidth;
                this.globalPointer.bind(this, this.prepareChanges);
            },

            prepareChanges: function prepareChanges(e:fmvc.IEvent) {
                var newX = e.data.clientX;
                var result = (newX - this.startX)/this.startSize;

                this.value = ui.validateMaxMin(this.value + result, 0, 1); // auto invalidate
                console.log('HSlider, x, result, value ', newX, result, this.value)

                if (e.name === ft.CompositeEvent.PointerUp) {
                    this.globalPointer.unbind(this);
                }
            },
            afterEnter: function() {
                console.log('HSlider after enter ' , this);
            }
        }
    };


}

