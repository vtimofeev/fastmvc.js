///<reference path='../fmvc/d.ts'/>

module fmvc {
    export var ModelName = {
        locale: 'locale',
        i18n: 'i18n',
        theme:'theme',
        log:'log'
    };


    export class AppFacade extends Facade {
        constructor(name:string, root:Element, type:string = '', theme:string = '', locale:string = 'ru', i18nDict:any = {}){
            super(name,type, root);

            // Модель локали, содержит строку указывающую на локализацию
            var localeModel:Model<string> = new Model<string>(ModelName.locale, locale);
            // Модель темы, содержит строку указывающую на тему
            var themeModel:Model<any> = new Model<any>(ModelName.theme, {value: theme});
            // Объект содержащий глобальные данные i18n
            var i18nModel:Model<any> = new Model<any>(ModelName.i18n, i18nDict);
            // Добавляем модели по умолчанию в фасад
            this.register(localeModel, i18nModel, themeModel);
        }

        init() {
        }

        // Текущее значение локали
        public get locale():string {
            return this.model[ModelName.locale].data.value;
        }

        // Текущее значение темы
        public get theme():string {
            return this.model[ModelName.locale].data.value;
        }

        // i18n
        public get i18n():any {
            return this.model[ModelName.i18n].data;
        }

    }
}

