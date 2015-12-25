///<reference path="../ft/d.ts" />
var ui;
(function (ui) {
    ui.FormDefinition = {
        className: 'ui.Form',
        content: '<div .base="form" .state.schemaType="insert" class="{state.base}"><h1>Form {model.name}</h1></div>',
        mixin: {
            afterEnter: function () {
                console.log('Create form ', this.model.schemas, this.getState('schemaType'));
                if (!this.model || !this.model.schemas || !this.model.schemas[this.getState('schemaType')])
                    return;
                var schema = this.model.schemas[this.getState('schemaType')];
                console.log('Schema ... ', schema);
                schema.forEach(function (value) {
                    console.log('Schema value is ... ', value);
                    var states = {
                        title: value.title,
                        value: this.model.data[value.field]
                    };
                    var bindout = 'bindout.' + value.field;
                    var params = {
                        model: this.model,
                        setStates: states
                    };
                    params[bindout] = value.field;
                    var instance = ft.templateManager.createInstance('ui.Input', this.name + '-field-' + value.field, params);
                    instance.render(this.getElement());
                }, this);
                var instance = ft.templateManager.createInstance('ui.Button', this.name + '-field-submit', { data: 'Submit', onaction: 'submit' });
                instance.render(this.getElement());
            },
            internalHandler: {}
        }
    };
})(ui || (ui = {}));
//# sourceMappingURL=form.js.map