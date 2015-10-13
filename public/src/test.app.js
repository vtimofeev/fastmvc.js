/**
 * Created by Vasily on 26.06.2015.
 */
///<reference path='../../build/fmvc.dev.d.ts'/>
var ViewEvent = {
    EDIT: 'edit',
    SAVE: 'save',
    CANCEL: 'cancel'
};
var d1 = ["a", "b", 1, 2, 3, 4, 5, 6, 7];
var m2 = new fmvc.Model('a2', [4, 5, 6, 7, 8, 9, 10, 11]);
var s1 = new fmvc.CompositeModel('s1', [d1, m2]);
s1.setMapBeforeCompare(m2.name, function (v) { return v; }).setSourceCompareFunc(_.intersection).setResultFunc(function (v) { return (_.chain(v).filter(function (r) { return (r % 2 === 0); }).map(function (d) { return (d * 100); }).value()); });
/*, _.partial(_.sortBy, _, (v)=>(-v) ), _.partial(_.map, _ ,getValue), (v)=>v?v.length:0*/
setTimeout(function () { m2.data = [2, 4, 6, 8, 9, 10, 12]; }, 1000);
setTimeout(function () { m2.data = [2, 4, "a", "b", 9, 10, 12]; }, 2000);
setTimeout(function () { m2.data = [2, 4, 6, 8, 9, 10, 12]; }, 3000);
/*





var v1 = new fmvc.ViewList('ViewList');
v1.childrenConstructor = ui.Button;
v1.setModel(s1, true);

class TestMediator extends fmvc.Mediator {
    static NAME:string = 'TestMediator';
    get events():string[] {
        return [ViewEvent.EDIT, ViewEvent.SAVE, ViewEvent.CANCEL];
    }
}

class TestStatMediator extends fmvc.Mediator {
    static NAME:string = 'TestMediator';
    get events():string[] {
        return [ViewEvent.EDIT, ViewEvent.SAVE, ViewEvent.CANCEL];
    }
}

class TestModel extends fmvc.Model {
}

var btns1 = new test.TestButtons('tbtns1');

var testApp:fmvc.Facade = new fmvc.Facade('testApp', document.body);
var testModel = new TestModel('test', { value: '1', title: 'Hello world'});
var testMediator = new TestStatMediator(TestMediator.NAME, document.body);
testApp.register([testModel, testMediator]);
testMediator.addView([btns1]);

setTimeout(()=>testModel.setState('one'), 2000);


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