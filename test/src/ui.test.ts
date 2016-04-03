///<reference path="../../src/d.ts/mocha/mocha.d.ts" />
///<reference path="../../../DefinitelyTyped/chai/chai.d.ts" />
///<reference path="../../src/fmvc/d.ts" />
///<reference path="../../src/ft/d.ts" />

declare var ui;
ft.load(_.values(ui.def).filter((v)=>!!v && v.className));

describe('ui', ()=> {
    var TestClassDef = {
        className: 'ui.Test',
        content: '<div>' +
        '<h1>Buttons</h1>' +
        '<div class="round-hgroup"><ui.Button .data="The button text" ></ui.Button>' +
        '<ui.Button .type="apply" .data="Apply button for {data.name}" ></ui.Button>' +
        '<ui.ToggleButton .type="apply" .data="Apply toggle button for {data.name}" ></ui.ToggleButton>' +
        '<ui.Checkbox .type="apply" .data="Apply checkbox for {data.name}"></ui.Checkbox>' +
        '<ui.Radio .type="apply" .data="Apply checkbox for {data.name}"></ui.Radio>' +
        '<ui.Switch .type="apply" .data="Apply switch for {data.name}"></ui.Switch>' +
        '<ui.ToggleButton .data="Toggle button" ></ui.ToggleButton></div>' +
        '<h1>Progress</h1>' +
        '<ui.Progress .value=".5"></ui.Progress>' +
        '<h1>Slider</h1>' +
        '<ui.HSlider .value=".1" .state.step=".2"></ui.HSlider>' +
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



