module ui.def {
    export var Button = {
        className: 'ui.Button',
        content: '<div .base="button" .stateHandlers="hover" onaction="action" ' +
        'class="{state.base} {state.base}-{state.hover} {state.base}-{state.disabled}">' +
        '{(data?data:"")}' +
        '</div>'
    };

    export var ToggleButton = {
        className: 'ui.Button',
        content: '<div .base="button" .stateHandlers="hover,selected" onaction="action" ' +
        'class="{state.base} {state.base}-{state.selected} {state.base}-{state.hover} {state.base}-{state.disabled}">' +
        '{(data?data:"")}' +
        '</div>'
    };


}
