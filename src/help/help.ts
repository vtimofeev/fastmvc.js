///<reference path='../fmvc/references.ts'/>

declare var $;
declare var _;
declare var window:Window;
declare var document:Document;

module help {
    export class Application {
        facade:fmvc.Facade;
        constructor() {
            this.facade = new fmvc.Facade('HelpApplication');
        }
    }

    class ApplicationMediator extends fmvc.Mediator {
        static NAME:string = 'ApplicationMediator';

        constructor(facade:fmvc.Facade) {
            super(facade, ApplicationMediator.NAME);
        }

        cdnTasks():void {
        }

        wmodeFPTasks():void {
        }

    }

    class ApplicationView extends fmvc.View {
        static NAME:string  = 'ApplicationView';

        constructor()
        {
            super(ApplicationView.NAME, $('body'));
        }
    }

    class TVScheduleView extends fmvc.BasisView {
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

    class TVScheduleItemView extends fmvc.BasisView {
        static NAME:string  = 'TVScheduleItemView';

        constructor()
        {
            super(TVScheduleView.NAME, $('body'));
        }
    }

    class EnvironmentView extends fmvc.View {
        static NAME:string  = 'EnvironmentView';

        constructor()
        {
            super(EnvironmentView.NAME, $('body'));
        }
    }

    class FormView extends fmvc.BasisView
    {
        static NAME:string  = 'FormView';
        items:any = ['nameInput', 'emailInput', 'problemSelect', 'problemTextarea'];

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
            super.init();
        }


        public show(value:Boolean)
        {
        }

        public validate():boolean
        {
            return false;
        }
    }

    class TVSheduleModel extends fmvc.Model
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

    class UserModel extends fmvc.Model {
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