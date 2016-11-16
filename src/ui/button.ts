module ui.def {

    export var Button = {
        className: 'ui.Button',
        content: `<div .base="button" .stateHandlers="hover" .onaction="action"  
        
        class="{state.base} {state.icon} {state.base}-{state.type} {state.base}-{state.hover} {state.base}-{state.disabled}"> 
        { data ? data.title || data.name || data : '' } 
        </div>`
    };

    export var ToggleButton = {
        className: 'ui.ToggleButton',
        content: `<div .base="button" .stateHandlers="hover,selected" .onaction="action"
        class="{state.base} {state.icon} {state.base}-{state.type} {state.base}-{state.selected} {state.base}-{state.hover} {state.base}-{state.disabled}"> 
        { data ? data.title || data.name || data : '' } 
        </div>`
    };

    export var Checkbox = {
        className: 'ui.Checkbox',
        extendClassName: 'ui.ToggleButton',
        params: {base: 'checkbox'}
    };

    export var Radio = {
        className: 'ui.Radio',
        extendClassName: 'ui.ToggleButton',
        params: {base: 'radio'}
    };

    export var Switcher = {
        className: 'ui.Switcher',
        extendClassName: 'ui.ToggleButton',
        params: {base: 'switcher'}
    };

}
