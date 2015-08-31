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
    class View extends Notifier implements IView {
        private _mediator;
        private _model;
        private _data;
        private _states;
        private _invalidate;
        private _isWaitingForValidate;
        private _inDocument;
        private _element;
        constructor(name: string);
        getElement(): Element;
        setElement(value: Element): void;
        setMediator(value: Mediator): IView;
        mediator: Mediator;
        setStates(value: any): IView;
        private setStateReverse(value, name);
        setState(name: string, value: any): IView;
        getState(name: string): any;
        model: Model;
        data: any;
        setData(value: any): IView;
        app: any;
        setModel(value: Model): IView;
        inDocument: boolean;
        getEventNameByDomEvent(e: any): string;
        domHandler(e: any): void;
        createDom(): void;
        enter(): void;
        exit(): void;
        isWaitingForValidate: boolean;
        invalidate(value: number): void;
        validate(): void;
        protected validateRecreateTree(): void;
        protected validateData(): void;
        protected validateState(): void;
        protected validateParent(): void;
        protected validateChildren(): void;
        protected validateApp(): void;
        render(element: Element): IView;
        dispose(): void;
        sendEvent(name: string, data?: any, sub?: string, error?: any, global?: boolean): void;
        log(...messages: any[]): View;
    }
    interface IView {
        setModel(value: Model): IView;
        data: any;
        model: Model;
        setMediator(value: Mediator): IView;
        mediator: Mediator;
        createDom(): void;
        enter(): void;
        exit(): void;
        render(element: Element): IView;
        invalidate(value: number): void;
        domHandler(e: any): void;
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
declare module test {
    class TestInput extends fmvc.View {
        constructor(name: string, modelOrData?: fmvc.Model | any, jsTemplate?: fmvc.IDomObject);
        createDom(): TestInput;
        jsTemplate: fmvc.IRootDomObject;
        private static __jsTemplate;
    }
}
