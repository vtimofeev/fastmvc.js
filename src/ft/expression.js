///<reference path="./d.ts" />
var ft;
(function (ft) {
    var Expression = (function () {
        function Expression() {
            this.counter = 0;
            this.ExpressionMatchRe = /\{([\(\)\\,\.\|\?:'"@A-Za-z<>=\[\]& \+\-\/\*0-9]+)\}/g;
            this.VariableMatchRe = /([A-Za-z0-9_\-"'\.]+)/gi;
            this.ExResult = '{$0}';
        }
        Expression.prototype.strToExpression = function (value) {
            return this.parseExpressionMultiContent(value);
        };
        Expression.prototype.execute = function (value, map, context) {
            var expression = map[value.name];
            return this.executeMultiExpression(expression, context);
        };
        //----------------------------------------------------------------------------------------------------------------------------------------
        // Execute
        //----------------------------------------------------------------------------------------------------------------------------------------
        Expression.prototype.executeFilters = function (value /* args of i18n */, filters, context) {
            if (!filters || !filters.length)
                return value;
            return _.reduce(filters, function (memo /* args of i18n */, filter, index) {
                if (filter.indexOf('i18n.') === 0)
                    return context.getFormattedMessage(filter.replace('i18n.', ''), memo);
                else
                    return this.executePlainFilter(filter, memo);
            }, value, this);
        };
        Expression.prototype.executePlainFilter = function (filter, value) {
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
        };
        Expression.prototype.executeMultiExpression = function (ex, context) {
            var _this = this;
            var isSimpleExpression = (ex.expressions.length === 1);
            return isSimpleExpression ?
                this.executeExpression(ex, context) :
                _.reduce(ex.expressions, function (memo, value) { return memo.replace('{' + value + '}', _this.getContextValue(value, context)); }, ex.result, this);
        };
        Expression.prototype.getContextValue = function (v, context) {
            if (v.indexOf('data.') === 0 || v.indexOf('app.') === 0) {
                return context.eval('this.' + v);
            }
            else if (v.indexOf('(') === 0) {
                context.eval(v);
            }
            else if (v.indexOf('state.') === 0) {
                return context.getState(v.replace('state.', ''));
            }
            else if (_.isObject(v)) {
                return this.executeExpression(v, context);
            }
            else
                throw new Error('Not supported variable in ' + this.name + ', ' + v);
        };
        Expression.prototype.getContextArguments = function (ex, context) {
            var _this = this;
            _.reduce(ex.args, function (r, v, k) { return r[k] = _this.getContextValue(v, context); }, {}, this);
        };
        Expression.prototype.executeExpression = function (ex, context) {
            var r = ex.args ? this.getContextArguments(ex, context) : this.getContextValue(ex.expressions[0], context);
            if (ex.filters)
                r = this.executeFilters(r, ex.filters);
            if (ex.result && ex.result != this.ExResult)
                r = ex.result.replace(this.ExResult, r);
            //console.log([this.name , ' ... ExecuteExpression ' , ex, '  result=', JSON.stringify(r), ', of content: ', ex.content].join(''), ex);
            return r;
        };
        //----------------------------------------------------------------------------------------------------------------------------------------
        // Create expression path
        //----------------------------------------------------------------------------------------------------------------------------------------
        Expression.prototype.getName = function () {
            return 'e-' + this.counter++;
        };
        Expression.prototype.parseExpressionMultiContent = function (value) {
            var _this = this;
            var matches = value.match(this.ExpressionMatchRe);
            console.log('Multi matches: ', value, matches);
            if (!(matches && matches.length))
                return null;
            var expressions = _.map(matches, function (v) { return _this.parseExpressionContent(v.substring(1, v.length - 1)); }, this);
            var expressionVars = [];
            var result = _.reduce(matches, function (r, v, i) {
                var e = '$' + i;
                //expressionVars.push(e);
                return r.replace(v, '{' + e + '}');
            }, value, this);
            var simplyfiedExpressions = _.map(expressions, this.simplifyExpression, this);
            _.each(expressions, function (v) { return expressionVars = expressionVars.concat(v.vars); });
            return { name: this.getName(), content: value, result: result, vars: expressionVars, expressions: simplyfiedExpressions };
        };
        Expression.prototype.simplifyExpression = function (expression) {
            if (_.isObject(expression) && !expression.filters)
                return expression.args;
            else
                return expression;
        };
        /*
         Supported types

         {a} - simple property
         {a|filterOne|filterTwo} - simple property with filters
         // excluded {a,b,c} - selector of properties
         {(a||b||c)} - expression executed in context
         {(a||b?'one':'two')} - expression executed in context
         {data.name as A, (a||b) as V, c as D, (a||b||c) as E|i18n.t|s|d} - expression executed in context with filters
        */
        Expression.prototype.parseExpressionContent = function (value) {
            var _this = this;
            console.log('Parse content ex: ', value /*, ', ' , expressionMatches*/);
            var result = {
                name: this.getName(),
                content: value,
                vars: [],
                args: {},
                filters: [],
            };
            //var simpleExpressions:ISimeplExpression[] = _.map(expressionMatches, this.parseRoundBracketExpression, this);
            var valueSpitByFilter = value.split('|'); // get before first `|`
            var expression = _.first(valueSpitByFilter);
            result.filters = _.map(_.rest(valueSpitByFilter), function (v) { return String(v).trim(); }); // get after first `|`
            var args = this.parseArguments(expression);
            var vars;
            var e;
            if (_.isObject(args)) {
                vars = _.map(args, function (v, k) { return (e = _this.tryParseRoundBracketExpression(v), (_.isObject(e) ? args[k] = e.expression : null), e); }, this);
                result.args = args;
            }
            else {
                vars = [this.tryParseRoundBracketExpression(args)];
                result.args = _.isObject(vars[0]) ? vars[0].expression : vars[0];
            }
            _.each(vars, function (v) { return _.isObject(v) ? result.vars = [].concat(result.vars, v.vars) : result.vars.push(v); });
            // remove empty keys
            _.each(_.keys(result), function (key) { return (_.isEmpty(result[key]) ? delete result[key] : null); });
            console.log('Parse result ', result);
            return result;
        };
        Expression.prototype.tryParseRoundBracketExpression = function (value, index) {
            //value = value.replace(expression, '$' + index);
            if (index === void 0) { index = 0; }
            var expressions = this.getExpressionFromString(value);
            if (!expressions)
                return value;
            var expression = expressions[0];
            var variables = _.uniq(_.filter(expression.match(this.VariableMatchRe), function (v) { return v.indexOf('\'') < 0 && v.indexOf('"') < 0 && v.match(/^[A-Za-z]+/gi); }));
            //if (!_.isEmpty(variables)) variables = variables.sort((a:string, b:string)=>a.length > b.length ? -1 : 1);
            var convertedExpression = _.reduce(variables, function (memo, v) {
                var requestVariable = ((v.indexOf('.') > -1 && v.indexOf('state.') === -1) || v === 'data' ? ('this.' + v) : ('this.getState("' + v.replace('state.', '') + '")'));
                return memo.replace(new RegExp(v, 'g'), requestVariable);
            }, expression, this);
            return { content: expression, expression: convertedExpression, vars: variables };
        };
        Expression.prototype.parseArguments = function (value) {
            if (value.indexOf(',') === -1)
                return this.parseArgument(value);
            var result = {};
            _.each(value.split(','), function (argument, index) {
                var parsedArgs = this.parseArgument(argument);
                if (_.isObject(parsedArgs))
                    result = _.extend(result, parsedArgs);
            }, this);
            return _.isEmpty(result) ? null : result;
        };
        Expression.prototype.parseArgument = function (value) {
            if (value.indexOf(' as ') === -1)
                return value.trim();
            else {
                var result = value.split(' as ');
                var object = {};
                object[result[1].trim()] = result[0].trim();
                return object;
            }
        };
        Expression.prototype.getExpressionFromString = function (value) {
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
        return Expression;
    })();
    ft.Expression = Expression;
})(ft || (ft = {}));
//# sourceMappingURL=expression.js.map