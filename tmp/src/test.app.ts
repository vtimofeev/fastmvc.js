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
    events():string[] {
        return [ViewEvent.EDIT, ViewEvent.SAVE, ViewEvent.CANCEL];
    }
}

class TestStatMediator extends fmvc.Mediator {
    static NAME:string = 'TestMediator';
    events():string[] {
        return [ViewEvent.EDIT, ViewEvent.SAVE, ViewEvent.CANCEL];
    }
}

class TestModel extends fmvc.Model {
}

var testApp:fmvc.Facade = new fmvc.Facade('testApp', window);
var testModel:TestModel = new TestModel('testModel', {content: 'Hello world'});

testApp
    .register((new TestStatMediator(TestMediator.NAME, document.body)).setFacade(testApp).addViews([new ui.Button('btn1', testModel),((new ui.Button('btn2', null, {events: { click: ViewEvent.EDIT }} )).setState('content', 'The value')) ]))
    .register((new TestMediator(TestMediator.NAME, document.body)).setFacade(testApp).addViews([new ui.Button('btn3'),new ui.Button('btn4', testModel)]));
