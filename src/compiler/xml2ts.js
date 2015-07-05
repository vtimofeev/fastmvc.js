///<reference path='../fmvc/d.ts' />
///<reference path='../d.ts/node/node.d.ts'/>
///<reference path='../d.ts/async/async.d.ts'/>
//<reference path='../d.ts/lodash/lodash.d.ts'/>
///<reference path='../d.ts/dustjs-linkedin/dustjs-linkedin.d.ts'/>
var fs = require('fs');
var htmlparser = require("htmlparser");
var _ = require('lodash');
var dust = require('dustjs-linkedin');
var dir = require('node-dir');
var path = require('path');
var async = require('async');
var beautify = require('js-beautify');
var stylus = require('stylus');
var tsc = require('typescript-compiler');
require('dustjs-helpers');
dust.config.whitespace = true;
var start = Date.now();
var tsClasses = [];
var fmvc;
(function (fmvc) {
    fmvc.Type = {
        String: 'string',
        Int: 'int',
        Float: 'float',
        Boolean: 'boolean'
    };
    // Локальные элементы для расщирения класса
    var F_ELEMENTS = {
        STYLE: 'f:style',
        STATE: 'f:state',
        I18N: 'f:i18n'
    };
    var KEYS = {
        EXTEND: 'extend',
        CREATE_STATES: 'enableStates',
        LINK: 'link',
        RAW: 'raw',
        DATA: 'data',
        STATES: 'states',
        STYLE: 'style',
        HREF: 'href',
        VALUE: 'value',
        CLASS: 'class',
        CHECKED: 'checked',
        DISABLED: 'disabled',
        SELECTED: 'selected',
        FOCUSED: 'focused'
    };
    var EVENT_KEYS = {
        ONKEYDOWN: 'onkeydown',
        ONKEYUP: 'onkeyup',
        ONACTION: 'onaction',
        ONCLICK: 'onclick',
        ONMOUSEOVER: 'onmouseover',
        ONMOUSEOUT: 'onmouseout'
    };
    var DOM_KEYS = [KEYS.VALUE, KEYS.HREF, KEYS.STYLE, KEYS.CLASS, KEYS.CHECKED, KEYS.DISABLED, KEYS.SELECTED, KEYS.FOCUSED];
    var ALLOWED_KEYS = [].concat(_.values(KEYS), _.values(EVENT_KEYS));
    var ALLOWED_VARIABLES_IN_EXPRESSION = [].concat(_.values(KEYS), ['data', 'app']);
    var Xml2Ts = (function () {
        function Xml2Ts(srcIn, srcOut) {
            this.srcIn = srcIn;
            this.srcOut = srcOut;
            _.bindAll(this, 'loadDustSources', 'loadSources', 'parse', 'complete');
            this.loadDustSources(this.loadSources);
        }
        Xml2Ts.prototype.loadDustSources = function (next) {
            dir.readFiles(__dirname, {
                match: /.ts.dust$/,
                exclude: /^\./,
                recursive: false
            }, function (err, content, filename, next) {
                if (err)
                    throw err;
                var base = path.basename(filename);
                //console.log('Compile ', filename, base);
                dust.loadSource(dust.compile(content, base, true));
                next();
            }, function (e, files) {
                if (e)
                    throw e;
                next(e, null);
            });
        };
        Xml2Ts.prototype.loadSources = function () {
            var t = this;
            var loadSrc = path.normalize(__dirname + '/' + this.srcIn);
            //console.log('loadSource from ' + loadSrc);
            dir.readFiles(loadSrc, {
                match: /.html$/,
                exclude: /^\./,
                recursive: true
            }, function (err, content, filename, next) {
                if (err)
                    throw err;
                var base = path.basename(filename);
                t.parse(base, content, next);
            }, this.complete);
        };
        Xml2Ts.prototype.complete = function () {
            var jsClassPath = path.normalize(__dirname + '/' + this.srcOut + '/compiled.js');
            tsc.compile(tsClasses, '-m commonjs -t ES5 --out ' + jsClassPath);
            console.log('Compiled ts to %s, for %d ms', jsClassPath, (Date.now() - start));
            console.log('*** complete all ***');
        };
        Xml2Ts.prototype.parse = function (fileName, content, next) {
            var t = this;
            var handler = new htmlparser.DefaultHandler(function (error, dom) {
                if (error) {
                }
                else {
                }
            }, { enforceEmptyTags: false, verbose: false });
            var parser = new htmlparser.Parser(handler, { strict: false });
            parser.parseComplete(content);
            var resultHtmlJs = JSON.parse(JSON.stringify(handler.dom, Xml2TsUtils.jsonReplacer, '\t'));
            var rootJs = null;
            var rootDom = null;
            var styleJs = null;
            var i18nJs = null;
            var statesJs = null;
            _.each(resultHtmlJs, function (value, index) {
                var isHtmlTag = value.type === 'tag' && value.name.indexOf('f:') === -1;
                if (isHtmlTag) {
                    rootJs = value;
                }
                else {
                    switch (value.name) {
                        case F_ELEMENTS.STYLE:
                            styleJs = value;
                            break;
                        case F_ELEMENTS.I18N:
                            var i18nPath = path.normalize(__dirname + '/' + t.srcIn + '/' + value.attribs.src);
                            i18nJs = require(i18nPath);
                            break;
                        case F_ELEMENTS.STATE:
                            if (!statesJs)
                                statesJs = [];
                            var type = value.attribs.type || 'boolean';
                            statesJs.push({ name: value.attribs.name, type: type, default: Xml2TsUtils.getTypedValue(value.attribs.default || '', type) });
                    }
                }
            });
            rootDom = Xml2TsUtils.recreateJsNode(rootJs, '0');
            rootDom.className = path.basename(fileName).replace(path.extname(fileName), '');
            rootDom.enableStates = [].concat(rootDom.enableStates, statesJs);
            if (i18nJs)
                rootDom.i18n = i18nJs;
            var tsClassPath = path.normalize(__dirname + '/' + t.srcOut + '/' + rootDom.className + '.ts');
            var jsClassPath = path.normalize(__dirname + '/' + t.srcOut + '/' + rootDom.className + '.js');
            async.series([
                function loadStylus(cb) {
                    //console.log('styleJs' , styleJs);
                    if (!styleJs) {
                        cb(null, null);
                        return;
                    }
                    var stylusSrc = path.normalize(__dirname + '/' + t.srcIn + '/' + styleJs.attribs.src);
                    //console.log('Style source is ' + stylusSrc)
                    var stylusSrc = fs.readFileSync(stylusSrc, 'utf8');
                    stylus(stylusSrc, { compress: true })
                        .render(function (err, css) {
                        if (err)
                            throw err;
                        rootDom.css = { content: css, enabled: false };
                        cb(err, css);
                    });
                },
                function createTsClass(cb) {
                    dust.render('object.ts.dust', rootDom, function dustCompileHandler(e, result) {
                        var reformattedContent = beautify.js_beautify(result, { "max_preserve_newlines": 1 });
                        //console.log('Write file ' + tsClassPath);
                        fs.writeFile(tsClassPath, reformattedContent, function tsSaveHandler(e, result) {
                            if (!e)
                                cb();
                            else
                                throw new Error('Cant write content to ' + tsClassPath);
                        });
                    });
                }
            ], function compileResultHandler(err, result) {
                if (!err)
                    tsClasses.push(tsClassPath);
                next();
            });
        };
        return Xml2Ts;
    })();
    fmvc.Xml2Ts = Xml2Ts;
    var Xml2TsUtils = (function () {
        function Xml2TsUtils() {
        }
        Xml2TsUtils.jsonReplacer = function (key, value) {
            ////console.log(key, _.isString(value));
            if (!_.isString(value))
                return value;
            switch (key) {
                case KEYS.RAW:
                    return undefined;
                case KEYS.STYLE:
                    return Xml2TsUtils.getDynamicValues(key, value, ';');
                case KEYS.DATA:
                    return Xml2TsUtils.getDynamicValues(key, value, null);
                case KEYS.STATES:
                    return Xml2TsUtils.parseDynamicContent(value);
                //return _.map(value.split(','), function(value) { return value.indexOf('=')>-1?value.split('='):value });
                default:
                    {
                        if (key in EVENT_KEYS)
                            return value; // {event: key.replace('on', null), value: value};
                        else {
                            ////console.log('Check replacer dynamic ' , key , _.isString(value) , ALLOWED_KEYS.indexOf(key) );
                            return (_.isString(value) && ALLOWED_KEYS.indexOf(key) > -1) ? Xml2TsUtils.getDynamicValues(key, value) : value;
                        }
                    }
            }
        };
        // todo review
        Xml2TsUtils.getDataDynamicValue = function (key, value) {
            if (value.match(Xml2TsUtils.PROPERTY_DATA_MATCH)) {
                return value;
            }
            else {
            }
        };
        Xml2TsUtils.parseDynamicContent = function (value) {
            // {a} // property
            // {a|filterOne|filterTwo} // property
            // {a,b,c} // selector if a or b or c
            // {(a||b||c)} // expression
            // {(a||b?'one':'two')} // expression
            // {(a||b) as V, c as D, (a||b||c) as E|i18n.t|s|d} // expression
            //console.log('Start ' ,value);
            var result = {
                content: value,
                values: [],
                vars: [],
                args: {},
                filters: [],
                expression: [] // выражения для расчет
            };
            var expressionMatches = Xml2TsUtils.getExpressionFromString(value); //value.match(Xml2TsUtils.BRACKETS_MATCH);
            //console.log('expression matches: ', expressionMatches);
            if (expressionMatches && expressionMatches.length)
                _.each(expressionMatches, function (expression, index) {
                    //console.log('Start expression ' , expression);
                    value = value.replace(expression, '$' + index);
                    var variables = _.uniq(_.filter(expression.match(Xml2TsUtils.VARS_MATCH), function (v) { return v.indexOf('\'') === -1 && v.match(/[A-Za-z]+/gi); }));
                    if (!_.isEmpty(variables))
                        variables = variables.sort(function (a, b) { return a.length > b.length ? -1 : 1; });
                    result.vars = result.vars.concat(variables);
                    var reducedExpression = _.reduce(variables, function (memo, v) {
                        var requestVariable = ((v.indexOf('.') > -1 && v.indexOf('state.') === -1) ? ('this.' + v) : ('this.getState("' + v.replace('state.', '') + '")'));
                        return memo.replace(new RegExp(v, 'g'), requestVariable);
                    }, expression, this);
                    //console.log('Reduces expression: ', reducedExpression);
                    result.expression.push(reducedExpression);
                });
            //console.log('value after expressions ' , value);
            var valueSpitByFilter = value.split('|');
            value = _.first(valueSpitByFilter);
            //console.log('value after filter ' , value);
            result.filters = _.rest(valueSpitByFilter);
            //result.expression = expressionMatches;
            var arguments = Xml2TsUtils.parseArguments(value);
            //console.log('arguments ' , arguments, _.isObject(arguments), value.split(','));
            if (_.isObject(arguments)) {
                result.args = arguments;
                result.vars = result.vars.concat(_.filter(_.values(arguments), function (v) { return v.indexOf('$') === -1; }));
                result.values = [];
            }
            else {
                result.vars = result.vars.concat(value.split(','));
                result.values = result.values.concat(value.split(','));
            }
            console.dir(result);
            return result;
        };
        Xml2TsUtils.parseArguments = function (value) {
            if (value.indexOf(',') === -1)
                return Xml2TsUtils.parseArgument(value);
            var result = {};
            _.each(value.split(','), function (argument, index) {
                var parsedArgs = Xml2TsUtils.parseArgument(argument);
                //console.log('Parsed arguments', parsedArgs);
                if (_.isObject(parsedArgs))
                    result = _.extend(result, parsedArgs);
            });
            return _.isEmpty(result) ? null : result;
        };
        Xml2TsUtils.parseArgument = function (value) {
            if (value.indexOf('as') === -1)
                return value.trim();
            else {
                var result = value.split('as');
                var object = {};
                object[result[1].trim()] = result[0].trim();
                return object;
            }
        };
        Xml2TsUtils.getDynamicValues = function (key, value, delimiter) {
            ////console.log('Check for ' , key, value);
            if (!_.isString(value))
                return value;
            var values = delimiter !== null ? (value.split(delimiter ? delimiter : ' ')) : [value];
            var dynamicValues = null;
            var staticValues = null;
            var boundValues = null;
            _.each(values, function (v) {
                var matches = v.match(Xml2TsUtils.DATA_MATCH_REGEXP);
                _.each(matches, function (match, index) {
                    var matchValue = match.replace(/[\{\}]/g, '');
                    var filterResult = null;
                    ////console.log('Check dv of ' , matchValue);
                    if (matchValue.indexOf('@') > -1) {
                        var cleanMatchValue = matchValue.replace('@', '');
                        var cleanResultValue = '{' + cleanMatchValue + '}';
                        if (!dynamicValues)
                            dynamicValues = {};
                        if (!dynamicValues[cleanMatchValue])
                            dynamicValues[cleanMatchValue] = [cleanResultValue];
                        else
                            dynamicValues[cleanMatchValue].push(cleanResultValue);
                        if (!boundValues)
                            boundValues = {};
                        if (!boundValues[cleanMatchValue])
                            boundValues[cleanMatchValue] = cleanResultValue;
                    }
                    else if (matchValue.indexOf('|') > -1) {
                        var filters = matchValue.split('|');
                        var data = filters.splice(0, 1)[0];
                        filterResult = { args: {}, filters: [], source: v.replace(matches[0], '{replace}') };
                        _.each(filters, function (v, k) {
                            var filter = v.indexOf('.') > -1 ? v.split('.') : v;
                            filterResult.filters.push(filter);
                        });
                        var dataFields = data.split(',');
                        _.each(dataFields, function (dataFieldContent) {
                            var content = dataFieldContent.split('as');
                            var dataPropName = content[0].trim();
                            var dataPropKey = content[1] ? content[1].trim() : 'VALUE';
                            filterResult.args[dataPropKey] = dataPropName;
                            if (!dynamicValues)
                                dynamicValues = {};
                            if (!dynamicValues[dataPropName])
                                dynamicValues[dataPropName] = [filterResult];
                            else
                                dynamicValues[dataPropName].push(filterResult);
                        });
                    }
                    else {
                        if (!dynamicValues)
                            dynamicValues = {};
                        if (!dynamicValues[matchValue])
                            dynamicValues[matchValue] = [v];
                        else
                            dynamicValues[matchValue].push(v);
                    }
                });
                if (!(matches && matches.length)) {
                    if (!staticValues)
                        staticValues = [];
                    staticValues.push(v);
                }
            });
            if (dynamicValues) {
                ////console.log('Return dynamic for ' , key, dynamicValues);
                return { static: staticValues, dynamic: dynamicValues, bounds: boundValues };
            }
            else {
                //console.log('Return static for ', key, value);
                return value;
            }
        };
        Xml2TsUtils.getStaticValueOfDynamicObject = function (value, delimiter) {
            delimiter = delimiter ? delimiter : ' ';
            return _.isObject(value) && value.static ? value.static.join(delimiter) : _.isString(value) ? value : null;
        };
        Xml2TsUtils.extendDynamicSummary = function (dynamic, dynamicName, domName, elementPath, values) {
            //console.log('[ex2ds] ' , dynamicName, domName, elementPath, values);
            if (!dynamic[dynamicName])
                dynamic[dynamicName] = {};
            if (!dynamic[dynamicName][domName])
                dynamic[dynamicName][domName] = {};
            if (!dynamic[dynamicName][domName][elementPath])
                dynamic[dynamicName][domName][elementPath] = (values.length === 1) ? values[0] : values;
        };
        Xml2TsUtils.recreateJsNode = function (data, path, rootObject) {
            var a = data.attribs;
            var object = { path: path, type: data.type, data: data.data, staticAttributes: {}, children: [], links: [], handlers: {}, bounds: {} };
            if (!rootObject) {
                rootObject = object;
                rootObject.dynamicSummary = {};
            }
            if (object.type === 'tag')
                object.tagName = data.name;
            // skip empty text node
            if (object.type === 'text' && _.isString(object.data)) {
                var empty = (object.data.replace(/[\n\t ]./gi, ''));
                if (empty) {
                    console.log('Empty ' + path);
                    return null;
                }
            }
            if (a) {
                if (a.link)
                    rootObject.links.push(Xml2TsUtils.getNameValue(a.link, path));
                if (a.enableStates)
                    rootObject.enableStates = Xml2TsUtils.getValueArrayFromString(a.enableStates, ',');
                if (a.extend)
                    object.extend = a.extend;
                if (a.states)
                    object.states = a.states;
            }
            // handlers, create static attributes
            _.each(a, function (value, key) {
                //console.log('Check: ', key, value);
                if (_.values(EVENT_KEYS).indexOf(key) > -1) {
                    //console.log('--- Handler ' , key, value);
                    object.handlers[key.replace('on', '')] = value;
                }
                if (DOM_KEYS.indexOf(key) < 0)
                    return;
                var result = null;
                switch (key) {
                    case KEYS.CLASS:
                        result = Xml2TsUtils.getStaticValueOfDynamicObject(value, ' ');
                        break;
                    case KEYS.STYLE:
                        result = Xml2TsUtils.getStaticValueOfDynamicObject(value, ';');
                        break;
                }
                //create dynamic maps summary for  root
                if (_.isObject(value)) {
                    _.each(value.dynamic, function (dynamicValueArray, dynamicName) {
                        Xml2TsUtils.extendDynamicSummary(rootObject.dynamicSummary, dynamicName, key, path, dynamicValueArray);
                    });
                    _.each(value.bounds, function (boundValue, boundObject) {
                        object.bounds[key] = {};
                        object.bounds[key][boundObject] = boundValue;
                        object.handlers['change'] = 'set,' + boundObject + ',' + boundValue;
                    });
                }
                if (result)
                    object.staticAttributes[key] = result;
            });
            if (_.isObject(data.data)) {
                var key = 'data';
                _.each(data.data.dynamic, function (dynamicValueArray, dynamicName) {
                    Xml2TsUtils.extendDynamicSummary(rootObject.dynamicSummary, dynamicName, key, path, dynamicValueArray); //create dynamic maps summary for root
                });
            }
            _.forEach(data.children, function (node, index) {
                var childPath = path + ',' + index;
                var result = Xml2TsUtils.recreateJsNode(node, childPath, rootObject);
                if (result)
                    object.children.push(result);
            });
            if (_.keys(object.staticAttributes).length === 0)
                delete object.staticAttributes;
            if (object.children.length === 0)
                delete object.children;
            if (object.links.length === 0)
                delete object.links;
            if (_.keys(object.handlers).length === 0)
                delete object.handlers;
            if (_.keys(object.bounds).length === 0)
                delete object.bounds;
            return object;
        };
        Xml2TsUtils.getNameValue = function (name, value) {
            return { name: name, value: value };
        };
        Xml2TsUtils.getValueArrayFromString = function (enableStates, s) {
            var r = enableStates.split(s);
            return _.map(r, function (v, k) { return (v.indexOf('=') > -1) ? Xml2TsUtils.getNameValueObjectFromString(v, '=') : v; });
        };
        Xml2TsUtils.getNameValueObjectFromString = function (v, s) {
            var r = v.split(s);
            return { name: r[0], value: r[1] };
        };
        Xml2TsUtils.getTypedValue = function (s, type) {
            switch (type) {
                case fmvc.Type.String:
                    return s;
                case fmvc.Type.Int:
                    return parseInt(s, 10);
                case fmvc.Type.Float:
                    return parseFloat(s);
                case fmvc.Type.Boolean:
                    return !!(s === true || s === 'true');
            }
        };
        Xml2TsUtils.getExpressionFromString = function (value) {
            var brackets = [];
            var open = 0;
            var r = [];
            _.each(value, function (v, i) {
                if (v === '(') {
                    if (open === 0)
                        brackets.push([i]);
                    open++;
                }
                else if (v === ')') {
                    if (open === 1)
                        brackets[brackets.length - 1].push(i);
                    open--;
                }
            });
            _.each(brackets, function (v) { r.push(value.substring(v[0], v[1] + 1)); });
            return r.length ? r : null;
        };
        Xml2TsUtils.MATCH_REGEXP = /\{([\@A-Za-z\, \|0-9\.]+)\}/g;
        Xml2TsUtils.DATA_MATCH_REGEXP = /\{([\(\)\\,\.\|@A-Za-z 0-9]+)\}/g;
        Xml2TsUtils.BRACKETS_MATCH = /\([^()]+\)/gi;
        Xml2TsUtils.VARS_MATCH = /([A-Za-z0-9'\.]+)/gi;
        Xml2TsUtils.PROPERTY_DATA_MATCH = /^\{[A-Za-z0-9\.]+\}$/;
        return Xml2TsUtils;
    })();
})(fmvc || (fmvc = {}));
new fmvc.Xml2Ts('../ui', '../ui');
//# sourceMappingURL=xml2ts.js.map