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

    var FormView = (function (_super) {
        __extends(FormView, _super);
        function FormView() {
            _super.call(this, FormView.NAME, $('body'));
        }
        FormView.NAME = 'FormView';
        return FormView;
    })(fastmvc.View);

    var ApplicationView = (function (_super) {
        __extends(ApplicationView, _super);
        function ApplicationView() {
            _super.call(this, ApplicationView.NAME, $('body'));
        }
        ApplicationView.NAME = 'ApplicationView';
        return ApplicationView;
    })(fastmvc.View);

    var TVView = (function (_super) {
        __extends(TVView, _super);
        function TVView() {
            _super.call(this, TVView.NAME, $('body'));
        }
        TVView.NAME = 'TVView';
        return TVView;
    })(fastmvc.View);

    var EnvironmentView = (function (_super) {
        __extends(EnvironmentView, _super);
        function EnvironmentView() {
            _super.call(this, EnvironmentView.NAME, $('body'));
        }
        EnvironmentView.NAME = 'EnvironmentView';
        return EnvironmentView;
    })(fastmvc.View);

    var CDNModel = (function (_super) {
        __extends(CDNModel, _super);
        function CDNModel() {
            _super.call(this, CDNModel.NAME);
        }
        CDNModel.NAME = 'CDNModel';
        return CDNModel;
    })(fastmvc.Model);

    var UserModel = (function (_super) {
        __extends(UserModel, _super);
        function UserModel() {
            _super.call(this, UserModel.NAME);
            this.default();
        }
        UserModel.prototype.default = function () {
            _super.prototype.setData.call(this, { name: 'Имя', email: '', phone: '', ua: '', playerEnvironment: '', player: '', ip: '', problem: '', problemText: '' });
        };
        UserModel.NAME = 'UserModel';
        return UserModel;
    })(fastmvc.Model);
    help.UserModel = UserModel;

    var problems = {
        'p0': 'Частые буферизации и потеря соединения',
        'p1': 'Трансляция не запускается',
        'p2': 'Отображается черный экран, звук есть',
        'p3': 'Другое'
    };
})(help || (help = {}));
//# sourceMappingURL=help.js.map
