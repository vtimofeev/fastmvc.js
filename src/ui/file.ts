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
    export var File = {
        className: 'ui.File',
        content: `<div class="{base}-container">
        <div class="{base}-value">Current {state.value} , To replace: {state.files}</div>
        
        <input 
        .base="input" 
        .stateHandlers="focused" 
        .ln="fileInput"
        
        .value="" .state.placeholder="" .state.valid=""  
        
        type="file"
        name="{name}" 
        placeholder="{state.placeholder||state.title}" 
        value="{state.value}"  
        class="{state.base} {state.base}-{state.type} {state.base}-{state.valid} {state.base}-{state.enabled} {state.base}-{state.error}"
        />
        
        <ui.Button .onaction="upload">Upload</ui.Button>        
        </div>`,
        mixin: {

/*
            syncValue: function() {
                this.value = this.getElement().value;
            },
*/

            fileInputHandler(e:any) {
                this.setState('files', e.target.files);
            },

            uploadFiles() {
                var data = new FormData(),files = this.getState('files'),
                    t = this;
                console.log('Upload files', files);

                $.each(files, function(key, value)
                {
                    data.append(key, value);
                });


                $.ajax({
                    url: '/upload?type=json',
                    type: 'POST',
                    data: data,
                    cache: false,
                    dataType: 'json',
                    processData: false, // Don't process the files
                    contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                    success: function(data, textStatus, jqXHR)
                    {
                        console.log('AJAX result: ', data);
                        if(typeof data.error === 'undefined')
                        {
                            // Success so call function to process the form
                            console.log('Result: ', data[0], t);
                        }
                        else
                        {
                            // Handle errors here
                            console.log('ERRORS: ', data.error);
                        }

                        t.value = data[0].url;

                    },
                    error: function(jqXHR, textStatus, errorThrown)
                    {
                        // Handle errors here
                        console.log('ERRORS: ' + textStatus);
                        // STOP LOADING SPINNER
                    }
                });
            },

/*
            afterCreate() {
                this.setState('type', 'file');
            },
*/

            afterEnter: function() {
                this.fileInput && this.fileInput.addEventListener('change', this.fileInputHandler.bind(this));
            },


            internalHandler(e) {

                if(e.type === 'upload') {
                    this.uploadFiles();
                }
            }

        }
    }
}
