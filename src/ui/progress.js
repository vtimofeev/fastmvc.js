var ui;
(function (ui) {
    var def;
    (function (def) {
        def.Progress = {
            component: 'ui.Progress',
            content: '<div .base="progress" .value="0" class="{state.base}">' +
                '<div class="{state.base}-bg" style="width: {(state.value*100)}%;"></div>' +
                '</div>',
        };
    })(def = ui.def || (ui.def = {}));
})(ui || (ui = {}));
//# sourceMappingURL=progress.js.map