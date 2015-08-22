///<reference path="./d.ts" />

module ft {
    export type TreeElement = TreeElement;
    export type AttributeValue = string|IExpressionName;

    export interface ITemplateParser {
        lastData:any;
        lastError:any;
        parse(html:string):any;
    }

    export interface ITemplateManager {
        parse(value:string):ITemplate;
        add(name:string, value:ITemplate):ITemplateManager;
        get(name:string):ITemplate;
        getConstructor(template:ITemplate):ITemplateConstructor;
    }

    export interface ITemplateViewHelper {
        createTreeObject:IGetTreeObjectFunctor;
        updateTreeObject:IGetTreeObjectFunctor;
        enterTreeObject:IGetTreeObjectFunctor;
        exitTreeObject:IGetTreeObjectFunctor;
        setDataTreeObject:IGetTreeObjectFunctor;
        //updateDom(view:TemplateView);
    }

    export interface IHtmlObject {
        tag:string;
        name:string;
        raw:string;
        data?:string;
        attribs?:{[name:string]:any}[];
        children?:IHtmlObject[];
    }

    export interface IExpressionManager {
        parse(value:string):IExpression;
        getExpressionName(value:IExpression):IExpressionName;
        execute(value:IExpression, root:ITemplateView):any;
    }

    export interface ITemplate {
        name?: string;
        extend?: string;
        domTree: IDomDef;
        i18n?: any;
        dynamicTree?:IDynamicTree;
        styleMapByTheme?: {[name:string]:any};
        expressionMap?:IExpressionMapByName;
    }

    export interface IExpressionMapByName {
        [name:string]:IExpression
    }

    export interface ITemplateConstructor {
        (name:string, params?:ITemplateViewParams):ft.TemplateView
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

    export interface ISimpleExpression {
        vars:string[];
        expressions:string;
    }

    export interface IExpression {
        name:string;
        content: string;
        result?: string;
        vars:string[];

        //values:any;
        args?:any;

        filters?:string[];
        expressions?:(IExpression|string)[];
    }

    export interface ITemplateViewParams {
    }

    export interface ITemplateView extends fmvc.IView {
        eval(value:string):any;
        getValue(value:any):any;
        getFormattedMessage(name:string,arguments:any[]):string;
        getExpressionValue(ex:IExpression);
    }

    export  interface IAttrPropertyMap {
        [propName:string]:AttributeValue;
    }

    export interface IDomDef {
        // system
        type:string;  // system tag type = text,comment,tag (creation step)
        path:string; // system path (creation step)
        name?:string; // system tag name (creation step)
        attribs?:IDomAttribs;
        states?:IExpressionName; //special system attribute
        children?:IDomDef[]; // system IDomDef children
    }

    export interface IDomAttribs {
        // dom attributes
        [attrName:string]:any|AttributeValue;
        class?:IAttrPropertyMap;
        style?:IAttrPropertyMap;
    }

    export interface IObj {
        [name:string]:string|number|boolean;
    }

    export interface ITreeObjectFunctor {
        (object:TreeElement, data:IDomDef, root:ITemplateView):any
    }

    export interface IChildrenTreeObjectFunctor {
        (object:TreeElement, parent:TreeElement, data:IDomDef, root:ITemplateView):any
    }

    export interface IGetTreeObjectFunctor {
        (data:IDomDef, root:ITemplateView):TreeElement
    }

    export  interface IGetElementFunctor {
        (value:TreeElement):Element
    }

}