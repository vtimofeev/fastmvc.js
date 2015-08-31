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
        createTemplate(name:string, content:string):ITemplateConstructor;
        parse(value:string):ITemplate;
        addTemplate(name:string, value:ITemplate):ITemplateManager;
        getTemplate(name:string):ITemplate;
        getTemplateViewFunc(templateName:string):ft.ITemplateConstructor;
    }

    export interface ITemplateViewHelper {
        createTreeObject:IGetTreeObjectFunctor;
        enterTreeObject:IGetTreeObjectFunctor;
        exitTreeObject:IGetTreeObjectFunctor;
        setDataTreeObject:IGetTreeObjectFunctor;
        //updateDom(view:TemplateView);
    }

    export interface IHtmlObject {
        type:string; // 'tag', 'text', 'comment'
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
        dynamicTree?:IDynamicTree;
        expressionMap?:IExpressionMap;

        i18n?: any;
        styleMapByTheme?: {[name:string]:any};
    }

    export interface IExpressionMap {
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
        [propertyPathName:string]:string[] /* expression name string */
    }

    /*
    export interface IExpressionDomPathMap {
        [path:string]:string|IExpressionName;
    }
    */

    export interface IExpressionName {
        name:string;
    }

    export interface ISimpleExpression {
        vars:string[];
        expressions:string;
    }

    export interface IExpressionHost {
        path:string;
        group:string;
        key:string;
        keyProperty?:string;
    }

    export interface IExpression {
        name:string;

        content: string;
        result?: string;
        vars:string[];
        hosts:IExpressionHost[];


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
        getElement():Element;
        getTemplate():ITemplate;
        getFormattedMessage(name:string,arguments:any[]):string;
        getExpressionValue(ex:IExpression);
        getClassExpressionValue(ex:IExpression);
        isChangedDynamicProperty(value:string);
    }

    export  interface IAttrPropertyMap {
        [propName:string]:AttributeValue;
    }

    export interface IDomDef {
        // system
        type:string;  // system tag type = text,comment,tag (creation step)
        path:string; // system path (creation step)
        link?:string // system class link (in class property)
        name:string; // system tag name (creation step)
        extend?:string;
        attribs?:IDomAttribs;
        handlers?:any;
        params?:any;
        data?:any;

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