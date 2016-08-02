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
        private _classData:{[className:string]:{template: ITemplate, content: string, params:any, mixin: any}} = {};
        private _instanceFunc:{[className:string]:ITemplateConstructor} = {};

        constructor() {
            _.bindAll(this, 'createClass', 'createInstance', 'load');
        }

        public loadAsync(url:string, base:string):fmvc.IPromise {
            var className = url.replace('.ft', '').replace(/\//g, '.'),
                t = this;
            return $.get(base + url)
                .then( (v)=>({ className: className, content: v}) )
                .then( t.load );
        }

        public load(value):void {
            if (_.isArray(value)) {
                value.forEach((v)=>this.load(v), this);
            }
            else if (_.isObject(value)) {
                if(value.extendClassName) {
                    var baseClass = this._classData[value.extendClassName];
                    if(!baseClass) throw 'Cant found base class to extend ' + value.extendClassName;

                    this.createClass(value.className,
                        value.content || baseClass.content,
                        _.extend(baseClass.params || {}, value.params),
                        _.extend(baseClass.mixin || {}, value.mixin)
                    );
                } else {
                    this.createClass(value.className, value.content, value.params, value.mixin);
                }
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

            if (this._classData[className]) throw 'TemplateManager: cant add ITempalte object of ' + className + ' cause it exists.';

            this._classData[className] = {template: templateData, content: content, params: params, mixin: mixin};
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
            var instance;

            try {
                instance = this._instanceFunc[className](name, params, mixin);
            }
            catch (e) {
                console.error('Cant create instance of ' , className, ' with name, params, mixin ', name, params, mixin );
                throw e;
            }

            return instance;
        }

        /* Регистрируем класс (функцию конструктор), в глобальном скоупе */
        private registerClass(className:string, value:ITemplateConstructor):void {
            _.reduce(className.split('.'), (g, v)=>(g[v] ? g[v] : (g[v] = {})), globalScope); // create constructor map at window
        }

        /* Создаем функцию конструктор, связанную с текущим именем класса и расширением - параметоров и методоа */
        private createInstanceFunc(className:string, baseParams:any, baseMixin:any):ITemplateConstructor {
            var template = this._classData[className].template;
            if (!this._instanceFunc[className]) {
                this._instanceFunc[className] = function (name:string, params?:any, mixin?:any):ft.TemplateView {
                    console.log('CreateInstance  ', name, baseParams,params,  baseMixin,  mixin);
                    var instanceParams:any = _.extend({}, baseParams, params); // extend base parameters
                    var instanceMixin:any = _.extend({}, baseMixin, mixin); // extend methods
                    var instance = new ft.TemplateView(name, instanceParams, template);
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