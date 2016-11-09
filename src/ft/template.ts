///<reference path="./d.ts" />

namespace ft {
    export class Template implements ITemplate {
        name:string;
        extend:string;
        domTree:IDomDef;
        i18n:any;
        dynamicTree:IDynamicTree;
        styleMapByTheme:{[name:string]:any};
        expressionMap:IExpressionMap;
        pathMap: {[path:string]:IDomDef};

        constructor() {
        }
    }
}