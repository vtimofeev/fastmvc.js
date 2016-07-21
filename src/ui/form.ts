///<reference path="../ft/d.ts" />

module ui.def {
    interface IFormField {
        name:string,
        field?:string,
        settings:any
    }

    export var FormDefinition = {
        className: 'ui.Form',
        content: '<div .base="form" .state.schemaType="insert" class="{state.base}">' +
        '<h1>Form {model.name}</h1>' +
        '</div>',
        mixin: {
            cleanForm: function () {

                this.fields && this.fields.forEach( field=>field.dispose() );
                this.submitButton && this.submitButton.dispose();
                this.cancelButton && this.cancelButton.dispose();

                this.fields = [];
                this.submitButton = null;
                this.cancelButton = null;
            },

            afterValidate: function () {
                console.log('AfterValidate: Create form ', this.model.schemas, this.getState('schemaType') );

                if(!this.model || !this.model.schemas || !this.model.schemas[this.getState('schemaType')]) return;

                if(this.bindedInstance === this.model && this.bindedSchema === this.getState('schema')) return;
                console.log('Render form ', this.model.schemas, this.getState('schemaType') );

                this.bindedInstance = this.model;
                this.bindedSchema = this.getState('schema');

                this.cleanForm();

                var schemaType = this.getState('schemaType');
                var schema:any[] = this.model.schemas[schemaType] || this.getState('schema');

                schema.forEach(function(value:IFormField) {
                    var modelProperty = value.field || value.name,

                        type = value.settings && (value.settings.indexOf('password') > -1) && 'password',

                        states = {
                            title:  modelProperty,
                            type: type || 'text',
                            value: this.model.data[modelProperty]
                        };

                    var bindout = 'out.value';// + modelProperty;
                    var params = {
                        model: this.model,
                        setStates: states,
                    };

                    params[bindout] = modelProperty;
                    var instance = ft.templateManager.createInstance('ui.Input', this.name + '-field-' + modelProperty, params);
                    instance.render(this.getElement());
                    instance.parent = this;
                    this.fields.push(instance);
                }, this);

                this.submitButton = ft.templateManager.createInstance('ui.Button', this.name + '-field-submit' , {data:'Submit', type: 'apply', onaction: (e)=>this.internalHandler('apply',e) });
                this.submitButton.render(this.getElement());

                this.cancelButton = ft.templateManager.createInstance('ui.Button', this.name + '-field-cancel' , {data:'Cancel', onaction: (e)=>this.internalHandler('cancel',e) });
                this.cancelButton.render(this.getElement());

                console.log('Form submit button created ', this.submitButton);
                console.log('Form cancel created ', this.cancelButton);

            },

            internalHandler: function (type, e) {
                console.log('Handler ', type, e);

                if(type==='apply') {
                    var schemaType = this.getState('schemaType');
                    console.log('Methoid to apply ', this.model[schemaType], this.model.data);
                    this.model.applyChanges();
                    this.model[schemaType](this.model.data);

                }
            },

            disposeImpl: function () {
                this.cleanForm();
                this.super.disposeImpl();
            }

        }
    }
}
