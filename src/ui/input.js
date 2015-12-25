var ui;
(function (ui) {
    var def;
    (function (def) {
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
        def.Input = {
            className: 'ui.Input',
            content: '<input ' +
                ' .base="input" .value="" .state.placeholder="" .state.valid="" .state.type="text" ' +
                ' placeholder="{state.placeholder||state.title}" value="{state.value}" type="{state.type}" ' +
                ' class="{state.base} {state.base}-{state.type} {state.base}-{state.valid}"' +
                ' onkeydown="down" onkeyup="up" ' +
                '/>',
            mixin: {
                internalHandler: function (name, e) {
                    switch (name) {
                        case 'up':
                            this.value = this.getElement().value;
                            break;
                        case 'down':
                            break;
                    }
                }
            }
        };
    })(def = ui.def || (ui.def = {}));
})(ui || (ui = {}));
//# sourceMappingURL=input.js.map