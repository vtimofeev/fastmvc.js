///<reference path='./d.ts'/>

module fmvc {
    export var Type = {
        String: 'string',
        Int: 'int',
        Float: 'float',
        Boolean: 'boolean'
    };

    export interface IStyleDefinition {
        enabled:boolean;
        content?:string;
        url?:string;
    }

    export interface IView {
        init():void;
        invalidate(type:number):void;
        data:any;
        model:fmvc.Model; // get, set
        mediator:fmvc.Mediator; // get, set
        eventHandler(name:string, e:any):void;
    }

    export interface IRootDomObject extends IDomObject {
        className:string;
        css?:IStyleDefinition;
        links?:{[name:string]:string/* path */}[];
        dynamicSummary?:IDynamicSummary;
        i18n:any;
    }

    export interface INameValue {
        name:string;
        value:any;
    }

    export interface ITypeNameValue {
        name:string;
        value:any;
        type:string;
    }


    export interface IDynamicSummary {
        [propertyName:string]:{[substance/* class, data, style any */:string]:any};
    }



    export interface IDomObject {
        path:string;
        type:string; // @tag/string/other
        tagName?:string; // tag name: div/br
        extend?:string;

        isVirtual?:boolean;
        isComponent?:boolean;

        createDom:Function;

        component?:fmvc.View;
        componentConstructor?:Function;

        element?:HTMLElement;
        virtualElement?:HTMLElement;

        enableStates?:(string|ITypeNameValue)[];
        states?:string[];
        data?:string;

        staticAttributes?:{[id:string]:any};

        handlers?:{[event:string]:string};
        children?:IDomObject[];

    }
}


