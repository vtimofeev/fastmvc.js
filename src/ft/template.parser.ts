///<reference path="./d.ts" />
declare var Tautologistics:any;

module ft {
    var htmlparser:any = Tautologistics.NodeHtmlParser;
    var expressionManager:IExpressionManager;
    var expression = new Expression();

    export class TemplateParser implements ITemplateParser {
        private _htmlparserHandler:any;
        private _htmlParser:any;
        private _skipProperties:string[] = ['raw'];
        private _propAttribs:{[name:string]:any} = {
            style: {
                delimiter: ';',
                getName: (v)=>(v.split(':')[0]).trim(),
                getValue: (v)=>(v.split(':')[1]).trim()
            },
            class: {
                delimiter: ' ',
                getName: _.identity,
                getValue: _.identity
            }
        };

        lastError:any;
        lastData:any;

        constructor() {
            _.bindAll(this, 'parserHandler');
            this._htmlparserHandler = new htmlparser.DefaultHandler(this.parserHandler);
            this._htmlParser = new htmlparser.Parser(this._htmlparserHandler/*, test.options.parser*/);
        }

        private reset() {
            this._htmlParser.reset();
            this.lastData = null;
            this.lastError = null;
        }

        parseHtml(html:string):IHtmlObject[] {
            this.reset();
            html = html.trim().replace(/\n/gi, '');
            this._htmlparserHandler.dom = null;
            this._htmlParser.parseComplete(html);
            return <IHtmlObject[]> this._htmlparserHandler.dom;
        }

        htmlObjectToTemplate(objs:IHtmlObject[]):ITemplate {
            var result:ITemplate = {};// new Template();

            _.each(objs, function(obj:IHtmlObject, index:number) {
                if(obj.name.indexOf('f.') < 0) {
                    result.expressionMap = <IExpressionMap> {};
                    result.extend = obj.attribs.extend;
                    result.name = obj.name;
                    // side effect, creates expression map to result
                    result.domTree = this.htmlObjectToDomTree(obj, result, String(0));
                    result.dynamicTree = this.getDynamicTreeFromExpressionMap(result.expressionMap);

                }
            }, this);

            return result;
        }

        htmlObjectToDomTree(o:IHtmlObject, r:ITemplate, path:string):IDomDef {
            var params:string[] = ['states', 'enableStates'];
            var skipped:string[] = ['extend'];

            var def = <IDomDef> {attribs: {}, params: {}};
            def.type = o.type;
            def.name = o.name;
            def.path = path;
            if(o.type != 'tag') def.data = this.parseExpressionAttrib(o.data, 'data', r.expressionMap, path, 'data'); // set data or data expression

            if(o.attribs && o.attribs.extend) def.extend = o.attribs.extend;

            _.each(o.attribs, function(value:any, key:string) {
               if(skipped.indexOf(key) >= 0 || !(value = value?value.trim():value)) return;
               var group:string = (params.indexOf(key)>-1)?'params':'attribs';
               def[group][key] = this.parseExpressionAttrib(value, key, r.expressionMap, path, group);
            }, this);

            def.children = _.map(o.children, (v:IHtmlObject, index:number)=>(this.htmlObjectToDomTree(v,r, def.path +','+index)), this);
            _.each(_.keys(def), (key)=>(_.isEmpty(def[key]) ? delete def[key] : null));
            return def;
        }

        // Проверяем данное выражение конвертируется в объект класса или стиля (набор свойств: выражений)
        parseExpressionAttrib(value:any, key:string, map:IExpressionMap, path:string, group:string):IExpression|{[propName:string]:IExpression} {
            if(this._propAttribs[key]) {
                var prop:any = this._propAttribs[key];
                return _.reduce(
                    value.split(prop.delimiter),
                    (r, value, index)=>(r[prop.getName(value)]=this.parseExpressionValue(prop.getValue(value), map, path, group, key, prop.getName(value)), r ),
                    {},
                    this);
            } else {
                return this.parseExpressionValue(value, map, path, group, key);
            }
        }

        getDynamicTreeFromExpressionMap(map:IExpressionMap) {
            var result = {};
            _.each(map, function(ex:IExpression) {
                var varParts:string[];
                _.each(ex.vars,
                    (v:string)=>(
                        varParts = v.split('.')
                            ,result[varParts[0]] = result[varParts[0]] || {}
                            ,result[varParts[0]][v] = result[varParts[0]][v] || []
                            ,result[varParts[0]][v].push(ex.name)));
            }, this);
            return result;
        }

        getExpressionHost(path:string, group:string /* attribs, params, data */, key:string /* class, href */, keyProperty:string /* class name */ = null ) {
            return {path: path, group: group, key: key, keyProperty: keyProperty};
        }

        // Парсим строку с выражением
        parseExpressionValue(value:any, map:any, path, group, key, keyProperty) {
            var ex = expression.strToExpression(value);

            var expressionNameObj:IExpressionName = ex?expression.getExpressionNameObject(ex):null;
            var result = expressionNameObj || value;
            if(ex) {
                // Добавляем хост в выражение
                var hosts = ex.hosts || [];
                hosts.push(this.getExpressionHost(path, group, key, keyProperty));
                ex.hosts = hosts;

                // Расширяем карту
                map[ex.name] = ex;
            }
            return result;
        }



        parserHandler(error:any, data:any) {
            this.lastError = error;
            this.lastData = data;
        }
    }

}
