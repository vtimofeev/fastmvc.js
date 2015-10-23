///<reference path="./d.ts" />

module ft {
    export type TreeElement = ITemplateView|Comment|HTMLElement|Text;
    export type ExpressionValue = string|IExpression;
    export type ExpressionNameValue = string|IExpressionName;




    // Params of dom element or component



    export var TemplateParams = {
        ln:'ln', // create public field in TemplateView that has name as value
        states:'states', // state when object is created, '{state.selected}'
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
        createTemplate(name:string, content:string):ITemplateConstructor;
        parse(value:string):ITemplate;
        addTemplate(name:string, value:ITemplate):ITemplateManager;
        getTemplate(name:string):ITemplate;
        getTemplateViewFunc(templateName:string):ft.ITemplateConstructor;
    }

    export interface ITemplateViewHelper {
        //getIdMap():{[id:string]:ITemplateView}
        createTreeObject:IGetTreeObjectFunctor;
        enterTreeObject:IGetTreeObjectFunctor;
        exitTreeObject:IGetTreeObjectFunctor;
        setDataTreeObject:IGetTreeObjectFunctor;
        updateDynamicTree(view:ITemplateView, group?:string):void;
        dispatchTreeEventDown(e:ITreeEvent):void;
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
        hasStates?:boolean;
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
        context?:ITemplateView;
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
        domDef:IDomDef;
        localDomDef:IDomDef;

        eval(value:string):any;

        //getValue(value:any):any;
        getTemplate():ITemplate;
        getTreeElementByPath(value:string):TreeElement;
        setTreeElementPath(path:string, value:TreeElement):void;

        getFormattedMessage(name:string,arguments:any[]):string;
        getExpressionValue(ex:IExpressionName);
        getCssClassExpressionValue(ex:IExpressionName);

        getDomDefinitionByPath(path:string):IDomDef;
        isChangedDynamicProperty(value:string);

        setChildrenViewPath(path:string, value:TemplateChildrenView):void;
        getChildrenViewByPath(path:string):TemplateChildrenView;

        setDynamicProperty(name:string, value:any);

        getPathClassValue(path:string, name:string):string;
        setPathClassValue(path:string, name:string, value:string);

        applyParameter(value:any, key:string):void;


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
        //target:fmvc.Notifier; fmvc.IEvent

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