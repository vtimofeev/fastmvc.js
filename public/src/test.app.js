/**
 * Created by Vasily on 26.06.2015.
 */
///<reference path='../../build/fmvc.dev.d.ts'/>
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
var m1 = new fmvc.Model('a1', [1, 2, 3, 4, 5, 6, 7]);
var m2 = new fmvc.Model('a2', [5, 6, 7, 8, 9, 10]);
var s1 = new fmvc.SourceModel('s1', [m1, m2]);
s1.setSourceMethod(_.intersection).setResultMethods(_.partial(_.filter, _, function (v) { return v % 2 === 0; }), _.partial(_.sortBy, _, function (v) { return -v; }));
setTimeout(function () { m2.data = [2, 4, 6, 8, 9, 10, 12]; }, 1000);
setTimeout(function () { m1.data = [2, 4, 6, 8, 9, 10, 12]; }, 3000);
var v1 = new fmvc.ViewList('ViewList');
v1.childrenConstructor = ui.Button;
v1.setModel(s1, true);
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
testApp.register((new TestStatMediator(TestMediator.NAME, document.body)).setFacade(testApp).addView([v1]));
/*
var testModel:TestModel = new TestModel('test', {content: 'Hello world', title: 'Hello Title', custom: 0});
testModel.queue().loadXml({url: 'config.xml'}).parse(function($xml) { return {statUrl: $xml.find('stat_url').text()}; }).complete((obj)=>testModel.set(obj), null, this);
testModel.queue().loadXml({url: 'config2.xml'}).parse(_.identity).complete((v)=>testModel.set({title:v.toString()}), null, this);

testModel.setState('customState');
testApp.register(testModel);


var testListModel = new fmvc.ModelList('testlist', []);
console.log(testListModel.count);
testListModel.data = [ {counten: 'FirstItem'} ];
console.log(testListModel.count);

console.log('Finish testlistmodel ', testListModel);

setTimeout(function() {
    testModel.setState('one');
}, 1000);

setTimeout(function() {
    testModel.setState('two');
}, 3000);

setTimeout(function() {
    testModel.setState('three');
}, 5000);


setInterval(function () {
    //testModel.setState(testModel.state + '!');
    //testModel.data = {custom: (testModel.data.custom + 1) };
}, 1000);

var btn1 = new test.TestButtons('tbtns1');
*/
/*
btn1.setState('content', 'TheContent2');
btn1.setState('title', 'StateTitle');
btn1.data = { title: 'Data:Title', content: 'Data:Content'};
*/
//console.log(btn1);
/*

        testApp
    .register((new TestStatMediator(TestMediator.NAME, document.body)).setFacade(testApp).addView([v1, btn1 ,((new ui.Button('btn2', testModel, {events: { click: ViewEvent.EDIT }} )).setState('content', 'The value')) ]))
    .register((new TestMediator(TestMediator.NAME, document.body)).setFacade(testApp).addView([new ui.Button('btn3'),new ui.Button('btn4', testModel)]));


testModel.data = { title : 'Updated Title'};
    */ 
//# sourceMappingURL=test.app.js.map