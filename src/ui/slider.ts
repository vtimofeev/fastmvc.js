module ui {
    export function validateMaxMin(value:number, min:number, max:number) {
        return value < min ? min : value > max ? max : value;
    }

    export var HSlider = {
        component: 'ui.HSlider',
        content: '<div .base="hslider" .value="0" class="{state.base}">' +
        '<div ln="bg" class="{state.base}-value" style="width: {(value*100)}%;"></div>' +
        '<ft.Button ln="dragger" .base="hslider-button" onmousedown="{this.dragStart(e);}" style="left: {(value*100)}%;"/>' +
        '</div>',
        mixin: {
            dragStart: function dragStart(e) {
                this.startMouseX = e.mouseX;
                this.startSize = this.bg.offsetWidth;
                this.globalHandler(['mousemove', 'mouseend'], this.prepareChanges);
            },

            prepareChanges: function prepareChanges(e) {
                var newX = e.mouseX;
                var result = (newX - this.startMouseX)/this.startSize;
                this.value = validateMaxMin(this.value + result, 0, 1); // auto invalidate
                //this.bind();
            },

            init: function() {
                //this.prepareChanges = this.deffered(this.prepareChanges, 100)
            }
        }
    };


}

