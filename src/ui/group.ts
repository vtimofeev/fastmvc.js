module ui.def {
    export var Group = {
        className: 'ui.Group',
        content: '<div .base="group" class="{state.base}" .children.selected="{ctx.data===state.value}" .children.base="button" .children.class="ui.Button" .children.stateHandlers="hover"' +
        ' children.onaction="item"></div>',
        mixin: {
            internalHandler: function (e) {
                switch (e.name) {
                    case 'item': {
                        this.value = e.target.data;
                    }
                }
            }
        }
    }
}
