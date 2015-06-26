///<reference path='../fmvc/d.ts' />

///<reference path='../d.ts/node/node.d.ts'/>
///<reference path='../d.ts/async/async.d.ts'/>
//<reference path='../d.ts/lodash/lodash.d.ts'/>
///<reference path='../d.ts/dustjs-linkedin/dustjs-linkedin.d.ts'/>


interface IDynamic {
    /*
     {'data': {
     'data.value' : 'text and {data.type} + {data.value}' ,
     'data.type' : 'text and {data.type} + {data.value}' } },
     {'class': { 'data.type' : ['enabled-{data.type}'] ] }
     */
    dynamic:{[propery:string]:string[]};
    static?:string[]; // [ 'backgroundColor:red' ];
    value:string;
}

/* {
 selected: {
 class: {
 '0.1': ['total-{selected}'],
 '0.2': 'close-{selected}'
 }
 },
 data.firstname: { 0.1: { data: '{data.firstname} is '}};
 */
interface IDynamicSummary {
    [propertyName:string]:{[substance/* class, data, style any */:string]:any};
}

interface INameValue {
    name:string;
    value:any;
}

interface ITypedNameValue extends INameValue {
    type:string;
}

interface IRootDomObject extends IDomObject {
    className:string;
    css?:fmvc.IStyleDefinition;
    i18n?:any;
    links?:{[name:string]:string/* path */}[];
    dynamicSummary?:fmvc.IDynamicSummary;
    customStates:fmvc.ITypedNameValue[];
}

interface IDomObject {
    path:string;
    type:string; // @tag/string/other
    tagName?:string; // tag name: div/br
    extend?:string;

    isVirtual:boolean;
    isComponent:boolean;

    createDom:Function;

    component?:fmvc.View;
    componentConstructor?:Function;

    element?:HTMLElement;
    virtualElement?:HTMLElement;

    enableStates?:string[];
    states?:string[];
    bounds?:any;

    staticAttributes?:fmvc.INameValue[];

    links?:any;
    handlers?:{[event:string]:string};
    children?:fmvc.IDomObject[];
}




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

require('dustjs-helpers');
dust.config.whitespace = true;

