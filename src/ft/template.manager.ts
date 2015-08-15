///<reference path="./d.ts" />

module ft {
    export class TemplateManager implements ITemplateManager {
        parse(value:string):ft.ITemplate {
            return undefined;
        }

        add(name:string, value:ft.ITemplate):ft.ITemplateManager {
            return undefined;
        }

        get(name:string):ft.ITemplate {
            return undefined;
        }

        getConstructor(template:ft.ITemplate):ft.ITemplateConstructor {
            return function(name:string, params?:ft.ITemplateViewParams):ft.TemplateView {
                return new ft.TemplateView(name, params, template);
            };
        }

        constructor() {

        }
    }


}