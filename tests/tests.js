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
            this.facade.register(new TestMediator(TestMediator.NAME, new TestView($('#content'))));
        }
        TestApp.NAME = 'testapp';
        return TestApp;
    })();

    var TestMediator = (function (_super) {
        __extends(TestMediator, _super);
        function TestMediator() {
            _super.apply(this, arguments);
        }
        TestMediator.prototype.events = function () {
            return [fastmvc.Event.MODEL_CHANGE];
        };

        TestMediator.prototype.modelEventHandler = function (e) {
        };

        TestMediator.prototype.internalEventHandler = function (e) {
            switch (e.name) {
                case TestViewEvent.ADD_CLICK:
                    return;
                case TestViewEvent.SEARCH_CLICK:
                    return;
            }
        };
        TestMediator.NAME = 'TestMediator';
        return TestMediator;
    })(fastmvc.Mediator);

    var TestViewEvent = (function () {
        function TestViewEvent() {
        }
        TestViewEvent.SEARCH_CLICK = 'searchClick';
        TestViewEvent.SEARCH_KEYPRESS = 'searchKeyPress';
        TestViewEvent.ADD_CLICK = 'addClick';
        TestViewEvent.REMOVE_CLICK = 'addClick';
        return TestViewEvent;
    })();

    var TestView = (function (_super) {
        __extends(TestView, _super);
        function TestView(name, $base) {
            _super.call(this, name, $base);
            this.eventHandlers = {
                'keyup keypress #searchInput': TestViewEvent.SEARCH_CLICK,
                'click #addButton': TestViewEvent.ADD_CLICK
            };
        }
        TestView.prototype.render = function () {
        };
        TestView.NAME = 'TestView';
        return TestView;
    })(fastmvc.View);
})(tests || (tests = {}));
//@ sourceMappingURL=tests.js.map
