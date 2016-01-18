module todo {
    class App extends fmvc.AppFacade {
        constructor(name:string, root:Element, theme:string, locale:string, i18nDict:any) {
            super(name, root, theme, locale, i18nDict);
        }

        public initModels() {
            var itemsData = [{title: 'First', done: false}, {title: 'Second', done: true}];
            var items = new fmvc.Model('items', itemsData.map((v, k)=>new fmvc.Model('item-' + k, v)) );
            this.register(items);
        }

        public initMediators() {
            return super.initMediators();
        }
    }

    class AppMediator extends fmvc.Mediator {
        constructor(name:string, root:Element) {
            super(name, root);
        }


    }

}