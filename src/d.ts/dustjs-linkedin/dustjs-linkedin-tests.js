///<reference path="dustjs-linkedin.d.ts"/>
var dust = require("dustjs-linkedin");
//
// compilation
//
dust.compile("template", "template name", true);
dust.compile("template", "template name");
dust.compileFn("");
var template = dust.compileFn("template", "template name");
// registration
dust.register("template name", template);
dust.loadSource("template source");
// context 
var context = dust.makeBase({ anyProperty: "anyvalue" });
context = dust.makeBase(context);
// render and renderSource overloads
dust.render("template name", { anyProperty: "anyvalue" }, function (err, out) { });
dust.render("template name", context, function (err, out) { });
dust.renderSource("template source", { anyProperty: "anyvalue" });
dust.renderSource("template source", { anyProperty: "anyvalue" }, function (err, out) { });
dust.renderSource("template source", context, function (err, out) { });
dust.renderSource("template source", context);
// stream
dust.stream("template name", { anyProperty: "anyvalue" });
dust.stream("template name", context);
// utils
var filter = dust.filters["someFilter"];
filter("value");
dust.escapeHtml("<html/>");
dust.escapeJs("['a', 124]");
//# sourceMappingURL=dustjs-linkedin-tests.js.map