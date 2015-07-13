/**
 * Created by Vasily on 26.06.2015.
 */
///<reference path='../../src/fmvc/d.ts'/>
///<reference path='../../src/ui/Button.ts'/>

class TestApp extends  fmvc.Facade {
}

var ViewEvent = {
    EDIT: 'edit',
    SAVE: 'save',
    CANCEL: 'cancel'
};


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

var testApp:fmvc.Facade = new fmvc.Facade('testApp', window);
var testModel:TestModel = new TestModel('test', {content: 'Hello world', title: 'Hello Title', custom: 0});
testModel.queue.loadXml({url: 'config.xml'}).parse(function($xml) { return {statUrl: $xml.find('stat_url').text()}; }).complete((obj)=>testModel.set(obj), null, this);
testModel.queue.loadXml({url: 'config2.xml'}).parse(_.identity).complete((v)=>testModel.set({title:v.toString()}), null, this);

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
/*
btn1.setState('content', 'TheContent2');
btn1.setState('title', 'StateTitle');
btn1.data = { title: 'Data:Title', content: 'Data:Content'};
*/
console.log(btn1);

testApp
    .register((new TestStatMediator(TestMediator.NAME, document.body)).setFacade(testApp).addViews([btn1 ,((new ui.Button('btn2', testModel, {events: { click: ViewEvent.EDIT }} )).setState('content', 'The value')) ]))
    .register((new TestMediator(TestMediator.NAME, document.body)).setFacade(testApp).addViews([new ui.Button('btn3'),new ui.Button('btn4', testModel)]));


testModel.data = { title : 'Updated Title'};