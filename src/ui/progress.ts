module ui {
    export var ProgressDefinition = {
        component: 'ui.Progress',
        content: '<div .base="progress" .value="0" class="{state.base}">' +
            '<div class="{state.base}-pg" style="width: {(state.value*100)}%;"></div>' +
        '</div>',
        extension: {
        }
    }
}

