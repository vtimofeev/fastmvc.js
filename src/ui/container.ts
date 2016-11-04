module ui.def {

    export var Popup = {
        className: 'ui.Popup',
        content: `<div 
        .base="popup-container"  
        class="{state.base} {state.icon} {state.base}-{state.type}"
        .onkeyup-esc="close"> 
          <div class="{base}-content">  
          <ui.Button .base="button" .type="icon" .custom="ícon-close" .onaction="close"></ui.Button>
            <h1 class="{base}-header">{model.data.name}</h1>
            {model.data.content}
          </div>         
        </div>`,
        mixin: {

        }
    };
}