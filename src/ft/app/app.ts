///<reference path='../d.ts'/>

module ft {
    export var ModelName = {
        locale: 'locale',
        i18n: 'i18n',
        theme:'theme',
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

            // Добавляем модели по умолчанию в фасад
            this.register(localeModel, i18nModel, themeModel);
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

        public get browser():ft.helper.IBowser {
            return ft.helper.browser;
        }

    }
}

