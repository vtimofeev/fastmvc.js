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

    const DOM_KEYS:string[] = [KEYS.VALUE, KEYS.HREF, KEYS.STYLE, KEYS.CLASS, KEYS.CHECKED, KEYS.DISABLED, KEYS.SELECTED, KEYS.FOCUSED];
    const ALLOWED_KEYS:string[] = [].concat(_.values(KEYS), _.values(EVENT_KEYS) );

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
                        //console.log('Compile ', filename, base);
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
            var loadSrc = path.normalize(__dirname + '/' + this.srcIn);
            //console.log('loadSource from ' + loadSrc);
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

            var jsClassPath:string = path.normalize(__dirname + '/' + this.srcOut + '/compiled.js');
            tsc.compile(tsClasses, '-m commonjs -t ES5 --out ' + jsClassPath);
            console.log('Compiled ts to %s, for %d ms', jsClassPath , (Date.now() - start));
            console.log('*** complete all ***');
        }

        parse(fileName:string, content:string, next:Function) {
            var t = this;
            var handler:any = new htmlparser.DefaultHandler(function (error, dom) {
                if (error) {
                    //console.log('error parse html ' + fileName);
                }
                else {
                    //console.log('success parse html ' + fileName);
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
                            var i18nPath:string = path.normalize(__dirname + '/' + t.srcIn + '/' + value.attribs.src);
                            i18nJs = require(i18nPath);
                            break;
                        case F_ELEMENTS.STATE:
                            if(!statesJs) statesJs = [];
                            var type = value.attribs.type || 'boolean';
                            statesJs.push({name: value.attribs.name, type: type, default: Xml2TsUtils.getTypedValue(value.attribs.default || '', type) });
                    }
                }
            });



            rootDom = Xml2TsUtils.recreateJsNode(rootJs, '0');
            rootDom.className = path.basename(fileName).replace(path.extname(fileName), '');
            rootDom.enableStates = [].concat(rootDom.enableStates, statesJs);


            if (i18nJs) rootDom.i18n = i18nJs;
            var tsClassPath:string = path.normalize(__dirname + '/' + t.srcOut + '/' + rootDom.className + '.ts');
            var jsClassPath:string = path.normalize(__dirname + '/' + t.srcOut + '/' + rootDom.className + '.js');

            async.series(
                [
                    function loadStylus(cb) {
                        //console.log('styleJs' , styleJs);
                        if (!styleJs) {
                            cb(null, null);
                            return;
                        }
                        var stylusSrc = path.normalize(__dirname + '/' + t.srcIn + '/' + styleJs.attribs.src);
                        //console.log('Style source is ' + stylusSrc)
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
                                //console.log('Write file ' + tsClassPath);
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
        public static MATCH_REGEXP:RegExp = /\{([\@A-Za-z\, \|0-9\.]+)\}/g;

        public static jsonReplacer(key:string, value:any):any {
            ////console.log(key, _.isString(value));
            if(!_.isString(value)) return value;

            switch (key) {
                case KEYS.RAW:
                    return undefined;
                case KEYS.STYLE:
                    return Xml2TsUtils.getDynamicValues(key, value, ';');
                case KEYS.DATA:
                    return Xml2TsUtils.getDynamicValues(key, value, null);
                case KEYS.STATES:
                    return _.map(value.split(','), function(value) { return value.indexOf('=')>-1?value.split('='):value });
                default:
                {
                    if (key in EVENT_KEYS) return value;// {event: key.replace('on', null), value: value};
                    else  {
                        ////console.log('Check replacer dynamic ' , key , _.isString(value) , ALLOWED_KEYS.indexOf(key) );
                        return (_.isString(value) && ALLOWED_KEYS.indexOf(key) > -1 ) ? Xml2TsUtils.getDynamicValues(key, value) : value
                    }
                }
            }
        }

        public static getDynamicValues(key:string, value:any, delimiter?:string) {
            ////console.log('Check for ' , key, value);
            if (!_.isString(value)) return value;

            var values:any[] = delimiter !== null ? (value.split(delimiter ? delimiter : ' ')) : [value];
            var dynamicValues:{[property:string]:string} = null;
            var staticValues:string[] = null;
            var boundValues:string[] = null;

            _.each(values, function (v) {
                var matches = v.match(Xml2TsUtils.MATCH_REGEXP);

                _.each(matches, function(match, index) {
                    var matchValue = match.replace(/[\{\}]/g, '');
                    var filterResult = null;
                    ////console.log('Check dv of ' , matchValue);
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
                            var content = dataFieldContent.split('as');
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
                ////console.log('Return dynamic for ' , key, dynamicValues);
                return {static: staticValues, dynamic: dynamicValues, bounds: boundValues };
            } else {
                //console.log('Return static for ', key, value);
                return value;
            }
        }

        public static getStaticValueOfDynamicObject(value:any, delimiter:string):string {
            delimiter = delimiter?delimiter:' ';
            return _.isObject(value) && value.static ? value.static.join(delimiter) : _.isString(value) ? value : null;
        }

        public static extendDynamicSummary(dynamic:fmvc.IDynamicSummary, dynamicName:string, domName:string, elementPath:string, values:string[]) {
            //console.log('[ex2ds] ' , dynamicName, domName, elementPath, values);
            if (!dynamic[dynamicName]) dynamic[dynamicName] = {};
            if (!dynamic[dynamicName][domName]) dynamic[dynamicName][domName] = {};
            if (!dynamic[dynamicName][domName][elementPath]) dynamic[dynamicName][domName][elementPath] = (values.length === 1) ? values[0] : values;
        }

        public static recreateJsNode(data:any, path:string, rootObject?:fmvc.IRootDomObject):any {
            var a:any = data.attribs;
            var object:fmvc.IDomObject = {path: path, type: data.type, data: data.data, staticAttributes: {}, children: [], links: [], handlers: {}, bounds: {}};
            if (!rootObject) {
                rootObject = object;
                rootObject.dynamicSummary = {};
            }

            if (object.type === 'tag') object.tagName = data.name;

            // skip empty text node
            if(object.type === 'text'  && _.isString(object.data))  {
                var empty = (object.data.replace(/[\n\t ]./gi, ''));
                if(empty) { console.log('Empty ' + path); return null; }
            }

            if (a) {
                if (a.link) rootObject.links.push(Xml2TsUtils.getNameValue(a.link, path));
                if (a.enableStates) rootObject.enableStates = Xml2TsUtils.getValueArrayFromString(a.enableStates, ',');
                if (a.extend) object.extend = a.extend;
                if (a.states) object.states = a.states;
            }

            // handlers, create static attributes
            _.each(a, function (value:any, key:any) {
                //console.log('Check: ', key, value);
                if (_.values(EVENT_KEYS).indexOf(key) > -1) {
                    //console.log('--- Handler ' , key, value);
                    object.handlers[key.replace('on','')] = value;
                }

                if (DOM_KEYS.indexOf(key) < 0) return;
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
                    _.each(value.dynamic, function (dynamicValueArray:any, dynamicName) {
                        Xml2TsUtils.extendDynamicSummary(rootObject.dynamicSummary, dynamicName, key, path, dynamicValueArray);
                    });

                    _.each(value.bounds, function (boundValue, boundObject) {
                       object.bounds[key] = {};
                       object.bounds[key][boundObject] = boundValue;
                       object.handlers['change'] = 'set,' + boundObject + ',' + boundValue;
                    });
                }

                if (result) object.staticAttributes[key] = result;
            });

            if (_.isObject(data.data)) {
                var key:string = 'data';
                _.each(data.data.dynamic, function (dynamicValueArray:any, dynamicName) {
                    Xml2TsUtils.extendDynamicSummary(rootObject.dynamicSummary, dynamicName, key, path, dynamicValueArray); //create dynamic maps summary for root
                });
            }

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
                    return s;
                case fmvc.Type.Int:
                    return parseInt(s,10);
                case fmvc.Type.Float:
                    return parseFloat(s);
                case fmvc.Type.Boolean:
                    return !!(s === true || s === 'true');
            }
        }

    }
}

new fmvc.Xml2Ts('../ui' , '../ui');