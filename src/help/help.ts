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

    class TVScheduleView extends fastmvc.BTView {
        static NAME:string  = 'TVScheduleView';

        items:Array<TVScheduleItemView>;

        constructor()
        {
            super(TVScheduleView.NAME, $('body'));
        }

        init():void
        {
            super.init();
        }

        createItems():void
        {

        }

    }

    class TVScheduleItemView extends fastmvc.BTView {
        static NAME:string  = 'TVScheduleItemView';

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

    class FormView extends fastmvc.BTView
    {
        static NAME:string  = 'FormView';

        nameInput:HTMLElement;
        emailInput:HTMLElement;
        problemSelect:HTMLElement;
        problemTextarea:HTMLElement;

        constructor()
        {
            super(FormView.NAME, $('body'));
        }

        public init()
        {
            super.init(['nameInput', 'emailInput', 'problemSelect', 'problemTextarea']);

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

        constructor() {
            super(TVSheduleModel.NAME);
        }

        public load(url)
        {
        }

        successLoadHandler(value:any)
        {
        }

        faultLoadHandler(value:any)
        {
        }
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