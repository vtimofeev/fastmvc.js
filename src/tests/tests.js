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
            this.facade = new fastmvc.Facade(TestApp.NAME);

            this.facade.register(new fastmvc.Model('TestModel'));
            this.facade.register(new TestMediator(this.facade, TestMediator.NAME, new TestView($('#content'))));
            this.facade.getLogger().setFilter(['TestMediator', 'TestView']);

            var model = this.facade.getObject('TestModel');
            model.setData({ info: 'test1' });
            model.setData({ info: 'test2' });
        }
        TestApp.NAME = 'testapp';
        return TestApp;
    })();
    tests.TestApp = TestApp;

    var TestMediator = (function (_super) {
        __extends(TestMediator, _super);
        function TestMediator() {
            _super.apply(this, arguments);
        }
        TestMediator.prototype.events = function () {
            return [fastmvc.Event.MODEL_CHANGE];
        };

        TestMediator.prototype.modelEventHandler = function (e) {
            var view = this.view();

            switch (e.name) {
                case fastmvc.Event.MODEL_CHANGE:
                    view.data = e.data;
                    view.render();
                    return;
            }
        };

        TestMediator.prototype.internalHandler = function (e) {
            _super.prototype.internalHandler.call(this, e);
            var model = this.facade().getObject('TestModel');
            model.setData({ 'data': e.data.currentTarget.value });
            this.log('Internal handler ' + e.name);
        };
        TestMediator.NAME = 'TestMediator';
        return TestMediator;
    })(fastmvc.Mediator);

    var TestViewEvent = (function () {
        function TestViewEvent() {
        }
        TestViewEvent.SEARCH_CHANGE = 'searchChange';
        TestViewEvent.SEARCH_KEYPRESS = 'searchKeyPress';
        TestViewEvent.ADD_CLICK = 'addClick';
        TestViewEvent.REMOVE_CLICK = 'addClick';
        return TestViewEvent;
    })();

    var TestView = (function (_super) {
        __extends(TestView, _super);
        function TestView($base) {
            _super.call(this, TestView.NAME, $base);
            this.eventHandlers = {
                'keyup #searchInput': TestViewEvent.SEARCH_CHANGE,
                'click #addButton': TestViewEvent.ADD_CLICK
            };
        }
        TestView.prototype.render = function () {
            this.log('Render');
            $('#modelContent').html(JSON.stringify(this.data));
        };

        TestView.prototype.eventHandler = function (name, e) {
            _super.prototype.eventHandler.call(this, name, e);
            switch (name) {
                case TestViewEvent.SEARCH_CHANGE:
                    break;
                case TestViewEvent.ADD_CLICK:
                    break;
            }
            return;
        };
        TestView.NAME = 'TestView';
        return TestView;
    })(fastmvc.View);
})(tests || (tests = {}));

$(function ready() {
    document.app = new tests.TestApp();
});
//@ sourceMappingURL=tests.js.map
