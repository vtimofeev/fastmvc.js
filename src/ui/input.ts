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

    export var Input = {
        className: 'ui.Input',
        content: '<input ' +
        ' .base="input" .value="" .state.placeholder="" .state.valid="" .state.type="text" ' +
        ' name="{name}" placeholder="{state.placeholder||state.title}" value="{state.value}" type="{state.type}" ' +
        ' class="{state.base} {state.base}-{state.type} {state.base}-{state.valid} {state.base}-{state.enabled}"' +
        ' onkeydown="down" onkeyup="up" onblur="blur" onkeyleft="left" onkeyright="right" onkeyenter="enter" onkeyesc="esc" ' +
        '/>',
        mixin: {
            syncElementValue: function() {
                this.value = this.getElement().value;
            },

            afterEnter: function() {
                // Загружаем значения сохраненные браузером
                setTimeout( ()=>this.syncElementValue() , 100 );
            },
            internalHandler(name:string, e:any) {
                switch (name) {
                    case 'blur':
                    case 'up':
                        this.syncElementValue();
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
