namespace ft {
    var DataType = {
        Boolean: 'boolean',
        String: 'string',
        Number: 'number',
        Undefined: 'undefined',
        Object: 'object',
    };

    export const TemplateApplyValueFunc = {
        base: applyStringValue,
        life: applyStringValue,
        custom: applyStringValue,
        hover: applyBooleanValue,
        selected: applyBooleanValue,
        disable: applyBooleanValue,
        focus: applyBooleanValue,
    };

    export function applyBooleanValue(value:any):boolean {
        if(!value) return false; // undefined, null, 0, false

        var type:string = typeof value;
        if(type === DataType.Boolean) return value;
        if(type === DataType.String) return (value==='false'||value==='0'||value==='null')?false:true;

        return true;
    }

    export function applyStringValue(value:any):string {
        if(!value) return ''; // undefined, null, 0, false

        var type:string = typeof value;
        if(type === DataType.String) return value;
        else return String(value);
    }

    export function applyNumberStateValue(value:any):number {
        var type:string = typeof value;
        if(type === DataType.Number) return value;
        else return Number(value);
    }



}
