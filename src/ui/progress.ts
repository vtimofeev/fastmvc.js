module ui.def {
    export var Progress = {
        className: 'ui.Progress',
        content: '<div .base="progress" .value="0" class="{state.base}">' +
            '<div class="{state.base}-bg" style="width: {(state.value*100)}%;"></div>' +
        '</div>',
    }
}

