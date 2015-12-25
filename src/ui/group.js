var ui;
(function (ui) {
    ui.GroupDefinition = {
        className: 'ui.Group',
        content: '<div .base="group" class="{state.base}" children.selected="{ctx.data===state.value}" children.base="button" children.class="ft.Button" children.stateHandlers="hover"' +
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
    };
})(ui || (ui = {}));
//# sourceMappingURL=group.js.map