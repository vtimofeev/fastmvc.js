///<reference path="../src/d.ts/mocha/mocha.d.ts" />
///<reference path="../../DefinitelyTyped/chai/chai.d.ts" />
///<reference path="../src/fmvc/d.ts" />
var expect = chai.expect;
var assert = chai.assert;
describe('fmvc', function () {
    var facadeName = 'testName';
    var model0Name = 'model0';
    var model1Name = 'model1';
    var view0Name = 'view0';
    var view1Name = 'view1';
    var mediatorName = 'mediator0';
    var model0Data = { name: 'Model data', value: 1248 };
    var model1Data = { name: 'Model data 1', value: 1991, title: 'Title 1' };
    var model0ArrayData = [{ _id: 1, name: 'Vasya' }, { _id: 2, name: 'Alena' }];
    var model1ArrayData = [{ _id: 1, name: 'Vasily' }, { _id: 3, name: 'Katya' }];
    var eventName = 'testEvent';
    var eventData = { a: 1 };
    describe('fmvc.Notifier', function () {
        var n0 = new fmvc.Notifier(model0Name, fmvc.TYPE_MODEL);
        var f0 = new fmvc.Facade(facadeName);
        it('should has simple properties name,type,!facade', function () {
            assert(n0.name === model0Name, 'equal model name');
            assert(n0.type === fmvc.TYPE_MODEL, 'equal model type');
            assert(!n0.facade, 'has no facade');
        });
        it('can set facade', function () {
            n0.facade = f0;
            assert(n0.facade === f0, 'facade is equal');
            n0.facade = null;
            assert(n0.facade === null, 'facade is null');
        });
        it('should can bind to notifier and send event to listeners, using listenerCount ', function () {
            var event = null;
            assert(n0.listenerCount <= 0, 'has no listeners');
            n0.bind(this, function (e) { return (event = e); });
            assert(n0.listenerCount === 1, 'has one listener: ' + n0.listenerCount);
            n0.sendEvent(eventName, eventData);
            console.log(event);
            assert(event.target === n0, 'target is');
            assert(event.name === eventName, 'name is');
            assert(event.data === eventData, 'data is');
            n0.unbind(this);
            assert(n0.listenerCount === 0, 'has no listeners');
        });
    });
    describe('fmvc.Model', function () {
        var m0 = new fmvc.Model(model0Name, model0Data, { enabledEvents: false, watchChanges: false });
        var m0_1 = new fmvc.Model(model1Name, model0Data, { enabledEvents: true, watchChanges: true });
        var ma0 = new fmvc.Model(model0Name, model0ArrayData);
        it('should has basic properties (object)', function () {
            assert(m0.data !== model0Data, 'data must not equal');
            assert(_.isEqual(m0.data, model0Data), 'is equal');
        });
        it('should has no changes (object, watchChanges=false', function () {
            m0.setData(model1Data);
            assert(_.isEqual(m0.data, model1Data), 'is equal to the new data');
            assert(!m0.changes, 'has no changes cause it disabled');
        });
        it('should has changes (object, watchChanges=true)', function () {
            m0_1.setData(model1Data);
            assert(_.isEqual(m0_1.data, model1Data), 'is equal to the new data');
            assert(m0_1.changes, 'has changes: ' + JSON.stringify(m0_1.changes));
        });
        it('should has no changes (array)', function () {
            assert(_.isEqual(ma0.data, model0ArrayData), 'equal array');
            assert(ma0.data !== model0ArrayData, 'not same');
            ma0.data = model1ArrayData;
            assert(!_.isEqual(ma0.data, model0ArrayData), 'not equal array');
            assert(!ma0.changes, 'has no changes');
        });
        it('can be reset', function () {
            assert(m0_1.reset(), 'return instance');
            assert(!m0_1.data, 'has no data');
            assert(!m0_1.changes, 'has no changes');
            assert(m0_1.state === fmvc.ModelState.None, 'has state none');
        });
    });
    describe('fmvc.View', function () {
        var m = new fmvc.Mediator(mediatorName, document.body);
        var v0 = new fmvc.View(v0);
        it('should set/get/remove mediator', function () {
            assert(v0.setMediator(m), 'return view');
            assert(v0.mediator, 'return view');
            v0.setMediator(null);
            assert(!v0.mediator, 'has no mediator');
        });
        it('can be rendered to html document', function () {
            assert(!v0.inDocument, 'inDocument must be false');
            assert(v0.render(document.body), 'return view');
            assert(_.isElement(v0.getElement()), 'has dom element');
            console.log(v0);
            assert(v0.inDocument, 'inDocument must be true');
        });
        it('should can be invalidated and validated', function (done) {
            v0.validateData = function () {
                done();
            };
            v0.invalidate(fmvc.InvalidateType.Data);
            assert(v0.isWaitingForValidate, 'must be waiting for validate');
        });
        it('should set model and get model', function () {
            var data0 = { a: 1, b: 2 };
            var model0 = new fmvc.Model('testModel', data0);
            v0.model = model0;
            console.log(model0, model0.data);
            assert.strictEqual(v0.model, model0, 'Model should be equal');
            assert.deepEqual(v0.data, data0, 'Data should be equal');
        });
        it('should set state and get state', function () {
            assert(v0.setState('selected', true), 'return view');
            assert(v0.getState('selected'), 'should be true');
        });
    });
    describe('fmvc.Mediator', function () {
        var m = new fmvc.Mediator(mediatorName, document.body);
        var view0 = new fmvc.View(view0Name);
        var view1 = new fmvc.View(view1Name);
        m.addView(view0, view1);
        it('can add/remove/get view', function () {
            assert(m.getView(view0Name) === view0, 'view added');
            assert(m.removeView(view0Name), 'return mediator');
            assert(!m.getView(view0Name), 'has no view after remove');
        });
        it('can receive view events', function () {
            var event = null;
            m.viewEventHandler = function (e) { return (event = e); };
            view1.sendEvent(eventName, eventData);
            assert(event.target === view1, 'target is');
            assert(event.name === eventName, 'name is');
            assert(event.data === eventData, 'data is');
        });
    });
    describe('fmvc.Facade', function () {
        var f = new fmvc.Facade(facadeName);
        var m0 = new fmvc.Model(model0Name, model0Data);
        var m1 = new fmvc.Model(model1Name, model1Data);
        var vm = new fmvc.Mediator(mediatorName);
        it('should set name in constructor and get by getter', function () {
            assert(f.name === facadeName);
        });
        it('should register model', function () {
            assert(f.register(m0), 'return facade');
            assert(f.model[model0Name] === m0, 'return model equal by property');
            assert(f.get(model0Name) === m0, 'return model equal');
        });
        f = new fmvc.Facade(facadeName);
        it('should register multi model, mediator', function () {
            f.register(m0, m1, vm);
            assert(f.get(model0Name) === m0, 'has m0');
            assert(f.get(model1Name) === m1, 'has m1');
            assert(f.get(mediatorName) === vm, 'has mediator');
        });
    });
});
/*
describe("Cow", function() {
describe("constructor", function() {
    it("should have a default name", function() {
        var cow = new Cow();
        expect(cow.name).to.equal("Anon cow");
    });

    it("should set cow's name if provided", function() {
        var cow = new Cow("Kate");
        expect(cow.name).to.equal("Kate");
    });
});

describe("#greets", function() {
    it("should throw if no target is passed in", function() {
        expect(function() {
            (new Cow()).greets();
        }).to.throw(Error);
    });

    it("should greet passed target", function() {
        var greetings = (new Cow("Kate")).greets("Baby");
        expect(greetings).to.equal("Kate greets Baby");
    });
});
});
import * as fmvc from '../src/fmvc/';
import assert = require('assert');

/*
var btimers = btNs.getTimers();

describe('basic-timer', function() {
it('once', function(done) {
    var now = Date.now();
    var btimer = btimers.once(function() {
        var time = Date.now() - now;
        assert(time >= 80, 'Check timeout ' + now + ', ' + time);
        done();
    }, 100);
    assert(btimer, 'Required timer object');
});
*/
//# sourceMappingURL=facade.test.js.map