module ui {
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

    export var InputDefinition = {
        className: 'ui.Input',
        content: '<input ' +
        ' .base="input" .value="" .state.placeholder="" .state.valid="" .state.type="text" ' +
        ' placeholder="{state.placeholder||state.title}" value="{state.value}" type="{state.type}" ' +
        ' class="{state.base} {state.base}-{state.type} {state.base}-{state.valid}"' +
        ' onkeydown="down" onkeyup="up" ' +
        '/>',
        mixin: {
            internalHandler(name:string, e:any) {
                switch (name) {
                    case 'up':
                        this.value = this.getElement().value;
                        break;
                    case 'down':
                        break;

                }
            }
        }
    }
}
