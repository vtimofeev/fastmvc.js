/// <reference path="../../DefinitelyTyped/lodash/lodash.d.ts" />
/// <reference path="../../DefinitelyTyped/jquery/jquery.d.ts" />
declare module fmvc {
    class Event {
        static Model: {
            Changed: string;
            StateChanged: string;
            Disposed: string;
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
            [id: string]: Model<any>;
        };
        mediator: {
            [id: string]: Mediator;
        };
        root: Element;
        name: string;
        type: string;
        constructor(name: string, type: string, root: Element);
        init(): void;
        initModels(): void;
        initMediators(): void;
        start(): void;
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
        bind(object: any, handler?: any): Notifier;
        unbind(object: any): Notifier;
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
        global?: any;
    }
    interface IViewEvent extends IEvent {
        source?: any;
    }
}
declare module fmvc {
    interface IModelOptions {
        enabledState?: boolean;
        enabledEvents?: boolean;
        watchChanges?: boolean;
        history?: boolean;
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
    class Model<T> extends fmvc.Notifier implements IModelOptions {
        private _data;
        private _state;
        private _changes;
        private _prevState;
        private _queue;
        enabledEvents: boolean;
        enabledState: boolean;
        watchChanges: boolean;
        constructor(name: string, data?: any, opts?: IModelOptions);
        reset(): Model<T>;
        d: T;
        data: T;
        getData(): T;
        setData(value: T): void;
        changes: any;
        parseValueAndSetChanges(value: T): any;
        state: string;
        prevState: string;
        setState(value: string): Model<T>;
        length: any;
        sendEvent(name: string, data?: any, changes?: any, sub?: string, error?: any): void;
        dispose(): void;
        queue(create?: boolean): ModelQueue<T>;
    }
}
declare module fmvc {
    class ModelQueue<T> {
        private model;
        private currentPromise;
        private error;
        constructor(model: fmvc.Model<T>);
        load(object: any): ModelQueue<T>;
        promise: any;
        loadXml(object: any): ModelQueue<T>;
        parse(method: any): ModelQueue<T>;
        async(getPromiseMethod: any, args: any[], context: any, states?: any): ModelQueue<T>;
        sync(method: Function, args?: any[], context?: any, states?: any): ModelQueue<T>;
        complete(method: Function, args?: any[], context?: any, states?: any): void;
        executeError(err?: any): any;
        fault(method: Function, args?: any[], context?: any, states?: any): ModelQueue<T>;
        setup(): JQueryPromise<{}>;
        dispose(): void;
    }
}
declare module fmvc {
    class CompositeModel<T> extends Model<T> {
        private _sources;
        private _sourceCompareFunc;
        private _mapBeforeCompareFunc;
        private _resultFuncs;
        private throttleApplyChanges;
        constructor(name: string, source: any[], opts?: IModelOptions);
        addSources(v: any[]): CompositeModel<T>;
        addSource(v: any, mapBeforeCompareFunc?: Function): CompositeModel<T>;
        removeSource(v: Model<T>): CompositeModel<T>;
        private sourceChangeHandler(e);
        setSourceCompareFunc(value: any): CompositeModel<T>;
        setMapBeforeCompare(name: string, value: any): CompositeModel<T>;
        setResultFunc(...values: any[]): CompositeModel<T>;
        apply(): void;
        private getSourceResult();
        private getPreparedSourceData(v);
        dispose(): void;
    }
}
declare module fmvc {
    interface ILoggerConfig {
        filter?: string[];
        length?: number;
        console?: boolean;
    }
    class Logger extends fmvc.Model<any> {
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
    var InvalidateType: {
        Data: number;
        App: number;
        State: number;
        Parent: number;
        Children: number;
        Template: number;
        Theme: number;
        I18n: number;
        All: number;
    };
    var frameExecution: number;
    function nextFrameHandler(handler: Function, context: IView, ...params: any[]): void;
    class View extends Notifier implements IView {
        private _parent;
        private _mediator;
        private _model;
        private _data;
        private _states;
        private _invalidate;
        private _isWaitingForValidate;
        private _inDocument;
        private _element;
        constructor(name: string);
        parent: IView;
        getElement(): HTMLElement;
        setElement(value: HTMLElement): void;
        setMediator(value: Mediator): IView;
        mediator: Mediator;
        setStates(value: any): IView;
        private setStateReverse(value, name);
        setState(name: string, value: any): IView;
        getState(name: string): any;
        model: Model<any>;
        data: any;
        setData(value: any): IView;
        app: any;
        setModel(value: Model<any>): IView;
        inDocument: boolean;
        getEventNameByDomEvent(e: any): string;
        domHandler(e: any): void;
        createDom(): void;
        enter(): void;
        beforeEnter(): void;
        afterEnter(): void;
        beforeCreate(): void;
        afterCreate(): void;
        beforeExit(): void;
        afterExit(): void;
        exit(): void;
        isWaitingForValidate: boolean;
        invalidate(value: number): void;
        invalidateData(e?: IEvent): void;
        invalidateApp(): void;
        validate(): void;
        protected validateData(): void;
        protected validateState(): void;
        protected validateParent(): void;
        protected validateChildren(): void;
        protected validateApp(): void;
        protected validateTemplate(): void;
        render(element: Element): IView;
        unrender(): void;
        dispose(): void;
        sendEvent(name: string, data?: any, sub?: string, error?: any, global?: boolean): void;
        log(...messages: any[]): View;
    }
    interface IView extends INotifier {
        setModel(value: Model<any>): IView;
        app: any;
        data: any;
        model: Model<any>;
        parent: IView;
        mediator: Mediator;
        inDocument: boolean;
        setMediator(value: Mediator): IView;
        createDom(): void;
        enter(): void;
        exit(): void;
        render(element: Element): IView;
        invalidate(value: number): void;
        validate(): void;
        domHandler(e: any): void;
        getElement(): HTMLElement;
        setElement(value: HTMLElement): void;
        beforeCreate(): void;
        afterCreate(): void;
        beforeEnter(): void;
        afterEnter(): void;
        beforeExit(): void;
        afterExit(): void;
        getState(name: string): any;
        setState(name: string, value: any): void;
        setStates(value: any): IView;
    }
}
declare module fmvc {
    class Mediator extends fmvc.Notifier implements IMediator {
        private views;
        private _root;
        constructor(name: string, root: Element);
        setRoot(root: Element): Mediator;
        root: Element;
        addView(...views: IView[]): Mediator;
        private _addView(view);
        getView(name: string): IView;
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
        getView(name: string): IView;
    }
}
declare var MessageFormat: any;
