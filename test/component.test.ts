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

    var templateObjs = {
        "ft.DataButton": {
            content: '<div onclick="{(this.sendEvent(this.data);)}" class="button button-{state.selected} button-{state.hover}">{data.title}</div>',
        },
        "ft.ButtonGroup": {
            content: '<div childrenClass="ft.DataButton" childrenData="{data.children}">' +
                '<div>Group header</div>' +
                '<div states="{data.selected}">Selected is {data.selected.title}</div>' +
                '<div ln="childrenContainer"></div>' +
                '<ft.DataButton onclick="reset">Reset</ft.DataButton>' +
                '<div onclick="next">Select next</div>' +
                '<div onclick="prev">Select prev</div>' +
                '</div>',
            data: {children: buttonsDs, selected: null},
            action: 'create'
        },
    };

    var tm:ft.ITemplateManager = ft.templateManager;

    describe('ft - ButtonGroup/DataButton', function () {
        _.each(templateObjs, function(obj:ITemplateTestObject, key:string) {
            it('should create instances ' + key, function () {
                var CreateTemplate = tm.createTemplate(key, obj.content);
                var params = {setStates: obj.states, data: obj.data};

                if(obj.action === 'create') window[key]('view-' + key, params);

                var container = document.getElementById('template-container');
                container.innerHTML = '';
                inst.render(container);
                assert.strictEqual(container.innerHTML, obj.result, 'should be equal');

            });
        });
    });
});