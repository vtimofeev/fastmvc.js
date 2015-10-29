///<reference path="../src/d.ts/mocha/mocha.d.ts" />
///<reference path="../../DefinitelyTyped/chai/chai.d.ts" />
///<reference path="../src/fmvc/d.ts" />
///<reference path="../src/ft/d.ts" />

var expect = chai.expect;
var assert = <chai.Assert> chai.assert;

interface ITemplateTestObject {
    className:string, content:string; result:string, mixin:any, data?:any, states?:any, action?:string
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

    buttonsDs = _.map(_.range(100), (v)=> {
        return {title: v + ' - ' + Math.random(), action: Math.random()};
    });
    buttonsDs2 = _.map(_.range(100), (v)=> {
        return {title: v + ' - ' + Math.random(), action: Math.random()};
    });


    var buttonReset = {title: 'Очистить (локальный)', action: 'actionReset'};
    var interval:number;
    var intervalUpdate = function (value:number) {
        clearInterval(interval);
        if (value === 0) return;
        interval = setInterval(function () {
            _.each(model.data.children, (m, v)=>{
                if(!model.disposed) model.data.children[v].data = {title: Math.round(Math.random() * 100), action: Math.random()}
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
             '<div children.data="{data.count}" children.class="ft.NumberButton" children.selected="{(child.data!==data.countItemSelected)}" children.onaction="countSelected"></div>'+


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
                        this.model.changes = {childrenDisabled: !this.model.data.childrenDisabled};
                        //this.invalidateData();
                        //console.log('On toggle this children disabled: ', this.model.data.childrenDisabled);
                    }
                    else if (name === 'selectItemFirst') {
                        this.model.changes = {selectedItem: e.target.model};
                    }
                    else if (name === 'update0') intervalUpdate(0);
                    else if (name === 'update50') intervalUpdate(50);
                    else if (name === 'update100') intervalUpdate(100);
                    else if (name === 'update1000') intervalUpdate(1000);
                    else if (name === 'update10000') intervalUpdate(10000);
                    else if (name === 'countSelected') {
                        this.model.changes = {countItemSelected:  e.target.data};
                        //this.invalidateApp();
                        updateChildrenCount(e.target.data)
                    }


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


    ];


    var tm:ft.ITemplateManager = ft.templateManager;
    var app = new fmvc.Facade('testapp', null, document.body);
    var model = new fmvc.Model<IAppData>('scope');
    model.data = {
        selected: null,
        childrenDisabled: false, children: null,
        reset: buttonReset,
        mouseX: 0,
        mouseY: 0,
        count: [0, 10,50,100,200,500,1000],
        countItemSelected: 10
    };

    var mediator = new fmvc.Mediator('appmed', document.body);
    app.register(model, mediator);

    function updateChildrenCount(value) {
        model.changes = {
            children: _.map(
                _.range(value),
                (v)=> {
                    return new fmvc.Model('data-' + v, {title: Math.round(Math.random() * 100), action: Math.random()});
                }
            )
        };
    }
    updateChildrenCount(model.data.countItemSelected);

    //model.changes = {selectedItem: model.data.children[2]};
    intervalUpdate(1000);
    console.log('---Setdata ', model.d.selectedItem);


    describe('ft - ButtonGroup/DataButton', function () {
        _.each(templateObjs, function (obj:ITemplateTestObject, index:number) {
            var key = obj.className;

            it('should create instances ' + key, function () {
                tm.createClass(key, obj.content, null, null);
                //var params:any = {setStates: obj.states};
                var instance:ft.ITemplateView = null;
                if (obj.action === 'create') {
                    instance = tm.createInstance(key, 'view-' + key, params);
                    _.each(obj.mixin, (v, k)=>instance[k] = v);
                    instance.setModel(model);
                    instance.logMouseMove = function (e:fmvc.IEvent) {
                        //console.log('Args: ', arguments);
                        instance.model.changes = {mouseX: e.data.clientX, mouseY: e.data.clientY};
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