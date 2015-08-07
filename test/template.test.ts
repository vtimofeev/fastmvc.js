///<reference path="../src/d.ts/mocha/mocha.d.ts" />
///<reference path="../../DefinitelyTyped/chai/chai.d.ts" />
///<reference path="../src/fmvc/d.ts" />

var expect = chai.expect;
var assert = chai.assert;

describe('ft - template package ',function() {
    var simpleName:string = 'template-simple';
    var dataName:string = 'template-data';
    var stateName:string = 'template-state';
    var simpleTemplate:string = document.getElementById(simpleName).innerHTML;
    var dataTemplate:string = document.getElementById(dataName).innerHTML;
    var stateTemplate:string = document.getElementById(stateName).innerHTML;
    var tm:ITemplateManager = ft.TemplateManager();


    describe('template manager', function () {
        it('should correct parse template', function () {
            var simpleTmplInst:ITemplate = tm.parse(simpleTemplate);
            assert.instanceOf(simpleTmplInst, ft.Template, 'should be template');
            assert(simpleTmplInst.domTree, 'has dom tree');
            assert(!simpleTmplInst.dynamicTree, 'has no dynamic tree');
        });

        it('should correct parse data  template', function () {
            var dataTmplInst:ITemplate = tm.parse(dataTemplate);
            assert.instanceOf(dataTmplInst, ft.Template, 'should be template');
            assert(dataTmplInst.domTree, 'has dom tree');
            assert(dataTmplInst.dynamicTree, 'has dynamic tree');
        });
    });

    describe('template view', function () {
        var simpleTmplInst:ITemplate = tm.parse(simpleTemplate);

        it('should create instance view from template', function () {
            var SimpleConstructor = tm.getConstructor(simpleTmplInst);
            assert(SimpleConstructor, 'exist constructor');
            var view = new SimpleConstructor();
            assert.instanceOf(view, ft.TemplateView, 'should be instance of TemplateView');
        })

    });
});

