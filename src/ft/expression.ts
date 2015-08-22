///<reference path="./d.ts" />

module ft {
    export class Expression {
        private counter:number = 0;
        private ExpressionMatchRe:RegExp = /\{([\(\)\\,\.\|\?:'"@A-Za-z<>=\[\]& \+\-\/\*0-9]+)\}/g;
        private VariableMatchRe:RegExp = /([A-Za-z0-9_\-"'\.]+)/gi;
        private ExResult:string = '{$0}';

        public strToExpression(value:string):IExpression {
            return this.parseExpressionMultiContent(value);
        }
        
        public execute(value:IExpressionName, map:IExpressionMapByName, context:ITemplateView):any {
            var expression = <IExpression> map[value.name];
            return this.executeMultiExpression(expression, context);
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
                case Filter.FIRST:
                    return 'first:' + value;
                    break;
                case Filter.SECOND:
                    return 'second:' + value;
                    break;
            }
            return value;
        }

        private executeMultiExpression(ex:IExpression, context:ITemplateView):any {
            var isSimpleExpression:Boolean = (ex.expressions.length === 1);
            return isSimpleExpression?
                this.executeExpression(ex, context):
                _.reduce(ex.expressions, (memo:string, value:string|IExpression)=>memo.replace('{'+value+'}',this.getContextValue(value, context)), ex.result, this);
        }

        private getContextValue(v:string|IExpression, context:ITemplateView):any {
            if(v.indexOf('data.') === 0 || v.indexOf('app.') === 0) {
                return context.eval('this.'+ v);
            }
            else if(v.indexOf('(') === 0) {
                context.eval(v);
            }
            else if(v.indexOf('state.') === 0) {
                return context.getState(v.replace('state.',''));
            }
            else if(_.isObject(v)) {
                return this.executeExpression(<IExpression> v, context);
            }
            else throw new Error('Not supported variable in ' + this.name + ', ' + v);
        }

        private getContextArguments(ex:IExpression, context:ITemplateView):any {
            _.reduce(ex.args, (r:any,v:string,k:string)=>r[k]=this.getContextValue(v,context),{},this);
        }

        private executeExpression(ex:IExpression, context:ITemplateView):any {
            var r:any = ex.args?this.getContextArguments(ex,context):this.getContextValue(ex.expressions[0],context);
            if(ex.filters) r = this.executeFilters(r, ex.filters);
            if(ex.result && ex.result != this.ExResult) r = ex.result.replace(this.ExResult, r);
            //console.log([this.name , ' ... ExecuteExpression ' , ex, '  result=', JSON.stringify(r), ', of content: ', ex.content].join(''), ex);
            return r;
        }

        //----------------------------------------------------------------------------------------------------------------------------------------
        // Create expression path
        //----------------------------------------------------------------------------------------------------------------------------------------

        private getName() {
            return 'e-' + this.counter++;
        }

        private parseExpressionMultiContent(value:string):IExpression {
            var matches = value.match(this.ExpressionMatchRe);
            console.log('Multi matches: ', value, matches);

            if (!(matches && matches.length)) return null;

            var expressions = _.map(matches, (v:string)=>this.parseExpressionContent(v.substring(1, v.length - 1)), this);
            var expressionVars = [];

            var result = _.reduce(matches, function (r, v, i) {
                var e = '$' + i;
                //expressionVars.push(e);
                return r.replace(v, '{' + e + '}');
            }, value, this);


            var simplyfiedExpressions = _.map(expressions, this.simplifyExpression, this);
            _.each(expressions, (v)=>expressionVars = expressionVars.concat(v.vars));
            return {name: this.getName(), content: value, result: result, vars: expressionVars, expressions: simplyfiedExpressions};
        }

        private simplifyExpression(expression:IExpression|string):IExpression|string {
            if(_.isObject(expression) && !expression.filters) return expression.args;
            else return expression;
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
            console.log('Parse content ex: ' , value /*, ', ' , expressionMatches*/);
            var result:IExpression = {
                name: this.getName(), // Уникальное имя
                content: value, // исходный код
                vars: [], // переменные которые участвуют
                args: {}, // аргументы для i18n
                filters: [], // фильтры
            };

            //var simpleExpressions:ISimeplExpression[] = _.map(expressionMatches, this.parseRoundBracketExpression, this);
            var valueSpitByFilter = value.split('|'); // get before first `|`
            var expression = _.first(valueSpitByFilter);
            result.filters = _.map(_.rest(valueSpitByFilter), (v)=>String(v).trim()); // get after first `|`

            var args = this.parseArguments(expression);

            var vars:(string|ISimpleExpression)[];
            var e;
            if (_.isObject(args)) {
                vars = _.map(args, (v,k)=>(e=this.tryParseRoundBracketExpression(v),(_.isObject(e)?args[k]=e.expression:null),e),this);
                result.args = args;
            } else {
                vars = [this.tryParseRoundBracketExpression(args)];
                result.args = _.isObject(vars[0])?vars[0].expression:vars[0];
            }
            _.each(vars, (v)=>_.isObject(v)?result.vars=[].concat(result.vars,v.vars):result.vars.push(v));


            // remove empty keys
            _.each(_.keys(result), (key)=>(_.isEmpty(result[key]) ? delete result[key] : null));
            console.log('Parse result ' , result);
            return result;
        }

        private tryParseRoundBracketExpression(value:string, index:number = 0):ISimpleExpression|string {
            //value = value.replace(expression, '$' + index);

            var expressions = this.getExpressionFromString(value);
            if(!expressions) return value;

            var expression = expressions[0];
            var variables = _.uniq(_.filter(expression.match(this.VariableMatchRe), (v)=>v.indexOf('\'') < 0 && v.indexOf('"') < 0 && v.match(/^[A-Za-z]+/gi)));


            //if (!_.isEmpty(variables)) variables = variables.sort((a:string, b:string)=>a.length > b.length ? -1 : 1);
            var convertedExpression = _.reduce(variables, function (memo, v) {
                var requestVariable = ((v.indexOf('.') > -1 && v.indexOf('state.') === -1) || v === 'data' ? ('this.' + v) : ('this.getState("' + v.replace('state.', '') + '")'));
                return memo.replace(new RegExp(v, 'g'), requestVariable);
            }, expression, this);

            return {content:expression, expression: convertedExpression, vars: variables};
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
