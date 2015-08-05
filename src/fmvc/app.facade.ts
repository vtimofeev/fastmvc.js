///<reference path='./d.ts'/>

module fmvc {
    export var DefaultModel = {
        locale: 'locale',
        i18n: 'i18n',
        theme:'theme',
        log:'log'
    };


    export class AppFacade extends Facade {
        constructor(name:string, root:Element, theme:string = '', locale:string = 'ru', i18nDict:any = {}){
            super(name,root);

            // Модель локали, содержит строку указывающую на локализацию
            var localeModel:Model = new Model(DefaultModel.locale, {value: locale});
            // Модель темы, содержит строку указывающую на тему
            var themeModel:Model = new Model(DefaultModel.theme, {value: theme});
            // Объект содержащий глобальные данные i18n
            var i18nModel:Model = new Model(DefaultModel.i18n, i18nDict);
            // Добавляем модели по умолчанию в фасад
            this.register([localeModel, i18nModel, themeModel]);
        }

        init() {
        }

        // Текущее значение локали
        public get locale():string {
            return this.model[DefaultModel.locale].data.value;
        }

        // Текущее значение темы
        public get theme():string {
            return this.model[DefaultModel.locale].data.value;
        }

        // i18n
        public get i18n():any {
            return this.model[DefaultModel.i18n].data;
        }

    }
}

