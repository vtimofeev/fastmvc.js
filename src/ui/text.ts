module ui.def {

    const CKEDITOR = 'CKEDITOR',
          EditorPath = '/ckeditor/ckeditor.js';

    export var Text = {
        className: 'ui.Text',
        content: `
        <textarea 
        .base="textarea" .value="" .state.placeholder="" .state.valid=""  
        id="{name}" name="{name}" placeholder="{state.placeholder||state.title}" value="{state.value}" 
        class="{state.base} {state.base}-{state.valid} {state.base}-{state.enabled}" 
        />`,
        mixin: {

            syncValue: function(value:string) {
                this.value = value || this.getElement().value;

            },

            afterEnter: function() {
                if (!window[CKEDITOR]) {
                    var script = document.createElement('script');
                    script.src = EditorPath;
                    script.onload = this.initInternal.bind(this);
                    document.body.appendChild(script);
                }
                else {
                    this.initInternal();
                }
            },

            initInternal: function () {

                const editor = this[CKEDITOR] = (window[CKEDITOR] && window[CKEDITOR].replace(this.getElement()));
                editor.setData(this.value);

                var t = this;
                editor.on('change', function () {
                    t.getElement().value = t[CKEDITOR].getData();
                    t.syncValue();
                });
            },

            beforeExit: function () {
                if (this[CKEDITOR]) this[CKEDITOR].destroy();
            }

        }
    }
}