module xml2ns {
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
        ONACTION: 'onaction'
    };

    const DOM_KEYS:string[] = [KEYS.VALUE, KEYS.HREF, KEYS.STYLE, KEYS.CLASS, KEYS.CHECKED, KEYS.DISABLED, KEYS.SELECTED, KEYS.FOCUSED];
    const ALLOWED_KEYS:string[] = [].concat(KEYS, EVENT_KEYS);

    interface IDynamic {
        /*
         {'data': {
         'data.value' : 'text and {data.type} + {data.value}' ,
         'data.type' : 'text and {data.type} + {data.value}' } },
         {'class': { 'data.type' : ['enabled-{data.type}'] ] }
         */
        dynamic:{[propery:string]:string[]};
        static?:string[]; // [ 'backgroundColor:red' ];
        value:string;
    }

    /* {
     selected: {
     class: {
     '0.1': ['total-{selected}'],
     '0.2': 'close-{selected}'
     }
     },
     data.firstname: { 0.1: { data: '{data.firstname} is '}};
     */
    interface IDynamicSummary {
        [propertyName:string]:{[substance/* class, data, style any */:string]:any};
    }

    interface INameValue {
        name:string;
        value:any;
    }

    interface IRootDomObject extends IDomObject {
        className:string;
        css?:string;
        links?:{[name:string]:string/* path */}[];
        dynamicSummary?:IDynamicSummary;
    }

    interface IDomObject {
        path:string;
        type:string; // @tag/string/other
        tagName?:string; // tag name: div/br
        extend?:string;

        isVirtual:boolean;
        isComponent:boolean;

        createDom:Function;

        component?:fmvc.View;
        componentConstructor?:Function;

        element?:HTMLElement;
        virtualElement?:HTMLElement;

        enableStates?:string[];
        states?:string[];

        staticAttributes?:INameValue[];

        handlers?:{[event:string]:string};
        children?:IDomObject[];
    }

    export class Xml2Ts {
        constructor(public srcIn:string,  public srcOut:string) {
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
                        console.log('Compile ', filename, base);
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
            dir.readFiles(__dirname + this.srcIn,
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
            console.log('*** complete ***');
        }

        parse(fileName:string, content:string, next:Function) {
            var t = this;
            var handler:any = new htmlparser.DefaultHandler(function (error, dom) {
                if (error)
                    console.log('error parse html ' + fileName);
                else {
                    console.log('success parse html ' + fileName);
                }
            }, {enforceEmptyTags: false, verbose: false});

            var parser = new htmlparser.Parser(handler, {strict: false});
            parser.parseComplete(content);

            var resultHtmlJs:any = JSON.parse(JSON.stringify(handler.dom, replacer, '\t'));
            var rootJs:any = null;
            var rootDom:IRootDomObject = null;
            var styleJs:any = null;

            _.each(resultHtmlJs, function (value:string, index:number) {
                if (value.type === 'tag' && value.name.indexOf('f:') === -1) {
                    rootJs = value;
                }
                else if (value.name === 'f:style') {
                    styleJs = value;
                }
            });

            rootDom = Xml2TsUtils.recreateJsNode(rootJs, 0);
            rootDom.className = path.basename(fileName);

            async.series(
                [
                    function loadStylus(cb) {
                        if (!styleJs) cb(null, null);
                        var stylusSrc = fs.readFileSync(path.normalize(styleJs.attribs.src), 'utf8');

                        stylus(stylusSrc, {compress: true})
                            .render(function (err, css) {
                                if (err) throw err;
                                rootDom.css = css;
                                console.log('Css of stylus : ' + css);
                                cb(err, css);
                            });
                    }
                ],
                function compileResultHandler(err, result) {
                    if (err) return 'Cant render dust cause errors for ' + rootDom.className;
                    dust.render('object.ts.dust', rootDom,
                        function (e, result) {
                            var reformattedContent = beautify.js_beautify(result, {"max_preserve_newlines": 1});
                            var filePath:string = __dirname + t.srcOut + '/' + rootDom.className + '.ts';
                            fs.writeFile(path.resolve(__dirname + t.srcOut + '/' + rootDom.className + '.ts', reformattedContent), function (e, result) {
                                if (!e) next();
                                else throw new Error('Cant write content to ' + filePath);
                            });
                        });
                });

        }

    }

    class Xml2TsUtils {
        public static MATCH_REGEXP:RegExp = /\{([A-Za-z0-9\.]+)\}/;

        public static jsonReplacer(key:string, value:any):any {
            //console.log(key, _.isString(value));
            switch (key) {
                case KEYS.RAW:
                    return undefined;
                case KEYS.STYLE:
                    return Xml2TsUtils.getDynamicValues(key, value, ';');
                case KEYS.DATA:
                    Xml2TsUtils.getDynamicValues(key, value, null);
                default:
                {
                    if (key in EVENT_KEYS)return {event: key.replace('on', null), value: value};
                    else return (_.isString(value) && ALLOWED_KEYS.indexOf(key) > -1 ) ? Xml2TsUtils.getDynamicValues(key, value) : value
                }
            }
        }

        public static getDynamicValues(key:string, value:any, delimiter?:string) {
            if (!_.isString(value)) return value;
            var values:any[] = delimiter !== null ? (value.split(delimiter ? delimiter : ' ')) : [value];
            var dynamicValues:{[property:string]:string} = null;
            var staticValues:string[] = null;

            _.each(values, function (v) {
                var matches = v.match(Xml2TsUtils.MATCH_REGEXP);
                if (matches && matches.length === 2) {
                    var matchValue = matches[1];
                    if (!dynamicValues) dynamicValues = {};

                    if (!dynamicValues[matchValue]) dynamicValues[matchValue] = [v];
                    else dynamicValues[matchValue].push(v);
                } else {
                    if (!staticValues) staticValues = [];
                    staticValues.push(v);
                }
            });

            if (dynamicValues) return {static: staticValues, dynamic: dynamicValues, value: value};
            return value;
        }

        public static getStaticValueOfDynamicObject(value:any, delimiter:string):string {
            return _.isObject(value) && value.static ? value.static.join(' ') : _.isString(value) ? value : null;
        }

        public static extendDynamicSummary(dynamic:IDynamicSummary, dynamicPropertyName:string, domPropertyName:string, elementPath:string, values:string[]) {
            if (!dynamic[dynamicPropertyName]) dynamic[dynamicPropertyName] = {};
            if (!dynamic[dynamicPropertyName][domPropertyName]) dynamic[domPropertyName][domPropertyName] = {};
            if (!dynamic[dynamicPropertyName][domPropertyName][elementPath]) dynamic[domPropertyName][domPropertyName][elementPath] = (values.length === 1) ? values[0] : values;
        }

        public static recreateJsNode(data:any, path:string, rootObject:IRootDomObject):IDomObject {
            var a:any = data.attribs;
            var object:IDomObject = {path: path, type: data.type, staticAttributes: [], children: []};
            if (!rootObject) {
                rootObject = object;
                rootObject.dynamicSummary = {};
            }

            if (object.type === 'tag') object.tagName = data.name;

            if (a) {
                if (a.link) rootObject.links.push(Xml2TsUtils.getNameValue(a.link, path));
                if (a.extend) object.extend = a.extend;
                if (a.enableStates) object.enableStates = a.enableStates.split(',');
            }

            // create static attributes
            _.each(a, function (value:string, key:any) {
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
                    //console.log('Dynamic: ', value.dynamic);
                    _.each(value.dynamic, function (dynamicValueArray, dynamicName) {
                        Xml2TsUtils.extendDynamicSummary(rootObject.dynamicSummary, dynamicName, key, path, dynamicValueArray);
                    });
                }
                if (result) object.staticAttributes.push(Xml2TsUtils.getNameValue(key, result));
            });

            if (_.isObject(data.data)) {
                var key:string = 'data';
                _.each(data.data.dynamic, function (dynamicValueArray, dynamicName) {
                    Xml2TsUtils.extendDynamicSummary(rootObject.dynamicSummary, dynamicName, key, path, dynamicValueArray); //create dynamic maps summary for root
                });
            }

            _.forEach(data.children, function (node, index) {
                var childPath:string = path + ',' + index;
                var result = Xml2TsUtils.recreateJsNode(node, childPath, rootObject);
                object.children.push(result);
            });

            if (object.staticAttributes.length === 0) delete object.staticAttributes;
            if (object.children.length === 0) delete object.children;



            return object;
        }


        public static getNameValue(name:string, value:any):INameValue {
            return {name: name, value: value};
        }
    }
}


new xml2ns.Xml2Ts('../ui' , '../ui');