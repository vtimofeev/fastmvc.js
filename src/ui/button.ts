module ui {
    export var Button = {
        component: 'ui.Button',
        content: '<div .base="button" .stateHandlers="hover,selected" onaction="action" ' +
        'class="{state.base} {state.base}-{state.selected} {state.base}-{state.hover} {state.base}-{state.disabled}">' +
        '{(data?data:"")}' +
        '</div>',
        extension: {
        }
    }
}
