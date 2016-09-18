_.mixin({
    // fast implementation
    extend: function() {
        var e, i = 1, len = arguments.length, prop;
        for (; i<len; i++) {
            e = arguments[i];
            for (prop in e) arguments[0][prop] = e[prop];
        }
        return arguments[0];
    }
});