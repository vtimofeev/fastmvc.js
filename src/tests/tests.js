///<reference path='../fastmvc/references.ts'/>
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

            //this.facade.getLogger().setFilter(['TestMediator', 'TestView'])
            this.facade.register(new TestModel());
            this.facade.register(new TestListModel());
            this.facade.register(new TestMediator(this.facade, [new TestView($('#content')), new TestListView($('#content'))]));
        }
        TestApp.NAME = 'testapp';
        return TestApp;
    })();
    tests.TestApp = TestApp;

    var TestModel = (function (_super) {
        __extends(TestModel, _super);
        function TestModel() {
            _super.call(this, TestModel.NAME, {});
        }
        TestModel.NAME = 'TestModel';
        return TestModel;
    })(fastmvc.Model);

    var TestListModel = (function (_super) {
        __extends(TestListModel, _super);
        function TestListModel() {
            _super.call(this, TestListModel.NAME, []);
        }
        TestListModel.NAME = 'TestListModel';
        return TestListModel;
    })(fastmvc.Model);

    var TestMediator = (function (_super) {
        __extends(TestMediator, _super);
        function TestMediator(facade, views) {
            _super.call(this, facade, TestMediator.NAME, views);
        }
        TestMediator.prototype.events = function () {
            return [fastmvc.Event.MODEL_CHANGE];
        };

        TestMediator.prototype.modelEventHandler = function (e) {
            var name = e.target.name();

            switch (e.name) {
                case fastmvc.Event.MODEL_CHANGE:
                    switch (name) {
                        case TestModel.NAME:
                            var view = this.getView(TestView.NAME);
                            view.data = e.data;
                            view.render();
                            break;

                        case TestListModel.NAME:
                            var view = this.getView(TestListView.NAME);
                            view.data = e.data;
                            view.render();
                            break;
                    }

                    return;
            }
        };

        TestMediator.prototype.internalHandler = function (e) {
            _super.prototype.internalHandler.call(this, e);
            this.log('Internal handler ' + e.name);
            var model = this.facade().getObject('TestModel');
            var listModel = this.facade().getObject('TestListModel');

            switch (e.name) {
                case TestViewEvent.SEARCH_CHANGE:
                    var data = { 'data': e.data.currentTarget.value };

                    model.setData(data);
                    if (e.data.keyCode === 13) {
                        listModel.add(data);
                    }
                    break;
                case TestListView.EVENT_LI_DBL_CLICK:
                    var target = e.data.currentTarget;
                    var id = target.dataset['id'];
                    var item = e.target.data[Number(id)];
                    this.log('Selected: ' + JSON.stringify(item));
                    model.setData(item);
                    listModel.remove(item);

                    break;
            }
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
            this.templateData = [];
            this.template = bt('id:template.basis');
            this.container = document.getElementById('content');
        }
        TestView.prototype.render = function () {
            for (var i in this.data) {
                var instance = this.template.createInstance();
                this.container.append(instance);
            }
        };

        TestView.prototype.eventHandler = function (name, e) {
            _super.prototype.eventHandler.call(this, name, e);
            switch (name) {
                case TestViewEvent.SEARCH_CHANGE:
                    this.log('KeyCode ' + e.keyCode);
                    if (e.keyCode === 13) {
                        $('#searchInput').val('');
                    }
                    break;
                case TestViewEvent.ADD_CLICK:
                    break;
            }
            return;
        };
        TestView.NAME = 'TestView';
        return TestView;
    })(fastmvc.View);

    var TestListView = (function (_super) {
        __extends(TestListView, _super);
        function TestListView($base) {
            _super.call(this, TestListView.NAME, $base);
            this.eventHandlers = {
                'dblclick #listModelContent li': TestListView.EVENT_LI_DBL_CLICK,
                'keyup #listModelContent li': TestListView.EVENT_LI_EDIT_KEY,
                'focusout #listModelContent li': TestListView.EVENT_LI_DBL_CLICK
            };
        }
        TestListView.prototype.render = function () {
            var tmpl = _.template($('#template').html());
            var result = tmpl({ data: this.data });

            this.log('Render ' + tmpl + ', ' + result);
            $('#listModelContent').html(result);
        };

        TestListView.prototype.eventHandler = function (name, e) {
            _super.prototype.eventHandler.call(this, name, e);
            var $trg = $(e.currentTarget);
            switch (name) {
                case TestListView.EVENT_LI_DBL_CLICK:
                    this.switchView($trg);
                    break;
                case TestListView.EVENT_LI_EDIT_KEY:
                    if (e.keyCode === 13)
                        this.switchView($trg);
                    break;
            }
            return;
        };

        TestListView.prototype.switchView = function ($trg) {
            if ($trg.hasClass('enable-default')) {
                $trg.removeClass('enable-default');
                $trg.addClass('enable-edit');
                $trg.find('input').focus();
            } else {
                $trg.removeClass('enable-edit');
                $trg.addClass('enable-default');
            }
        };
        TestListView.NAME = 'TestListView';

        TestListView.EVENT_LI_CLICK = 'liClick';
        TestListView.EVENT_LI_DBL_CLICK = 'liDblClick';
        TestListView.EVENT_LI_EDIT_KEY = 'liEditKey';
        return TestListView;
    })(fastmvc.View);
})(tests || (tests = {}));

$(function ready() {
    document.app = new tests.TestApp();
});
//# sourceMappingURL=tests.js.map
