///<reference path="../ft/d.ts" />

module ui.def {
    import TemplateView = ft.TemplateView;
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
                //console.log('Form, after validate --- ', this.getState('schemaType'),
                    this.model, this.model.schemas, this.bindedInstance);

                var schema = this.getState('schemaType');

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
                            propertyName: modelProperty,
                            title:  modelProperty,
                            type: type || 'text',
                            value: this.model.data && this.model.data[modelProperty] || ''
                        },

                        bindout = 'out.value',

                        params = {
                        model: this.model,
                        setStates: states,
                    };

                    params[bindout] = 'model.data.' + modelProperty;
                    //console.log('Create field ', value.settings, params);

                    var instance = ft.templateManager.createInstance( (value.type === 'text' ? 'ui.Text' : 'ui.Input') , this.name + '-field-' + modelProperty, params);
                    instance.render(this.getElement());
                    instance.parent = this;

                    var t = this;
                    value.settings && value.settings.forEach && value.settings.forEach(function(v:string) {
                        var items = v.split(':'),
                            act = items[0],
                            field = items[1] && items[1].split('|') || [],

                            propertyName = field[0],
                            filters = field.slice(1);

                        if(act === 'copy' && propertyName) {
                            instance.bindStateFunction('value', (v)=>{
                                t.fields.filter( (f:TemplateView)=>f.getState('propertyName')===propertyName ).forEach( (f:TemplateView)=>f.setState('value', v) );
                            }, filters)
                        }

                    });

                    this.fields.push(instance);
                }, this);

                this.submitButton = ft.templateManager.createInstance('ui.Button', this.name + '-field-submit' , {data:schema==='insert'?'Save':'Update', type: 'apply', onaction: (e)=>this.internalHandler('apply',e) });
                this.submitButton.render(this.getElement());

                this.cancelButton = ft.templateManager.createInstance('ui.Button', this.name + '-field-cancel' , {data:'Cancel', type: 'cancel', onaction: (e)=>this.internalHandler('cancel',e) });
                this.cancelButton.render(this.getElement());
            },

            internalHandlerImpl: function (e:fmvc.IEvent) {


                if(e.type==='cancel') {
                    if(this.model) this.model.changes = null;
                    return;
                }

                if(e.type==='apply') {
                    this.fields.forEach( (v)=>v.syncValue && v.syncValue() );
                    //@todo validate and set errors

                    this.submitButton.disabled = true;
                    var schemaType = this.getState('schemaType');

                    var operationPromise = ((schemaType === 'update' || schemaType === 'insert')?this.model.save():this.model[schemaType](this.model.changes || this.model.data));

                    operationPromise.then(
                            (v:any)=>{
                                this.model.changes = v && v[0];
                                this.model.applyChanges();
                                this.dispatchEvent({ type: schemaType, target: this.model });
                                console.log('On form success apply ', v, this.model);
                            }
                        ).catch(
                            (e:any)=>{
                                this.model.state = fmvc.ModelState.Error;
                                console.log('On form error apply ', e);
                            }
                        ).finally(()=>{
                            this.submitButton.disabled = false;
                    });


                }
            },

            disposeImpl: function () {
                this.cleanForm();
                this.super.disposeImpl();
            }

        }
    }
}
