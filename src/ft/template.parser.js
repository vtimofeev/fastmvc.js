///<reference path="./d.ts" />
var ft;
(function (ft) {
    var htmlparser = Tautologistics.NodeHtmlParser;
    var expressionManager;
    var TemplateParser = (function () {
        function TemplateParser() {
            this._skipProperties = ['raw'];
            _.bindAll(this, 'parserHandler');
            this._htmlparserHandler = new htmlparser.DefaultHandler(this.parserHandler);
            this._htmlParser = new htmlparser.Parser(this._htmlparserHandler /*, test.options.parser*/);
        }
        TemplateParser.prototype.reset = function () {
            this._htmlParser.reset();
            this.lastData = null;
            this.lastError = null;
        };
        TemplateParser.prototype.parseHtml = function (html) {
            this.reset();
            this._htmlparserHandler.dom = null;
            this._htmlParser.parseComplete(html);
            return this._htmlparserHandler.dom;
        };
        TemplateParser.prototype.convertToTemplate = function (result) {
            var result = new Template();
            _.each(result, function (obj, index) {
                if (obj.name === 'div') {
                    result.extend = obj.attribs.classExtend;
                    result.name = obj.attribs.className;
                    result.domTree = obj;
                    //_.each()
                    result.dynamicTree;
                }
            });
        };
        TemplateParser.prototype.parseHtmlObject = function (o, r) {
            var emptyDef = ['attribs'];
            var params = ['states', 'enableStates', 'extendName', 'className'];
            var def = { attribs: {}, params: {} };
            var r = r || { domTree: def, dynamicTree: {}, expressionMap: {} };
            _.each(o.attribs, function (value, key) {
                value = value ? value.trim() : value;
                if (!value)
                    return;
                var context = params.indexOf(key) >= 0 ? def.params : def.attribs;
                context[key] = this.parseExpressionAttrib(value, key, map);
            }, this);
        };
        TemplateParser.prototype.parseExpressionAttrib = function (value, key, map) {
            var _this = this;
            var propAttribs = {
                style: {
                    delimiter: ';',
                    getName: function (v) { return (v.split(':')[0]).trim(); },
                    getValue: function (v) { return (v.split(':')[1]).trim(); }
                },
                class: {
                    delimiter: ' ',
                    getName: _.identity,
                    getValue: _.identity
                }
            };
            var prop;
            if (prop = propAttribs[key]) {
                return _.reduce(value.split(prop.delimiter), function (r, value, index) { return (r[prop.getName(value)] = _this.parseExpressionValue(prop.getValue(value)), r); }, {}, this);
            }
            else {
                return this.parseExpressionValue(value, map);
            }
        };
        TemplateParser.prototype.parseExpressionValue = function (value, map) {
            var expression = expressionManager.parse(value);
            var expressionNameObj = expression ? expressionManager.getExpressionName(expression) : null;
            var result = expression ? expressionNameObj : value;
            if (expression)
                map[expression.name] = result;
            return result;
        };
        TemplateParser.prototype.parserHandler = function (error, data) {
            console.log('parserHandler: ', error, data);
            this.lastError = error;
            this.lastData = data;
        };
        return TemplateParser;
    })();
    ft.TemplateParser = TemplateParser;
})(ft || (ft = {}));
//# sourceMappingURL=template.parser.js.map