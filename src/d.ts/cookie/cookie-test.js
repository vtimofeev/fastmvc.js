/// <reference path="cookie.d.ts" />
var cookie = require('cookie');
function test_serialize() {
    var retVal;
    retVal = cookie.serialize('foo', 'bar');
    retVal = cookie.serialize('foo', 'bar', { httpOnly: true });
}
function test_parse() {
    var retVal;
    retVal = cookie.parse('foo=bar; bar=baz;');
    retVal = cookie.parse('foo=bar; bar=baz', { decode: function (x) { return x; } });
}
function test_options() {
    var serializeOptions = {
        encode: function (x) { return x; },
        path: '/',
        expires: new Date(),
        maxAge: 200,
        domain: 'example.com',
        secure: false,
        httpOnly: false
    };
    var parseOptios = {
        decode: function (x) { return x; }
    };
}
//# sourceMappingURL=cookie-test.js.map