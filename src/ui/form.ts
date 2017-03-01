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

            hasSetting(prop:any, name:string):boolean {
                return prop && prop.settings && (prop.settings.indexOf(name) > -1);
            },

            getFieldClassName(prop:any):string {
                var isTextarea = this.hasSetting(prop, 'textarea'),
                    isCheckbox = this.hasSetting(prop, 'checkbox'),
                    isSelect = this.hasSetting(prop, 'select'),
                    isGroup = this.hasSetting(prop, 'group'),
                    isFile = this.hasSetting(prop, 'file') || this.hasSetting(prop, 'file[]');

                if(isTextarea) {
                    return 'ui.Textarea';
                }
                else if(isSelect) {
                    return 'ui.Select';
                }
                else if(isCheckbox) {
                    return 'ui.Checkbox';
                }
                else if(isGroup) {
                    return 'ui.Group';
                }
                else if(isFile) {
                    return 'ui.MFile';
                }
                else if(prop.type === 'text') {
                    return 'ui.Text';
                }

                return 'ui.Input';
            },

            afterValidate: function () {
                console.log('Form, after validate --- ', this.getState('schemaType'),this.model, this.model.schemas, this.bindedInstance);

                var schema = this.getState('schemaType');

                if(!this.model || !this.model.schemas || !this.model.schemas[this.getState('schemaType')] || this.model.disposed) return;
                if(this.bindedInstance === this.model && this.bindedSchema === this.getState('schema')) return;

                this.bindedInstance = this.model;
                this.bindedSchema = this.getState('schema');

                this.cleanForm();

                var schemaType = this.getState('schemaType');
                var schema:any[] = this.model.schemas[schemaType] || this.getState('schema');


                schema.forEach(function(value:IFormField) {
                    var title = (this.i18n.form && this.i18n.form.field && this.i18n.form.field[value.name]) || value.field || value.name;
                    var modelProperty = value.field || value.name,
                        settings = value.settings || [],
                        stateType = value.settings && (value.settings.indexOf('password') > -1) && 'password',
                        states = {
                            propertyName: modelProperty,
                            title:  title,
                            value: this.model.data && this.model.data[modelProperty] || ''
                        },
                        bindout = 'out.value',
                        params = {
                            model: this.model,
                            setStates: states,
                        };

                    console.log('Create field', modelProperty, settings,  this.hasSetting(value, 'hidden') );
                    if ( this.hasSetting(value, 'hidden') ) return;
                    
                    
                    if ( this.hasSetting(value, 'file') ) {
                        var tempModel = new fmvc.ArrayModel(this.getFieldClassName(value) + '-model', states.value || ['', '', ''])
                        tempModel.bind(this, (e)=>{
                            var r = {};
                            r[modelProperty] = tempModel.data;
                            console.log('On file model change ', tempModel.data);
                            this.model.changes = r;
                        });
                        params.model = tempModel;
                    }

                    stateType && (states.type = stateType);
                    params[bindout] = 'model.data.' + modelProperty;

                    console.log('Create field with params ', params, ' , ', value);
                    var instance = ft.templateManager.createInstance( this.getFieldClassName(value) , this.name + '-field-' + modelProperty, params);
                    instance.render(this.getElement());

                    instance.parent = this;
                    instance.settings = settings;

                    if(this.state.applyOnEnter==='true') {
                        instance.enterHandler = this.internalHandler.bind(this, 'apply');
                    }


                    // Связь изменений модели с экземпляром
                    if(this.getState('modelBind' === 'true')) {
                        this.model.bind(instance, ()=> {
                            instance && !instance.disposed && (instance.value = this.model.data && this.model.data[modelProperty] || '');
                        });
                    }

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

                this.submitButton = ft.templateManager.createInstance('ui.Button', this.name + '-field-submit' , {data: this.state.applyText || (schema==='insert'?'Save':'Update'), type: 'apply', onaction: (e)=>this.internalHandler('apply',e) });
                this.submitButton.render(this.getElement());

                this.cancelButton = ft.templateManager.createInstance('ui.Button', this.name + '-field-cancel' , {data:'Cancel', type: 'cancel', onaction: (e)=>this.internalHandler('cancel',e) });
                if(this.state.hideCancel !== 'true') this.cancelButton.render(this.getElement());
            },

            getErrors() {
                var settings = ['required', 'minlen'],
                    validate = {
                        required: (name, v)=>!!v,
                        minlen: (name, v)=>(v&&v.length > parseInt(name.split('-')[1], 10))
                    };

                var errors = this.fields.reduce( (m:any, fieldView:any)=> {

                    var r = settings.map( name=>{
                        var isValid = (fieldView.settings.indexOf( name ) > -1) ? validate[name](name, fieldView.value) : null;
                        //console.log('Apply try ', name, fieldView.settings, fieldView.settings.indexOf( name ), fieldView.value, isValid);
                        return isValid === false ? name : null;
                    } ).filter( (v)=>!!v );

                    r.length && (m.data.push({name: fieldView.name, errors: r}));
                    r.length && (m.count += r.length);
                    return m;

                }, { data: [], count: 0 });

                errors.data.forEach( v=>{
                    var field = this.fields.filter( f=>f.name===v.name)[0];
                    field.setState('error', true);
                });

                return errors;
            },

            internalHandlerImpl: function (e:fmvc.IEvent) {


                if(e.type==='cancel') {
                    if(this.model) this.model.changes = null;
                    return;
                }

                if(e.type==='apply') {
                    this.fields.forEach( (v)=>v.syncValue && v.syncValue() );

                    var errors = this.getErrors();
                    console.log('Has errors on apply ', errors);
                    if(errors.count) return;

                    console.log('On apply changes ? ', this.getState('schemaType'), this.model.changes , this.model.data  );

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
