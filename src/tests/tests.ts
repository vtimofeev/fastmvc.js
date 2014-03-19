declare var $:any;
declare var _:any;

module tests
{

    export class TestApp
    {
        static NAME:string = 'testapp';
        facade:fastmvc.Facade;

        constructor()
        {
            this.facade = new fastmvc.Facade(TestApp.NAME);

            this.facade.register(new fastmvc.Model('TestModel'))
            this.facade.register(new TestMediator(this.facade, TestMediator.NAME, new TestView($('#content'))));
            this.facade.getLogger().setFilter(['TestMediator', 'TestView'])

            var model:fastmvc.Model = this.facade.getObject('TestModel');
            model.setData({info:'test1'});
            model.setData({info:'test2'});
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
            var view:fastmvc.View = this.view();

            switch(e.name)
            {
                case fastmvc.Event.MODEL_CHANGE:
                    view.data = e.data;
                    view.render();
                    return;
            }
        }

        internalHandler(e:any):void {
            super.internalHandler(e);
            var model:fastmvc.Model = this.facade().getObject('TestModel');
            model.setData({'data': e.data.currentTarget.value});
            this.log('Internal handler ' + e.name);
        }
    }

    class TestViewEvent
    {
        static SEARCH_CHANGE = 'searchChange';
        static SEARCH_KEYPRESS = 'searchKeyPress';
        static ADD_CLICK = 'addClick';
        static REMOVE_CLICK = 'addClick';
    }

    class TestView extends fastmvc.View implements fastmvc.IView
    {
        public static NAME:string = 'TestView';
        public eventHandlers:any = {
            'keyup #searchInput': TestViewEvent.SEARCH_CHANGE,
            'click #addButton': TestViewEvent.ADD_CLICK
        };

        constructor($base:any)
        {
            super(TestView.NAME, $base);
        }

        public render()
        {
            this.log('Render');
            $('#modelContent').html(JSON.stringify(this.data));
        }

        public eventHandler(name:string, e:any):void {
            super.eventHandler(name, e);
            switch(name)
            {
                case TestViewEvent.SEARCH_CHANGE:
                    break;
                case TestViewEvent.ADD_CLICK:
                    break;
            }
            return;
        }

    }
}

$(function ready() {
    document.app = new tests.TestApp();
});


