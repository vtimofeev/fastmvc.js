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
    buttonsDs = _.map(_.range(100), function (v) {
        return { title: v + ' - ' + Math.random(), action: Math.random() };
    });
    buttonsDs2 = _.map(_.range(100), function (v) {
        return { title: v + ' - ' + Math.random(), action: Math.random() };
    });
    var buttonReset = { title: 'Очистить (локальный)', action: 'actionReset' };
    var interval;
    var intervalUpdate = function (value) {
        clearInterval(interval);
        if (value === 0)
            return;
        interval = setInterval(function () {
            _.each(model.data.children, function (m, v) {
                if (!model.disposed)
                    model.data.children[v].data = { title: Math.round(Math.random() * 100), action: Math.random() };
            });
        }, value);
    };
    var templateObjs = [
        {
            className: "ft.Button",
            content: '<div .base="button" .stateHandlers="hover,selected" onaction="buttonClick"  class="{state.base} {state.base}-{state.life} {state.base}-{state.selected} {state.base}-{state.hover} {state.base}-{state.disabled}">{(data&&(\"title\" in data)?data.title:data?data:\"\")}</div>',
        },
        {
            className: "ft.NumberButton",
            content: '<div .base="button" .stateHandlers="hover" class="{state.base} {state.base}-{state.selected} {state.base}-{state.hover} {state.base}-{state.disabled}">{data}</div>',
        },
        {
            className: "ft.ButtonGroup",
            content: '<div .base="buttonGroup" children.data={data} class="{state.base}"  children.class="ft.Button" children.stateHandlers="hover"></div>',
        },
        ui.HSliderDefinition,
        {
            className: "ft.Progress",
            content: '<div .base="progress" .value="0" class="{state.base}"><div class="{state.base}-bg" style="width:{(state.value*100)}%"></div></div>',
        },
        {
            className: "ft.Component",
            content: '<div .base="COMPONENT">' +
                '<h1>First component, global mouse {data.mouseX} {data.mouseY} </h1>' +
                '<h2>First component, global mouse {data.mouseX} {data.mouseY} </h2>' +
                '<h3>First component, global mouse {data.mouseX} {data.mouseY} </h3>' +
                '<h4>First component, global mouse {data.mouseX} {data.mouseY} </h4>' +
                '<h1>Slider</h1>' +
                '<ui.HSlider>Slider content</ui.HSlider>' +
                '<h1>Count</h1>' +
                '<div children.data="{data.count}" children.class="ft.NumberButton" children.selected="{(child.data!==data.countItemSelected)}" children.onaction="countSelected"></div>' +
                '<h1>Updates</h1>' +
                '<ft.Button onaction="update0">Update 0</ft.Button>' +
                '<ft.Button onaction="update50">Update 50</ft.Button>' +
                '<ft.Button onaction="update100">Update 100</ft.Button>' +
                '<ft.Button onaction="update1000">Update 1 000</ft.Button>' +
                '<ft.Button onaction="update10000">Update 10 000</ft.Button>' +
                '<h1>Toggle</h1>' +
                '<ft.Button onaction="toggleGroup" .data="{app.scope.d.reset}" .createDelay="1000">Toggle group</ft.Button>' +
                '<ft.Button onaction="toggleGroup" .data="{app.scope.d.reset}" .createDelay="2000">Toggle group' +
                '<div>Ola<ft.Button .data="{data.reset}" .createDelay="4000" onaction="{alert(1)}"></ft.Button></div>' +
                '</ft.Button>' +
                '<ft.Button onaction="toggleGroup" .createDelay="3000">Toggle group</ft.Button>' +
                '<div>{data.children.length} {data.reset.title}</div>' +
                '<div .data="{data.children}"' +
                ' children.selected="{(child.model!==data.selectedItem)}" ' +
                ' children.class="ft.Button" children.onaction="selectItemFirst" children.disabled="{data.childrenDisabled}"></div>' +
                '<ft.ButtonGroup .data="{data.children}" children.createDelay="{(childIndex+1500)}" children.base="button" children.focused="anydata" children.onaction="selectItemSecond" ' +
                ' children.disabled="{data.childrenDisabled}" ' +
                ' children.selected="{(child.model!==data.selectedItem)}"></ft.ButtonGroup>' +
                '</div>',
            mixin: {
                internalHandler: function (name, e) {
                    console.log('Internal extension handler ', name);
                    if (name === 'toggleGroup') {
                        this.model.changes = { childrenDisabled: !this.model.data.childrenDisabled };
                    }
                    else if (name === 'selectItemFirst') {
                        this.model.changes = { selectedItem: e.target.model };
                    }
                    else if (name === 'update0')
                        intervalUpdate(0);
                    else if (name === 'update50')
                        intervalUpdate(50);
                    else if (name === 'update100')
                        intervalUpdate(100);
                    else if (name === 'update1000')
                        intervalUpdate(1000);
                    else if (name === 'update10000')
                        intervalUpdate(10000);
                    else if (name === 'countSelected') {
                        this.model.changes = { countItemSelected: e.target.data };
                        //this.invalidateApp();
                        updateChildrenCount(e.target.data);
                    }
                }
            },
            action: 'create'
        }
    ];
    var tm = ft.templateManager;
    var app = new fmvc.Facade('testapp', null, document.body);
    var model = new fmvc.Model('scope');
    model.data = {
        selected: null,
        childrenDisabled: false, children: null,
        reset: buttonReset,
        mouseX: 0,
        mouseY: 0,
        count: [0, 10, 50, 100, 200, 500, 1000],
        countItemSelected: 10
    };
    var mediator = new fmvc.Mediator('appmed', document.body);
    app.register(model, mediator);
    function updateChildrenCount(value) {
        model.changes = {
            children: _.map(_.range(value), function (v) {
                return new fmvc.Model('data-' + v, { title: Math.round(Math.random() * 100), action: Math.random() });
            })
        };
    }
    updateChildrenCount(model.data.countItemSelected);
    //model.changes = {selectedItem: model.data.children[2]};
    intervalUpdate(1000);
    console.log('---Setdata ', model.d.selectedItem);
    describe('ft - ButtonGroup/DataButton', function () {
        _.each(templateObjs, function (obj, index) {
            var key = obj.className;
            it('should create instances ' + key, function () {
                tm.createClass(key, obj.content, null, null);
                //var params:any = {setStates: obj.states};
                var instance = null;
                if (obj.action === 'create') {
                    instance = tm.createInstance(key, 'view-' + key, params);
                    _.each(obj.mixin, function (v, k) { return instance[k] = v; });
                    instance.setModel(model);
                    instance.logMouseMove = function (e) {
                        //console.log('Args: ', arguments);
                        instance.model.changes = { mouseX: e.data.clientX, mouseY: e.data.clientY };
                    };
                    instance.afterEnter = function () {
                        console.log('After enter', this.name);
                        //this.globalEmitter.on('mousemove', this.logMouseMove, this);
                        this.globalPointer.bind(this, this.logMouseMove);
                    };
                    //model.changes = { children: buttonsDs };
                    //model.bind(instance, instance.invalidateApp);
                    mediator.addView(instance);
                }
                console.log('Instance: ', instance);
                ///instance.render(container);
                //instance.data.children = buttonsDs2;
                //instance.invalidate(fmvc.InvalidateType.Data);
                //instance.validate();
                /*
                 instance.internalHandler = function (type, e) {
                 console.log('Dispatch internal handler execute for ', type, e);
                 if (type === 'selectedChildrenItem') {
                 model.changes = {selected: e.target.model};
                 }

                 if (type === 'reset') {
                 model.changes = {selected: null};
                 }

                 if (type === 'disable') {
                 model.changes = {disabled: true};
                 }

                 if (type === 'enable') {
                 model.changes = {disabled: false};
                 }
                 };

                 console.log('Prevalidate on data changed: ---------------------------------------------', instance);


                 instance.data.children = buttonsDs2;
                 instance.invalidate(fmvc.InvalidateType.Data);

                 console.log('Prevalidate on data changed 2: ---------------------------------------------', instance);
                 instance.validate();
                 */
            });
        });
        it('should exist component constructors', function () {
            //assert(ft.DataButton, 'should exist ft.DataButton (window)');
            //assert(ft.ButtonGroup, 'should exist ft.ButtonGroup (window)');
        });
    });
});
//# sourceMappingURL=component.test.js.map