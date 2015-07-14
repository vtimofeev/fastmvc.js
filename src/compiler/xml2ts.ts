///<reference path='../fmvc/d.ts' />
///<reference path='../d.ts/node/node.d.ts'/>
///<reference path='../d.ts/async/async.d.ts'/>
//<reference path='../d.ts/lodash/lodash.d.ts'/>
///<reference path='../d.ts/dustjs-linkedin/dustjs-linkedin.d.ts'/>
import util = require('util');
import fs = require('fs');
import htmlparser = require("htmlparser");
import _ = require('lodash');
import dust = require('dustjs-linkedin');
import dir = require('node-dir');
import path = require('path');
import async = require('async');
import beautify = require('js-beautify');
import stylus = require('stylus');
import tsc = require('typescript-compiler');

var VERSION = '0.1';
var argv = require('optimist').
    usage('FMVC xml2ts compiler. Version ' + VERSION + '.\nCreates view components ts classes from like html notation.\n\nUsage: $0 -p [string] -o [string]').
    demand(['p']).
    describe('p', 'Path to directory').
    describe('c', 'Out compilied js directory').
    describe('o', 'Out directory').argv;


require('dustjs-helpers');
dust.config.whitespace = true;

var start = Date.now();
var tsClasses = [];

module fmvc {
    export var Type = {
        String: 'string',
        Int: 'int',
        Float: 'float',
        Boolean: 'boolean'
    };


    // Локальные элементы для расщирения класса
    const F_ELEMENTS = {
        STYLE: 'f:style',
        STATE: 'f:state',
        I18N: 'f:i18n'
    };

