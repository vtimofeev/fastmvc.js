///<reference path='../fastmvc/references.ts'/>

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
            //this.facade.getLogger().setFilter(['TestMediator', 'TestView'])

            this.facade.register(new TestModel());
            this.facade.register(new TestListModel());
            this.facade.register(new TestMediator(this.facade, [ new TestView($('#content')) , new TestListView($('#content')) ] ));
        }
    }

    class TestModel extends fastmvc.Model
    {
        public static NAME:string = 'TestModel';
        constructor()
        {
            super(TestModel.NAME, {})
        }
    }

    class TestListModel extends fastmvc.Model
    {
        public static NAME:string = 'TestListModel';
        constructor()
        {
            super(TestListModel.NAME, [])
        }
    }

    class TestMediator extends fastmvc.Mediator
    {
        public static NAME:string = 'TestMediator';

        constructor(facade:fastmvc.Facade, views:any)
        {
            super(facade, TestMediator.NAME, views);
        }

        events():any
        {
            return[fastmvc.Event.MODEL_CHANGE];
        }

        modelEventHandler(e:any)
        {
            var name:string = e.target.name();

            switch(e.name)
            {
                case fastmvc.Event.MODEL_CHANGE:

                    switch(name)
                    {
                        case TestModel.NAME:
                            var view:fastmvc.View = this.getView(TestView.NAME);
                            view.data = e.data;
                            view.render();
                            break;

                        case TestListModel.NAME:
                            var view:fastmvc.View = this.getView(TestListView.NAME);
                            view.data = e.data;
                            view.render();
                            break;
                    }

                    return;
            }
        }

        internalHandler(e:any):void {
            super.internalHandler(e);
            this.log('Internal handler ' + e.name);
            var model:fastmvc.Model = this.facade().getObject('TestModel');
            var listModel:fastmvc.Model = this.facade().getObject('TestListModel');


            switch(e.name)
            {
                case TestViewEvent.SEARCH_CHANGE:
                    var data:any = {'data': e.data.currentTarget.value};

                    model.setData(data);
                    if(e.data.keyCode === 13)
                    {
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


        }
    }

    class TestViewEvent
    {
        static SEARCH_CHANGE:string = 'searchChange';
        static SEARCH_KEYPRESS:string = 'searchKeyPress';
        static ADD_CLICK:string = 'addClick';
        static REMOVE_CLICK:string = 'addClick';
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

        set Data(value:any)
        {
            this.data = value;
        }

        get Data():any
        {
            return this.data;
        }



        public render()
        {
            this.Data = [1,2,3];
            var data = this.Data;
            this.log('Render');
            $('#modelContent').html(JSON.stringify(this.data));
        }

        public eventHandler(name:string, e:any):void {
            super.eventHandler(name, e);
            switch(name)
            {
                case TestViewEvent.SEARCH_CHANGE:
                    this.log('KeyCode ' + e.keyCode);
                    if(e.keyCode === 13)
                    {
                        $('#searchInput').val('');
                    }
                    break;
                case TestViewEvent.ADD_CLICK:
                    break;
            }
            return;
        }
    }

    class TestListView extends fastmvc.View implements fastmvc.IView
    {
        public static NAME:string = 'TestListView';

        static EVENT_LI_CLICK:string = 'liClick';
        static EVENT_LI_DBL_CLICK:string = 'liDblClick';
        static EVENT_LI_EDIT_KEY:string = 'liEditKey';

        public eventHandlers:any = {
            'dblclick #listModelContent li': TestListView.EVENT_LI_DBL_CLICK,
            'keyup #listModelContent li': TestListView.EVENT_LI_EDIT_KEY,
            'focusout #listModelContent li': TestListView.EVENT_LI_DBL_CLICK
        };


        constructor($base:any)
        {
            super(TestListView.NAME, $base);
        }

        public render()
        {

            var tmpl:any = _.template($('#template').html());
            var result:string = tmpl({data: this.data});

            this.log('Render ' + tmpl + ', ' + result);
            $('#listModelContent').html(result);

        }

        public eventHandler(name:string, e:any):void {
            super.eventHandler(name, e);
            var $trg = $(e.currentTarget);
            switch(name)
            {
                case TestListView.EVENT_LI_DBL_CLICK:
                    this.switchView($trg);
                    break;
                case TestListView.EVENT_LI_EDIT_KEY:
                    if(e.keyCode === 13) this.switchView($trg);
                    break;

            }
            return;
        }


        private switchView($trg)
        {
            if ($trg.hasClass('enable-default'))
            {
                $trg.removeClass('enable-default');
                $trg.addClass('enable-edit');
                $trg.find('input').focus();
            }
            else
            {
                $trg.removeClass('enable-edit');
                $trg.addClass('enable-default');

            }
        }
    }
}

$(function ready() {
    document.app = new tests.TestApp();
});


