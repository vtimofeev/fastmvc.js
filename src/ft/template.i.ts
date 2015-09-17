///<reference path="./d.ts" />

module ft {
    export type TreeElement = TemplateView|Comment|HTMLElement;
    export type ExpressionValue = string|IExpression;
    export type ExpressionNameValue = string|IExpressionName;


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
        getIdMap():{[id:string]:ITemplateView}
        createTreeObject:IGetTreeObjectFunctor;
        enterTreeObject:IGetTreeObjectFunctor;
        exitTreeObject:IGetTreeObjectFunctor;
        setDataTreeObject:IGetTreeObjectFunctor;
        updateDynamicTree(view:ITemplateView):void;
        dispatchTreeEvent(e:ITreeEvent):void;
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
        pathMap: {[path:string]:IDomDef};


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
        content:string;
        expression:string;
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
        hosts?:IExpressionHost[];


        //values:any;
        args?:any;

        filters?:string[];
        expressions?:(IExpression|string)[];
    }

    export interface ITemplateViewParams {
    }

    export interface ITemplateView extends fmvc.IView {
        parent:ITemplateView;

        eval(value:string):any;
        evalHandler(value:string, e:any):any;
        getValue(value:any):any;
        getElement():Element;
        getTemplate():ITemplate;
        getFormattedMessage(name:string,arguments:any[]):string;
        getExpressionValue(ex:IExpressionName);
        getClassExpressionValue(ex:IExpressionName);
        isChangedDynamicProperty(value:string);

        getElementByPath(value:string):HTMLElement;

        setDynamicProperty(name:string, value:any);

        getPathClassValue(path:string, name:string):string;
        setPathClassValue(path:string, name:string, value:string);

        on(event, handler, path?:string);
        off(event, handler?, path?:string);
        handleTreeEvent(e:ITreeEvent);
        dispatchTreeEvent(e:ITreeEvent);
    }

    export  interface IAttrPropertyMap {
        [propName:string]:ExpressionValue;
    }

    export interface IDomDef {
        // system
        type:string;  // system tag type = text,comment,tag (creation step)
        path:string; // system path (creation step)
        parentPath?:string; //
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
        [attrName:string]:any|ExpressionValue;
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

    export interface ITreeEvent extends fmvc.IEvent {
        e?:any; /* browser event */
        previousTarget?:fmvc.INotifier;
        currentTarget?:fmvc.INotifier; // target component
        cancelled:boolean; // browser event type or custom event type
        prevented:boolean;
        depth:number;
    }

}