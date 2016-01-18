///<reference path="./d.ts" />

module ft {
    export var globalScope:any = window || {};
    export var templateParser = new TemplateParser();

    /**
     * Менеджер классов,
     * 1. используется для создания классов и регистрации их в глобальном скоупе, имеет возможности для переопределения встроенных методов и параметорв, создания новых.
     * 2. используется для получения экземпляров классов
     *
     */
    export class TemplateManager implements ITemplateManager {
        private _templateMap:{[className:string]:ITemplate} = {};
        private _instanceFunc:{[className:string]:ITemplateConstructor} = {};

        constructor() {
            _.bindAll(this, 'createClass', 'createInstance');
        }

        public load(value):void {
            if (_.isArray(value)) {
                value.forEach((v)=>this.createClass(v.className, v.content, v.params, v.mixin), this);
            }
            else if (_.isObject(value)) {
                this.createClass(value.className, value.content, value.params, value.mixin);
            }
            else {
                throw 'TemplateManager:load unsupported argument ' + value;
            }
        }


        /**
         * Создаем класc - функцию которая линкует экземпляр "TemplateView" с параметрами заданными при создании класса, и расширением методоа
         * ***В функции конструкторе используется хак переопределения возвращаемого значения, это работает только для объектов
         *
         * @param className
         * @param content
         * @param params
         * @param mixin
         * @returns {ITemplateConstructor}
         */
        public createClass(className:string, content:string, params:any, mixin:any):ITemplateConstructor {
            var templateData:ITemplate = this.parse(content);
            console.log('Add ', className, content);

            if (this._templateMap[className]) throw 'TemplateManager: cant add ITempalte object of ' + className + ' cause it exists.';
            this._templateMap[className] = templateData;

            var result:ITemplateConstructor = this.createInstanceFunc(className, params, mixin);
            this.registerClass(className, result);
            return result;
        }

        /**
         * Фабрика классов, создание экземпляров по имени класса, имени экземпляра, параметрам и расширению методов ( которые в свою очередь будут расширять базовые)
         * Возвращает расширенный экземпляр TemplateView
         *
         * @param className
         * @param name
         * @param params
         * @param mixin
         * @returns {any}
         */
        public createInstance(className:string, name:string, params?:any, mixin?:any):ft.TemplateView {
            return this._instanceFunc[className](name, params, mixin);
        }


        /* Регистрируем класс (функцию конструктор), в глобальном скоупе */
        private registerClass(className:string, value:ITemplateConstructor):void {
            _.reduce(className.split('.'), (g, v)=>(g[v] ? g[v] : (g[v] = {})), globalScope); // create constructor map at window
        }

        /* Создаем функцию конструктор, связанную с текущим именем класса и расширением - параметоров и методоа */
        private createInstanceFunc(className:string, baseParams:any, baseMixin:any):ITemplateConstructor {
            var template = this._templateMap[className];
            if (!this._instanceFunc[className]) {
                this._instanceFunc[className] = function (name:string, params?:any, mixin?:any):ft.TemplateView {
                    //console.log('CreateInstance  ', name, baseParams, baseMixin, params, mixin);
                    var instanceParams:any = _.extend({}, baseParams, params); // extend base parameters
                    var instanceMixin:any = _.extend({}, baseMixin, mixin); // extend methods
                    var instance = new ft.TemplateView(name, instanceParams, template);
                    //console.log('CreateInstance base (p),(m) local (p),(m) instance p,m ', name, baseParams, baseMixin, params, mixin, instanceParams, instanceMixin);
                    _.each(instanceMixin, (v, k)=>instance[k] = v);

                    return instance;
                };
            }
            return this._instanceFunc[className];
        }

        /* Парсим текстовый шаблон, затем дополнительно обрабатываем для представления в виде "ITemplate" */
        private parse(value:string):ITemplate {
            var objs = templateParser.parseHtml(value);
            var template:ITemplate = templateParser.htmlObjectToTemplate(objs);
            //@todo: Добавить проверку синтаксиса html и выражений, выводить в специальный логгер
            return template;
        }
    }

    export var templateManager = new TemplateManager();
    export var createClass = templateManager.createClass;
    export var createInstance = templateManager.createInstance;
    export var load = templateManager.load;
}