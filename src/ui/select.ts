///<reference path="../ft/d.ts" />

module ui.def {

    export var Select = {
        className: 'ui.Select',
        content: '<div .base="button" .stateHandlers="hover,selected,focused" .onaction="action" .onkeydown="{this.keydownHandler(e)}" ' +
        'class="{state.base} {state.icon} {state.base}-{state.type} {state-base}-{state.selected} {state.base}-{state.hover} {state.base}-{state.disabled}">' +
        '<div>{model.data.item}</div>' +
        '<ui.Group .base="roundcorner-vgroup" .custom="absolute-fill-bottom" .ln="group" .if="{state.selected}" ' +
        '.model="{model}" ' +
        '.value="{model.data.item}" ' +
        '.out.value="model.data.item" ' +
        '.children.data="{model.data.items}"></ui.Group>' +
        '</div>',
        mixin: {

            afterEnter() {

                this.globalPointer.bind(this, this.pointerHandler);
                this.globalKeyboard.bind(this, this.keydownHandler);

            },

            afterExit() {
                this.globalPointer.unbind(this);
                this.globalKeyboard.unbind(this);
            },

            pointerHandler(e:fmvc.IEvent) {

                var requiredDeselectOnAction:boolean = this.selected && e.data.type === ft.CompositeEvent.PointerUp;
                requiredDeselectOnAction && (_.defer(()=>this.selected = false));

            },

            keydownHandler(e:fmvc.IEvent) {
                var keyCode = e && e.data && (e.data.type === 'keydown') && e.data.keyCode;
                if(!this.inDocument || !(this.group && this.group.inDocument) || !this.selected || !keyCode) return;

                var data = this.data,
                    hoverIndex = this.group.getState('hoverIndex') || 0;
                (e.data).preventDefault();


                if (keyCode === ft.KeyCode.Enter) {
                   this.group.value = data.items[hoverIndex];
                    _.defer(()=>this.selected=false);
                }
                //https://catalog.api.2gis.ru/2.0/catalog/marker/search?page=1&page_size=10000&q=%D0%BE%D1%81%D1%82%D0%B0%D0%BD%D0%BA%D0%B8%D0%BD%D1%81%D0%BA%D0%B8%D0%B9%20%D0%BF%D0%B0%D1%80%D0%BA&hash=3f3cffc417564cee&region_id=32&key=ruczoy1743
                if (keyCode === ft.KeyCode.Esc) {
                    return _.defer(()=>this.selected=false);
                }


                keyCode === ft.KeyCode.Up && hoverIndex--;
                keyCode === ft.KeyCode.Down && hoverIndex++;

                hoverIndex = hoverIndex < 0 ? data.items.length - 1 : hoverIndex;
                hoverIndex = hoverIndex > data.items.length - 1 ? 0 : hoverIndex;

                this.group.setState('hoverIndex', hoverIndex < 0 ? data.items.length - 1 : hoverIndex );
                this.invalidateData();

             }
        }
    };

}