///<reference path="./d.ts" />

module ft {
    export var templateHelper:TemplateViewHelper;

    export class TemplateView extends fmvc.View {
        private _template:ITemplate;
        private _componentMapByPath;
        private _elementMapByPath;

        constructor(name:string, params?:ITemplateViewParams, template?:ITemplate) {
            super(name);
        }

        createDom() {
            ft.templateHelper.createDom(this);
        }

        getTemplate():ITemplate {
            this._template;
        }

        setProperty(name:string, value:HTMLElement|TemplateView) {
        }

        setPath(path:string,  value:HTMLElement|TemplateView) {

        }



    }

    export class TemplateViewHelper implements ITemplateViewHelper {
        createDom(view:ft.TemplateView) {
        }

        createComponent(value:IDomDef):ft.TemplateView {

        }

        updateDom(view:ft.TemplateView) {
        }

    }

    interface ITemplateViewHelper {
        createDom(view:TemplateView);
        updateDom(view:TemplateView);
    }

    interface IDomDef {
        [attrName:string]:string|IExpressionName;
        tag:string;
        children?:IDomDef[];

        //special attributes
        states?:IExpressionName;
    }


}
