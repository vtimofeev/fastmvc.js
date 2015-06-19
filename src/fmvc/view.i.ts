///<reference path='./d.ts'/>

module fmvc {
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
        css?:string;
        links?:{[name:string]:string/* path */}[];
        dynamicSummary?:IDynamicSummary;
    }

    interface INameValue {
        name:string;
        value:any;
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
        isComponent:boolean;

        createDom:Function;

        component?:fmvc.View;
        componentConstructor?:Function;

        element?:HTMLElement;
        virtualElement?:HTMLElement;

        enableStates?:string[];
        states?:string[];
        data?:string;

        staticAttributes?:INameValue[];

        handlers?:{[event:string]:string};
        children?:IDomObject[];

    }
}


