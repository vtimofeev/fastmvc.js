///<reference path="./d.ts" />
var ft;
(function (ft) {
    var htmlparser = Tautologistics.NodeHtmlParser;
    console.log(htmlparser);
    var expressionManager;
    var expression = new ft.Expression();
    var TemplateParser = (function () {
        function TemplateParser() {
            this._skipProperties = ['raw'];
            this._propAttribs = {
                style: {
                    delimiter: ';',
                    canGet: function (v) { return (v.split(':').length > 1); },
                    getName: function (v) { return (v.split(':')[0]).trim(); },
                    getValue: function (v) { return (v.split(':')[1]).trim(); }
                },
                class: {
                    delimiter: ' ',
                    canGet: function () { return true; },
                    getName: _.identity,
                    getValue: _.identity
                }
            };
            _.bindAll(this, 'parserHandler');
            this._htmlparserHandler = new htmlparser.HtmlBuilder(this.parserHandler);
            this._htmlParser = new htmlparser.Parser(this._htmlparserHandler /*, test.options.parser*/);
        }
        TemplateParser.prototype.reset = function () {
            this._htmlParser.reset();
            this.lastData = null;
            this.lastError = null;
        };
        TemplateParser.prototype.parseHtml = function (html) {
            this.reset();
            html = html.trim().replace(/\n/gi, '');
            this._htmlparserHandler.dom = null;
            this._htmlParser.parseComplete(html);
            return this._htmlparserHandler.dom;
        };
        TemplateParser.prototype.htmlObjectToTemplate = function (objs) {
            console.log('Result parser: ', objs);
            var result = {}; // new Template();
            _.each(objs, function (obj, index) {
                if (obj.name.indexOf('f.') < 0) {
                    result.expressionMap = {};
                    (obj.attribs ? result.extend = obj.attribs.extend : null);
                    result.name = obj.name;
                    result.pathMap = {};
                    // side effect, creates expression map to result, create pathMap
                    result.domTree = this.htmlObjectToDomTree(obj, result, '0');
                    result.dynamicTree = this.getDynamicTreeFromExpressionMap(result.expressionMap);
                }
            }, this);
            this.removeEmptyKeys(result);
            return result;
        };
        TemplateParser.prototype.htmlObjectToDomTree = function (o, r, path) {
            var _this = this;
            // switch to parser 2.0
            (o.attributes ? o.attribs = o.attributes : null);
            var skipped = ['extend'];
            var def = { attribs: {}, params: {}, handlers: {} };
            def.type = (o.type === 'cdata' ? 'text' : o.type); // @todo move cdata to tree creator
            def.name = o.name;
            def.path = path;
            def.parentPath = path.indexOf(',') > 0 ? path.substring(0, path.lastIndexOf(',')) : null;
            if (o.type != 'tag')
                def.data = this.parseExpressionAttrib(o.data, 'data', r.expressionMap, path, 'data'); // set data or data expression
            if (o.attribs && o.attribs.extend)
                def.extend = o.attribs.extend;
            _.each(o.attribs, function (value, key) {
                if (skipped.indexOf(key) >= 0 || !(value = value ? value.trim() : value))
                    return;
                var group = this.getAttribGroup(key);
                var groupKey = this.getGroupKey(key, group);
                def[group][groupKey] = this.parseExpressionAttrib(value, key, r.expressionMap, path, group);
            }, this);
            def.children = _.map(o.children, function (v, index) { return (_this.htmlObjectToDomTree(v, r, def.path + ',' + index)); }, this);
            _.each(_.keys(def), function (key) { return (_.isEmpty(def[key]) ? delete def[key] : null); });
            r.pathMap[path] = def;
            return def;
        };
        TemplateParser.prototype.getGroupKey = function (key, group) {
            return group === 'handlers' ? (key.replace(/^on/, '')).toLowerCase() : key;
        };
        TemplateParser.prototype.getAttribGroup = function (name) {
            var params = ['states', 'enableStates'];
            if (name.indexOf('on') === 0) {
                return 'handlers';
            }
            else {
                return (params.indexOf(name) > -1) ? 'params' : 'attribs';
            }
        };
        // Проверяем данное выражение конвертируется в объект класса или стиля (набор свойств: выражений)
        TemplateParser.prototype.parseExpressionAttrib = function (value, key, map, path, group) {
            var _this = this;
            if (this._propAttribs[key]) {
                var prop = this._propAttribs[key];
                return _.reduce(value.split(prop.delimiter), function (r, value, index) { return (prop.canGet(value) ? (r[prop.getName(value)] = _this.parseExpressionValue(prop.getValue(value), map, path, group, key, prop.getName(value))) : null,
                    r); }, {}, this);
            }
            else if (group === 'handlers') {
                return this.parseJsValue(value);
            }
            else {
                return this.parseExpressionValue(value, map, path, group, key);
            }
        };
        TemplateParser.prototype.getDynamicTreeFromExpressionMap = function (map) {
            var result = {};
            _.each(map, function (ex) {
                var varParts;
                _.each(ex.vars, function (v) { return (varParts = v.split('.')
                    , result[varParts[0]] = result[varParts[0]] || {}
                    , result[varParts[0]][v] = result[varParts[0]][v] || []
                    , result[varParts[0]][v].push(ex.name)); });
            }, this);
            return result;
        };
        TemplateParser.prototype.getExpressionHost = function (path, group /* attribs, params, data */, key /* class, href */, keyProperty) {
            if (keyProperty === void 0) { keyProperty = null; }
            return { path: path, group: group, key: key, keyProperty: keyProperty };
        };
        // Выделяем из шаблонной строки JS код (handlers)
        TemplateParser.prototype.parseJsValue = function (value) {
            return expression.strToJsMatch(value);
        };
        // Парсим строку с выражением
        TemplateParser.prototype.parseExpressionValue = function (value, map, path, group, key, keyProperty) {
            var ex = expression.strToExpression(value);
            var expressionNameObj = ex ? expression.getExpressionNameObject(ex) : null;
            var result = expressionNameObj || value;
            if (ex) {
                // Добавляем хост в выражение
                var hosts = ex.hosts || [];
                hosts.push(this.getExpressionHost(path, group, key, keyProperty));
                ex.hosts = hosts;
                // Расширяем карту
                map[ex.name] = ex;
            }
            return result;
        };
        TemplateParser.prototype.removeEmptyKeys = function (def) {
            _.each(_.keys(def), function (key) { return (_.isEmpty(def[key]) ? delete def[key] : null); });
        };
        TemplateParser.prototype.parserHandler = function (error, data) {
            this.lastError = error;
            this.lastData = data;
        };
        return TemplateParser;
    })();
    ft.TemplateParser = TemplateParser;
})(ft || (ft = {}));
//# sourceMappingURL=template.parser.js.map