///<reference path="./d.ts" />

namespace ft {
    var GetContext = {
        string: 'string',
        model: 'model',
        modelField: 'model.',
        data: 'data',
        dataField: 'data.',
        appField: 'app.',
        facadeField: 'facade.',
        stateField: 'state',
        openBracket: '(',
        thisDot: 'this.'
    };

    export class ExpressionName implements IExpressionName {

        public name:string;
        public context:any;

        constructor(name:string, context:any = null) {
            this.name = name;
            this.context = context;
        }
    }

    export class Expression {
        private counter:number = 0;
        private ExpressionMatchRe:RegExp = /\{[\(\)\\\.,\|\?:;'"!@A-Za-z_<>=\[\]& \+\-\/\*%0-9]+\}/g;
        private VariableMatchRe:RegExp = /([A-Za-z0-9_\-"'\.]+)/gi;
        private ExResult:string = '{$0}';
        private funcMap:{[id:string]:Function} = {};

        public strToExpression(value:string):IExpression {
            var r = this.parseExpressionMultiContent(value);
            return r;
        }
        
        public getExpressionNameObject(value:IExpression):IExpressionName {
            return new ExpressionName(value.name);
        }
        
        public execute(value:IExpression, context:TemplateView, classes?:boolean, current:TemplateView):any {
            return this.executeMultiExpression(value, context, classes, current);
        }

        //----------------------------------------------------------------------------------------------------------------------------------------
        // Execute
        //----------------------------------------------------------------------------------------------------------------------------------------

        private executeFilters(value:any/* primitive, object args of i18n */, filters:string[], context:TemplateView):any {
            if(!filters || !filters.length) return value;

            return _.reduce(filters,
                function(memo:any/* primitive/object args of i18n */, filter:string, index:number) {
                    return this.executePlainFilter(filter, memo, context);
                }, value, this);
        }

        private executePlainFilter(filter:string, value:any, context:TemplateView):string {
            if(filter.indexOf('i18n.') === 0) {
                return context.getFormattedMessage(filter.replace('i18n.', ''),value);
            }
            else {
                if (!this.funcMap[filter]) this.funcMap[filter] = context.getFilter(filter);

                try {
                    var fnc = this.funcMap[filter];
                    return fnc.call(context, value);
                } catch(e) {
                    return '{error[' + filter + ']}';
                }
            }
        }

        private executeMultiExpression(ex:IExpression, context:TemplateView, classes:boolean, current?:TemplateView):any {
            var isSimpleExpression:Boolean = (ex.expressions.length === 1);
            var contextValue;
            return isSimpleExpression?
                this.executeExpression(ex, context, classes, current):
                _.reduce(ex.expressions,
                    (memo:string, value:string|IExpression, index:number)=> {
                        contextValue = this.getParsedContextValue(value, context, classes);
                        if(classes && (!memo || !contextValue)) return '';

                        var result = memo ? memo.replace('{$' + index + '}', contextValue) : '{error:multiExpression}';
                        return result;
                    }, ex.result, this);
        }

        private getParsedContextValue(value:ExpressionValue, context:TemplateView, classes:boolean, , current?:TemplateView) {
            return this.parseContextValue(this.getContextValue(value, context, current), value, classes);

        }

        private parseContextValue(value:any, ex:IExpression|string, classes:boolean):any {
            if(classes) {
                    if(!!value) {
                        if(value === true) {
                            if (typeof ex === 'string') return ex.split('.')[1];
                            else throw 'Incorrect type at parseContextValue with classes true';
                        } else {
                            return value;
                        }
                    } else {
                        return null;
                    }
            }
            return value;
        }

        public replaceUndefinedToNull(v):any {
            return v === undefined?null:v;
        }

        public getContextValue(v:string|IExpression, context:TemplateView, current:TemplateView):any {
            //console.log('getContextValue', v, context);
            var r:any,
                rstr:string,
                safeVs:string,
                vs:string = typeof v === 'string'?v:null;

            if(vs) {
                r = context.getDynamicProperty(vs);

                if(r != undefined) return r;

                ft.counters.expressionCtx++;

                if(vs === GetContext.data || v === GetContext.model) {
                    r = context[vs];
                }
                else if(
                    vs.indexOf(GetContext.dataField) === 0 ||
                    vs.indexOf(GetContext.appField) === 0  ||
                    vs.indexOf(GetContext.facadeField) === 0 ||
                    vs.indexOf(GetContext.modelField) === 0) {

                    if(!this.funcMap[vs]) {
                        this.funcMap[vs] = new Function('var v=null; try {v=this.' + vs + ';} catch(e) { v=\'{' + vs.replace(/'/g, '\\\'') + '}\';} return v;');
                    }

                    r = this.funcMap[vs].call(context,current);
                }
                else if(vs.indexOf(GetContext.stateField) === 0) {
                    if(!this.funcMap[vs]) {
                        var state = vs.substring(6);
                        this.funcMap[vs] = new Function('return this.getState("' + state + '");');
                    }
                    r = this.funcMap[vs].call(context,current);
                }
                else if(vs.indexOf(GetContext.openBracket) === 0 || vs.indexOf(GetContext.thisDot) >= 0 ) {
                    if(!this.funcMap[vs]) {
                        safeVs = vs.replace(/'/g, '"');
                        this.funcMap[vs] = new Function('current', 'var v=null; try {v=' + vs + ';} catch(e) { v=\'{' + safeVs + '}\';} return v;');
                    }
                    r = this.funcMap[vs].call(context, current);
                }

                return this.replaceUndefinedToNull(r);
            }
            else if(_.isObject(v)) {
                ft.counters.expressionEx++;
                return this.executeExpression(<IExpression> v, context);
            }
            else {
                throw new Error('Not supported variable ' + v + ' in ' + context.name);
            }
        }

        private getContextArguments(ex:IExpression, context:TemplateView):any {
            return _.isString(ex.args)?this.getContextValue(ex.args,context):_.reduce(ex.args, (r:any,v:string,k:string)=>(r[k]=this.getContextValue(v,context),r),{},this);
        }

        private executeExpression(ex:IExpression, context:TemplateView, classes?:boolean, current?:TemplateView):any {
            ft.counters.expression++;
            var r:any = ex.args?this.getContextArguments(ex,context,current):this.getParsedContextValue(ex.expressions[0],context,classes,current);
            if(!r && classes) return '';// empty class expression
            if(ex.filters) r = this.executeFilters(r, ex.filters, context);
            if(ex.result && ex.result !== this.ExResult) r = ex.result.replace(this.ExResult, r);
            return r;
        }

        //----------------------------------------------------------------------------------------------------------------------------------------
        // Create expression path
        //----------------------------------------------------------------------------------------------------------------------------------------

        private getName() {
            return 'e-' + this.counter++;
        }

        public strToJsMatch(value:string):string {
            var m = value.match(this.ExpressionMatchRe);
            return m&&m[0]?(m[0]).substring(1,m[0].length-1):'this.internalHandler("' + value + '", e)';
        }

        private parseExpressionMultiContent(value:string):IExpression {
            var matches = value.match(this.ExpressionMatchRe);

            if (!(matches && matches.length)) return null;

            var expressions = _.map(matches, (v:string)=>this.parseExpressionContent(v.substring(1, v.length - 1)), this);
            var expressionVars = [];

            var result = _.reduce(matches, function (r, v, i) {
                var e = '$' + i;
                return r.replace(v, '{' + e + '}');
            }, value, this);


            var simplyfiedExpressions = _.map(expressions, this.simplifyExpression, this);
            _.each(expressions, (v)=>expressionVars = expressionVars.concat(v.vars));
            var r = {name: this.getName(), content: value, result: result, vars: expressionVars, expressions: simplyfiedExpressions};
            return r;
        }

        private simplifyExpression(expression:IExpression|string):IExpression|string {
            var ex:IExpression = this.ifExpression(expression);
            if(ex && !ex.filters) return ex.args;
            else return expression;
        }

        private  ifSimpleExpression(value:any):ISimpleExpression {
            return <ISimpleExpression> (_.isObject(value)?value:null);
        }

        private  ifExpression(value:any):IExpression {
            return <IExpression> (_.isObject(value)?value:null);
        }

        /*
         Supported types

         {a} - simple property
         {a|filterOne|filterTwo} - simple property with filters
         // excluded {a,b,c} - selector of properties
         {a||b||c} - expression executed in context
         {a||b?'one':'two'} - expression executed in context
         {data.name as A, (a||b) as V, c as D, (a||b||c) as E|i18n.t|s|d} - expression executed in context with filters
        */
        private parseExpressionContent(value:string):IExpression {
            var result:IExpression = {
                name: this.getName(), // Уникальное имя
                content: value, // исходный код
                vars: [], // переменные которые участвуют
                args: {}, // аргументы для i18n
                filters: [], // фильтры
            };

            var valueReplacedOr = value.replace(/\|\|/g, '###or');
            var valueSpitByFilter = valueReplacedOr.split(/\|/); // get before first `|`
            var expression = (_.first(valueSpitByFilter)).replace(/###or/g, '||');
            result.filters = _.map(_.rest(valueSpitByFilter), (v)=>String(v).trim()); // get after first `|`

            var args = this.parseArguments(expression);

            var vars:(string|ISimpleExpression)[];
            var e;


            if (_.isObject(args)) {
                vars = _.map(<any>args, (v:string,k:string)=>(e=this.tryParseRoundBracketExpression(v),(_.isObject(e)?args[k]=e.expression:null),e),this);
                result.args = args;
            } else {
                vars = [this.tryParseRoundBracketExpression(<string>args)];

                var firstExpression:ISimpleExpression = this.ifSimpleExpression(vars[0]);
                result.args = firstExpression?firstExpression.expression:vars[0];
            }

            _.each(vars, (v)=>_.isObject(v)?result.vars=[].concat(result.vars,(<ISimpleExpression>v).vars):result.vars.push(<string>v));

            // remove empty keys
            _.each(_.keys(result), (key)=>(_.isEmpty(result[key]) ? delete result[key] : null));
            return result;
        }

        private tryParseRoundBracketExpression(expression:string, index:number = 0):ISimpleExpression|string {
            var variableMatches:string[] = expression.match(this.VariableMatchRe);
            var hasOneMatch:boolean = variableMatches && variableMatches.length === 1;
            var hasNoConditions = expression.indexOf('!') === -1;

            if(expression.indexOf('this') > -1 || (hasOneMatch && hasNoConditions) ) return expression;

            var variables = _.compact(
                _.filter(
                    _.map(expression.match(this.VariableMatchRe), (v)=>v.trim()),
                    (v)=>(v.indexOf('\'') < 0 && v.indexOf('"') < 0 && v.match(/^[A-Za-z]+/gi))
                )
            );

            var convertedExpression = _.reduce(variables, function (memo, v, k) {
                return memo.replace(new RegExp(v, 'g'), '###' + k);

            }, expression, this);

            _.each(variables, (v,k)=>convertedExpression=convertedExpression.replace(new RegExp('###' + k, 'g'), this.getExVarToJsVar(v)), this);

            var r =  {content:expression, expression: convertedExpression, vars: variables};
            return r;
        }

        private getExVarToJsVar(v:string):string {
            var requestVariable = ((v.indexOf('.') > -1 && v.indexOf('state.') === -1) || v === 'data' ? ('this.' + v) : (v.indexOf('state.')>-1?('this.getState("' + v.replace('state.', '') + '")'):''));
           return requestVariable;
        }

        private parseArguments(value:string):string|string[]|Object {
            if (value.indexOf(',') === -1) return this.parseArgument(value);
            var result = {};
            _.each(value.split(','), function (argument:string, index:number) {
                var parsedArgs = this.parseArgument(argument);
                if (_.isObject(parsedArgs)) result = _.extend(result, parsedArgs);
            }, this);
            return _.isEmpty(result) ? null : result;
        }

        private parseArgument(value:string) {
            if (value.indexOf(' as ') === -1) return value.trim();
            else {
                var result = value.split(' as ');
                var object = {};
                object[result[1].trim()] = result[0].trim();
                return object;
            }
        }
    }
}
