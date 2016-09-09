///<reference path="../ft/d.ts" />

module ui.def {

    export var Select = {
        className: 'ui.Select',
        content: '<div .base="button" .stateHandlers="hover,selected,focused" .onaction="action" .onkeydown="{this.keydownHandler(e)}" ' +
        'class="{state.base} {state.icon} {state.base}-{state.type} {state-base}-{state.selected} {state.base}-{state.hover} {state.base}-{state.disabled}">' +
        '<div>{(model.data.item&&model.data.item?model.data.item.title:"")} ix: {state.hoverIndex}</div>' +
        '<ui.Group .ln="group" .if="{state.selected}" .data="{model.data.items}" .value="{model.data.item}"  .children.hover="{ctx.index===state.hoverIndex}" ></ui.Group>' +
        '</div>',
        mixin: {
            keydownHandler: function (e) {
                if(!this.inDocument || !(this.group && this.group.inDocument)) return;

                console.log('kdh ...', this);

                var data = this.data,
                    //selectedIndex = data.items && data.items.indexOf(data.item) || -1,
                    hoverIndex = this.group.getState('hoverIndex') || 0;

                //@todo enter keycode
                if (e.keyCode === ft.KeyCode.Enter) {
                  return  (this.model.changes = { item: data.items[hoverIndex] });
                }


                //@todo arrow up and down codes
                e.keyCode === ft.KeyCode.Up && hoverIndex--;
                e.keyCode === ft.KeyCode.Down && hoverIndex++;

                this.group.setState('hoverIndex', hoverIndex < 0 ? data.items.length - 1 : hoverIndex );
             }
        }
    };

}