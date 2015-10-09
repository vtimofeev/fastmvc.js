///<reference path="../src/d.ts/mocha/mocha.d.ts" />
///<reference path="../../DefinitelyTyped/chai/chai.d.ts" />
///<reference path="../src/fmvc/d.ts" />
///<reference path="../src/ft/d.ts" />
var expect = chai.expect;
var assert = chai.assert;
describe('ft - component package ', function () {
    var dataSimple = 'text';
    var dataUser = { name: 'Vasily', age: 34 };
    var statesDefault = { base: 'button', hover: false };
    var statesActive = { base: 'button', hover: true };
    var statesStyle = { top: 100, bottom: 200 };
    var buttonsDs = [
        { title: 'Один (локальный)', action: 'clickOne' },
        { title: 'Два (локальный)', action: 'clickTwo' }
    ];
    var buttonsDs2 = [
        { title: 'Три (локальный)', action: 'clickThree' },
        { title: 'Четыре (локальный)', action: 'clickFour' }
    ];
    var buttonReset = { title: 'Очистить (локальный)', action: 'actionReset' };
    var templateObjs = {
        "ft.DataButton": {
            content: '<div .stateHandlers="hover,selected" onclick="selected" class="button button-{state.selected} button-{state.hover} button-{state.disabled}">{data.title}</div>',
        },
        "ft.ButtonGroup": {
            content: '<div .stateHandlers="hover" >' +
                '<div class="button-{state.hover}">Заголовок с подсветкой</div>' +
                '<ft.DataButton onclick="disable" state.disabled="{data.disabled}">Disable children</ft.DataButton>' +
                '<ft.DataButton onclick="enable" state.disabled="{(!data.disabled)}">Enable children</ft.DataButton>' +
                '<div states="{data.selected}">Выбран элемент {data.selected.title}</div>' +
                '<div states="{(!data.selected)}">Нет выбранного элемнта (глобальный-кнопка)</div>' +
                '<ft.DataButton states="{data.selected}" .data="{data.selected}"> Выбран узел (глобальный) </ft.DataButton>' +
                '<ft.DataButton states="{(!data.selected)}" .data="{data.reset}"> Нет узла (глобальный) </ft.DataButton>' +
                '<div ln="childrenContainer" children.stateHandlers="hover" children.state.selected="{(ctx.data===data.selected)}" children.state.disabled="{data.disabled}" children.class="ft.DataButton" children.data="{data.children}">' +
                '</div>' +
                '<ft.DataButton .stateHandlers="hover" .data="{data.reset}" state.disabled="{data.disabled}" state.selected="{data.selected}" onclick="reset"> Очистить (глобальный) </ft.DataButton>' +
                '</div>',
            data: { disabled: false, children: buttonsDs, selected: buttonsDs[0], reset: buttonReset },
            action: 'create'
        },
    };
    var tm = ft.templateManager;
    describe('ft - ButtonGroup/DataButton', function () {
        _.each(templateObjs, function (obj, key) {
            it('should create instances ' + key, function () {
                var CreateTemplate = tm.createTemplate(key, obj.content);
                var params = { setStates: obj.states, data: obj.data };
                var instance = null;
                var container = document.getElementById('template-container');
                if (obj.action === 'create') {
                    container.innerHTML = '';
                    instance = window[key]('view-' + key, params);
                    instance.render(container);
                }
                instance.data.children = buttonsDs2;
                instance.invalidate(fmvc.InvalidateType.Data);
                console.log('Prevalidate on data changed: ---------------------------------------------', instance);
                instance.validate();
                instance.data.children = buttonsDs2;
                instance.invalidate(fmvc.InvalidateType.Data);
                instance.internalHandler = function (type, e) {
                    console.log('Dispatch internal handler execute for ', type, e);
                    if (type === 'selected') {
                        instance.data.selected = e.target.data;
                        instance.invalidate(fmvc.InvalidateType.Data);
                    }
                    if (type === 'reset') {
                        instance.data.selected = null;
                        instance.invalidate(fmvc.InvalidateType.Data);
                    }
                    if (type === 'disable') {
                        instance.data.disabled = true;
                        instance.invalidate(fmvc.InvalidateType.Data);
                    }
                    if (type === 'enable') {
                        instance.data.disabled = false;
                        instance.invalidate(fmvc.InvalidateType.Data);
                    }
                };
                console.log('Prevalidate on data changed 2: ---------------------------------------------', instance);
                instance.validate();
            });
        });
        it('should exist component constructors', function () {
            assert(ft.DataButton, 'should exist ft.DataButton (window)');
            assert(ft.ButtonGroup, 'should exist ft.ButtonGroup (window)');
        });
    });
});
//# sourceMappingURL=component.test.js.map