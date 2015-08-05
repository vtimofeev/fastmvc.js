/// <reference path="../../DefinitelyTyped/lodash/lodash.d.ts" />
/// <reference path="../../DefinitelyTyped/jquery/jquery.d.ts" />
declare module fmvc {
    class Event {
        static Model: {
            Changed: string;
            StateChanged: string;
        };
    }
}
declare module fmvc {
    var VERSION: string;
    var TYPE_MEDIATOR: string;
    var TYPE_MODEL: string;
    var TYPE_VIEW: string;
    var FacadeModel: {
        Log: string;
    };
    class Facade {
        private _name;
        private _type;
        private _events;
        private _root;
        model: {
            [id: string]: Model;
        };
        mediator: {
            [id: string]: Mediator;
        };
        root: Element;
        name: string;
        type: string;
        constructor(name: string, type: string, root: Element);
        init(): void;
        register(...objects: INotifier[]): Facade;
        private _register(object);
        unregister(...objects: INotifier[]): Facade;
        private _unregister(object);
        get(name: string): INotifier;
        private addListener(object, event);
        private removeListener(object, event?);
        eventHandler(e: IEvent): void;
        logger: Logger;
        log(...args: any[]): Facade;
        private static __facadesByName;
        private static __facadesByType;
        static registerInstance(facade: Facade): void;
        static unregisterInstance(facade: Facade): void;
        static getFacadeByName(name: string): Facade;
        static getFacadesByType(type: string): Facade[];
    }
}
declare module fmvc {
    class Notifier implements INotifier {
        private _facade;
        private _name;
        private _type;
        private _listeners;
        private _disposed;
        constructor(name: string, type?: string);
        facade: fmvc.Facade;
        name: string;
        disposed: boolean;
        type: string;
        listenerCount: number;
        setFacade(facade: fmvc.Facade): Notifier;
        sendEvent(name: string, data?: any, changes?: any, sub?: string, error?: any): void;
        log(...messages: string[]): Notifier;
        registerHandler(): void;
        removeHandler(): void;
        bind(object: INotifier, handler?: any): Notifier;
        unbind(object: INotifier): Notifier;
        private addListener(object, handler);
        private removeListener(object);
        private removeAllListeners();
        private _sendToListners(e);
        dispose(): void;
    }
    interface IListener {
        target: INotifier;
        handler: Function;
    }
    interface INotifier {
        name: string;
        type: string;
        disposed: boolean;
        facade: fmvc.Facade;
        sendEvent(name: string, data: any): void;
        registerHandler(): void;
        removeHandler(): void;
        dispose(): void;
    }
    interface IEvent {
        target: INotifier;
        name: string;
        data?: any;
        changes?: any;
        sub?: any;
        error?: any;
    }
    interface IViewEvent extends IEvent {
        source?: any;
    }
}
/**
 * Created by Vasily on 19.06.2015.
 */
