/// <reference path="mkdirp.d.ts" />
var mkdirp = require('mkdirp');
var str;
var num;
mkdirp(str, num, function (err, made) {
    str = made;
});
mkdirp(str, function (err, made) {
    str = made;
});
str = mkdirp.sync(str, num);
str = mkdirp.sync(str);
//# sourceMappingURL=mkdirp-tests.js.map