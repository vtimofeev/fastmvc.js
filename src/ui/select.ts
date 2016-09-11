///<reference path="../ft/d.ts" />

module ui.def {

    export var Select = {
        className: 'ui.Select',
        content: '<div .base="button" .stateHandlers="hover,selected,focused" .onaction="action" .onkeydown="{this.keydownHandler(e)}" ' +
        'class="{state.base} {state.icon} {state.base}-{state.type} {state-base}-{state.selected} {state.base}-{state.hover} {state.base}-{state.disabled}">' +
        '<div>{(model.data.item&&model.data.item?model.data.item.title:"")} item: {model.data.item}</div>' +
        '<ui.Group .ln="group" .if="{state.selected}" ' +
        '.model="{model}" ' +
        '.value="{model.data.item}" ' +
        '.out.value="model.data.item" ' +
        '.children.data="{model.data.items}"></ui.Group>' +
        '</div>',
        mixin: {

            afterEnter() {
                this.globalKeyboard.bind(this, this.keydownHandler);
            },

            afterExit() {
                this.globalKeyboard.unbind(this);
            },

            keydownHandler: function (e) {
                var keyCode = e && e.data && (e.data.type === 'keydown') && e.data.keyCode;
                if(!this.inDocument || !(this.group && this.group.inDocument) || !this.selected || !keyCode) return;

                var data = this.data,
                    hoverIndex = this.group.getState('hoverIndex') || 0;
                (e.data).preventDefault();


                if (keyCode === ft.KeyCode.Enter) {
                  console.log('Select: Hover index is ...', hoverIndex, ' ENTER ', data, this);
                  this.group.value = data.items[hoverIndex];
                }

                keyCode === ft.KeyCode.Up && hoverIndex--;
                keyCode === ft.KeyCode.Down && hoverIndex++;

                hoverIndex = hoverIndex < 0 ? data.items.length - 1 : hoverIndex;

                console.log('Select: Hover index is ...', hoverIndex);
                this.group.setState('hoverIndex', hoverIndex < 0 ? data.items.length - 1 : hoverIndex );
                this.invalidateData();

             }
        }
    };

}