///<reference path="../src/d.ts/mocha/mocha.d.ts" />
///<reference path="../../DefinitelyTyped/chai/chai.d.ts" />
///<reference path="../src/fmvc/d.ts" />
///<reference path="../src/ft/d.ts" />

var expect = chai.expect;
var assert = <chai.Assert> chai.assert;

interface ITemplateTestObject {
    content:string; result:string, data?:any, states?:any, action?:string
}

interface IAppData {
    disabled:boolean;
    children:any[];
    selected:any;
    reset:any
}



describe('ft - component package ', function () {
    var dataSimple = 'text';
    var dataUser = {name: 'Vasily', age: 34};
    var statesDefault = {base: 'button', hover: false};
    var statesActive = {base: 'button', hover: true};
    var statesStyle = {top: 100, bottom: 200};

    var buttonsDs:any[] = [
        {title: 'Один (локальный)', action: 'clickOne'},
        {title: 'Два (локальный)', action: 'clickTwo'}
    ];


    var buttonsDs2:any[] = [
        {title: 'Три (локальный)', action: 'clickThree'},
        {title: 'Четыре (локальный)', action: 'clickFour'}
    ];

    buttonsDs = _.map(_.range(100), (v)=>{return {title: v + ' - ' + Math.random(), action: Math.random()};});
    buttonsDs2 = _.map(_.range(100), (v)=>{return {title: v + ' - ' + Math.random(), action: Math.random()};});


    var buttonReset = {title: 'Очистить (локальный)', action: 'actionReset'};


    var templateObjs = {
        "ft.Button": {
            content: '<div .base="button" .stateHandlers="hover,selected" onclick="buttonClick"  class="{state.base} {state.base}-{state.life} {state.base}-{state.selected} {state.base}-{state.hover} {state.base}-{state.disabled}">{(data&&data.title?data.title:data?data:\"\")}</div>',
        },
        "ft.ButtonGroup": {
            content: '<div .base="buttonGroup" class="{state.base}"  children.class="ft.Button" children.stateHandlers="hover"></div>',
        },
        "ft.Progress": {
            content:'<div .base="progress" .value="0" class="{state.base}"><div class="{state.base}-bg" style="width:{(state.value*100)}%"></div></div>',
        },
        "ft.Component": {
            content: '<div>' +
            '<h1>First component</h1>' +
            '<ft.Button onclick="toggleGroup" .createDelay="1000">Toggle group</ft.Button>' +
            '<ft.Button onclick="toggleGroup" .createDelay="2000">Toggle group</ft.Button>' +
            '<ft.Button onclick="toggleGroup" .createDelay="3000">Toggle group</ft.Button>' +
            '<div>ahaha</div>' +
            '<div .data="{data.children}"' +
            ' children.selected="{(child.model!==app.scope.d.selectedItem)}" ' +
            ' children.class="ft.Button" children.onclick="selectItem2" children.disabled="{data.childrenDisabled}"></div>' +

            '<ft.ButtonGroup .data="{app.scope.d.children}" children.createDelay="{(childIndex+1500)}" children.base="button" children.focused="anydata" children.onclick="selectItem" ' +
                ' children.disabled="{data.childrenDisabled}" ' +
                ' children.selected="{(child.model===app.scope.d.selectedItem)}"></ft.ButtonGroup>' +
            '</div>',

            extends: {
                internalHandler: function(name, e) {
                    console.log('Internal extension handler ', name);
                    if(name === 'toggleGroup') {
                        this.model.changes = { childrenDisabled: !this.model.data.childrenDisabled };
                        this.invalidateData();
                        console.log('On toggle this children disabled: ', this.model.data.childrenDisabled);
                    }
                    if(name === 'selectItem') this.model.changes = { selectedItem: e.target.model };
                }

            },
            action: 'create'
        }

            /*
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
        "ft.SampleComponent": {
            content: '<div .stateHandlers="hover" >' +
            '<div class="button-{state.hover}" children.class="ft.DataButton" children.data="{app.scope.d.children}"  children.stateHandlers="hover">Заголовок с подсветкой</div>' +

            '<ft.DataButton onclick="disable" state.disabled="{app.scope.d.disabled}">Disable children</ft.DataButton>' +
            '<ft.DataButton onclick="enable" state.disabled="{(!app.scope.d.disabled)}">Enable children</ft.DataButton>' +

            '<div states="{app.scope.d.selected}">Выбран элемент {app.scope.d.selected.d.title}</div>' +
            '<div states="{(!app.scope.d.selected)}">Нет выбранного элемнта (глобальный-кнопка)</div>' +

            '<ft.DataButton states="{app.scope.d.selected}" .model="{app.scope.d.selected}"> Выбран узел (глобальный) </ft.DataButton>' +
            '<ft.DataButton states="{(!app.scope.d.selected)}" .data="{app.scope.d.reset}"> Нет узла (глобальный) </ft.DataButton>' +

            '<div ln="childrenContainer" children.redispatchHandlers="mouseover,mouseout" children.stateHandlers="hover" children.state.selected="{(ctx.model===app.scope.d.selected)}" children.state.disabled="{app.scope.d.disabled}" children.class="ft.DataButton" children.data="{app.scope.d.children}">' +
            '</div>' +
            '<ft.DataButton .stateHandlers="hover" .data="{app.scope.d.reset}" state.disabled="{app.scope.d.disabled}" state.selected="{app.scope.d.selected}" onclick="reset"> Очистить (глобальный) </ft.DataButton>' +

            '</div>',
            data: {disabled: false, children: buttonsDs, selected: buttonsDs[0], reset: buttonReset},
            action: 'create'

        }
             */


    };

    var tm:ft.ITemplateManager = ft.templateManager;
    var app = new fmvc.Facade('testapp', null, document.body);
    var model = new fmvc.Model<IAppData>('scope');
    model.data = {selected: null, childrenDisabled: false, children: null, reset: buttonReset };

    var mediator = new fmvc.Mediator('appmed', document.body);
    app.register(model, mediator);

    model.changes = {children: _.map(
        _.range(5),
        (v)=>{return new fmvc.Model('data-' + v, {title:  Math.round(Math.random()*100), action: Math.random()});}
    )};

    setInterval(function() {
        _.each(model.data.children, (m,v)=>{
            try {
                //model.data.children[v].data = {title:  Math.round(Math.random() * 100), action: Math.random()}
            }
            catch(e) {
                console.log(v);
            }
        });
    }, 1e10);

    model.changes = {selectedItem: model.data.children[2]};
    console.log('---Setdata ', model.d.selectedItem);

    describe('ft - ButtonGroup/DataButton', function () {
        _.each(templateObjs, function (obj:ITemplateTestObject, key:string) {

            

            it('should create instances ' + key, function () {
                var CreateTemplate = tm.createTemplate(key, obj.content);
                var params:any = {setStates: obj.states};
                var instance:ft.ITemplateView = null;
                if (obj.action === 'create') {
                    //var container:HTMLElement = document.getElementById('template-container');
                    //container.innerHTML = '';
                    instance = window[key]('view-' + key, params);
                    instance.setModel(model);
                    //model.changes = { children: buttonsDs };
                    //model.bind(instance, instance.invalidateApp);
                    mediator.addView(instance);
                    _.each(obj.extends, (v,k)=>instance[k] = v);
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
            assert(ft.DataButton, 'should exist ft.DataButton (window)');
            assert(ft.ButtonGroup, 'should exist ft.ButtonGroup (window)');
        });
    });
});