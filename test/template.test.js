///<reference path="../src/d.ts/mocha/mocha.d.ts" />
///<reference path="../../DefinitelyTyped/chai/chai.d.ts" />
///<reference path="../src/fmvc/d.ts" />
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