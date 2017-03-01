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
                window.CKEDITOR.editorConfig = function(config) {
                    config.allowedContent = true;
                    return config;
                };

                const editor = this[CKEDITOR] = (window[CKEDITOR] && window[CKEDITOR].replace(this.getElement(), {
                    filebrowserBrowseUrl: '/browse',
                    filebrowserUploadUrl: '/upload',

                }));

                editor.setData(this.value);

                var t = this;
                function sync() {
                    t.getElement().value = t[CKEDITOR].getData();
                    t.syncValue();
                }
                var ds =  _.debounce(sync, 50);

                editor.on('change', ds);
                editor.on('key', ds);
            },

            beforeExit: function () {
                if (this[CKEDITOR]) this[CKEDITOR].destroy();
            }

        }
    }
}
