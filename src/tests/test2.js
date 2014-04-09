///<reference path='../fmvc/references.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var tests;
(function (tests) {
    var TestApp = (function () {
        function TestApp() {
            this.facade = new fmvc.Facade(TestApp.NAME);

            //this.facade.getLogger().setFilter(['TestMediator', 'TestView'])
            var testObject = { 'name': 'Hello', 'value': 1 };
            var testObject2 = { 'name': 'Hello', 'value': 2 };

            var tm = new TestModel(testObject);
            var tlm = new TestListModel([testObject, testObject2]);
            this.facade.register(tm);
            this.facade.register(tlm);
            this.facade.register(new TestMediator(this.facade, [
                new TestView($('#testViewContent')[0], tm),
                new TestListView($('#testListViewContent')[0], tlm)
            ]));

            testObject2.name = 'Ola';
            tlm.update(testObject2);
        }
        TestApp.NAME = 'testapp';
        return TestApp;
    })();
    tests.TestApp = TestApp;

    var TestModel = (function (_super) {
        __extends(TestModel, _super);
        function TestModel(data) {
            _super.call(this, TestModel.NAME, data);
        }
        TestModel.NAME = 'TestModel';
        return TestModel;
    })(fmvc.Model);

    var TestListModel = (function (_super) {
        __extends(TestListModel, _super);
        function TestListModel(data) {
            _super.call(this, TestListModel.NAME, data);
        }
        TestListModel.NAME = 'TestListModel';
        return TestListModel;
    })(fmvc.ModelList);

    var TestMediator = (function (_super) {
        __extends(TestMediator, _super);
        function TestMediator(facade, views) {
            _super.call(this, facade, TestMediator.NAME, views);
        }
        TestMediator.prototype.events = function () {
            return [fmvc.Event.MODEL_CHANGE];
        };

        TestMediator.prototype.modelEventHandler = function (e) {
            var name = e.target.name();
            switch (e.name) {
                case fmvc.Event.MODEL_CHANGE:
                    switch (name) {
                        case TestModel.NAME:
                            break;
                        case TestListModel.NAME:
                            break;
                    }
            }
        };

        TestMediator.prototype.internalHandler = function (e) {
            _super.prototype.internalHandler.call(this, e);
        };
        TestMediator.NAME = 'TestMediator';
        return TestMediator;
    })(fmvc.Mediator);

    var TestView = (function (_super) {
        __extends(TestView, _super);
        function TestView(base, model) {
            _super.call(this, TestView.NAME, base);
            this.data = model;
        }
        TestView.prototype.init = function () {
            _super.prototype.init.call(this);
            this.data.setData({ name: 'Test', value: 2 });
            this.data.setData({ value: 43 });
            this.data.setData({ value: 48 });

            this.destroy();
        };

        TestView.prototype.eventHandler = function (name, e) {
            _super.prototype.eventHandler.call(this, name, e);
        };
        TestView.NAME = 'TestView';
        return TestView;
    })(fmvc.BasisView);

    var TestListView = (function (_super) {
        __extends(TestListView, _super);
        function TestListView(base, model) {
            _super.call(this, TestListView.NAME, base);
            this.views = ['content'];
            this.data = model;
        }
        TestListView.prototype.init = function () {
            //super.init();
            var models = this.data.getData();
            alert('init');

            for (var i in models) {
                var model = models[i];

                var view = new TestListItemView(this.base, model);
                view.mediator(this._mediator);
                view.init();

                this.log('Create element ' + view + ', ' + model);
                this.views.push[view];
            }
        };

        TestListView.prototype.render = function () {
        };

        TestListView.prototype.eventHandler = function (name, e) {
            _super.prototype.eventHandler.call(this, name, e);
        };
        TestListView.NAME = 'TestListView';
        return TestListView;
    })(fmvc.BasisView);

    var TestListItemView = (function (_super) {
        __extends(TestListItemView, _super);
        function TestListItemView(base, model) {
            _super.call(this, TestListItemView.NAME, base);
            this.data = model;
        }
        TestListItemView.prototype.eventHandler = function (name, e) {
            _super.prototype.eventHandler.call(this, name, e);

            switch (name) {
                case 'update':
                    this.data.setData({ 'name': 'Hello333', 'value': (new Date().getTime()) });
                    break;
            }
        };

        TestListItemView.prototype.test = function () {
            console.log('in child');
        };
        TestListItemView.NAME = 'TestListItemView';
        return TestListItemView;
    })(fmvc.BasisView);
})(tests || (tests = {}));

$(function ready() {
    document['app'] = new tests.TestApp();
});
//# sourceMappingURL=test2.js.map
