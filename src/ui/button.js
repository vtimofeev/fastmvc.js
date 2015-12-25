var ui;
(function (ui) {
    var def;
    (function (def) {
        def.Button = {
            className: 'ui.Button',
            content: '<div .base="button" .stateHandlers="hover" onaction="action" ' +
                'class="{state.base} {state.base}-{state.hover} {state.base}-{state.disabled}">' +
                '{(data?data:"")}' +
                '</div>'
        };
        def.ToggleButton = {
            className: 'ui.Button',
            content: '<div .base="button" .stateHandlers="hover,selected" onaction="action" ' +
                'class="{state.base} {state.base}-{state.selected} {state.base}-{state.hover} {state.base}-{state.disabled}">' +
                '{(data?data:"")}' +
                '</div>'
        };
    })(def = ui.def || (ui.def = {}));
})(ui || (ui = {}));
//# sourceMappingURL=button.js.map