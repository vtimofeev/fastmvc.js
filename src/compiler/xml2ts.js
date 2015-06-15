///<reference path='../fmvc/d.ts' />
///<reference path='../d.ts/node/node.d.ts'/>
///<reference path='../d.ts/async/async.d.ts'/>
//<reference path='../d.ts/lodash/lodash.d.ts'/>
///<reference path='../d.ts/dustjs-linkedin/dustjs-linkedin.d.ts'/>
var util = require('util');
var fs = require('fs');
var htmlparser = require("htmlparser");
var _ = require('lodash');
var dust = require('dustjs-linkedin');
var dir = require('node-dir');
var path = require('path');
var async = require('async');
var beautify = require('js-beautify');
var stylus = require('stylus');
require('dustjs-helpers');
dust.config.whitespace = true;
var xml2ns;
(function (xml2ns) {
    var KEYS = {
        EXTEND: 'extend',
        CREATE_STATES: 'createStates',
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
                console.log('Compile ', filename, base);
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
            console.log('loadSource from ' + loadSrc);
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
            console.log('*** complete ***');
        };
        Xml2Ts.prototype.parse = function (fileName, content, next) {
            var t = this;
            var handler = new htmlparser.DefaultHandler(function (error, dom) {
                if (error)
                    console.log('error parse html ' + fileName);
                else {
                    console.log('success parse html ' + fileName);
                }
            }, { enforceEmptyTags: false, verbose: false });
            var parser = new htmlparser.Parser(handler, { strict: false });
            parser.parseComplete(content);
            var resultHtmlJs = JSON.parse(JSON.stringify(handler.dom, Xml2TsUtils.jsonReplacer, '\t'));
            var rootJs = null;
            var rootDom = null;
            var styleJs = null;
            var i18nJs = null;
            _.each(resultHtmlJs, function (value, index) {
                if (value.type === 'tag' && value.name.indexOf('f:') === -1) {
                    rootJs = value;
                }
                else if (value.name === 'f:style') {
                    styleJs = value;
                }
                else if (value.name === 'f:i18n') {
                    var i18nPath = path.normalize(__dirname + '/' + t.srcIn + '/' + value.attribs.src);
                    i18nJs = require(i18nPath);
                    console.log('i18n ', i18nJs);
                }
            });
            console.log(util.inspect(rootJs, { depth: 5 }));
            rootDom = Xml2TsUtils.recreateJsNode(rootJs, 0);
            rootDom.className = path.basename(fileName).replace(path.extname(fileName), '');
            if (i18nJs)
                rootDom.i18n = i18nJs;
            async.series([
                function loadStylus(cb) {
                    if (!styleJs)
                        cb(null, null);
                    var stylusSrc = path.normalize(__dirname + '/' + t.srcIn + '/' + styleJs.attribs.src);
                    console.log('Style source is ' + stylusSrc);
                    var stylusSrc = fs.readFileSync(stylusSrc, 'utf8');
                    stylus(stylusSrc, { compress: true })
                        .render(function (err, css) {
                        if (err)
                            throw err;
                        rootDom.css = css;
                        console.log('Css of stylus : ' + css);
                        cb(err, css);
                    });
                }
            ], function compileResultHandler(err, result) {
                if (err)
                    return 'Cant render dust cause errors for ' + rootDom.className;
                dust.render('object.ts.dust', rootDom, function (e, result) {
                    var reformattedContent = beautify.js_beautify(result, { "max_preserve_newlines": 1 });
                    var filePath = path.normalize(__dirname + '/' + t.srcOut + '/' + rootDom.className + '.ts');
                    console.log('Write file ' + filePath);
                    fs.writeFile(filePath, reformattedContent, function (e, result) {
                        if (!e)
                            next();
                        else
                            throw new Error('Cant write content to ' + filePath);
                    });
                });
            });
        };
        return Xml2Ts;
    })();
    xml2ns.Xml2Ts = Xml2Ts;
    var Xml2TsUtils = (function () {
        function Xml2TsUtils() {
        }
        Xml2TsUtils.jsonReplacer = function (key, value) {
            //console.log(key, _.isString(value));
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
                    return _.map(value.split(','), function (value) { return value.indexOf('=') > -1 ? value.split('=') : value; });
                default:
                    {
                        if (key in EVENT_KEYS)
                            return value; // {event: key.replace('on', null), value: value};
                        else {
                            //console.log('Check replacer dynamic ' , key , _.isString(value) , ALLOWED_KEYS.indexOf(key) );
                            return (_.isString(value) && ALLOWED_KEYS.indexOf(key) > -1) ? Xml2TsUtils.getDynamicValues(key, value) : value;
                        }
                    }
            }
        };
        Xml2TsUtils.getDynamicValues = function (key, value, delimiter) {
            //console.log('Check for ' , key, value);
            if (!_.isString(value))
                return value;
            var values = delimiter !== null ? (value.split(delimiter ? delimiter : ' ')) : [value];
            var dynamicValues = null;
            var staticValues = null;
            var boundValues = null;
            _.each(values, function (v) {
                var matches = v.match(Xml2TsUtils.MATCH_REGEXP);
                if (matches && matches.length === 2) {
                    var matchValue = matches[1];
                    var filterResult = null;
                    //console.log('Check dv of ' , matchValue);
                    if (matchValue.indexOf('|') > -1) {
                        var dataAndFilters = matchValue.split('|');
                        var firstFilter = dataAndFilters[1].split('.');
                        filterResult = { args: {}, method: firstFilter[0].trim(), name: firstFilter[1].trim(), source: v.replace(matches[0], '{replace}') };
                        var dataFields = dataAndFilters[0].split(',');
                        _.each(dataFields, function (dataFieldContent) {
                            var content = dataFieldContent.split('as');
                            var dataPropName = content[0].trim();
                            filterResult.args[content[1] ? content[1].trim() : 'VALUE'] = dataPropName;
                            if (!dynamicValues)
                                dynamicValues = {};
                            if (!dynamicValues[dataPropName])
                                dynamicValues[dataPropName] = [filterResult];
                            else
                                dynamicValues[dataPropName].push(filterResult);
                        });
                    }
                    else if (matchValue.indexOf('@') > -1) {
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
                    else {
                        if (!dynamicValues)
                            dynamicValues = {};
                        if (!dynamicValues[matchValue])
                            dynamicValues[matchValue] = [v];
                        else
                            dynamicValues[matchValue].push(v);
                    }
                }
                else {
                    if (!staticValues)
                        staticValues = [];
                    staticValues.push(v);
                }
            });
            if (dynamicValues) {
                //console.log('Return dynamic for ' , key, dynamicValues);
                return { static: staticValues, dynamic: dynamicValues, bounds: boundValues };
            }
            else {
                console.log('Return static for ', key, value);
                return value;
            }
        };
        Xml2TsUtils.getStaticValueOfDynamicObject = function (value, delimiter) {
            delimiter = delimiter ? delimiter : ' ';
            return _.isObject(value) && value.static ? value.static.join(delimiter) : _.isString(value) ? value : null;
        };
        Xml2TsUtils.extendDynamicSummary = function (dynamic, dynamicName, domName, elementPath, values) {
            console.log('[ex2ds] ', dynamicName, domName, elementPath, values);
            if (!dynamic[dynamicName])
                dynamic[dynamicName] = {};
            if (!dynamic[dynamicName][domName])
                dynamic[dynamicName][domName] = {};
            if (!dynamic[dynamicName][domName][elementPath])
                dynamic[dynamicName][domName][elementPath] = (values.length === 1) ? values[0] : values;
        };
        Xml2TsUtils.recreateJsNode = function (data, path, rootObject) {
            var a = data.attribs;
            var object = { path: path, type: data.type, data: data.data, staticAttributes: [], children: [], links: [], handlers: {}, bounds: {} };
            if (!rootObject) {
                rootObject = object;
                rootObject.dynamicSummary = {};
            }
            if (object.type === 'tag')
                object.tagName = data.name;
            if (a) {
                if (a.link)
                    rootObject.links.push(Xml2TsUtils.getNameValue(a.link, path));
                if (a.extend)
                    object.extend = a.extend;
                if (a.createStates)
                    object.createStates = a.createStates.split(',');
                if (a.states)
                    object.states = a.states;
            }
            // handlers, create static attributes
            _.each(a, function (value, key) {
                console.log('Check: ', key, value);
                if (_.values(EVENT_KEYS).indexOf(key) > -1) {
                    console.log('--- Handler ', key, value);
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
                    object.staticAttributes.push(Xml2TsUtils.getNameValue(key, result));
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
                object.children.push(result);
            });
            if (object.staticAttributes.length === 0)
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
        Xml2TsUtils.MATCH_REGEXP = /\{([\@A-Za-z\, \|0-9\.]+)\}/;
        return Xml2TsUtils;
    })();
})(xml2ns || (xml2ns = {}));
new xml2ns.Xml2Ts('../ui', '../ui');
//# sourceMappingURL=xml2ts.js.map