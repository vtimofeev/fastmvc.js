///<reference path='../fastmvc/references.ts'/>

declare var $;
declare var _;
declare var window:Window;
declare var document:Document;

module help {
    export class Application {
        facade:fastmvc.Facade;
        constructor() {
            this.facade = new fastmvc.Facade('HelpApplication');
        }
    }

    class ApplicationMediator extends fastmvc.Mediator {
        static NAME:string = 'ApplicationMediator';

        constructor(facade:fastmvc.Facade) {
            super(facade, ApplicationMediator.NAME);
        }

        cdnTasks():void {
        }

        wmodeFPTasks():void {
        }

    }

    class ApplicationView extends fastmvc.View {
        static NAME:string  = 'ApplicationView';

        constructor()
        {
            super(ApplicationView.NAME, $('body'));
        }
    }

    class TVScheduleView extends fastmvc.View {
        static NAME:string  = 'TVView';

        constructor()
        {
            super(TVScheduleView.NAME, $('body'));
        }
    }

    class EnvironmentView extends fastmvc.View {
        static NAME:string  = 'EnvironmentView';

        constructor()
        {
            super(EnvironmentView.NAME, $('body'));
        }
    }

    class FormView extends fastmvc.View
    {
        static NAME:string  = 'FormView';

        inputName:HTMLElement;


        constructor()
        {
            super(FormView.NAME, $('body'));
        }

        public show(value:Boolean)
        {
        }

        public validate():boolean
        {
            return false;
        }


    }


    class TVSheduleModel extends fastmvc.Model
    {
        static NAME:string  = 'TVScheduleModel';


    }

    class UserModel extends fastmvc.Model {
        static NAME:string = 'UserModel';

        constructor() {
            super(UserModel.NAME);
        }

        setData(value:IUserData)
        {
            super.setData(value);
        }
    }

    interface ITVScheduleProgram
    {
        title:string;
        geo:string;
        age:string;
        time:number;
    }

    interface IUserData
    {
        userId:string;
        name:string;
        email:string;
        problem:string;
        description?:string;
    }

    interface IEnvironmentData
    {
        playerMode:string;
        playerVersion:string;
        fpVersion?:string;

        ip:string;

        ua:string;

        country:string;
        city:string;
        region:string;
        provider:string;
    }


    var problems:any = {
        '0': 'Частые буферизации и потеря соединения',
        '1': 'Трансляция не запускается',
        '2': 'Отображается черный экран, звук есть',
        '3': 'Другое'
    }
}