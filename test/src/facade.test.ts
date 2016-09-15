///<reference path="d.ts" />

var expect = chai.expect;
var assert = chai.assert;

interface IModelData {
    name:string;
    value: number;
}

describe('fmvc', function() {
    const facadeName:string = 'testName';
    const model0Name:string = 'model0';
    const model1Name:string = 'model1';
    const view0Name:string = 'view0';
    const view1Name:string = 'view1';
    const mediatorName:string = 'mediator0';
    const model0Data:IModelData = { name: 'Model data', value: 1248 };
    const model1Data:IModelData = { name: 'Model data 1', value: 1991 , title: 'Title 1'};
    const model0ArrayData = [{_id: 1, name: 'Vasya'}, {_id: 2, name: 'Alena'}];
    const model1ArrayData = [{_id: 1, name: 'Vasily'}, {_id: 3, name: 'Katya'}];
    const eventName:string = 'testEvent';
    const eventData:any = {a: 1};

    describe('fmvc.Notifier', function() {
        var n0= new fmvc.Notifier(model0Name, fmvc.TYPE_MODEL);
        var f0 = new fmvc.Facade(facadeName);

        it('should has simple properties name,type,!facade', function() {
            assert(n0.name === model0Name, 'equal model name');
            assert(n0.type === fmvc.TYPE_MODEL, 'equal model type');
            assert(!n0.facade, 'has no facade');
        });

        it('can set facade', function() {
           n0.facade = f0;
           assert(n0.facade === f0, 'facade is equal');
           n0.facade = null;
           assert(n0.facade === null, 'facade is null');
        });

        it('should can bind to notifier and send event to listeners, using listenerCount ', function() {


            var event:fmvc.IEvent = null;
            assert(n0.listenerCount <= 0, 'has no listeners');

            n0.bind(this, (e:fmvc.IEvent)=>(event=e));
            assert(n0.listenerCount === 1, 'has one listener: ' + n0.listenerCount);

            n0.dispatchEvent({type: eventName, data: eventData});
            console.log(event);
            assert(event.target === n0, 'target is');
            assert(event.type === eventName, 'name is');
            assert(event.data === eventData, 'data is');

            n0.unbind(this);
            assert(n0.listenerCount === 0, 'has no listeners');
        });
    });

    describe('fmvc.Model', function() {
        var m0 = new fmvc.Model(model0Name, model0Data, {enabledEvents: false});
        var m0_1 = new fmvc.Model(model1Name, model0Data, {enabledEvents: true});
        var ma0 = new fmvc.Model(model0Name, model0ArrayData);

        it('should has basic properties (object)', function() {
            assert(_.isEqual(m0.data, model0Data), 'is equal');
        });

        it('should has no changes by model.setData(value)', function() {
            m0.setData(model1Data);
            assert(_.isEqual(m0.data, model1Data), 'is equal to the new data');
            assert(!m0.changes, 'has no changes cause it disabled');
        });

        it('should has no changes by model.setChanges(value) with autoCommit', function() {
            m0_1.setChanges(model1Data);
            assert(_.isEqual(m0_1.data, model1Data), 'is equal to the new data');
            assert(_.isEqual(m0_1.data, model0Data), 'is equal (rewrited)');

            //@todo check with autocommit
        });

        it('should has no changes (array)', function() {
            assert(_.isEqual(ma0.data, model0ArrayData), 'equal array');
            assert(ma0.data === model0ArrayData, 'are same');
            ma0.data = model1ArrayData;
            assert(!_.isEqual(ma0.data, model0ArrayData), 'not equal array');
            assert(!ma0.changes, 'has no changes');
        });

        it('can be reset', function() {
            assert(m0_1.reset(), 'return instance');
            assert(!m0_1.data, 'has no data');
            assert(!m0_1.changes, 'has no changes');
            assert(m0_1.state === fmvc.ModelState.None, 'has state none');
        });
    });

    describe('fmvc.CompositeModel', function() {
        it('datasource + result function', function() {
            var cm = new fmvc.CompositeModel('cm-1', [[1,2,3,4,5]]);
            cm.setResultFunc((src)=>_.filter(src,(v:number)=>(v%2===0))).apply();
            assert.deepEqual(cm.data, [2,4], 'arrays should be same');
            assert.equal(cm.count, 2, 'should contains 2 elements')

        });

        it('2 datasource + intersection', function() {
            var cm = new fmvc.CompositeModel('cm-1', [[1,2,3,4,5], [2,3,4]]);
            cm.setSourceCompareFunc(_.intersection).apply();
            assert.deepEqual(cm.data, [2,3,4], 'arrays should be same');
            cm.setResultFunc((src)=>_.filter(src,(v:number)=>(v%2===0))).apply();
            assert.deepEqual(cm.data, [2,4], 'arrays should be same');
            console.log('---', cm, cm.data);
            assert.equal(cm.count, 2, 'should contains 2 elements')
        });

        it('two datasources incapsulated at models + mapBefore + union + result filters', function() {
            var m0 = new fmvc.Model('m0', [2,4,6]);
            var m1 = new fmvc.Model('m1', [6,8,10]);
            var cm = new fmvc.CompositeModel('cm-1', [m0,m1]);

            cm.setSourceCompareFunc(_.union).apply();
            assert.deepEqual(cm.data, [2,4,6,8,10], 'arrays should be same');

            cm.setResultFunc((src)=>_.filter(src,(v:number)=>(v%2===1))).apply();
            assert.deepEqual(cm.data, [], 'arrays should be same');
            assert.equal(cm.count, 0, 'should contains 2 elements');

            m1.setData([0]);
            cm.setMapBeforeCompare('m1', (v:number)=>v+1);
            cm.apply();
            assert.deepEqual(cm.data, [1], 'arrays should be same');
        });
    });

    describe('fmvc.View', function() {
        var m = new fmvc.Mediator(mediatorName, document.body);
        var v0 = new fmvc.View(v0);

        it('should set/get/remove mediator', function() {
            assert(v0.setMediator(m),'return view');
            assert(v0.mediator,'return view');
            v0.setMediator(null);
            assert(!v0.mediator,'has no mediator');
        });

        it('can be rendered to html document', function() {
            assert(!v0.inDocument, 'inDocument must be false');
            assert(v0.render(document.body), 'return view');
            assert(_.isElement(v0.getElement()), 'has dom element');
            console.log(v0);
            assert(v0.inDocument, 'inDocument must be true');
        });

        it('should can be invalidated and validated', function(done) {
            v0.validateData = function() {
                done();
            };
            v0.invalidate(fmvc.InvalidateType.Data);
            assert(v0.isWaitingForValidate, 'must be waiting for validate');
        });

        it('should set model and get model', function() {
            var data0 = { a: 1, b: 2};
            var model0 = new fmvc.Model('testModel', data0);
            v0.model = model0;
            console.log(model0, model0.data);

            assert.strictEqual(v0.model, model0, 'Model should be equal');
            assert.deepEqual(v0.data, data0, 'Data should be equal');

        });

        it('should set state and get state', function() {
            assert(v0.setState('selected', true), 'return view');
            assert(v0.getState('selected'), 'should be true');
        });
    });

    describe('fmvc.Mediator', function() {
        var m = new fmvc.Mediator(mediatorName, document.body);
        var view0 = new fmvc.View(view0Name);
        var view1 = new fmvc.View(view1Name);
        m.addView(view0, view1);

        it('can add/remove/get view', function() {
            assert(m.getView(view0Name) === view0, 'view added');
            assert(m.removeView(view0Name), 'return mediator');
            assert(!m.getView(view0Name), 'has no view after remove');
        });

        it('can receive view events', function() {
           var event:fmvc.IEvent = null;
           m.viewEventHandler = (e)=>(event=e);
           view1.dispatchEvent({type: eventName, data: eventData});
           assert(event.target === view1, 'target is');
           assert(event.type === eventName, 'name is');
           assert(event.data === eventData, 'data is');
       });
    });


    describe('fmvc.Facade', function() {
        var f = new fmvc.Facade(facadeName);
        var m0 = new fmvc.Model(model0Name, model0Data);
        var m1 = new fmvc.Model(model1Name, model1Data);
        var vm = new fmvc.Mediator(mediatorName);

        it('should set name in constructor and get by getter', function() {
            assert(f.name === facadeName )
        });
        
        it('should register model', function() {
            assert(f.register(m0), 'return facade');
            assert(f.model[model0Name] === m0, 'return model equal by property');
            assert(f.get(model0Name) === m0, 'return model equal');
        });

        f = new fmvc.Facade(facadeName);

        it('should register multi model, mediator', function() {
            f.register(m0,m1,vm);
            assert(f.get(model0Name) === m0,'has m0');
            assert(f.get(model1Name) === m1,'has m1');
            assert(f.get(mediatorName) === vm,'has mediator');
        });
    })
});
