///<reference path="../src/d.ts/mocha/mocha.d.ts" />
///<reference path="../../DefinitelyTyped/chai/chai.d.ts" />
///<reference path="../src/fmvc/d.ts" />
///<reference path="../src/ft/d.ts" />

var expect = chai.expect;
var assert = <chai.Assert> chai.assert;

interface ITemplateTestObject {
    content:string; result:string, data?:any, states?:any
}

describe('ft - component package ',function() {
    var dataSimple = 'text';
    var dataUser = {name: 'Vasily', age: 33};
    var statesDefault = {base: 'button', hover: false};
    var statesActive = {base: 'button', hover: true};
    var statesStyle = {top: 100, bottom: 200};

    var buttonsDs = [
        { title: 'One', action: 'clickOne'},
        { title: 'Two', action: 'clickTwo'}
    ];

    var buttonsDs2 = [
        { title: 'Three', action: 'clickThree'},
        { title: 'Four', action: 'clickFour'}
    ];

    var buttonReset = {title: 'dataReset', action: 'actionReset'};


    var templateObjs = {
        "ft.DataButton": {
            content: '<div onclick="selected" onmousedown="{(alert(1000);)}" class="button button-{state.selected} button-{state.hover}">{data.title}</div>',
        },
        "ft.ButtonGroup": {
            content: '<div>' +
                '<div class="button-{state.hover}" onmouseover="{console.log(\'group header over\');}">Group header</div>' +
                '<div states="{data.selected}">Selected is {data.selected.title}</div>' +
                '<div ln="childrenContainer" children.class="ft.DataButton" children.data="{data.children}"></div>' +
                '<ft.DataButton .data="{data.reset}" state.selected="{data.selected}" onclick="reset">Reset</ft.DataButton>' +
                '<ft.DataButton states="{(!this.data.selected)}">Delete visible when data.selected not null</ft.DataButton>' +
                '<div onclick="next">Select next</div>' +
                '<div onclick="prev">Select prev</div>' +
                '</div>',
            data: {children: buttonsDs, selected: buttonsDs[0], reset: buttonReset},
            action: 'create'
        },
    };

    var tm:ft.ITemplateManager = ft.templateManager;

    describe('ft - ButtonGroup/DataButton', function () {
        _.each(templateObjs, function(obj:ITemplateTestObject, key:string) {
            it('should create instances ' + key, function () {
                var CreateTemplate = tm.createTemplate(key, obj.content);
                var params:any = {setStates: obj.states, data: obj.data};
                var instance:ft.ITemplateView = null;
                var container:HTMLElement = document.getElementById('template-container');

                if(obj.action === 'create') {
                    container.innerHTML = '';
                    instance = window[key]('view-' + key, params);
                    instance.render(container);
                    //assert.strictEqual(container.innerHTML, obj.result, 'should be equal');
                }


                instance.data.children = buttonsDs2;
                instance.invalidate(fmvc.InvalidateType.Data);
                console.log('Prevalidate on data changed: ---------------------------------------------', instance);
                instance.validate();

                instance.data.children = buttonsDs2;
                instance.invalidate(fmvc.InvalidateType.Data);
                instance.internalHandler = function(type, e) {
                    if(type === 'selected') {
                        instance.data.selected = e.target.data;
                        instance.invalidate(fmvc.InvalidateType.Data);
                    }


                    if(type === 'reset') {
                      instance.data.selected = null;
                      instance.invalidate(fmvc.InvalidateType.Data);
                  }
                };
                console.log('Prevalidate on data changed 2: ---------------------------------------------', instance);
                instance.validate();
            });
        });

        it('should exist component constructors' , function() {
            assert(ft.DataButton, 'should exist ft.DataButton (window)');
            assert(ft.ButtonGroup, 'should exist ft.ButtonGroup (window)');
        });
    });
});