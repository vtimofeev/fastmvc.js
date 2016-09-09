var ft;
(function (ft) {
    var DataType = {
        Boolean: 'boolean',
        String: 'string',
        Number: 'number',
        Undefined: 'undefined',
        Object: 'object',
    };
    function applyBooleanStateValue(value) {
        if (!value)
            return false; // undefined, null, 0, false
        var type = typeof value;
        if (type === DataType.Boolean)
            return value;
        else if (type === DataType.String)
            return (value === 'false' || value === '0' || value === 'null') ? false : true;
        return true;
    }
    ft.applyBooleanStateValue = applyBooleanStateValue;
    function applyStringStateValue(value) {
        if (!value)
            return ''; // undefined, null, 0, false
        var type = typeof value;
        if (type === DataType.String)
            return value;
        else
            return String(value);
    }
    ft.applyStringStateValue = applyStringStateValue;
    function applyNumberStateValue(value) {
        var type = typeof value;
        if (type === DataType.Number)
            return value;
        else
            return Number(value);
    }
    ft.applyNumberStateValue = applyNumberStateValue;
    ft.TemplateStateValueFunc = {
        base: applyStringStateValue,
        life: applyStringStateValue,
        custom: applyStringStateValue,
        hover: applyBooleanStateValue,
        selected: applyBooleanStateValue,
        disable: applyBooleanStateValue,
        focus: applyBooleanStateValue,
    };
})(ft || (ft = {}));
//# sourceMappingURL=template.state.js.map