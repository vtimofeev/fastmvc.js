///<reference path='../fmvc/references.ts'/>

declare var $:any;
declare var _:any;
declare var document:Document;

module tests {

    export class TestApp {
        static NAME:string = 'testapp';
        facade:fmvc.Facade;

        constructor() {
            this.facade = new fmvc.Facade(TestApp.NAME);
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

    class TestModel extends fmvc.Model {
        public static NAME:string = 'TestModel';
        constructor(data:any) {
            super(TestModel.NAME, data)
        }
    }

    class TestListModel extends fmvc.ModelList {
        public static NAME:string = 'TestListModel';

        constructor(data:any) {
            super(TestListModel.NAME, data);
        }
    }

    class TestMediator extends fmvc.Mediator {
        public static NAME:string = 'TestMediator';

        constructor(facade:fmvc.Facade, views:any) {
            super(facade, TestMediator.NAME, views);
        }

        events():any {
            return[fmvc.Event.MODEL_CHANGED];
        }

        modelEventHandler(e:any) {
            var name:string = e.target.name();
            switch (e.name) {
                case fmvc.Event.MODEL_CHANGED:
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

    class TestView extends fmvc.BasisView implements fmvc.IView {
        public static NAME:string = 'TestView';

        constructor(base:HTMLElement, model:fmvc.Model) {
            super(TestView.NAME, base, null, model);
        }

        public init()
        {
            super.init();
            this.getModel().setData({name: 'Test', value:2})
            /*
            this.data.setData({name: 'Test', value:2});
            this.data.setData({value:43});
            this.data.setData({value:48});
             this.destroy();
            */
        }

        public eventHandler(name:string, e:any):void {
            super.eventHandler(name, e);
        }
    }

    class TestListView extends fmvc.BasisListView implements fmvc.IView {
        public static NAME:string = 'TestListView';

        private views:any = ['content'];
        private content:HTMLElement;

        constructor(base:any, model:fmvc.ModelList) {
            super(TestListView.NAME, base, null, model);
        }

        public init() {
            super.init();
            /*
            var models = this.data.getData();
            alert('init');

            for (var i in models)
            {
                var model:fmvc.Model = models[i];

                var view = new TestListItemView(this.base, model);
                view.mediator(this._mediator);
                view.init();


                this.log('Create element ' + view + ', ' + model);
                this.views.push[view];
            }
            */
        }

        public eventHandler(name:string, e:any):void {
            super.eventHandler(name, e);

        }
    }

    class TestListItemView extends fmvc.BasisView implements fmvc.IView {
        public static NAME:string = 'TestListItemView';

        constructor(base:any, model:any) {
            super(TestListItemView.NAME, base);
            this.data = model;
        }

        public eventHandler(name:string, e:any):void {
            super.eventHandler(name, e);

            switch(name)
            {
                case 'update':
                    this.data.setData({'name' : 'Hello333', 'value': (new Date().getTime())});
                    break;
            }
        }

        public test()
        {
            console.log('in child');
        }

    }
}

$(function ready() {
    document['app'] = new tests.TestApp();
});


