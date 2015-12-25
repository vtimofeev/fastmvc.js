///<reference path="../src/d.ts/mocha/mocha.d.ts" />
///<reference path="../../DefinitelyTyped/chai/chai.d.ts" />
///<reference path="../src/fmvc/d.ts" />
///<reference path="../src/ft/d.ts" />

var expect = chai.expect;
var assert = <chai.Assert> chai.assert;

describe('ft - form ', function () {
    var templateObjs = [
        ui.ButtonDefinition,
        ui.HSliderDefinition,
        ui.InputDefinition,
        ui.GroupDefinition,
        ui.FormDefinition,
        {
            className: 'ft.TestForm',
            content: '<div>' +
            '<h1>Test form</h1>' +
            '<ui.Form .model="{model}"></ui.Form>' +
            '</div>',
        action: 'create'
},
];

var tm:ft.ITemplateManager = ft.templateManager;
var app = new fmvc.Facade('testapp', null, document.body);
var model = new fmvc.Model<any>('user-1');
model.data = {
    fname: 'Vasily',
    sname: 'Timofeev',
    age: 33,
    gender: 1,
    password: 'hello',
};

model.getSchemas = function () {
    return {
        insert: [
                { field: 'fname', title: 'First:' },
                { field: 'sname', title: 'Second:' },
            ]
    }
};

var mediator = new fmvc.Mediator('appmed', document.body);
app.register(model, mediator);

describe('ft - Form', function () {
    _.each(templateObjs, function (obj:ITemplateTestObject, index:number) {
        console.log('Create, ' , obj);
        var key = obj.className;


        it('should create instances ' + key, function () {
            tm.createClass(key, obj.content, obj.params, obj.mixin);
            var instance:ft.ITemplateView = null;
            if (obj.action === 'create') {
                instance = tm.createInstance(key, 'view-' + key);
                console.log(instance);
                instance.setModel(model);
                mediator.addView(instance);
            }
        });

    });

    it('should exist component constructors', function () {
        //assert(ft.DataButton, 'should exist ft.DataButton (window)');
        //assert(ft.ButtonGroup, 'should exist ft.ButtonGroup (window)');
    });
});
});