module ui.def {
    /*
     Input data model

     1. attibs
     type: data.type // text,password,number,date ...
     placeholder: data.placeholder // text
     value: data.value // any

     2. states
     base
     type
     value
     placeholder
     valid
     */

    import IEvent = fmvc.IEvent;
    export var Input = {
        className: 'ui.Input',
        content: '<input ' +
        ' .base="input" ' +
        ' .stateHandlers="focused" ' +
        '.value="" .state.placeholder="" .state.valid="" .state.type="text" ' +
        ' name="{name}" placeholder="{state.placeholder||state.title}" value="{state.value}" type="{state.type}" ' +
        ' class="{state.base} {state.base}-{state.type} {state.base}-{state.valid} {state.base}-{state.enabled} {state.base}-{state.error}"' +
        ' onkeydown="down" onkeyup="up" onblur="blur" onkeyleft="left" onkeyright="right" onkeyenter="enter" onkeyesc="esc" ' +
        '/>',
        mixin: {

            syncValue: function() {
                this.value = this.getElement().value;
            },

            afterEnter: function() {
                this.globalKeyboard.bind(this, this.keyboardHandler);
                // Загружаем значения сохраненные браузером
                setTimeout( ()=>this.syncValue() , 500 );
            },

            beforeExit: function () {
                this.globalKeyboard.unbind(this);
            },

            keyboardHandler: function(e:IEvent) {


                if(!this.focused || !e.data) return;

                if(e.data.type === 'keyup') {
                    this.syncValue();
                    this.getState('error') && this.setState('error', false);
                }

                if(e.data.type === 'keyup' && e.data.keyCode === 13 && this.enterHandler) this.enterHandler(e);
                return;

                switch (name) {
                    case 'blur':
                    case 'up':
                        this.syncValue();
                        break;
                    case 'down':
                        break;
                    default:
                        break;
                }
            }
        }
    }
}
