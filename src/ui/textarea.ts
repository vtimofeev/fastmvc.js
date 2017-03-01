module ui.def {

    export var Textarea = {
        className: 'ui.Textarea',
        content: `
        <textarea 
        .base="textarea" .value="" .state.placeholder="" .state.valid=""
        .stateHandlers="focused"  
        rows="4"
        id="{name}" name="{name}" placeholder="{state.placeholder||state.title}" value="{state.value}" 
        class="{state.base} {state.base}-{state.error} {state.base}-{state.enabled}" 
        />`,
        mixin: {

            syncValue: function(value:string) {
                this.value = value || this.getElement().value;
            },

            afterEnter: function() {
                this.globalKeyboard.bind(this, this.keyboardHandler);
                setTimeout( ()=>this.syncValue() , 500 );
            },

            beforeExit: function () {
                this.globalKeyboard.unbind(this);
            },

            keyboardHandler: function(e:fmvc.IEvent) {
                if(!this.focused || !e.data) return;
                if(e.data.type === 'keyup') this.syncValue();
                if(e.data.type === 'keyup' && e.data.keyCode === 13 && this.enterHandler) this.enterHandler(e);
            }

        }
    }
}
