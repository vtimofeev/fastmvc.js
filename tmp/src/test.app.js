/**
 * Created by Vasily on 26.06.2015.
 */
///<reference path='../../src/fmvc/d.ts'/>
///<reference path='../../src/ui/Button.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TestApp = (function (_super) {
    __extends(TestApp, _super);
    function TestApp() {
        _super.apply(this, arguments);
    }
    return TestApp;
})(fmvc.Facade);
var ViewEvent = {
    EDIT: 'edit',
    SAVE: 'save',
    CANCEL: 'cancel'
};
var TestMediator = (function (_super) {
    __extends(TestMediator, _super);
    function TestMediator() {
        _super.apply(this, arguments);
    }
    TestMediator.prototype.events = function () {
        return [ViewEvent.EDIT, ViewEvent.SAVE, ViewEvent.CANCEL];
    };
    TestMediator.NAME = 'TestMediator';
    return TestMediator;
})(fmvc.Mediator);
var TestStatMediator = (function (_super) {
    __extends(TestStatMediator, _super);
    function TestStatMediator() {
        _super.apply(this, arguments);
    }
    TestStatMediator.prototype.events = function () {
        return [ViewEvent.EDIT, ViewEvent.SAVE, ViewEvent.CANCEL];
    };
    TestStatMediator.NAME = 'TestMediator';
    return TestStatMediator;
})(fmvc.Mediator);
var TestModel = (function (_super) {
    __extends(TestModel, _super);
    function TestModel() {
        _super.apply(this, arguments);
    }
    return TestModel;
})(fmvc.Model);
var testApp = new fmvc.Facade('testApp', window);
var testModel = new TestModel('testModel', { content: 'Hello world' });
testModel.queue.loadXml({ url: 'config.xml' }).parse(_.identity).complete(function (v) { return testModel.set({ xml: v }); }, null, this);
testModel.queue.loadXml({ url: 'config2.xml' }).parse(_.identity).complete(function (v) { return testModel.set({ xml2: v }); }, null, this);
testApp
    .register((new TestStatMediator(TestMediator.NAME, document.body)).setFacade(testApp).addViews([new ui.Button('btn1', testModel), ((new ui.Button('btn2', null, { events: { click: ViewEvent.EDIT } })).setState('content', 'The value'))]))
    .register((new TestMediator(TestMediator.NAME, document.body)).setFacade(testApp).addViews([new ui.Button('btn3'), new ui.Button('btn4', testModel)]));
//# sourceMappingURL=test.app.js.map