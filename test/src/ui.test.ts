///<reference path="d.ts" />

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
        '<ui.ToggleButton .data="Toggle button" ></ui.ToggleButton></div>' +
        '<h1>Switcher</h1>' +
        '<ui.Switcher .type="apply" .data="Apply switch for {data.name}"></ui.Switcher>' +
        '<h1>Progress</h1>' +
        '<ui.Progress .value=".5"></ui.Progress>' +
        '<h1>Slider {data.slider|sliderValue}</h1>' +
        '<ui.HSlider .model="{model}" .out.value="model.data.slider" .value="{model.data.slider}" .state.step=".01"></ui.HSlider>' +
        '<h1>Input</h1>' +
        '<ui.Input .model="{model}" .out.value="model.data.name|addRest" .value="{model.data.name|removeRest}" .state.placeholder="{data.placeholder}"></ui.Input>' +
        '<h1>Group {data.selectedAge}</h1>' +
        '<h1>Group {model.data.selectedAge}</h1>' +
        '<ui.Group .state.multiple="true"  ' +
        ' .data="{model.data.age}" ' +
        ' .out.value="data.selectedAge" ' +
        ' .value="{model.data.selectedAge}" ></ui.Group>' +
        '<ui.Group  .data="{data.age}" ></ui.Group>' +

        '</div>',
    };

    var model = new fmvc.Model<any>('model');
    model.data = {
        name: 'Vasily',
        placeholder: 'Name',
        slider: .5,
        age: [1, 2, 3, 4, 5],
        selectedAge: [1, 3, 5],
        selectedAges: []
    };

    setTimeout(function() {
        model.changes = { selectedAge: [1,2,3]};
    }, 1000);

    ft.load(TestClassDef);

    var instance:ft.TemplateView = ft.createInstance('ui.Test', 'ui.Test-1');
    instance.model = model;


    instance['addRest'] = (value)=>{
        return value.indexOf('...') === value.length - 3 ? value : value + '...';
    };
    instance['removeRest'] = (value)=>{
        return value.indexOf('...') === value.length - 3 ? value.substring(0, value.length - 3) : value;
    };

    instance['sliderValue'] = (value)=>{
        return 20 + Math.round(value*50);
    };


    instance.render(document.getElementById('container'));
});



