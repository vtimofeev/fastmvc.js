///<reference path="./d.ts" />
declare var Tautologistics:any

module ft {
    var htmlparser:any = Tautologistics.NodeHtmlParser;
    var expressionManager:IExpressionManager;

    export class TemplateParser implements ITemplateParser {
        private _htmlparserHandler:any;
        private _htmlParser:any;
        private _skipProperties:string[] = ['raw'];
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

        parseHtml(html:string):any {
            this.reset();
            this._htmlparserHandler.dom = null;
            this._htmlParser.parseComplete(html);
            return this._htmlparserHandler.dom;
        }

        convertToTemplate(result:IHtmlObject[]):ITemplate {
            var result:ITemplate = new Template();

            _.each(result, function(obj:IHtmlObject, index:number) {
                if(obj.name === 'div') {
                    result.extend = obj.attribs.classExtend;
                    result.name = obj.attribs.className;
                    result.domTree = obj;

                    //_.each()

                    result.dynamicTree;
                }
            });
        }

        parseHtmlObject(o:IHtmlObject, r:any) {
            var emptyDef:string[] = ['attribs'];
            var params:string[] = ['states', 'enableStates', 'extendName', 'className'];

            var def = <IDomDef> { attribs: {}, params: {}};
            var r = <ITemplate> r || {domTree:def, dynamicTree: {}, expressionMap: {} };

            _.each(o.attribs, function(value:any, key:string) {
               value = value?value.trim():value;
               if(!value) return;
               var context = params.indexOf(key)>=0?def.params:def.attribs;
               context[key] = this.parseExpressionAttrib(value, key, map);
            }, this);
        }

        parseExpressionAttrib(value:any, key:string, map:any) {
            var propAttribs:string = {
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
            var prop:any;
            if(prop = propAttribs[key]) {
                return _.reduce(value.split(prop.delimiter), (r, value, index)=>(r[prop.getName(value)]=this.parseExpressionValue(prop.getValue(value)), r), {}, this);
            } else {
                return this.parseExpressionValue(value, map);
            }
        }

        parseExpressionValue(value:any, map:any) {
            var expression = expressionManager.parse(value);
            var expressionNameObj:IExpressionName = expression?expressionManager.getExpressionName(expression):null;
            var result = expression?expressionNameObj:value
            if(expression) map[expression.name] = result;
            return result;
        }



        parserHandler(error:any, data:any) {
            console.log('parserHandler: ', error, data);
            this.lastError = error;
            this.lastData = data;
        }
    }

}
