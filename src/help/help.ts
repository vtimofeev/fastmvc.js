///<reference path='../fastmvc/references.ts'/>

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

    class FormView extends fastmvc.View {
        static NAME:string  = 'FormView';

        inputName:HTMLElement ;


        constructor()
        {
            super(FormView.NAME, $('body'));
        }
    }


    class ApplicationView extends fastmvc.View {
        static NAME:string  = 'ApplicationView';

        constructor()
        {
            super(ApplicationView.NAME, $('body'));
        }
    }

    class TVView extends fastmvc.View {
        static NAME:string  = 'TVView';

        constructor()
        {
            super(TVView.NAME, $('body'));
        }

    }

    class EnvironmentView extends fastmvc.View {
        static NAME:string  = 'EnvironmentView';

        constructor()
        {
            super(EnvironmentView.NAME, $('body'));
        }
    }



    class CDNModel extends fastmvc.Model {
        static NAME:string = 'CDNModel';

        constructor() {
            super(CDNModel.NAME);
        }
    }


    export class UserModel extends fastmvc.Model {
        static NAME:string = 'UserModel';

        default() {
            super.setData({ name: 'Имя', email: '', phone: '', ua: '', playerEnvironment: '', player: '', ip: '', problem: '', problemText: '' });
        }

        constructor() {
            super(UserModel.NAME);
            this.default();
        }
    }

    var problems:any = {
        'p0': 'Частые буферизации и потеря соединения',
        'p1': 'Трансляция не запускается',
        'p2': 'Отображается черный экран, звук есть',
        'p3': 'Другое'
    }
}