    const KEYS = {
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

    const EVENT_KEYS = {
        ONKEYDOWN: 'onkeydown',
        ONKEYUP: 'onkeyup',
        ONACTION: 'onaction',
        ONCLICK: 'onclick',
        ONMOUSEOVER: 'onmouseover',
        ONMOUSEOUT: 'onmouseout'
    };

    const DOM_AND_STATES_KEYS:string[] = [KEYS.VALUE, KEYS.HREF, KEYS.STYLE, KEYS.CLASS, KEYS.CHECKED, KEYS.DISABLED, KEYS.SELECTED, KEYS.FOCUSED, KEYS.STATES];
    const ALLOWED_KEYS:string[] = [].concat(_.values(KEYS), _.values(EVENT_KEYS) );
    const ALLOWED_VARIABLES_IN_EXPRESSION = [].concat(_.values(KEYS), ['data', 'app']);

    export class Xml2Ts {
        constructor(public srcIn:string, public srcOut:string) {
            _.bindAll(this, 'loadDustSources', 'loadSources', 'parse', 'complete');
            this.loadDustSources(this.loadSources);
        }

        loadDustSources(next:Function) {
                dir.readFiles(__dirname,
                    {
                        match: /.ts.dust$/,
                        exclude: /^\./,
                        recursive: false
                    }, function (err, content, filename, next) {
                        if (err) throw err;
                        var base = path.basename(filename);
                        dust.loadSource(dust.compile(content, base, true));
                        next();
                    },
                    function (e, files) {
                        if (e) throw e;
                        next(e, null);
                    });

        }

        loadSources() {
            var t = this;
            var loadSrc = path.normalize(this.srcIn);
            dir.readFiles(loadSrc,
                {
                    match: /.html$/,
                    exclude: /^\./,
                    recursive: true
                }, function (err, content, filename, next) {
                    if (err) throw err;
                    var base = path.basename(filename);
                    t.parse(base, content, next);
                }, this.complete);
        }

        complete() {
            var jsCompiledPath = (argv.c?resolvePath(argv.c):this.srcOut);
            var jsClassPath:string = path.normalize( this.srcOut  + '/compiled.js');
            console.log(tsc.compile(tsClasses, '-m commonjs -t ES5 --out ' + jsClassPath));
            console.log('Compiled ts to %s, for %d ms', jsClassPath, (Date.now() - start), tsClasses);
            console.log('*** complete all ***');
        }

        parse(fileName:string, content:string, next:Function) {
            var t = this;
            var handler:any = new htmlparser.DefaultHandler(function (error, dom) {
                if (error) {
                    console.log('error parse html ' + fileName);
                }
                else {

                }
            }, {enforceEmptyTags: false, verbose: false});

            var parser = new htmlparser.Parser(handler, {strict: false});
            parser.parseComplete(content);

            var resultHtmlJs:any = JSON.parse(JSON.stringify(handler.dom, Xml2TsUtils.jsonReplacer, '\t'));

            var rootJs:any = null;
            var rootDom:fmvc.IRootDomObject = null;
            var styleJs:any = null;
            var i18nJs:any = null;
            var statesJs:any = null;

            _.each(resultHtmlJs, function (value:any, index:number) {
                var isHtmlTag:boolean = value.type === 'tag' && value.name.indexOf('f:') === -1;
                if (isHtmlTag) {
                    rootJs = value;
                }
                else {
                    switch (value.name) {
                        case F_ELEMENTS.STYLE:
                            styleJs = value;
                            break;
                        case F_ELEMENTS.I18N:
                            var i18nPath:string = path.resolve(t.srcIn + '/' + value.attribs.src);
                            i18nJs = require(i18nPath);
                            break;
                        case F_ELEMENTS.STATE:
                            if(!statesJs) statesJs = [];
                            var type = value.attribs.type || 'string';
                            statesJs.push({name: value.attribs.name, type: type, default: Xml2TsUtils.getTypedValue(value.attribs.default || '', type) });
                    }
                }
            });



            rootDom = Xml2TsUtils.recreateJsNode(rootJs, '0');
            rootDom.className = path.basename(fileName).replace(path.extname(fileName), '');
            var paths = this.srcIn.split('/'); //@todo check winpaths
            rootDom.moduleName = paths[paths.length - 1];
            rootDom.enableStates = [].concat(rootDom.enableStates, statesJs);


            if (i18nJs) rootDom.i18n = i18nJs;
            var tsClassPath:string = path.normalize(t.srcOut + '/' + rootDom.className + '.ts');
            var jsClassPath:string = path.normalize(t.srcOut + '/' + rootDom.className + '.js');

            async.series(
                [
                    function loadStylus(cb) {
                        if (!styleJs) {
                            cb(null, null);
                            return;
                        }
                        var stylusSrc = path.normalize(t.srcIn + '/' + styleJs.attribs.src);
                        var stylusSrc = fs.readFileSync(stylusSrc, 'utf8');

                        stylus(stylusSrc, {compress: true})
                            .render(function (err, css) {
                                if (err) throw err;
                                rootDom.css = {content: css, enabled: false};
                                cb(err, css);
                            });
                    },
                    function createTsClass(cb) {
                        dust.render('object.ts.dust', rootDom,
                            function dustCompileHandler(e, result) {
                                var reformattedContent = beautify.js_beautify(result, {"max_preserve_newlines": 1});
                                fs.writeFile(tsClassPath, reformattedContent, function tsSaveHandler(e, result) {
                                    if (!e) cb();
                                    else throw new Error('Cant write content to ' + tsClassPath);
                                });
                            });
                    }

                ],
                function compileResultHandler(err, result) {
                    if (!err) tsClasses.push(tsClassPath);
                    next();
                });

        }

    }

    class Xml2TsUtils {
        //public static MATCH_REGEXP:RegExp = /\{([\@A-Za-z\, \|0-9\.]+)\}/g;
        public static DATA_MATCH_REGEXP:RegExp = /\{([\(\)\\,\.\|'"@A-Za-z \+\-\/\*0-9]+)\}/g;
        //public static BRACKETS_MATCH:RegExp = /\([^()]+\)/gi;
        public static VARS_MATCH:RegExp = /([A-Za-z0-9_\-'\.]+)/gi;
        public static JS_VARS_MATCH:RegExp = /(^[A-Za-z0-9_\-\.]+$)/gi;

        //public static PROPERTY_DATA_MATCH:RegExp = /^\{[A-Za-z0-9\.]+\}$/;


        public static jsonReplacer(key:string, value:any):any {
            if(!_.isString(value)) return value;

            switch (key) {
                case KEYS.RAW:
                    return undefined;
                case KEYS.STYLE:
                    return Xml2TsUtils.getDynamicValues(key, value, ';');
                case KEYS.DATA:
                    return Xml2TsUtils.parseMultidynamicContent(value);
                case KEYS.STATES:
                    return Xml2TsUtils.parseDynamicContent(value);

                default:
                {
                    if (key in EVENT_KEYS) return value;// {event: key.replace('on', null), value: value};
                    else  {
                        return (_.isString(value) && ALLOWED_KEYS.indexOf(key) > -1 ) ? Xml2TsUtils.getDynamicValues(key, value) : value
                    }
                }
            }
        }


        public static parseMultidynamicContent(value:string):any {
            var matches = value.match(Xml2TsUtils.DATA_MATCH_REGEXP);
            if(!(matches && matches.length)) return value;

            var expressions:fmvc.IExpression[] = _.map(matches, (v)=>this.parseDynamicContent(v.substring(1,v.length-1)), this);
            var expressionVars = [];
            var result = _.reduce(matches, function(r, v, i) { var e = '$' + i; expressionVars.push(e); return r.replace(v, '{' + e + '}'); }, value, this);
            return {content: value, result:result, vars: expressionVars, expressions: expressions};
        }

        public static parseDynamicContent(value:string) {
            // {a} // property
            // {a|filterOne|filterTwo} // property
            // {a,b,c} // selector if a or b or c
            // {(a||b||c)} // expression
            // {(a||b?'one':'two')} // expression
            // {(a||b) as V, c as D, (a||b||c) as E|i18n.t|s|d} // expression

            var result:fmvc.IExpression = {
                content: value,
                vars: [], // переменные которые участвуют
                values: [], // упорядоченные значения до получения любого истинного значения {a,b,c}
                args: {}, // аргументы для i18n
                filters: [], // фильтры
                expressions: [] // выражения для расчета
            };

            var expressionMatches = Xml2TsUtils.getExpressionFromString(value);//value.match(Xml2TsUtils.BRACKETS_MATCH);

            if (expressionMatches && expressionMatches.length) _.each(expressionMatches,
                function(expression:string, index:number) {
                    value = value.replace(expression, '$' + index);
                    var variables = _.uniq(_.filter(expression.match(Xml2TsUtils.VARS_MATCH), function (v) { return  v.indexOf('\'') === -1 && v.match(/^[A-Za-z]+/gi); }));
                    //console.log('--- vars : ' , variables);
                    if (!_.isEmpty(variables)) variables = variables.sort((a:string,b:string)=>a.length>b.length?-1:1);
                    result.vars = result.vars.concat(variables);
                    var reducedExpression = _.reduce(variables, function(memo, v) {
                        var requestVariable = ((v.indexOf('.')>-1 && v.indexOf('state.') === -1)?('this.' + v):('this.getState("' + v.replace('state.', '') + '")'));
                        return memo.replace(new RegExp(v, 'g'),  requestVariable);
                    }, expression, this);
                    result.expressions.push(reducedExpression);
                });

            var valueSpitByFilter = value.split('|');
            value = _.first(valueSpitByFilter);

            result.filters = _.rest(valueSpitByFilter);

            var args = Xml2TsUtils.parseArguments(value);

            if(_.isObject(args)) {
                result.args = args;
                result.vars = result.vars.concat(_.filter(_.values(args), (v)=>v.indexOf('$')===-1));
                result.values = [];
            } else {
                result.vars = result.vars.concat(value.split(','));
                result.values = result.values.concat(value.split(','));
            }

            // remove empty keys
            _.each(_.keys(result), (key)=>(_.isEmpty(result[key])?delete result[key]:null) );
            //console.dir(result);
            return result;
        }

        public static parseArguments(value:string):string|string[]|Object {
            if(value.indexOf(',') === -1) return Xml2TsUtils.parseArgument(value);

            var result = {};
            _.each(value.split(','), function(argument, index) {
                var parsedArgs = Xml2TsUtils.parseArgument(argument);
                if(_.isObject(parsedArgs)) result = _.extend(result, parsedArgs);
            });
            return _.isEmpty(result)?null:result;
        }

        public static parseArgument(value:string) {
            if(value.indexOf(' as ') === -1) return value.trim();
            else {
                var result = value.split(' as ');
                var object = {};
                object[result[1].trim()] = result[0].trim();
                return object;
            }
        }

        public static getDynamicValues(key:string, value:any, delimiter?:string) {
            if (!_.isString(value)) return value;


            var values:any[] = delimiter !== null ? (value.split(delimiter ? delimiter : ' ')) : [value];
            var dynamicValues:{[property:string]:string} = null;
            var staticValues:string[] = null;
            var boundValues:string[] = null;

            _.each(values, function (v) {
                var matches = v.match(Xml2TsUtils.DATA_MATCH_REGEXP);

                _.each(matches, function(match, index) {
                    var matchValue = match.replace(/[\{\}]/g, '');
                    var filterResult = null;
                    if(matchValue.indexOf('@') > -1) {
                        var cleanMatchValue:string = matchValue.replace('@', '');
                        var cleanResultValue:string = '{' + cleanMatchValue + '}';

                        if (!dynamicValues) dynamicValues = {};
                        if (!dynamicValues[cleanMatchValue]) dynamicValues[cleanMatchValue] = [cleanResultValue];
                        else dynamicValues[cleanMatchValue].push(cleanResultValue);

                        if (!boundValues) boundValues = {};
                        if (!boundValues[cleanMatchValue]) boundValues[cleanMatchValue] = cleanResultValue;
                    }
                    else if(matchValue.indexOf('|') > -1) {
                        var filters = matchValue.split('|');
                        var data = filters.splice(0,1)[0];
                        filterResult = {args: {}, filters: [], source: v.replace(matches[0], '{replace}') };

                        _.each(filters, function (v,k) {
                            var filter = v.indexOf('.')>-1?v.split('.'):v;
                            filterResult.filters.push(filter);
                        });

                        var dataFields = data.split(',');
                        _.each(dataFields, function(dataFieldContent) {
                            var content = dataFieldContent.split(' as ');
                            var dataPropName:string = content[0].trim();
                            var dataPropKey:string = content[1]?content[1].trim():'VALUE';
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
                return {static: staticValues, dynamic: dynamicValues, bounds: boundValues };
            } else {
                return value;
            }
        }

        public static getStaticValueOfDynamicObject(value:any, delimiter:string):string {
            delimiter = delimiter?delimiter:' ';
            return _.isObject(value) && value.static ? value.static.join(delimiter) : _.isString(value) ? value : null;
        }

        public static extendDynamicSummary(dynamic:fmvc.IDynamicSummary, dynamicName:string, domName:string, elementPath:string, values:string[]) {
            if (!dynamic[dynamicName]) dynamic[dynamicName] = {};
            if (!dynamic[dynamicName][domName]) dynamic[dynamicName][domName] = {};
            if (!dynamic[dynamicName][domName][elementPath]) dynamic[dynamicName][domName][elementPath] = (values.length === 1) ? values[0] : values;
        }

        public static recreateJsNode(data:any, path:string, rootObject?:fmvc.IRootDomObject):any {
            var a:any = data.attribs;
            var object:fmvc.IDomObject = {path: path, type: data.type, data: data.data, attribs: {}, staticAttributes: {}, children: [], links: [], handlers: {}, bounds: {}};
            if (!rootObject) {
                rootObject = object;
                rootObject.dynamicSummary = {};
            }

            if (object.type === 'tag') object.tagName = data.name;

            // skip empty text node
            if(object.type === 'text'  && _.isString(object.data))  {
                var empty = (object.data.trim().replace(/[\n\t ]./gi, ''));
                if(_.isEmpty(empty)) { console.log('Empty ', empty, path); return null; }
                else object.data = object.data.trim().replace(/[\n\t]./gi, '');
            }

            if (a) {
                if (a.link) {
                    rootObject.links.push(Xml2TsUtils.getNameValue(a.link, path));
                    object.link = a.link;
                }
                if (a.enableStates) rootObject.enableStates = Xml2TsUtils.getValueArrayFromString(a.enableStates, ',');
                if (a.extend) object.extend = a.extend;
                if (a.states) object.states = a.states;

            }

            // Проверяем аттрибуты объекта для дальнейшего прокидывания в объекты
            var skipAttribs = ['link', 'enableStates', 'extend', 'states', 'class', 'style'];
            _.each(a, function(v,k) {
                if(!_.has(skipAttribs, k)) object.attribs[k] = v;
            });

            // handlers, create static attributes
            // create dynamic array
            var commonDatas = _.isObject(data.data)?_.extend({}, a, {data: data.data}):a;
            _.each(commonDatas, function (value:any, key:any) {
                Xml2TsUtils.writeSummaryForNode(object, rootObject, key, path, value);
            });

            _.forEach(data.children, function (node, index) {
                var childPath:string = path + ',' + index;
                var result = Xml2TsUtils.recreateJsNode(node, childPath, rootObject);
                if(result) object.children.push(result);
           });

            if (_.keys(object.staticAttributes).length === 0) delete object.staticAttributes;
            if (object.children.length === 0) delete object.children;
            if (object.links.length === 0) delete object.links;
            if (_.keys(object.handlers).length === 0) delete  object.handlers;
            if (_.keys(object.bounds).length === 0) delete  object.bounds;
            return object;
        }

        public static writeSummaryForNode(object:IDomObject, rootObject:IRootDomObject, key:string, path:string, value:any) {
            if(key === 'states') console.log('Check summary for ', key, value);
            if (_.values(EVENT_KEYS).indexOf(key) > -1) {
                object.handlers[key.replace('on','')] = value;
            }

            if (!(DOM_AND_STATES_KEYS.indexOf(key) > -1 || key.indexOf('data') > -1)) return;

            var result = null;

            switch (key) {
                case KEYS.CLASS:
                    result = Xml2TsUtils.getStaticValueOfDynamicObject(value, ' ');
                    break;
                case KEYS.STYLE:
                    result = Xml2TsUtils.getStaticValueOfDynamicObject(value, ';');
                    break;
            }
            if (result) object.staticAttributes[key] = result;

            //create dynamic maps summary for root
            if (_.isObject(value)) {
                var expressionVars = Xml2TsUtils.getExpressionVars(value);
                if(key === 'states') console.log('Full vars list --> ' , path, key, value.vars, '===', expressionVars);

                _.each(expressionVars, (varName:string)=>Xml2TsUtils.extendDynamicSummary(rootObject.dynamicSummary, varName, key, path, value));
                _.each(value.dynamic, (dynamicValueArray:any, dynamicName)=>Xml2TsUtils.extendDynamicSummary(rootObject.dynamicSummary, dynamicName, key, path, dynamicValueArray));
                _.each(value.bounds, function (boundValue, boundObject) {
                    object.bounds[key] = {};
                    object.bounds[key][boundObject] = boundValue;
                    object.handlers['change'] = 'set,' + boundObject + ',' + boundValue;
                });
            }

        }

        public static getExpressionVars(ex:IMultiExpression) {
            var r = [].concat(ex.vars?ex.vars:[]);
            _.each(ex.expressions, function(childEx:IExpression|string) { if(_.isObject(childEx)) r = [].concat(r, Xml2TsUtils.getExpressionVars(childEx)); });
            return _.uniq(_.filter(r, (v)=>(v.match(Xml2TsUtils.JS_VARS_MATCH))));
        }

        public static getNameValue(name:string, value:any):fmvc.INameValue {
            return {name: name, value: value};
        }

        private static getValueArrayFromString(enableStates:string, s:string):(string|fmvc.INameValue)[] {
            var r = enableStates.split(s);
            return _.map(r, function(v,k) { return (v.indexOf('=')>-1)?Xml2TsUtils.getNameValueObjectFromString(v, '='):v; });
        }

        private static getNameValueObjectFromString(v:string, s:String):fmvc.INameValue {
            var r = v.split(s);
            return { name : r[0] , value : r[1] };
        }

        public static getTypedValue(s:any, type:string):any {
            switch (type) {
                case fmvc.Type.String:
                    return String(s);
                case fmvc.Type.Int:
                    return parseInt(s,10);
                case fmvc.Type.Float:
                    return parseFloat(s);
                case fmvc.Type.Boolean:
                    return !!(s === true || s === 'true');
            }
        }


        public static getExpressionFromString(value:string):string[] {
            var brackets = [];
            var open = 0;
            var r = [];

            _.each(value, function(v, i) {
                if(v === '(') {
                    if(open === 0) brackets.push([i]);
                    open++;
                } else if (v === ')') {
                    if(open === 1) brackets[brackets.length-1].push(i);
                    open--;
                }
            });

            _.each(brackets, function(v) { r.push(value.substring(v[0],v[1]+1)); })
            return r.length?r:null;
        }
    }
}

function resolvePath(value:string) {
    var r:string = path.normalize(process.cwd() + '/' + value);
    return value;
}


var sourceOut:any =
    _.isArray(argv.p)?
        _.map(argv.p, (v:string,k:number)=>({src: resolvePath(v), out: resolvePath(_.isArray(argv.o)?argv.o[k]:argv.o||v)}) ):
        {src:resolvePath(argv.p), out: resolvePath(argv.o || argv.p)};

_.each(sourceOut, (v)=>new fmvc.Xml2Ts(v.src,v.out));
