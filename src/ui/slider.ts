///<reference path="../../src/fmvc/d.ts" />
///<reference path="../../src/ft/d.ts" />


module ui {
    export function validateMaxMin(value:number, min:number, max:number) {
        return value < min ? min : value > max ? max : value;
    }

    export var HSliderDefinition = {
        className: 'ui.HSlider',
        content: '<div .base="hslider" .value=".5" class="{state.base} {state.base}-{state.life} {state.base}-{state.selected} {state.base}-{state.hover}" >' +
        '<div ln="bg" class="{state.base}-bg">' +
        '<div ln="pg" class="{state.base}-pg" style="width: {(state.value*100)}%;">' +
        '<ft.Button .base="{state.base}-button" onpointerdown="{this.dragStart(e);}"/>' +
        '</div>' +
        '</div>' +
        '</div>',
        mixin: {
            dragStart: function dragStart(e:ft.ITreeEvent) {
                this.startX = e.pe.clientX;
                this.startSize = this.bg.offsetWidth;
                this.startValue = Number(this.value);
                console.log('HSlider start', this.startX, this.getElement().offsetWidth, this.startSize, e);
                this.globalPointer.bind(this, this.prepareChanges);
            },

            prepareChanges: function prepareChanges(e:fmvc.IEvent) {
                //console.log('Prepare changes ', e);
                var newX = e.data.clientX;
                var result = (newX - this.startX) / this.startSize;

                this.value = ui.validateMaxMin(this.startValue + result, 0, 1); // auto invalidate
                //console.log('HSlider, x, result, value ', newX, result, this.value)

                if (e.data.name === ft.CompositeEvent.PointerUp) {
                    console.log('HSlider REMOVE !!!');
                    this.globalPointer.unbind(this);

                }
            },
            beforeEnter: function () {
                console.log('hslider before enter ', this);
            },

            afterEnter: function () {
                console.log('hslider after enter ', this);
            }
        }
    };


}

