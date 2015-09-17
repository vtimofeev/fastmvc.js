///<reference path="../src/d.ts/mocha/mocha.d.ts" />
///<reference path="../../DefinitelyTyped/chai/chai.d.ts" />
///<reference path="../src/fmvc/d.ts" />
///<reference path="../src/ft/d.ts" />
var expect = chai.expect;
var assert = chai.assert;
describe('ft - template package ', function () {
    var simpleName = 'template-simple';
    var dataName = 'template-data';
    var stateName = 'template-state';
    var simpleTemplate = document.getElementById(simpleName).innerHTML;
    var dataTemplate = document.getElementById(dataName).innerHTML;
    var complexTemplate = document.getElementById(stateName).innerHTML;
    var dataSimple = 'text';
    var dataUser = { name: 'Vasily', age: 33 };
    var statesDefault = { base: 'button', hover: false };
    var statesActive = { base: 'button', hover: true };
    var statesStyle = { top: 100, bottom: 200 };
    var templateObjs = {
        simpleTemplate: {
            content: '<div id="id1" data-a="a" data-b="b">text</div>',
            result: '<div id="id1" data-a="a" data-b="b">text</div>'
        },
        flatDataTemplate: {
            content: '<div>{data}</div>', data: dataSimple,
            result: '<div>text</div>'
        },
        complexDataTemplate: {
            content: '<div>Hello [{data.name}-{data.age}] {(data.age>30?"old man":"young man")}! Now <b>{data.name} became SUPERMAN!</b></div>', data: dataUser,
            result: '<div>Hello [Vasily-33] old man! Now <b>Vasily became SUPERMAN!</b></div>'
        },
        staticClassTemplate: {
            content: '<div class="base base-hover"></div>',
            result: '<div class="base base-hover"></div>'
        },
        dynamicClassTemplate: {
            content: '<div class="base base-hover {state.base} {state.base}-{state.hover}"></div>', states: statesDefault,
            result: '<div class="base base-hover button"></div>'
        },
        dynamicActiveClassTemplate: {
            content: '<div class="base base-hover {state.base} {state.base}-{state.hover}"></div>', states: statesActive,
            result: '<div class="base base-hover button button-hover"></div>'
        },
        staticStyleTemplate: {
            content: '<div style="top:0px;bottom:0px;position: absolute;"></div>',
            result: '<div style="top: 0px; bottom: 0px; position: absolute;"></div>'
        },
        dynamicStyleTemplate: {
            content: '<div style="top:{state.top}px;bottom:{state.bottom}px;position: absolute;"></div>', states: statesStyle,
            result: '<div style="top: 100px; bottom: 200px; position: absolute;"></div>'
        },
        complexTemplate: {
            content: '<div class="base base-hover {state.base} {state.base}-{state.hover}" style="top:{state.top}px;bottom:{state.bottom}px;position: absolute;">Hello [{data.name}-{data.age}] <span><![CDATA[{(data.age>30?"old a man":"young a man")}!]]></span> Now <b>{data.name} became SUPERMAN!</b></div>',
            states: _.extend(statesStyle, statesActive),
            data: dataUser,
            result: '<div class="base base-hover button button-hover" style="top: 100px; bottom: 200px; position: absolute;">Hello [Vasily-33] <span>old a man!</span> Now <b>Vasily became SUPERMAN!</b></div>'
        },
    };
    var templateHandlerObjs = {
        simpleHandlerTemplate: {
            content: '<div onclick="{var a=1; alert(a + \'click\');}">' +
                '<div onclick="{alert(\'first\');}"><div onclick="logByClick">The click div!</div></div>' +
                '</div>',
            result: '<div>Click!</div>'
        },
    };
    var tm = ft.templateManager;
    /*
    var statesTmpl:string = '<div title="hello" value="{state.hover}" class="component {state.base} {state.base}-{state.hover} component-{state.hover}" style="top: {state.top}px; bottom: {state.bottom}px">{(state.hover?"hovered":"not hovered")}</div>';
    */
    describe('template view parser', function () {
        it('should create dom', function () {
            var parser = new ft.TemplateParser();
            var result = parser.parseHtml('<div class="button" style="top:0px;">Content</div>');
            var rootData = result[0];
            assert(rootData, 'should be result');
            assert(rootData.name === 'div', 'should be div');
        });
    });
    describe('expression', function () {
        var expression = new ft.Expression();
        var t0 = '{data.name}';
        var t1 = '{(data.name>10?"exist":"not")}';
        var t2 = '{ ( data.name>10?"exist":"not" ) as Exist, data.age as Age | i18n.formatter } text {data.age}';
        var t3 = '{state.hover}';
        var t4 = '{(state.hover?100:0)}';
        var ex0 = expression.strToExpression(t0);
        var ex1 = expression.strToExpression(t1);
        var ex2 = expression.strToExpression(t2);
        var ex3 = expression.strToExpression(t3);
        var ex4 = expression.strToExpression(t4);
        var map = _.reduce([ex0, ex1, ex2, ex3, ex4], function (m, v) { return (m[v.name] = v, m); }, {});
        it('string parser', function () {
            console.log('ex0', JSON.stringify(ex0));
            assert(ex0, 'should be');
            assert(ex0.expressions[0] === 'data.name', 'should be data.name');
            var t1Result = '(this.data.name>10?"exist":"not")';
            var ex1 = expression.strToExpression(t1);
            console.log('ex1', JSON.stringify(ex1));
            assert(ex1, 'should be');
            assert.strictEqual(ex1.expressions[0], t1Result, 'should be ' + t1Result);
            var t2ResultExist = '( this.data.name>10?"exist":"not" )';
            var t2ResultFilter = 'i18n.formatter';
            var t2Result2 = 'data.age';
            console.log('ex2', ex2);
            assert(ex2.expressions[0].filters[0] === t2ResultFilter, 'Filter must be ' + t2ResultFilter);
            assert(ex2.expressions[0].args.Exist === t2ResultExist, 'Args exist must be ' + t2ResultExist);
            assert.strictEqual(ex2.expressions[1], t2Result2, 'Second expression must be variable ' + t2Result2);
            assert(ex2.vars.indexOf('data.name') >= 0, 'Must exist in array ');
            assert(ex2.vars.indexOf('data.age') >= 0, 'Must exist in array ');
            console.log('ex3', ex3);
            assert.strictEqual(ex3.expressions[0], 'state.hover', 'must be equal');
            console.log('ex4', ex4);
            assert.strictEqual(ex4.expressions[0], '(this.getState("hover")?100:0)', 'must be equal');
        });
        it('execute', function () {
            var template = new ft.TemplateView('ClassName');
            template._i18n = { formatter: '{Exist},{Age}' };
            var data0 = { name: 'Vasily', age: 33, email: 'vasily.timofeev@gmail.com' };
            template.model = new fmvc.Model('test', data0);
            var r0 = expression.execute({ name: ex0.name }, map, template);
            var r1 = expression.execute({ name: ex1.name }, map, template);
            var r2 = expression.execute({ name: ex2.name }, map, template);
            assert.strictEqual(r0, data0.name, 'should be equal: ', r0, data0);
            assert.strictEqual(r1, 'not', 'should be equal ');
            assert.strictEqual(r2, 'not,33 text 33');
            template.setState('hover', true);
            var r3 = expression.execute({ name: ex3.name }, map, template);
            var r4 = expression.execute({ name: ex4.name }, map, template);
            assert.equal(r3, true, 'should be equal ');
            assert.strictEqual(r4, 100, 'should be equal ');
            template.setState('hover', false);
            var r3 = expression.execute({ name: ex3.name }, map, template);
            var r4 = expression.execute({ name: ex4.name }, map, template);
            assert.equal(r3, false, 'should be equal ');
            assert.strictEqual(r4, 0, 'should be equal ');
            template.model.setData({ name: 1000, age: 999 });
            var r2 = expression.execute({ name: ex2.name }, map, template);
            assert.strictEqual(r2, 'exist,999 text 999');
        });
    });
    describe('template manager', function () {
        it('should correct parse template', function () {
            var inst = tm.parse(simpleTemplate);
            console.log('Simple tempalte ', inst);
            assert(inst.domTree, 'has dom tree');
            assert(!inst.dynamicTree, 'has no dynamic tree');
        });
        it('should correct parse data  template', function () {
            var inst = tm.parse(dataTemplate);
            console.log('Data tempalte ', inst);
            assert(inst.domTree, 'has dom tree');
            assert(inst.dynamicTree, 'has dynamic tree');
        });
        it('should correct parse complex  template', function () {
            var inst = tm.parse(complexTemplate);
            console.log('Complex tempalte ', inst);
            assert(inst.domTree, 'has dom tree');
            assert(inst.dynamicTree, 'has dynamic tree');
            assert(inst.expressionMap, 'has expressions map');
        });
    });
    describe('template view', function () {
        _.each(templateObjs, function (obj, key) {
            it('should create instances ' + key, function () {
                var CreateTemplate = tm.createTemplate(key, obj.content);
                var params = { setStates: obj.states, data: obj.data };
                var inst = CreateTemplate('view', params);
                var container = document.getElementById('template-container');
                container.innerHTML = '';
                inst.render(container);
                assert.strictEqual(container.innerHTML, obj.result, 'should be equal');
            });
        });
    });
    describe('template view handlers', function () {
        _.each(templateHandlerObjs, function (obj, key) {
            it('should create handler instances ' + key, function () {
                var CreateTemplate = tm.createTemplate(key, obj.content);
                var params = { setStates: obj.states, data: obj.data };
                var inst = CreateTemplate('view', params);
                var container = document.getElementById('template-container');
                container.innerHTML = '';
                console.log('inst ', inst);
                inst.render(container);
                assert.strictEqual(container.innerHTML, obj.result, 'should be equal');
            });
        });
    });
});
//# sourceMappingURL=template.test.js.map