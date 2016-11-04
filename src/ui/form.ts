///<reference path="../ft/d.ts" />

module ui.def {
    interface IFormField {
        name:string,
        field?:string,
        settings:any
    }

    export var FormDefinition = {
        className: 'ui.Form',
        content: '<div .base="form" .state.schemaType="insert" class="{state.base}"></div>',
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
                if(!this.model || !this.model.schemas || !this.model.schemas[this.getState('schemaType')] || this.model.disposed) return;
                if(this.bindedInstance === this.model && this.bindedSchema === this.getState('schema')) return;


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
                            value: this.model.data && this.model.data[modelProperty] || ''
                        };

                    var bindout = 'out.value';
                    var params = {
                        model: this.model,
                        setStates: states,
                    };

                    params[bindout] = 'model.data.' + modelProperty;


                    var instance = ft.templateManager.createInstance( (value.type === 'text' ? 'ui.Text' : 'ui.Input') , this.name + '-field-' + modelProperty, params);


                    instance.render(this.getElement());
                    instance.parent = this;
                    this.fields.push(instance);
                }, this);

                this.submitButton = ft.templateManager.createInstance('ui.Button', this.name + '-field-submit' , {data:'Submit', type: 'apply', onaction: (e)=>this.internalHandler('apply',e) });
                this.submitButton.render(this.getElement());

                this.cancelButton = ft.templateManager.createInstance('ui.Button', this.name + '-field-cancel' , {data:'Cancel', onaction: (e)=>this.internalHandler('cancel',e) });
                this.cancelButton.render(this.getElement());




            },

            internalHandlerImpl: function (e:IEvent) {


                if(e.type==='cancel') {
                    if(this.model) this.model.changes = null;
                    return;
                }

                if(e.type==='apply') {
                    this.fields.forEach( (v)=>v.syncValue && v.syncValue() );
                    var schemaType = this.getState('schemaType');


                    var operationPromise = ((schemaType === 'update')?this.model.save():this.model[schemaType](this.model.changes || this.model.data));

                    operationPromise.then(
                            (v:any)=>( this.model.changes = v && v[0],this.model.applyChanges(), console.log('On form success apply ', v, this.model))
                        ).catch(
                            (e:any)=>(this.model.state = fmvc.ModelState.Error, console.log('On form error apply ', e))
                        );


                }
            },

            disposeImpl: function () {
                this.cleanForm();
                this.super.disposeImpl();
            }

        }
    }
}
