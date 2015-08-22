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
    var stateTemplate = document.getElementById(stateName).innerHTML;
    var tm = ft.TemplateManager();
    describe('template view parser', function () {
        it('should create dom', function () {
            var parser = new ft.TemplateParser();
            var result = parser.parseHtml('<div class="button" style="top:0px;">Content</div>');
            var rootData = result[0];
            assert(rootData, 'should be result');
            assert(rootData.name === 'div', 'should be div');
        });
    });
    describe('template expression', function () {
        var expression = new ft.Expression();
        var t0 = '{data.name}';
        var t1 = '{(data.name>10?"exist":"not")}';
        var t2 = '{ ( data.name>10?"exist":"not" ) as Exist, data.age as Age | i18n.formatter } text content addition {data.age}';
        var t3 = '{state.hover}';
        var t4 = '{(state.hover?100:0)}';
        it('string parser', function () {
            var ex0 = expression.strToExpression(t0);
            console.log('ex0', JSON.stringify(ex0));
            assert(ex0, 'should be');
            assert(ex0.expressions[0] === 'data.name', 'should be data.name');
            var t1Result = '(this.data.name>10?"exist":"not")';
            var ex1 = expression.strToExpression(t1);
            console.log('ex1', JSON.stringify(ex1));
            assert(ex1, 'should be');
            assert(ex1.expressions[0] === t1Result, 'should be ' + t1Result);
            var ex2 = expression.strToExpression(t2);
            var t2ResultExist = '( this.data.name>10?"exist":"not" )';
            var t2ResultFilter = 'i18n.formatter';
            var t2Result2 = 'data.age';
            console.log('ex2', ex2);
            assert(ex2.expressions[0].filters[0] === t2ResultFilter, 'Filter must be ' + t2ResultFilter);
            assert(ex2.expressions[0].args.Exist === t2ResultExist, 'Args exist must be ' + t2ResultExist);
            assert(ex2.expressions[1] === t2Result2, 'Second expression must be variable ' + t2Result2);
            assert(ex2.vars.indexOf('data.name') >= 0, 'Must exist in array ');
            assert(ex2.vars.indexOf('data.age') >= 0, 'Must exist in array ');
            var ex3 = expression.strToExpression(t3);
            console.log('ex3', ex3);
            assert(ex3.expressions[0] === 'state.hover', 'must be equal');
            var ex4 = expression.strToExpression(t4);
            console.log('ex4', ex4);
            assert(ex4.expressions[0] === '(this.getState("hover")?100:0)', 'must be equal');
        });
    });
    return;
    describe('template manager', function () {
        it('should correct parse template', function () {
            var simpleTmplInst = tm.parse(simpleTemplate);
            assert.instanceOf(simpleTmplInst, ft.Template, 'should be template');
            assert(simpleTmplInst.domTree, 'has dom tree');
            assert(!simpleTmplInst.dynamicTree, 'has no dynamic tree');
        });
        it('should correct parse data  template', function () {
            var dataTmplInst = tm.parse(dataTemplate);
            assert.instanceOf(dataTmplInst, ft.Template, 'should be template');
            assert(dataTmplInst.domTree, 'has dom tree');
            assert(dataTmplInst.dynamicTree, 'has dynamic tree');
        });
    });
    describe('template view', function () {
        var simpleTmplInst = tm.parse(simpleTemplate);
        it('should create instance view from template', function () {
            var SimpleConstructor = tm.getConstructor(simpleTmplInst);
            assert(SimpleConstructor, 'exist constructor');
            var view = new SimpleConstructor();
            assert.instanceOf(view, ft.TemplateView, 'should be instance of TemplateView');
        });
    });
});
//# sourceMappingURL=template.test.js.map