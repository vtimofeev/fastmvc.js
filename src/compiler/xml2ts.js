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
exports.VERSION = '0.1';
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
    /*
     const KEYS = {
     EXTEND: 'extend',
     CREATE_STATES: 'setStates',
     LINK: 'link',
     //DATA: 'data',
     STATES: 'states'
     //RAW: 'raw',
     /*
     SELECTED: 'selected',
     STYLE: 'style',
     HREF: 'href',
     VALUE: 'value',
     CLASS: 'class',
     CHECKED: 'checked',
     DISABLED: 'disabled',
     SELECTED: 'selected',
     FOCUSED: 'focused'
     }
     */
    var ViewProperties = {
        className: 'className',
        extend: 'extend',
        setStates: 'setStates',
        link: 'link',
        states: 'states' //
    };
    var MUST_USE_ATTRIBUTE = 1;
    var MUST_USE_PROPERTY = 2;
    var HAS_BOOLEAN_VALUE = 4;
    var HAS_SIDE_EFFECTS = 8;
    var HAS_NUMERIC_VALUE = 16;
    var HAS_POSITIVE_NUMERIC_VALUE = 32;
    var HAS_OVERLOADED_BOOLEAN_VALUE = 64;
    var HAS_MULTI_VALUE = 128;
    var HAS_TEXT_VALUE = 256;
    var Properties = {
        /**
         * Standard Properties
         */
        accept: null,
        acceptCharset: null,
        accessKey: null,
        action: null,
        allowFullScreen: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
        allowTransparency: MUST_USE_ATTRIBUTE,
        alt: null,
        async: HAS_BOOLEAN_VALUE,
        autoComplete: null,
        // autoFocus is polyfilled/normalized by AutoFocusUtils
        // autoFocus: HAS_BOOLEAN_VALUE,
        autoPlay: HAS_BOOLEAN_VALUE,
        capture: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
        cellPadding: null,
        cellSpacing: null,
        charSet: MUST_USE_ATTRIBUTE,
        challenge: MUST_USE_ATTRIBUTE,
        checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
        classID: MUST_USE_ATTRIBUTE,
        // To set className on SVG elements, it's necessary to use .setAttribute;
        // this works on HTML elements too in all browsers except IE8. Conveniently,
        // IE8 doesn't support SVG and so we can simply use the attribute in
        // browsers that support SVG and the property in browsers that don't,
        // regardless of whether the element is HTML or SVG.
        className: MUST_USE_ATTRIBUTE,
        class: HAS_MULTI_VALUE,
        cols: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
        colSpan: HAS_POSITIVE_NUMERIC_VALUE,
        content: null,
        contentEditable: null,
        contextMenu: MUST_USE_ATTRIBUTE,
        controls: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
        coords: null,
        crossOrigin: null,
        data: null,
        dateTime: MUST_USE_ATTRIBUTE,
        defer: HAS_BOOLEAN_VALUE,
        dir: null,
        disabled: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
        download: HAS_OVERLOADED_BOOLEAN_VALUE,
        draggable: null,
        encType: null,
        form: MUST_USE_ATTRIBUTE,
        formAction: MUST_USE_ATTRIBUTE,
        formEncType: MUST_USE_ATTRIBUTE,
        formMethod: MUST_USE_ATTRIBUTE,
        formNoValidate: HAS_BOOLEAN_VALUE,
        formTarget: MUST_USE_ATTRIBUTE,
        frameBorder: MUST_USE_ATTRIBUTE,
        headers: null,
        height: MUST_USE_ATTRIBUTE,
        hidden: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
        high: null,
        href: null,
        hrefLang: null,
        htmlFor: null,
        httpEquiv: null,
        icon: null,
        id: MUST_USE_PROPERTY,
        inputMode: MUST_USE_ATTRIBUTE,
        is: MUST_USE_ATTRIBUTE,
        keyParams: MUST_USE_ATTRIBUTE,
        keyType: MUST_USE_ATTRIBUTE,
        label: null,
        lang: null,
        list: MUST_USE_ATTRIBUTE,
        loop: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
        low: null,
        manifest: MUST_USE_ATTRIBUTE,
        marginHeight: null,
        marginWidth: null,
        max: null,
        maxLength: MUST_USE_ATTRIBUTE,
        media: MUST_USE_ATTRIBUTE,
        mediaGroup: null,
        method: null,
        min: null,
        minLength: MUST_USE_ATTRIBUTE,
        multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
        muted: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
        name: null,
        noValidate: HAS_BOOLEAN_VALUE,
        open: HAS_BOOLEAN_VALUE,
        optimum: null,
        pattern: null,
        placeholder: HAS_TEXT_VALUE,
        poster: null,
        preload: null,
        radioGroup: null,
        readOnly: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
        rel: null,
        required: HAS_BOOLEAN_VALUE,
        role: MUST_USE_ATTRIBUTE,
        rows: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
        rowSpan: null,
        sandbox: null,
        scope: null,
        scoped: HAS_BOOLEAN_VALUE,
        scrolling: null,
        seamless: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
        selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
        shape: null,
        size: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
        sizes: MUST_USE_ATTRIBUTE,
        span: HAS_POSITIVE_NUMERIC_VALUE,
        spellCheck: null,
        src: null,
        srcDoc: MUST_USE_PROPERTY,
        srcSet: MUST_USE_ATTRIBUTE,
        start: HAS_NUMERIC_VALUE,
        step: null,
        style: null,
        tabIndex: null,
        target: null,
        title: HAS_TEXT_VALUE,
        type: null,
        useMap: null,
        value: HAS_TEXT_VALUE | MUST_USE_PROPERTY | HAS_SIDE_EFFECTS,
        width: HAS_NUMERIC_VALUE | MUST_USE_ATTRIBUTE,
        wmode: HAS_NUMERIC_VALUE | MUST_USE_ATTRIBUTE,
        wrap: null,
        /**
         * Non-standard Properties
         */
        // autoCapitalize and autoCorrect are supported in Mobile Safari for
        // keyboard hints.
        autoCapitalize: null,
        autoCorrect: null,
        // itemProp, itemScope, itemType are for
        // Microdata support. See http://schema.org/docs/gs.html
        itemProp: MUST_USE_ATTRIBUTE,
        itemScope: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
        itemType: MUST_USE_ATTRIBUTE,
        // itemID and itemRef are for Microdata support as well but
        // only specified in the the WHATWG spec document. See
        // https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
        itemID: MUST_USE_ATTRIBUTE,
        itemRef: MUST_USE_ATTRIBUTE,
        // property is supported for OpenGraph in meta tags.
        property: null,
        // IE-only attribute that specifies security restrictions on an iframe
        // as an alternative to the sandbox attribute on IE<10
        security: MUST_USE_ATTRIBUTE,
        // IE-only attribute that controls focus behavior
        unselectable: MUST_USE_ATTRIBUTE,
    };
    var defaultAttibuteMap = function (mask) {
        return function (v, k) { return (v & mask) ? k : null; };
    };
    var DomAttibutesByType = {
        multi: _.compact(_.map(Properties, defaultAttibuteMap(HAS_MULTI_VALUE))),
        text: _.compact(_.map(Properties, defaultAttibuteMap(HAS_TEXT_VALUE))),
        boolean: _.compact(_.map(Properties, defaultAttibuteMap(HAS_BOOLEAN_VALUE))),
    };
    var KEYS = {
        DATA: 'data',
        STATES: 'states',
        STYLE: 'style',
        RAW: 'raw',
    };
    var EVENT_KEYS = {
        ONKEYDOWN: 'onkeydown',
        ONKEYUP: 'onkeyup',
        ONACTION: 'onaction',
        ONCLICK: 'onclick',
        ONDBLCLICK: 'ondblclick',
        ONMOUSEOVER: 'onmouseover',
        ONMOUSEOUT: 'onmouseout',
        ONFOCUS: 'onfocus'
    };
    //const DOM_AND_STATES_KEYS:string[] = [KEYS.VALUE, KEYS.HREF, KEYS.STYLE, KEYS.CLASS, KEYS.CHECKED, KEYS.DISABLED, KEYS.SELECTED, KEYS.FOCUSED, KEYS.STATES];
    //const ALLOWED_KEYS:string[] = [].concat(_.values(KEYS), _.values(EVENT_KEYS) );
    //const ALLOWED_VARIABLES_IN_EXPRESSION = [].concat(_.values(KEYS), ['data', 'app']);
    var Xml2Ts = (function () {
        function Xml2Ts(srcIn, srcOut, compiledOut) {
            this.srcIn = srcIn;
            this.srcOut = srcOut;
            this.compiledOut = compiledOut;
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
            var loadSrc = path.normalize(this.srcIn);
            console.log('Read files ', loadSrc);
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
            return;
            var result = null;
            if (this.compiledOut) {
                var jsClassPath = path.normalize(this.compiledOut + '/fmvc.js');
                result = tsc.compile(tsClasses, '-m commonjs -t ES5 --out ' + jsClassPath);
            }
            else {
            }
            //console.log(result);
            console.log('Compiled ts to %s, for %d ms', jsClassPath, (Date.now() - start), tsClasses);
            console.log('*** complete all ***');
        };
        Xml2Ts.prototype.parse = function (fileName, content, next) {
            console.log('Prepare Parsing: ', fileName);
            var t = this;
            var handler = new htmlparser.DefaultHandler(function (error, dom) {
                if (error) {
                    console.log('error parse html ' + fileName);
                }
                else {
                }
            }, { enforceEmptyTags: false, verbose: false });
            var parser = new htmlparser.Parser(handler, { strict: false });
            parser.parseComplete(content);
            //var resultHtmlJs:any = JSON.parse(JSON.stringify(handler.dom));
            var resultHtmlJs = JSON.parse(JSON.stringify(handler.dom, Xml2TsUtils.jsonReplacer, '\t'));
            //console.log('Result Parsing: ', JSON.stringify(resultHtmlJs));
            console.dir(resultHtmlJs, { depth: 10 });
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
                            var i18nPath = path.resolve(t.srcIn + '/' + value.attribs.src);
                            i18nJs = require(i18nPath);
                            break;
                        case F_ELEMENTS.STATE:
                            if (!statesJs)
                                statesJs = [];
                            var type = value.attribs.type || 'string';
                            statesJs.push({
                                name: value.attribs.name,
                                type: type,
                                default: Xml2TsUtils.getTypedValue(value.attribs.default || '', type)
                            });
                    }
                }
            });
            rootDom = Xml2TsUtils.recreateJsNode(rootJs, '0');
            rootDom.className = path.basename(fileName).replace(path.extname(fileName), '');
            var paths = this.srcIn.split('/'); //@todo check winpaths
            rootDom.moduleName = paths[paths.length - 1];
            rootDom.enableStates = [].concat(rootDom.enableStates, statesJs);
            if (i18nJs)
                rootDom.i18n = i18nJs;
            var tsClassPath = path.normalize(t.srcOut + '/' + rootDom.className + '.ts');
            var jsClassPath = path.normalize(t.srcOut + '/' + rootDom.className + '.js');
            async.series([
                function loadStylus(cb) {
                    if (!styleJs) {
                        cb(null, null);
                        return;
                    }
                    var stylusSrc = path.normalize(t.srcIn + '/' + styleJs.attribs.src);
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
        //public static PROPERTY_DATA_MATCH:RegExp = /^\{[A-Za-z0-9\.]+\}$/;
        Xml2TsUtils.jsonReplacer = function (key, value) {
            if (!_.isString(value))
                return value;
            value = value.trim();
            //if(value) value = value.replace(/[\n\t]+/gi, '');
            if (!value)
                return undefined;
            switch (key) {
                case KEYS.RAW:
                    return undefined;
                case KEYS.STYLE:
                    return Xml2TsUtils.getDynamicValues(key, value, ';');
                case KEYS.STATES:
                    return Xml2TsUtils.parseDynamicContent(value);
                case KEYS.DATA:
                    return Xml2TsUtils.parseMultidynamicContent(value);
                default:
                    if (key.indexOf('data-') === 0 || key.indexOf('aria-') === 0 || key.indexOf('.') > 0 || key.indexOf('on') === 0) {
                        return Xml2TsUtils.parseMultidynamicContent(value);
                    }
                    else if (DomAttibutesByType.multi.indexOf(key) > -1) {
                        return Xml2TsUtils.getDynamicValues(key, value, ' ');
                    }
                    else if (DomAttibutesByType.text.indexOf(key) > -1) {
                        return Xml2TsUtils.parseMultidynamicContent(value);
                    }
                    else if (DomAttibutesByType.boolean.indexOf(key) > -1) {
                        return Xml2TsUtils.parseMultidynamicContent(value);
                    }
                    else {
                        console.log('Skip', key, value);
                        return value;
                    }
            }
        };
        Xml2TsUtils.parseMultidynamicContent = function (value) {
            var _this = this;
            var matches = value.match(Xml2TsUtils.DATA_MATCH_REGEXP);
            if (!(matches && matches.length))
                return value;
            var expressions = _.map(matches, function (v) { return _this.parseDynamicContent(v.substring(1, v.length - 1)); }, this);
            var expressionVars = [];
            var result = _.reduce(matches, function (r, v, i) {
                var e = '$' + i;
                expressionVars.push(e);
                return r.replace(v, '{' + e + '}');
            }, value, this);
            return { content: value, result: result, vars: expressionVars, expressions: expressions };
        };
        Xml2TsUtils.parseDynamicContent = function (value) {
            // {a} // property
            // {a|filterOne|filterTwo} // property
            // {a,b,c} // selector if a or b or c
            // {(a||b||c)} // expression
            // {(a||b?'one':'two')} // expression
            // {(a||b) as V, c as D, (a||b||c) as E|i18n.t|s|d} // expression
            var expressionMatches = Xml2TsUtils.getExpressionFromString(value); //value.match(Xml2TsUtils.BRACKETS_MATCH);
            if (!(expressionMatches && expressionMatches.length))
                return value;
            var result = {
                content: value,
                vars: [],
                values: [],
                args: {},
                filters: [],
                expressions: [] // выражения для расчета
            };
            if (expressionMatches && expressionMatches.length)
                _.each(expressionMatches, function (expression, index) {
                    value = value.replace(expression, '$' + index);
                    var variables = _.uniq(_.filter(expression.match(Xml2TsUtils.VARS_MATCH), function (v) {
                        return v.indexOf('\'') === -1 && v.match(/^[A-Za-z]+/gi);
                    }));
                    //console.log('--- vars : ', variables);
                    if (!_.isEmpty(variables))
                        variables = variables.sort(function (a, b) { return a.length > b.length ? -1 : 1; });
                    result.vars = result.vars.concat(variables);
                    var reducedExpression = _.reduce(variables, function (memo, v) {
                        var requestVariable = ((v.indexOf('.') > -1 && v.indexOf('state.') === -1) || v === 'data' ? ('this.' + v) : ('this.getState("' + v.replace('state.', '') + '")'));
                        return memo.replace(new RegExp(v, 'g'), requestVariable);
                    }, expression, this);
                    result.expressions.push(reducedExpression);
                });
            var valueSpitByFilter = value.split('|');
            value = _.first(valueSpitByFilter);
            result.filters = _.rest(valueSpitByFilter);
            var args = Xml2TsUtils.parseArguments(value);
            if (_.isObject(args)) {
                result.args = args;
                result.vars = result.vars.concat(_.filter(_.values(args), function (v) { return v.indexOf('$') === -1; }));
                result.values = [];
            }
            else {
                result.vars = result.vars.concat(value.split(','));
                result.values = result.values.concat(value.split(','));
            }
            // remove empty keys
            _.each(_.keys(result), function (key) { return (_.isEmpty(result[key]) ? delete result[key] : null); });
            //console.dir(result);
            return result;
        };
        Xml2TsUtils.parseArguments = function (value) {
            if (value.indexOf(',') === -1)
                return Xml2TsUtils.parseArgument(value);
            var result = {};
            _.each(value.split(','), function (argument, index) {
                var parsedArgs = Xml2TsUtils.parseArgument(argument);
                if (_.isObject(parsedArgs))
                    result = _.extend(result, parsedArgs);
            });
            return _.isEmpty(result) ? null : result;
        };
        Xml2TsUtils.parseArgument = function (value) {
            if (value.indexOf(' as ') === -1)
                return value.trim();
            else {
                var result = value.split(' as ');
                var object = {};
                object[result[1].trim()] = result[0].trim();
                return object;
            }
        };
        Xml2TsUtils.getDynamicValues = function (key, value, delimiter) {
            if (!_.isString(value))
                return value;
            var values = delimiter !== null ? (value.split(delimiter ? delimiter : ' ')) : [value];
            var r = { static: [], dynamic: [] };
            _.each(values, function (value) {
                var parts = (key === 'style') ? value.split(':') : null;
                value = parts && parts.length > 1 ? parts[1] : value;
                var re = Xml2TsUtils.parseMultidynamicContent(value);
                var ro = re;
                if (key === 'style') {
                    var o = {};
                    o[parts[0].trim()] = re;
                    ro = o;
                }
                if (re === value) {
                    r.static.push(ro);
                }
                else {
                    r.dynamic.push(ro);
                }
            });
            return r;
            /*
            var dynamicValues:{[property:string]:string} = null;
            var staticValues:string[] = null;
            var boundValues:string[] = null;

            _.each(values, function (v) {
                var matches = v.match(Xml2TsUtils.DATA_MATCH_REGEXP);

                _.each(matches, function (match, index) {
                    var matchValue = match.replace(/[\{\}]/g, '');
                    var filterResult = null;
                    if (matchValue.indexOf('@') > -1) {
                        var cleanMatchValue:string = matchValue.replace('@', '');
                        var cleanResultValue:string = '{' + cleanMatchValue + '}';

                        if (!dynamicValues) dynamicValues = {};
                        if (!dynamicValues[cleanMatchValue]) dynamicValues[cleanMatchValue] = [cleanResultValue];
                        else dynamicValues[cleanMatchValue].push(cleanResultValue);

                        if (!boundValues) boundValues = {};
                        if (!boundValues[cleanMatchValue]) boundValues[cleanMatchValue] = cleanResultValue;
                    }
                    else if (matchValue.indexOf('|') > -1) {
                        var filters = matchValue.split('|');
                        var data = filters.splice(0, 1)[0];
                        filterResult = {args: {}, filters: [], source: v.replace(matches[0], '{replace}')};

                        _.each(filters, function (v, k) {
                            var filter = v.indexOf('.') > -1 ? v.split('.') : v;
                            filterResult.filters.push(filter);
                        });

                        var dataFields = data.split(',');
                        _.each(dataFields, function (dataFieldContent) {
                            var content = dataFieldContent.split(' as ');
                            var dataPropName:string = content[0].trim();
                            var dataPropKey:string = content[1] ? content[1].trim() : 'VALUE';
                            filterResult.args[dataPropKey] = dataPropName;

                            if (!dynamicValues) dynamicValues = {};
                            if (!dynamicValues[dataPropName]) dynamicValues[dataPropName] = [filterResult];
                            else dynamicValues[dataPropName].push(filterResult);
                        });
                    }
                    else {
                        if (!dynamicValues) dynamicValues = {};
                        if (!dynamicValues[matchValue]) dynamicValues[matchValue] = [v];
                        else dynamicValues[matchValue].push(v);
                    }
                });
                if (!(matches && matches.length)) {
                    if (!staticValues) staticValues = [];
                    staticValues.push(v);
                }
            });

            if (dynamicValues) {
                return {static: staticValues, dynamic: dynamicValues, bounds: boundValues};
            } else {
                return value;
            }
            */
        };
        Xml2TsUtils.getStaticValueOfDynamicObject = function (value, delimiter) {
            delimiter = delimiter ? delimiter : ' ';
            return _.isObject(value) && value.static ? value.static.join(delimiter) : _.isString(value) ? value : null;
        };
        Xml2TsUtils.extendDynamicSummary = function (dynamic, dynamicName, domName, elementPath, values) {
            if (!dynamic[dynamicName])
                dynamic[dynamicName] = {};
            if (!dynamic[dynamicName][domName])
                dynamic[dynamicName][domName] = {};
            if (!dynamic[dynamicName][domName][elementPath])
                dynamic[dynamicName][domName][elementPath] = (values.length === 1) ? values[0] : values;
        };
        Xml2TsUtils.recreateJsNode = function (data, path, rootObject) {
            var a = data.attribs;
            var object = {
                path: path,
                type: data.type,
                data: data.data,
                properties: {},
                attribs: {},
                static: {},
                dynamic: {},
                children: [],
                links: [],
                handlers: {},
                bounds: {}
            };
            if (!rootObject) {
                rootObject = object;
                rootObject.dynamicSummary = {};
            }
            if (object.type === 'tag')
                object.tagName = data.name;
            // skip empty text node
            if (object.type === 'text' && _.isString(object.data)) {
                var empty = (object.data.trim().replace(/[\n\t ]./gi, ''));
                if (_.isEmpty(empty)) {
                    console.log('Empty ', empty, path);
                    return null;
                }
            }
            if (a) {
                if (a.link) {
                    rootObject.links.push(Xml2TsUtils.getNameValue(a.link, path));
                    object.link = a.link;
                }
                if (a.enableStates)
                    rootObject.enableStates = Xml2TsUtils.getValueArrayFromString(a.enableStates, ',');
                if (a.extend)
                    object.extend = a.extend;
                if (a.states)
                    object.states = a.states;
                if (a.selected)
                    object.selected = a.selected;
            }
            // Проверяем аттрибуты объекта для дальнейшего прокидывания в объекты
            var properties = ['link', 'enableStates', 'extend', 'states', 'selected'];
            _.each(a, function (v, k) {
                console.log('INCLUDE ', k, (_.indexOf(properties, k) === -1));
                if (_.indexOf(properties, k) === -1)
                    object.attribs[k] = v;
            });
            // handlers, create static attributes
            // create dynamic array
            var commonDatas = _.isObject(data.data) ? _.extend({}, a, { data: data.data }) : a;
            _.each(commonDatas, function (value, key) {
                Xml2TsUtils.writeSummaryForNode(object, rootObject, key, path, value);
            });
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
        Xml2TsUtils.writeSummaryForNode = function (object, rootObject, key, path, value) {
            if (key === 'states')
                console.log('Check summary for ', key, value);
            if (_.values(EVENT_KEYS).indexOf(key) > -1) {
                object.handlers[key.replace('on', '')] = value;
            }
            if (!(key.indexOf('data') > -1))
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
            if (result)
                object.staticAttributes[key] = result;
            //create dynamic maps summary for root
            if (_.isObject(value)) {
                var expressionVars = Xml2TsUtils.getExpressionVars(value);
                if (key === 'states')
                    console.log('Full vars list --> ', path, key, value.vars, '===', expressionVars);
                _.each(expressionVars, function (varName) { return Xml2TsUtils.extendDynamicSummary(rootObject.dynamicSummary, varName, key, path, value); });
                _.each(value.dynamic, function (dynamicValueArray, dynamicName) { return Xml2TsUtils.extendDynamicSummary(rootObject.dynamicSummary, dynamicName, key, path, dynamicValueArray); });
                _.each(value.bounds, function (boundValue, boundObject) {
                    object.bounds[key] = {};
                    object.bounds[key][boundObject] = boundValue;
                    object.handlers['change'] = 'set,' + boundObject + ',' + boundValue;
                });
            }
        };
        Xml2TsUtils.getExpressionVars = function (ex) {
            var r = [].concat(ex.vars ? ex.vars : []);
            _.each(ex.expressions, function (childEx) {
                if (_.isObject(childEx))
                    r = [].concat(r, Xml2TsUtils.getExpressionVars(childEx));
            });
            return _.uniq(_.filter(r, function (v) { return (v.match(Xml2TsUtils.JS_VARS_MATCH)); }));
        };
        Xml2TsUtils.getNameValue = function (name, value) {
            return { name: name, value: value };
        };
        Xml2TsUtils.getValueArrayFromString = function (enableStates, s) {
            var r = enableStates.split(s);
            return _.map(r, function (v, k) {
                return (v.indexOf('=') > -1) ? Xml2TsUtils.getNameValueObjectFromString(v, '=') : v;
            });
        };
        Xml2TsUtils.getNameValueObjectFromString = function (v, s) {
            var r = v.split(s);
            return { name: r[0], value: r[1] };
        };
        Xml2TsUtils.getTypedValue = function (s, type) {
            switch (type) {
                case fmvc.Type.String:
                    return String(s);
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
            _.each(brackets, function (v) {
                r.push(value.substring(v[0], v[1] + 1));
            });
            return r.length ? r : null;
        };
        //public static MATCH_REGEXP:RegExp = /\{([\@A-Za-z\, \|0-9\.]+)\}/g;
        Xml2TsUtils.DATA_MATCH_REGEXP = /\{([\(\)\\,\.\|'"@A-Za-z \+\-\/\*0-9]+)\}/g;
        //public static BRACKETS_MATCH:RegExp = /\([^()]+\)/gi;
        Xml2TsUtils.VARS_MATCH = /([A-Za-z0-9_\-'\.]+)/gi;
        Xml2TsUtils.JS_VARS_MATCH = /(^[A-Za-z0-9_\-\.]+$)/gi;
        return Xml2TsUtils;
    })();
})(fmvc || (fmvc = {}));
function resolvePath(value) {
    var r = path.normalize(process.cwd() + '/' + value);
    return value;
}
module.exports = { Xml2Ts: fmvc.Xml2Ts };
//# sourceMappingURL=xml2ts.js.map