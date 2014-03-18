declare var $:any;
declare var _:any;

module tests
{

    class TestApp
    {
        static NAME:string = 'testapp';
        facade:fastmvc.Facade;

        constructor()
        {
            this.facade = new fastmvc.Facade(TestApp.NAME);
            this.facade.register(new fastmvc.Model('TestModel'))
            this.facade.register(new TestMediator(TestMediator.NAME, new TestView($('#content'))));
        }
    }

    class TestMediator extends fastmvc.Mediator
    {
        public static NAME:string = 'TestMediator';

        events():any
        {
            return[fastmvc.Event.MODEL_CHANGE];
        }

        modelEventHandler(e:any)
        {
        }

        internalEventHandler(e:any)
        {
            switch (e.name)
            {
                case TestViewEvent.ADD_CLICK:
                    return;
                case TestViewEvent.SEARCH_CLICK:
                    return;
            }
        }

    }

    class TestViewEvent
    {
        static SEARCH_CLICK = 'searchClick';
        static SEARCH_KEYPRESS = 'searchKeyPress';
        static ADD_CLICK = 'addClick';
        static REMOVE_CLICK = 'addClick';
    }

    class TestView extends fastmvc.View implements fastmvc.IView
    {
        public static NAME:string = 'TestView';

        eventHandlers = {
            'keyup keypress #searchInput': TestViewEvent.SEARCH_CLICK,
            'click #addButton': TestViewEvent.ADD_CLICK
        };


        constructor(name:string, $base:any)
        {
            super(name, $base);
        }

        public render()
        {
        }


    }


}


