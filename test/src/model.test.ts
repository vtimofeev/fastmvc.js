///<reference path="d.ts" />

import IPromise = fmvc.IPromise;
var expect = chai.expect;
var assert = chai.assert;

interface IModelData {
    name:string;
    value: number;
}


describe('model test', function() {
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




    describe('Facade: Storage Models', function() {

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

});
