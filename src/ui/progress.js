var ui;
(function (ui) {
    ui.ProgressDefinition = {
        component: 'ui.Progress',
        content: '<div .base="progress" .value="0" class="{state.base}">' +
            '<div class="{state.base}-pg" style="width: {(state.value*100)}%;"></div>' +
            '</div>',
        extension: {}
    };
})(ui || (ui = {}));
//# sourceMappingURL=progress.js.map