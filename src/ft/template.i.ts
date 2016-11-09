///<reference path="./d.ts" />

namespace ft {
    export type TreeElement = TemplateView|Comment|HTMLElement|Text;
    export type ExpressionValue = string|IExpression;
    export type ExpressionNameValue = string|IExpressionName;
    export type TemplateViewParams = any[];

    // Params of dom element or component

        export var TemplateParams = {
        ln:'ln', // create public field in TemplateView that has name as value
        if:'if', // state when object is created, '{state.selected}'
        setStates:'setStates', // View, 'selected,focused,disabled,hover,draggable,counter' or 'selected=true,focused=false,disabled=true,counter={data.counter},modelCounter={app.counter.data}'
        setState:'setState', // View, 'selected=true'
        setStateSelected:'state.selected', // View, 'true' or '{(this.getCustomComponentSelected(child.data))}' (expression)
        setStateDisabled:'state.disabled', // View,

        stateHandlers:'.stateHandlers', // View 'hover,disabled,selected,focused',
        setData: '.data', // View
        setModel: '.model', // View

        childrenClass: 'children.class', // children constructor
        childrenSetStates: 'children.setStates', // '{this.data.selected===child.data}'
        childrenEnableStateHandlers: 'children.stateHandlers',
        childrenSetStateSelected: 'children.state.selected',
        childrenSetStateDisabled: 'children.state.disabled',
        childrenData: 'children.data', // children data array (context parent or app)
        childrenModel: 'children.model', // children model array (context parent or app)

        onwildcard: 'on*',

        childrenOnAction: 'children.onAction' // children eventHandler
    };

    export interface ITemplateParser {
        lastData:any;
        lastError:any;
        parseHtml(html:string):any;
    }

    export interface ITemplateManager {
        createClass(className:string, content:string, params?:any, mixin?:any):ITemplateConstructor;
        createInstance(className:string, name:string, params?:any, mixin?:any):any;
    }

    export interface IHtmlObject {
        type:string; // 'tag', 'text', 'comment'
        name:string;
        raw:string;
        data?:string;
        attribs?:{[name:string]:any}[];
        attributes?:{[name:string]:any}[];
        children?:IHtmlObject[];
    }

    export interface ITemplate {
        name?: string;
        extend?: string;

        domTree: IDomDef;
        dynamicTree?:IDynamicTree;
        expressionMap?:IExpressionMap;
        hasStates?:boolean;
        pathMap: {[path:string]:IDomDef};

        i18n?: any;
        styleMapByTheme?: {[name:string]:any};
    }

    export interface IExpressionMap {
        [name:string]:IExpression
    }

    export interface ITemplateConstructor {
        (name:string, params?:any, mixin?:any):ft.TemplateView
    }

    export interface IDynamicTree {
        app?: IDynamicMap;
        data?: IDynamicMap;
        state?: IDynamicMap;
    }

    export interface IDynamicMap {
        [propertyPathName:string]:string[] /* expression name string */
    }

    export interface IExpressionName {
        name:string;
        context?:TemplateView;
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

        args?:any;

        filters?:string[];
        expressions?:(IExpression|string)[];
    }

    export  interface IAttrPropertyMap {
        [propName:string]:ExpressionValue;
    }

    export interface IDomDef {
        // system
        type:string;  // system tag type = text,comment,tag,svg (creation step)
        path:string; // system path (creation step)
        parentPath?:string; //
        link?:string // system class link (in class property)
        name:string; // system tag name (creation step)
        extend?:string;
        attribs?:IDomAttribs;
        handlers?:any;
        params?:any;
        data?:any;

        if?:IExpressionName; //special system attribute
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


    export interface ITreeEvent extends fmvc.IEvent {
        e?:any; /* browser event */
        pe?:IPointerEvent;

        def:IDomDef; // from which node we start dispatch event
        currentDef?:IDomDef; // On tree

        previousTarget?:fmvc.INotifier;
        currentTarget?:fmvc.INotifier; // target component
        cancelled:boolean; // browser event type or custom event type
        executionHandlersCount:number;
        prevented:boolean;
        depth:number;
    }

}