declare module fmvc {
    var BrowserEvent: {
        CLICK: string;
        KEYUP: string;
        KEYDOWN: string;
        MOUSEOVER: string;
        MOUSEOUT: string;
        CHANGE: string;
    };
    var SpecialEvent: {
        ACTION: string;
        SWIPE: string;
        PAN: string;
        PINCH: string;
        TAP: string;
        DRAG: string;
    };
    var browserElementEvents: string[];
    var browserWindowEvents: string[];
    var specialEvents: string[];
    class EventDispatcher extends Notifier {
        static NAME: string;
        private executionMap;
        private windowHandlerMap;
        constructor();
        listen(el: Element, type: string, handler: Function, context?: any): EventDispatcher;
        private __createListener(el, id, type, handler, context?);
        private __removeListener(el, id, type);
        private __createElementListener(el, type);
        private __createWindowListener(el, type);
        private __createSpecialListener(el, type);
        unlistenAll(el: any): void;
        unlisten(el: Element, type: string): void;
        browserHandler(e: any): void;
        private createWindowListener(type);
    }
}
declare module fmvc {
    interface IModelOptions {
        enabledState?: boolean;
        enabledEvents?: boolean;
        watchChanges?: boolean;
    }
    var ModelState: {
        None: string;
        Parsing: string;
        Syncing: string;
        Synced: string;
        Changed: string;
        Completed: string;
        Error: string;
    };
    class Model extends fmvc.Notifier implements IModelOptions {
        private _data;
        private _state;
        private _changes;
        private _prevState;
        private _queue;
        enabledEvents: boolean;
        enabledState: boolean;
        watchChanges: boolean;
        constructor(name: string, data?: any, opts?: IModelOptions);
        setState(value: string): Model;
        parseValueAndSetChanges(value: any): any;
        reset(): Model;
        data: any;
        private setChanges(value);
        setData(value: any): void;
        changes: any;
        getData(): any;
        state: string;
        prevState: string;
        sendEvent(name: string, data?: any, changes?: any, sub?: string, error?: any): void;
        dispose(): void;
        queue(create?: boolean): ModelQueue;
    }
    class SourceModel extends Model {
        private _sources;
        private _sourceMethod;
        private _resultMethods;
        private throttleApplyChanges;
        constructor(name: string, source: Model | Model[], opts?: IModelOptions);
        addSources(v: Model | Model[]): SourceModel;
        removeSource(v: Model): SourceModel;
        sourceChangeHandler(e: IEvent): void;
        setSourceMethod(value: any): SourceModel;
        setResultMethods(...values: any[]): SourceModel;
        applyChanges(): void;
    }
    class ModelQueue {
        private model;
        private currentPromise;
        private error;
        constructor(model: fmvc.Model);
        load(object: any): ModelQueue;
        loadXml(object: any): ModelQueue;
        parse(method: any): ModelQueue;
        async(getPromiseMethod: any, args: any[], context: any, states: any): ModelQueue;
        sync(method: Function, args?: any[], context?: any, states?: any): ModelQueue;
        complete(method: Function, args?: any[], context?: any, states?: any): void;
        executeError(err?: any): any;
        fault(method: Function, args?: any[], context?: any, states?: any): ModelQueue;
        setup(): JQueryPromise<{}>;
        dispose(): void;
    }
    class Validator {
        name: string;
        fnc: Function;
        constructor(name: string, fnc: Function);
        execute(data: any): any;
    }
}
declare module fmvc {
    class ModelList extends Model {
        constructor(name: string, data?: any, opts?: IModelOptions);
        parseValue(value: any): any;
        getModel(value: any): Model;
        count: number;
    }
}
declare module fmvc {
    interface ILoggerConfig {
        filter?: string[];
        length?: number;
        console?: boolean;
    }
    class Logger extends fmvc.Model {
        private _config;
        private _modules;
        constructor(name: string, config?: ILoggerConfig);
        config: any;
        console: boolean;
        filter: string[];
        modules: any;
        add(name: string, messages?: any[], level?: number): Logger;
    }
}
declare module fmvc {
    var Type: {
        String: string;
        Int: string;
        Float: string;
        Boolean: string;
    };
    interface IStyleDefinition {
        enabled: boolean;
        content?: string;
        url?: string;
    }
    interface IView {
        init(): void;
        invalidate(type: number): void;
        data: any;
        model: fmvc.Model;
        mediator: fmvc.Mediator;
        eventHandler(name: string, e: any): void;
    }
    interface IRootDomObject extends IDomObject {
        className: string;
        moduleName: string;
        css?: IStyleDefinition;
        links?: {
            [name: string]: string;
        }[];
        dynamicSummary?: IDynamicSummary;
        i18n?: any;
    }
    interface INameValue {
        name: string;
        value: any;
    }
    interface ITypeNameValue {
        name: string;
        value: any;
        type: string;
        default?: any;
    }
    interface IDynamicSummary {
        [propertyName: string]: {
            [substance: string]: any;
        };
    }
    interface IExpression {
        content: string;
        vars: string[];
        values: string[];
        expressions?: string[];
        args?: any;
        filters?: string[];
    }
    interface IMultiExpression extends IExpression {
        result: string;
    }
    interface IDomObject {
        path: string;
        type: string;
        tagName?: string;
        extend?: string;
        link?: any;
        isVirtual?: boolean;
        isComponent?: boolean;
        component?: fmvc.View;
        componentConstructor?: Function;
        element?: HTMLElement;
        virtualElement?: HTMLElement;
        attribs: any;
        enableStates?: (string | ITypeNameValue)[];
        states?: any;
        selected?: any;
        data?: string;
        staticAttributes?: {
            [id: string]: any;
        };
        handlers?: {
            [event: string]: string;
        };
        children?: IDomObject[];
    }
}
declare module fmvc {
    var global: any;
    var State: {
        SELECTED: string;
        HOVER: string;
        FOCUSED: string;
        DISABLED: string;
        OPEN: string;
    };
    var DomObjectType: {
        TEXT: string;
        TAG: string;
        COMMENT: string;
    };
    var Filter: {
        FIRST: string;
        SECOND: string;
    };
    class View extends Notifier implements IView {
        private _mediator;
        private _model;
        private _data;
        dynamicPropertyValue: {
            [name: string]: any;
        };
        elementPaths: {
            [name: string]: Element;
        };
        private componentPaths;
        private handlers;
        private _invalidateTimeout;
        private _invalidate;
        private _inDocument;
        private _avaibleInheritedStates;
        private _states;
        private template;
        private _statesType;
        private _locale;
        private _id;
        private parentView;
        private parentElement;
        private linkedViews;
        private childrenViews;
        private tmp;
        element: Element;
        childrenContainer: Element;
        constructor(name: string, modelOrData?: fmvc.Model | any, jsTemplate?: IDomObject);
        initTemplate(templateExtention: IDomObject): void;
        init(): void;
        render(parent: Element): void;
        updateChildren(): void;
        id: string;
        createDom(): View;
        enableStates(states: (string | ITypeNameValue)[]): void;
        updateDom(): void;
        updateI18N(): void;
        updateData(data: any, prefix?: string, depth?: number): void;
        updateApp(): void;
        updateAppProp(name: string): void;
        private getStyleValue(name);
        getClassStringValue(propertyName: any, propertyValue: any, templateString: any): string;
        getDataStringValue(propertyName: any, propertyValue: any, strOrExOrMEx: any): string;
        executeFilters(value: any, filters: string[]): any;
        executePlainFilter(filter: string, value: string): string;
        updatePaths(paths: any, type: any, name: any, value: any, GetValue: Function, each: Boolean): void;
        updateDynamicProperty(name: string, value: any): void;
        updatePathProperty(path: any, type: any, name: string, value: any, resultValue: any, template?: string): void;
        getElementByPath(element: any, path: number[], root?: boolean): Element;
        inDocument: boolean;
        enterDocument(): void;
        appModelHandler(e: any): void;
        exitDocument(): void;
        applyEventHandlers(e: any): void;
        elementEventHandler(name: string, e: any): void;
        enterDocumentElement(value: IDomObject, object: any): any;
        exitDocumentElement(value: IDomObject, object: any): any;
        applyChangeStateElement(value: IDomObject, object: any): any;
        getFormattedMessage(value: string, data?: any): string;
        getCompiledFormatter(value: string): Function;
        hasState(name: string): boolean;
        setStates(value: any): View;
        setState(name: string, value: any): View;
        getState(name: string): any;
        private applyState(name, value);
        applyChildrenState(name: any, value: any): void;
        private applyChildState();
        avaibleInheritedStates: string[];
        inheritedStates: string[];
        isSelected: boolean;
        isHover: boolean;
        isFocused: boolean;
        isDisabled: boolean;
        isOpen: boolean;
        invalidate(type: number): void;
        invalidateHandler(): void;
        private removeInvalidateTimeout();
        mediator: Mediator;
        setMediator(value: Mediator): View;
        forEachChild(value: Function): void;
        addChild(value: View): void;
        removeChildFrom(index: number): View[];
        removeAllChildren(): View[];
        removeChildAt(value: View): void;
        data: any;
        model: Model;
        app: any;
        setModel(value: Model, listen?: boolean): void;
        modelHandler(e: IEvent): void;
        locale: string;
        i18n: any;
        sendEvent(name: string, data?: any, sub?: string, error?: any, global?: boolean): void;
        log(message: string, level?: number): View;
        viewEventsHandler(name: string, e: any): void;
        eventHandler(name: string, e: any): void;
        dispose(): View;
        dynamicProperties: IDynamicSummary;
        isDynamicStylesAvaible: boolean;
        isDynamicStylesEnabled(value?: boolean): boolean;
        enableDynamicStyle(value: boolean): void;
        dynamicStyle: string;
        templateElement: Element;
        isStateEnabled(states: any): boolean;
        private executeEval(value);
        getVarValue(v: string, ex: IExpression): any;
        executeMultiExpression(mex: IMultiExpression): string;
        executeExpression(ex: IExpression): any;
        getElement(value: IDomObject, object: any): Element;
        jsTemplate: IRootDomObject;
        className: any;
        dispatcher: EventDispatcher;
        static getTypedValue(s: any, type: string): any;
        private static __isDynamicStylesEnabled;
        private static __jsTemplate;
        private static __formatter;
        private static __messageFormat;
        private static __className;
        private static __inheritedStates;
        private static __emptyData;
        static Counters: {
            element: {
                added: number;
                removed: number;
                handlers: number;
            };
            update: {
                class: number;
                data: number;
                style: number;
                other: number;
            };
        };
        static dispatcher: EventDispatcher;
        static Name: string;
    }
    class ViewHelper {
        static getId(name?: string): string;
        static checkElementAttribute(el: Element, name: string, value: string): void;
        static setIfNotExistAttribute(el: Element, name: string, value: string): boolean;
        static hhmmss(value: any): string;
    }
}
declare module fmvc {
    class ViewList extends fmvc.View {
        private _dataset;
        ChildrenConstructor: Function;
        constructor(name: string);
        childrenConstructor: Function;
        applyChildrenState(name: string, value: any): void;
        applyViewState(name: string, value: any, view: fmvc.View, index: number): void;
        updateChildren(): void;
        modelHandler(e: IEvent): void;
    }
}
declare module fmvc {
    class Mediator extends fmvc.Notifier implements IMediator {
        private views;
        private _root;
        constructor(name: string, root?: Element);
        setRoot(root: Element): Mediator;
        root: Element;
        addView(...views: fmvc.View[]): Mediator;
        private _addView(view);
        getView(name: string): View;
        removeView(name: string): Mediator;
        events: string[];
        internalHandler(e: any): void;
        eventHandler(e: IEvent): void;
        modelEventHandler(e: IEvent): void;
        mediatorEventHandler(e: IEvent): void;
        viewEventHandler(e: IViewEvent): void;
    }
    interface IMediator {
        events: string[];
        internalHandler(e: any): void;
        eventHandler(e: any): void;
        getView(name: string): View;
    }
}
declare var MessageFormat: any;
declare module fmvc {
    var DefaultModel: {
        locale: string;
        i18n: string;
        theme: string;
        log: string;
    };
    class AppFacade extends Facade {
        constructor(name: string, root: Element, theme?: string, locale?: string, i18nDict?: any);
        init(): void;
        locale: string;
        theme: string;
        i18n: any;
    }
}
declare var bowser: any;
declare module fmvc {
    class BrowserUtils {
        static getClient(): IBowser;
    }
    interface IBowser {
        name: string;
        silk?: boolean;
        webkit?: boolean;
        gecko?: boolean;
        opera?: boolean;
        opera?: boolean;
        msie?: boolean;
        msedge?: boolean;
        phantomjs?: boolean;
        version: string;
        mobile?: boolean;
        tablet?: boolean;
        ios?: boolean;
        android?: boolean;
        blackberry?: boolean;
        webos?: boolean;
        bada?: boolean;
        tizen?: boolean;
        sailfish?: boolean;
        osversion?: string;
        a?: boolean;
        c?: boolean;
        x?: boolean;
    }
}
declare module ui {
    class Button extends fmvc.View {
        constructor(name: string, modelOrData?: fmvc.Model | any, jsTemplate?: fmvc.IDomObject);
        createDom(): Button;
        jsTemplate: fmvc.IRootDomObject;
        private static __jsTemplate;
    }
}
declare module test {
    class TestButtons extends fmvc.View {
        b1: any;
        b2: any;
        b3: any;
        b4: any;
        constructor(name: string, modelOrData?: fmvc.Model | any, jsTemplate?: fmvc.IDomObject);
        createDom(): TestButtons;
        jsTemplate: fmvc.IRootDomObject;
        private static __jsTemplate;
    }
}
