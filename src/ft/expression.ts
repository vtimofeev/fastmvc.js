///<reference path="./d.ts" />

module ft {
    var GetContext = {
        string: 'string',
        data: 'data',
        dataField: 'data.',
        appField: 'app.',
        stateField: 'state',
        openBracket: '('
    };

    export class Expression {

        private counter:number = 0;
        private ExpressionMatchRe:RegExp = /\{([\(\)\\,\.\|\?:;'"!@A-Za-z<>=\[\]& \+\-\/\*0-9]+)\}/g;
        private VariableMatchRe:RegExp = /([A-Za-z0-9 _\-"'\.]+)/gi;
        private ExResult:string = '{$0}';
        private funcMap:{[id:string]:Function} = {};

        public strToExpression(value:string):IExpression {
            return this.parseExpressionMultiContent(value);
        }
        
        public getExpressionNameObject(value:IExpression):IExpressionName {
            return { name: value.name }
        }
        
        public execute(value:IExpression, /*map:IExpressionMap,*/ context:ITemplateView, classes?:boolean):any {
            //console.log('Expression execute ... ', value, context, classes);
            return this.executeMultiExpression(value, context, classes);
        }

        //----------------------------------------------------------------------------------------------------------------------------------------
        // Execute
        //----------------------------------------------------------------------------------------------------------------------------------------

        private executeFilters(value:any /* args of i18n */, filters:string[], context:ITemplateView):any {
            if(!filters || !filters.length) return value;

            return _.reduce(filters,
                function(memo:any /* args of i18n */, filter:string, index:number) {
                    if (filter.indexOf('i18n.') === 0) return context.getFormattedMessage(filter.replace('i18n.', ''),memo);
                    else return this.executePlainFilter(filter, memo);
                }, value, this);
        }

        private executePlainFilter(filter:string, value:string):string {
            switch (filter) {
                case 'hhmmss':
                    return value; //ViewHelper.hhmmss(value);
                    /*
                case Filter.FIRST:
                    return 'first:' + value;
                    break;
                case Filter.SECOND:
                    return 'second:' + value;
                    break;
                    */
            }
            return value;
        }

        private executeMultiExpression(ex:IExpression, context:ITemplateView, classes:boolean):any {
            var isSimpleExpression:Boolean = (ex.expressions.length === 1);
            var contextValue;
            //console.log('Exec multi expression, simple', isSimpleExpression);
            return isSimpleExpression?
                this.executeExpression(ex, context, classes):
                _.reduce(ex.expressions,
                    (memo:string, value:string|IExpression, index:number)=>(
                        memo ? memo = memo.replace('{$'+index+'}', (contextValue = this.getParsedContextValue(value, context, classes))) : null,
                        (contextValue?memo:'') /* return special if classes */
                        ), ex.result, this);
        }

        private getParsedContextValue(value:ExpressionValue, context:ITemplateView, classes:boolean) {
            return this.parseContextValue(this.getContextValue(value, context), value, classes);

        }

        private parseContextValue(value:any, ex:IExpression|string, classes:boolean):any {
            if(classes && _.isBoolean(value) && (exStr = this.ifString(ex)) && exStr[0] != '(' && exStr.indexOf('.') > 0) {
                    var values = exStr.split('.');
                    var varName = (values.length === 2)?values[1]:null;
                    if(varName) return value?varName:null;
            }
            return value;
        }

        private ifString(value:any):string {
            return <string> (_.isString(value)?value:null);
        }

        public getContextValue(v:string|IExpression, context:ITemplateView):any {
            var r;
            if(r = context.getDynamicProperty(v)) return r;

            if(typeof v === 'string') {
                counters.expressionCtx++;
                if(v.indexOf(GetContext.dataField) === 0 || v.indexOf(GetContext.appField) === 0) {
                    if(!this.funcMap[v]) {
                        this.funcMap[v] = new Function('var v=null; try {v=this.' + v + ';} catch(e) {v=\'{' + v + '}\';} return v;');
                    }
                    r = this.funcMap[v].apply(context);

                    r = r===undefined?null:r;
                    context.setDynamicProperty(v, r);
                }
                else if(v.indexOf(GetContext.stateField) === 0) {
                    if(!this.funcMap[v]) {
                        var state = v.substring(6);
                        this.funcMap[v] = new Function('return this.getState("' + state + '");');
                    }
                    r = this.funcMap[v].apply(context);
                    if(r === undefined) r = null;
                    context.setDynamicProperty(v, r);
                }
                else if(v.indexOf(GetContext.openBracket) === 0) {
                    if(!this.funcMap[v]) {
                        this.funcMap[v] = new Function('var v=null; try {v=' + v + ';} catch(e) {v=\'{' + v + '}\';} return v;');
                    }
                    r = this.funcMap[v].apply(context);
                }
                else if(v === GetContext.data) {
                    r = context.data;
                    if(r === undefined) r = null;
                    context.setDynamicProperty(v, r);
                }

                if(r !== undefined) return r;
            }
            else if(_.isObject(v)) {
                counters.expressionEx++;
                return this.executeExpression(<IExpression> v, context);
            }

            throw new Error('Not supported variable ' + v + ' in ' + context.name);
        }

        private getContextArguments(ex:IExpression, context:ITemplateView):any {
            return _.reduce(ex.args, (r:any,v:string,k:string)=>(r[k]=this.getContextValue(v,context),r),{},this);
        }

        private executeExpression(ex:IExpression, context:ITemplateView, classes?:boolean):any {
            counters.expression++;
            var r:any = ex.args?this.getContextArguments(ex,context):this.getParsedContextValue(ex.expressions[0],context,classes);
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
            var m = value.match(this.ExpressionMatchRe)
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
            return {name: this.getName(), content: value, result: result, vars: expressionVars, expressions: simplyfiedExpressions};
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
         {(a||b||c)} - expression executed in context
         {(a||b?'one':'two')} - expression executed in context
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

        private tryParseRoundBracketExpression(value:string, index:number = 0):ISimpleExpression|string {
            var expressions = this.getExpressionFromString(value);
            if(!expressions) return value; // @todo review this fix (replace ! sign)

            var expression = expressions[0];

            // skip direct execution (at handlers);
            if(expression.indexOf('this') > -1) return expression;

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
            return {content:expression, expression: convertedExpression, vars: variables};
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

        private getExpressionFromString(value:string):string[] {
            var brackets = [];
            var open = 0;
            var r = [];
            _.each(value, function (v, i) {
                if (v === '(') {
                    if (open === 0) brackets.push([i]);
                    open++;
                } else if (v === ')') {
                    if (open === 1) brackets[brackets.length - 1].push(i);
                    open--;
                }
            });
            _.each(brackets, function (v) {
                r.push(value.substring(v[0], v[1] + 1));
            });
            return r.length ? r : null;
        }
    }
}
