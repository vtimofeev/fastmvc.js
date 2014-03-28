///<reference path='../fastmvc/references.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var help;
(function (help) {
    var Application = (function () {
        function Application() {
            this.facade = new fastmvc.Facade('HelpApplication');
        }
        return Application;
    })();
    help.Application = Application;

    var ApplicationMediator = (function (_super) {
        __extends(ApplicationMediator, _super);
        function ApplicationMediator(facade) {
            _super.call(this, facade, ApplicationMediator.NAME);
        }
        ApplicationMediator.prototype.cdnTasks = function () {
        };

        ApplicationMediator.prototype.wmodeFPTasks = function () {
        };
        ApplicationMediator.NAME = 'ApplicationMediator';
        return ApplicationMediator;
    })(fastmvc.Mediator);

    var ApplicationView = (function (_super) {
        __extends(ApplicationView, _super);
        function ApplicationView() {
            _super.call(this, ApplicationView.NAME, $('body'));
        }
        ApplicationView.NAME = 'ApplicationView';
        return ApplicationView;
    })(fastmvc.View);

    var TVScheduleView = (function (_super) {
        __extends(TVScheduleView, _super);
        function TVScheduleView() {
            _super.call(this, TVScheduleView.NAME, $('body'));
        }
        TVScheduleView.prototype.init = function () {
            _super.prototype.init.call(this);
        };

        TVScheduleView.prototype.createItems = function () {
        };
        TVScheduleView.NAME = 'TVScheduleView';
        return TVScheduleView;
    })(fastmvc.BTView);

    var TVScheduleItemView = (function (_super) {
        __extends(TVScheduleItemView, _super);
        function TVScheduleItemView() {
            _super.call(this, TVScheduleView.NAME, $('body'));
        }
        TVScheduleItemView.NAME = 'TVScheduleItemView';
        return TVScheduleItemView;
    })(fastmvc.BTView);

    var EnvironmentView = (function (_super) {
        __extends(EnvironmentView, _super);
        function EnvironmentView() {
            _super.call(this, EnvironmentView.NAME, $('body'));
        }
        EnvironmentView.NAME = 'EnvironmentView';
        return EnvironmentView;
    })(fastmvc.View);

    var FormView = (function (_super) {
        __extends(FormView, _super);
        function FormView() {
            _super.call(this, FormView.NAME, $('body'));
        }
        FormView.prototype.init = function () {
            _super.prototype.init.call(this, ['nameInput', 'emailInput', 'problemSelect', 'problemTextarea']);
        };

        FormView.prototype.show = function (value) {
        };

        FormView.prototype.validate = function () {
            return false;
        };
        FormView.NAME = 'FormView';
        return FormView;
    })(fastmvc.BTView);

    var TVSheduleModel = (function (_super) {
        __extends(TVSheduleModel, _super);
        function TVSheduleModel() {
            _super.call(this, TVSheduleModel.NAME);
        }
        TVSheduleModel.prototype.load = function (url) {
        };

        TVSheduleModel.prototype.successLoadHandler = function (value) {
        };

        TVSheduleModel.prototype.faultLoadHandler = function (value) {
        };
        TVSheduleModel.NAME = 'TVScheduleModel';
        return TVSheduleModel;
    })(fastmvc.Model);

    var UserModel = (function (_super) {
        __extends(UserModel, _super);
        function UserModel() {
            _super.call(this, UserModel.NAME);
        }
        UserModel.prototype.setData = function (value) {
            _super.prototype.setData.call(this, value);
        };
        UserModel.NAME = 'UserModel';
        return UserModel;
    })(fastmvc.Model);

    var problems = {
        '0': 'Частые буферизации и потеря соединения',
        '1': 'Трансляция не запускается',
        '2': 'Отображается черный экран, звук есть',
        '3': 'Другое'
    };
})(help || (help = {}));
//# sourceMappingURL=help.js.map
