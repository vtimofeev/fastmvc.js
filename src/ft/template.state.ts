module ft {
    var DataType = {
        Boolean: 'boolean',
        String: 'string',
        Number: 'number',
        Undefined: 'undefined',
        Object: 'object',
    };

    export function applyBooleanStateValue(value:any):boolean {
        if(!value) return false; // undefined, null, 0, false
        var type:string = typeof value;
        if(type === DataType.Boolean) return value;
        else if(type === DataType.String) return (value==='false'||value==='0'||value==='null')?false:true;
        return true;
    }

    export function applyStringStateValue(value:any):string {
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


    export var TemplateStateValueFunc = {
        base: applyStringStateValue,
        life: applyStringStateValue,
        custom: applyStringStateValue,

        hover: applyBooleanStateValue,
        selected: applyBooleanStateValue,
        disable: applyBooleanStateValue,
        focus: applyBooleanStateValue,
    }


}
