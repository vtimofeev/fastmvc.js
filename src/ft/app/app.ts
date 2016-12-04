///<reference path='../d.ts'/>

namespace ft {
    import IBowser = ft.helper.IBowser;

    export var ModelName = {
        locale: 'locale',
        i18n: 'i18n',
        theme:'theme',
        router:'router',
        bowser: 'info',
        window: 'window',
        log:'log'
    };

    export class App extends fmvc.Facade {
        constructor(name:string, root:Element, type:string = '', theme:string = '', locale:string = 'ru', i18nDict:any = {}){
            super(name,type, root);

            // Модель темы, содержит строку указывающую на тему
            var themeModel:fmvc.Model<any> = new fmvc.Model<string>(ModelName.theme, theme);
            // Модель локали, содержит строку указывающую на локализацию
            var localeModel:fmvc.Model<string> = new fmvc.Model<string>(ModelName.locale, locale);
            // Объект содержащий глобальные данные i18n
            var i18nModel:fmvc.Model<any> = new fmvc.Model<any>(ModelName.i18n, i18nDict);

            var bowser:fmvc.Model<IBowser> = new fmvc.Model<IBowser>(ModelName.bowser, bowser);

            var wndModel:fmvc.Model<any> = new fmvc.Model<any>(ModelName.window, { scrollY: 0, scrollX: 0 });
            window && window.addEventListener && window.addEventListener('scroll', (e)=>{
                wndModel.changes = {
                    scrollY: window.scrollY,
                    scrollX: window.scrollX,
                    height: window.document.documentElement.clientHeight
                }
            });

            var router:ft.Router<IRouter> = new ft.Router<IRouter>(ModelName.router);
            ft.dispatcher.setHrefHandler( router.hrefHandler.bind(router) );

            // Добавляем модели по умолчанию в фасад
            this.register(localeModel, i18nModel, themeModel, bowser, router, wndModel);
        }

        init() {
            super.init();
        }

        /* Быстрый доступ к значениям */
        public get locale():string {
            return this.model[ModelName.locale].data; // Текущее значение локали
        }

        public get theme():string {
            return this.model[ModelName.theme].data; // Текущее значение темы
        }

        public get i18n():any {
            return this.model[ModelName.i18n].data; // i18n
        }

        public get info():ft.helper.IBowser {
            return ft.helper.browser;
        }

        public get router():ft.Router<IRouter> {
            return <ft.Router<IRouter>> this.model[ModelName.router];
        }


    }
}

