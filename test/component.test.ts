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


    var templateObjs = [
        {
            className: "ft.Text",
            content: '<div class="button">{data?data.title:""}</div>',
        },
        {
            className: "ft.Li",
            content: '<li>data {data.title}</li>',
        },

        {
            className: "ft.Button",
            content: '<div .base="button" .stateHandlers="hover,selected" onaction="buttonClick"  class="{state.base} {state.base}-{state.life} {state.base}-{state.selected} {state.base}-{state.hover} {state.base}-{state.disabled}">{data&&(typeof data === "object")&&("title" in data)?data.title:(data?data:"")}</div>',
        },
        {
            className: "ft.NumberButton",
            content: '<div .base="button" .stateHandlers="hover" class="{state.base} {state.base}-{state.selected} {state.base}-{state.hover} {state.base}-{state.disabled}">{data}</div>',
        },
        {
            className: "ft.ButtonGroup",
            content: '<div .base="buttonGroup" children.data={data} class="{state.base}"  children.class="ft.Button" children.stateHandlers="hover" ></div>',
        },
        {
            className: "ft.TestButton",
            content: '<div .stateHandlers="hover,selected" class="button button-{state.selected} button-{state.hover}">{data.title}</div>',
        },
        ui.HSliderDefinition,
        ui.InputDefinition,
        {
            className: "ft.Progress",
            content: '<div .base="progress" .value="0" class="{state.base}"><div class="{state.base}-bg" style="width:{(state.value*100)}%"></div></div>',
        },
        {
            className: 'ft.TestSlider',
            content: '<div>' +
            '<h1>Slider content</h1>' +
            '<ft.Button .data="The button text"></ft.Button>' +
            '<ui.HSlider></ui.HSlider>' +
            '<h4>{data.name}!</h4>'+
            '<ui.Input .bindout.value="data.name" .value="{data.name}" .state.placeholder="{data.placeholder}"></ui.Input>' +
            '<ui.Input .bindout.value="data.name" .value="{data.name}" .state.placeholder="{data.placeholder}"></ui.Input>' +
            '<ul children.data="{data.children}" children.class="ft.Li"/>'
/*
            '<div .data="{data.children}"' +
        ' children.selected="{(child.model!==data.selectedItem)}" ' +
        ' children.class="ft.Button" children.onaction="selectItemFirst" children.disabled="{data.childrenDisabled}"></div>' +
            '<div>'*/,
            action: 'create'
        },
    ];


    var tm:ft.ITemplateManager = ft.templateManager;
    var app = new fmvc.Facade('testapp', null, document.body);
    var model = new fmvc.Model<IAppData>('scope');
    model.data = {
        name: 'Vasily 1',
        placeholder: 'hello dolly',
        selected: null,
        childrenDisabled: false,
        children: null,
        reset: buttonReset,
        mouseX: 0,
        mouseY: 0,
        count: [0,5, 10,50,100,200,500,1000,2000],
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

        //console.log('Updated model ... ', model);
    }
    updateChildrenCount(model.data.countItemSelected);

    //model.changes = {selectedItem: model.data.children[2]};

    var interval:number;
    var intervalUpdate = function (value:number) {
        clearInterval(interval);
        if (value === 0) return;
        interval = setInterval(function () {
            _.each(model.data.children, (m, v)=>{
                if(!model.disposed) {
                    model.data.children[v].data = {title: Math.round(Math.random() * 100), action: Math.random()};
                    //console.log('Model data ', v, model.data.children[v].data);
                }
            });
        }, value);
    };

    setTimeout(()=>intervalUpdate(1000), 10);

    console.log('---Setdata ', model.d.selectedItem);


    describe('ft - ButtonGroup/DataButton', function () {
        _.each(templateObjs, function (obj:ITemplateTestObject, index:number) {
            var key = obj.className;

            it('should create instances ' + key, function () {
                this.timeout(5000);
                tm.createClass(key, obj.content, obj.params, obj.mixin);

                var params:any = {setStates: obj.states};
                var instance:ft.ITemplateView = null;
                if (obj.action === 'create') {
                    instance = tm.createInstance(key, 'view-' + key, params);
                    //_.each(obj.mixin, (v, k)=>instance[k] = v);
                    instance.setModel(model);
                    /*
                    instance.logMouseMove = function (e:fmvc.IEvent) {
                        //console.log('Args: ', arguments);
                        instance.model.changes = {mouseX: e.data.clientX, mouseY: e.data.clientY};
                    };

                    instance.afterEnter = function () {
                        console.log('After enter', this.name);
                        //this.globalEmitter.on('mousemove', this.logMouseMove, this);
                        this.globalPointer.bind(this, this.logMouseMove);

                    };

                    */
                    //model.changes = { children: buttonsDs };
                    //model.bind(instance, instance.invalidateApp);
                    mediator.addView(instance);

                    var s = new Date().getTime();
                    for(var z = 0; z < 100; z++) {
                        var zi = tm.createInstance(key, 'view-' + key + z, params);
                        zi.setModel(model);
                    }
                    var e = new Date().getTime();
                    console.log('Create 10000 zi ', key, e-s );

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