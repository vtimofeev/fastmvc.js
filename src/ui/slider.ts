///<reference path="../../src/fmvc/d.ts" />
///<reference path="../../src/ft/d.ts" />


module ui.def {
    export function validateMaxMin(value:number, min:number, max:number) {
        return value < min ? min : value > max ? max : value;
    }

    export function validateStep(value:number, step:number) {
        return Math.round(value/step)*step;
    }

    export var HSliderDefinition = {
        className: 'ui.HSlider',
        content: '<div .base="hslider" .value=".5" class="{state.base} {state.base}-{state.selected} {state.base}-{state.hover}" >' +
        '<div ln="bg" class="{state.base}-bg">' +
        '<div ln="pg" class="{state.base}-pg" style="width: {state.value*100}%;">' +
        '<ui.Button ln="dg" .base="{state.base}-button" .stateHandlers="hover" onpointerdown="{this.dragStart(e);}"/>' +
        '</div>' +
        '</div>' +
        '</div>',
        mixin: {
            dragStart: function dragStart(e:ft.ITreeEvent) {
                this.startX = e.pe.clientX;
                this.startSize = this.bg.offsetWidth;
                this.startValue = Number(this.value);
                this.dg.setState('selected', true);
                this.globalPointer.bind(this, this.prepareChanges);
            },

            prepareChanges: function prepareChanges(e:fmvc.IEvent) {
                var newX = e.data.clientX,
                    result = (newX - this.startX) / this.startSize,
                    preValue = ui.def.validateMaxMin(this.startValue + result, 0, 1); // auto invalidate

                this.value = validateStep(preValue, 0.1);

                if (e.data.name === ft.CompositeEvent.PointerUp) {
                    this.globalPointer.unbind(this);
                    this.dg.setState('selected', false);
                }
            },

            afterEnter: function () {
            },

            disposeImpl: function() {
                this.pg = this.bg = this.dg = null;
            }
        }
    };


}

