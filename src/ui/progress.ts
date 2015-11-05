module ui {
    export var Progress = {
        component: 'ui.Progress',
        content: '<div .base="progress" .value="0" class="{state.base}"><div class="{state.base}-value" style="width: {(state.value*100)}%;"></div></div>',
        extension: {
        }
    }
}
