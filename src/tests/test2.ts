///<reference path='../fastmvc/references.ts'/>

declare var $:any;
declare var _:any;
declare var document:Document;

module tests {

    export class TestApp {
        static NAME:string = 'testapp';
        facade:fastmvc.Facade;

        constructor() {
            this.facade = new fastmvc.Facade(TestApp.NAME);
            //this.facade.getLogger().setFilter(['TestMediator', 'TestView'])


            var testObject = {'name' : 'Hello', 'value': 1};
            var testObject2 = {'name' : 'Hello', 'value': 2};

            var tm = new TestModel(testObject);
            var tlm = new TestListModel([testObject, testObject2]);
            this.facade.register(tm);
            this.facade.register(tlm);
            this.facade.register(new TestMediator(this.facade, [
                new TestView($('#testViewContent')[0],tm),
                new TestListView($('#testListViewContent')[0],tlm)
            ]));

            testObject2.name = 'Ola';
            tlm.update(testObject2);
        }
    }

    class TestModel extends fastmvc.Model {
        public static NAME:string = 'TestModel';
        constructor(data:any) {
            super(TestModel.NAME, data)
        }
    }

    class TestListModel extends fastmvc.ModelList {
        public static NAME:string = 'TestListModel';

        constructor(data:any) {
            super(TestListModel.NAME, data);
        }
    }

    class TestMediator extends fastmvc.Mediator {
        public static NAME:string = 'TestMediator';

        constructor(facade:fastmvc.Facade, views:any) {
            super(facade, TestMediator.NAME, views);
        }

        events():any {
            return[fastmvc.Event.MODEL_CHANGE];
        }

        modelEventHandler(e:any) {
            var name:string = e.target.name();
            switch (e.name) {
                case fastmvc.Event.MODEL_CHANGE:
                    switch (name) {
                        case TestModel.NAME:
                            break;
                        case TestListModel.NAME:
                            break;
                    }
            }
        }

        internalHandler(e:any):void {
            super.internalHandler(e);
        }
    }

    class TestView extends fastmvc.BTView implements fastmvc.IView {
        public static NAME:string = 'TestView';

        constructor(base:HTMLElement, model:fastmvc.Model) {
            super(TestView.NAME, base);
            this.data = model;
        }

        public init()
        {
            super.init();
            this.data.setData({name: 'Test', value:2});
            this.data.setData({value:43});
        }

        public eventHandler(name:string, e:any):void {
            super.eventHandler(name, e);
        }
    }

    class TestListView extends fastmvc.BTView implements fastmvc.IView {
        public static NAME:string = 'TestListView';

        private views:any = [];

        constructor(base:any, model:fastmvc.ModelList) {
            super(TestListView.NAME, base);
            this.data = model;
        }

        public init() {
            //super.init();
            var models = this.data.getData();
            alert('init');

            for (var i in models)
            {
                var model:fastmvc.Model = models[i];

                var view = new TestListItemView(this.base, model);
                view.mediator(this._mediator);
                view.init();

                this.log('Create element ' + view + ', ' + model);
                this.views.push[view];
            }
        }

        public render() {
        }

        public eventHandler(name:string, e:any):void {
            super.eventHandler(name, e);
        }
    }

    class TestListItemView extends fastmvc.BTView implements fastmvc.IView {
        public static NAME:string = 'TestListItemView';

        constructor(base:any, model:any) {
            super(TestListItemView.NAME, base);
            this.data = model;
        }

        public eventHandler(name:string, e:any):void {
            super.eventHandler(name, e);
        }
    }
}

$(function ready() {
    document['app'] = new tests.TestApp();
});


