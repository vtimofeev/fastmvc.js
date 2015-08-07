///<reference path="./d.ts" />

module ft {
    export interface ITemplateManager {
        parse(value:string):ITemplate;
        add(name:string, value:ITemplate):ITemplateManager;
        get(name:string):ITemplate;
        getConstructor(template:ITemplate):ITemplateConstructor;
    }

    export interface ITemplateConstructor {
        (name:string, params?:ITemplateViewParams):ft.TemplateView
    }

    export interface ITemplate {
        name?: string;
        extend?: string;
        domTree: any;
        i18n?: any;
        dynamicTree?:IDynamicTree;
        styleMapByTheme?: {[name:string]:any};
        expressionMapByName?:{[name:string]:IExpression};
    }

    export interface IDynamicTree {
        app?: IDynamicMap;
        data?: IDynamicMap;
        state?: IDynamicMap;
    }

    export interface IDynamicMap {
        [propertyPathName:string]:IExpressionDomPathMap
    }

    export interface IExpressionDomPathMap {
        [path:string]:string|IExpressionName;
    }

    export interface IExpressionName {
        name:string;
    }

    export interface IExpression {
        name:string;
        content: string;
        result: string;
        vars:string[];
        ex?:IExpression[];
    }

    export interface ITemplateViewParams {

    }
}