///<reference path="./d.ts" />

module ft {
    var tp = new TemplateParser();

    export class TemplateManager implements ITemplateManager {
        private _templateMap:{[name:string]:ITemplate} = {};
        private _templateFunc:{[name:string]:ITemplateConstructor} = {};

        constructor() {
        }

        parse(value:string):ft.ITemplate {
            var objs = tp.parseHtml(value);
            var template = tp.htmlObjectToTemplate(objs);
            return template;
        }

        addTemplate(name:string, value:ft.ITemplate):ft.ITemplateManager {
            if(this._templateMap[name]) throw 'TemplateManager: cant add constructor ' + name + ' cause it exists';
            this._templateMap[name] = value;
            return this;
        }

        getTemplate(name:string):ITemplate {
            return this._templateMap[name];
        }

        getTemplateViewFunc(templateName:string):ft.ITemplateConstructor {
            var t = this;
            return this._templateFunc[templateName] || (this._templateFunc[templateName] = function(name:string, params?:ft.ITemplateViewParams):ft.TemplateView {
                return new ft.TemplateView(name, params, t.getTemplate(templateName));
            });
        }
    }

    export var templateManager = new TemplateManager();
}