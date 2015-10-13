///<reference path="../src/d.ts/mocha/mocha.d.ts" />
///<reference path="../../DefinitelyTyped/chai/chai.d.ts" />
///<reference path="../src/fmvc/d.ts" />
///<reference path="../src/ft/d.ts" />

var expect = chai.expect;
var assert = <chai.Assert> chai.assert;

interface ITemplateTestObject {
    content:string; result:string, data?:any, states?:any
}

describe('ft - component package ', function () {
    var dataSimple = 'text';
    var dataUser = {name: 'Vasily', age: 34};
    var statesDefault = {base: 'button', hover: false};
    var statesActive = {base: 'button', hover: true};
    var statesStyle = {top: 100, bottom: 200};

    var buttonsDs = [
        {title: 'Один (локальный)', action: 'clickOne'},
        {title: 'Два (локальный)', action: 'clickTwo'}
    ];

    var buttonsDs2 = [
        {title: 'Три (локальный)', action: 'clickThree'},
        {title: 'Четыре (локальный)', action: 'clickFour'}
    ];

    var buttonReset = {title: 'Очистить (локальный)', action: 'actionReset'};


    var templateObjs = {
        "ft.DataButton": {
            content: '<div .stateHandlers="hover,selected" onclick="selectedChildrenItem" class="button button-{state.selected} button-{state.hover} button-{state.disabled}">{data.title}</div>',
        },

        "ft.ButtonGroup": {
            content: '<div .stateHandlers="hover" >' +
            '<div class="button-{state.hover}">Заголовок с подсветкой</div>' +

            '<ft.DataButton onclick="disable" state.disabled="{app.scope.d.disabled}">Disable children</ft.DataButton>' +
            '<ft.DataButton onclick="enable" state.disabled="{(!app.scope.d.disabled)}">Enable children</ft.DataButton>' +

            '<div states="{app.scope.d.selected}">Выбран элемент {app.scope.d.selected.title}</div>' +
            '<div states="{(!app.scope.d.selected)}">Нет выбранного элемнта (глобальный-кнопка)</div>' +

            '<ft.DataButton states="{app.scope.d.selected}" .data="{app.scope.d.selected}"> Выбран узел (глобальный) </ft.DataButton>' +
            '<ft.DataButton states="{(!app.scope.d.selected)}" .data="{app.scope.d.reset}"> Нет узла (глобальный) </ft.DataButton>' +

            '<div ln="childrenContainer" children.stateHandlers="hover" children.state.selected="{(ctx.data===app.scope.d.selected)}" children.state.disabled="{app.scope.d.disabled}" children.class="ft.DataButton" children.data="{app.scope.d.children}">' +
            '</div>' +
            '<ft.DataButton .stateHandlers="hover" .data="{app.scope.d.reset}" state.disabled="{app.scope.d.disabled}" state.selected="{app.scope.d.selected}" onclick="reset"> Очистить (глобальный) </ft.DataButton>' +

            '</div>',

            data: {disabled: false, children: buttonsDs, selected: buttonsDs[0], reset: buttonReset},
            action: 'create'
        },
    };

    var tm:ft.ITemplateManager = ft.templateManager;
    var app = new fmvc.Facade('testapp', null, document.body);
    var model = new fmvc.Model('scope');
    model.data = { selected: null, disabled: false, children: buttonsDs2, reset: buttonReset };
    var mediator = new fmvc.Mediator('appmed', document.body);
    
    app.register(model, mediator);

    describe('ft - ButtonGroup/DataButton', function () {
        _.each(templateObjs, function (obj:ITemplateTestObject, key:string) {

            

            it('should create instances ' + key, function () {
                var CreateTemplate = tm.createTemplate(key, obj.content);
                var params:any = {setStates: obj.states};
                var instance:ft.ITemplateView = null;
                var container:HTMLElement = document.getElementById('template-container');
                if (obj.action === 'create') {
                    container.innerHTML = '';
                    instance = window[key]('view-' + key, params);
                }

                mediator.addView(instance);
                model.data = { children: buttonsDs };
                model.bind(instance, instance.invalidateApp);
                instance.internalHandler = function (type, e) {
                    console.log('Dispatch internal handler execute for ', type, e);
                    if (type === 'selectedChildrenItem') {
                        model.data = {selected: e.target.data};
                        instance.invalidate(fmvc.InvalidateType.Data);
                    }

                    if (type === 'reset') {
                        model.data = {selected: null};
                        instance.invalidate(fmvc.InvalidateType.Data);
                    }

                    if (type === 'disable') {
                        model.data = {disabled: true};
                        instance.invalidate(fmvc.InvalidateType.Data);
                    }

                    if (type === 'enable') {
                        model.data = {disabled: false};
                        instance.invalidate(fmvc.InvalidateType.Data);
                    }

                };

                ///instance.render(container);

                //instance.data.children = buttonsDs2;
                //instance.invalidate(fmvc.InvalidateType.Data);

                //instance.validate();
                /*
                console.log('Prevalidate on data changed: ---------------------------------------------', instance);


                instance.data.children = buttonsDs2;
                instance.invalidate(fmvc.InvalidateType.Data);

                console.log('Prevalidate on data changed 2: ---------------------------------------------', instance);
                instance.validate();
                */
            });

        });

        it('should exist component constructors', function () {
            assert(ft.DataButton, 'should exist ft.DataButton (window)');
            assert(ft.ButtonGroup, 'should exist ft.ButtonGroup (window)');
        });
    });
});