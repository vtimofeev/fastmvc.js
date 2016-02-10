///<reference path="../../src/d.ts/mocha/mocha.d.ts" />
///<reference path="../../../DefinitelyTyped/chai/chai.d.ts" />
///<reference path="../../src/fmvc/d.ts" />
///<reference path="../../src/ft/d.ts" />

declare var ui;
ft.load( _.values(ui.def).filter((v)=>!!v&&v.className) );

describe('ui', ()=> {
    var TestClassDef = {
        className: 'ui.Test',
        content: '<div>' +
            '<h1>Button</h1>' +
            '<ui.Button .data="The button text" ></ui.Button>' +
            '<ui.Button .base="button-apply" .data="Apply button for {data.name}" ></ui.Button>' +
            '<ui.ToggleButton .data="Toggle button" ></ui.ToggleButton>' +
            '<h1>Slider</h1>' +
            '<ui.HSlider></ui.HSlider>' +
            '<h1>Input</h1>' +
            '<ui.Input .bindout.value="data.name" .value="{data.name}" .state.placeholder="{data.placeholder}"></ui.Input>' +
            '<h1>Group</h1>' +
            '<ui.Group .data="{data.age}"></ui.Group>' +
        '</div>',
    };

    var model = new fmvc.Model<any>('model');
    model.data = {
        name: 'Vasily',
        placeholder: 'Name',
        age: [1, 2, 3, 4, 5]

    };

    ft.load(TestClassDef);

    var instance:ft.TemplateView = ft.createInstance('ui.Test', 'ui.Test-1');
    instance.model = model;
    instance.render(document.getElementById('container'));
});



