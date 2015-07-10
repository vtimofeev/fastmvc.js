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
    Object.defineProperty(TestMediator.prototype, "events", {
        get: function () {
            return [ViewEvent.EDIT, ViewEvent.SAVE, ViewEvent.CANCEL];
        },
        enumerable: true,
        configurable: true
    });
    TestMediator.NAME = 'TestMediator';
    return TestMediator;
})(fmvc.Mediator);
var TestStatMediator = (function (_super) {
    __extends(TestStatMediator, _super);
    function TestStatMediator() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(TestStatMediator.prototype, "events", {
        get: function () {
            return [ViewEvent.EDIT, ViewEvent.SAVE, ViewEvent.CANCEL];
        },
        enumerable: true,
        configurable: true
    });
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
var testModel = new TestModel('test', { content: 'Hello world', title: 'Hello Title', custom: 0 });
testModel.queue.loadXml({ url: 'config.xml' }).parse(function ($xml) { return { statUrl: $xml.find('stat_url').text() }; }).complete(function (obj) { return testModel.set(obj); }, null, this);
testModel.queue.loadXml({ url: 'config2.xml' }).parse(_.identity).complete(function (v) { return testModel.set({ title: v.toString() }); }, null, this);
testModel.setState('customState');
testApp.register(testModel);
setTimeout(function () {
    testModel.setState('changedState');
}, 1000);
setInterval(function () { return testModel.data = { custom: (testModel.data.custom + 1) }; }, 1000);
var btn1 = new ui.TestButtons('tbtns1');
/*
btn1.setState('content', 'TheContent2');
btn1.setState('title', 'StateTitle');
btn1.data = { title: 'Data:Title', content: 'Data:Content'};
*/
console.log(btn1);
testApp
    .register((new TestStatMediator(TestMediator.NAME, document.body)).setFacade(testApp).addViews([btn1, ((new ui.Button('btn2', testModel, { events: { click: ViewEvent.EDIT } })).setState('content', 'The value'))]))
    .register((new TestMediator(TestMediator.NAME, document.body)).setFacade(testApp).addViews([new ui.Button('btn3'), new ui.Button('btn4', testModel)]));
testModel.data = { title: 'Updated Title' };
//# sourceMappingURL=test.app.js.map