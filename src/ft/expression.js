///<reference path="./d.ts" />
var ft;
(function (ft) {
    var Expression = (function () {
        function Expression() {
            this.counter = 0;
            this.ExpressionMatchRe = /\{([\(\)\\,\.\|\?:;'"!@A-Za-z<>=\[\]& \+\-\/\*0-9]+)\}/g;
            this.VariableMatchRe = /([A-Za-z0-9 _\-"'\.]+)/gi;
            this.ExResult = '{$0}';
        }
        Expression.prototype.strToExpression = function (value) {
            return this.parseExpressionMultiContent(value);
        };
        Expression.prototype.getExpressionNameObject = function (value) {
            return { name: value.name };
        };
        Expression.prototype.execute = function (value, map, context, classes) {
            var expression = map[value.name];
            return this.executeMultiExpression(expression, context, classes);
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
            }
            return value;
        };
        Expression.prototype.executeMultiExpression = function (ex, context, classes) {
            var _this = this;
            var isSimpleExpression = (ex.expressions.length === 1);
            var contextValue;
            return isSimpleExpression ?
                this.executeExpression(ex, context, classes) :
                _.reduce(ex.expressions, function (memo, value, index) { return (memo ? memo = memo.replace('{$' + index + '}', (contextValue = _this.getParsedContextValue(value, context, classes))) : null,
                    (contextValue ? memo : '') /* return special if classes */); }, ex.result, this);
        };
        Expression.prototype.getParsedContextValue = function (value, context, classes) {
            return this.parseContextValue(this.getContextValue(value, context), value, classes);
        };
        Expression.prototype.parseContextValue = function (value, ex, classes) {
            var exStr = this.ifString(ex);
            if (classes && _.isBoolean(value) && exStr && exStr[0] != '(' && exStr.indexOf('.') > 0) {
                var values = exStr.split('.');
                var varName = (values.length === 2) ? values[1] : null;
                if (varName)
                    return value ? varName : null;
            }
            return value;
        };
        Expression.prototype.ifString = function (value) {
            return (_.isString(value) ? value : null);
        };
        Expression.prototype.getContextValue = function (v, context) {
            var r;
            if (typeof v === 'string') {
                /*
                var boolTrue = v.indexOf('!!') === 0;
                if(boolTrue) v = v.substring(2);
                var boolFalse = v.indexOf('!') === 0;
                if(boolFalse) v = v.substring(1);
                */
                if (v.indexOf('data.') === 0 || v.indexOf('app.') === 0) {
                    r = context.eval('this.' + v);
                    context.setDynamicProperty(v, r);
                }
                else if (v.indexOf('state.') === 0) {
                    r = context.getState(v.replace('state.', ''));
                    context.setDynamicProperty(v, r);
                }
                else if (v === 'data') {
                    r = context.data;
                    context.setDynamicProperty(v, r);
                }
                else if (v.indexOf('(') === 0) {
                    r = context.eval(v);
                }
                if (r !== undefined)
                    return r;
            }
            else if (_.isObject(v)) {
                return this.executeExpression(v, context);
            }
            throw new Error('Not supported variable ' + v + ' in ' + context.name);
        };
        Expression.prototype.getContextArguments = function (ex, context) {
            var _this = this;
            return _.reduce(ex.args, function (r, v, k) { return (r[k] = _this.getContextValue(v, context), r); }, {}, this);
        };
        Expression.prototype.executeExpression = function (ex, context, classes) {
            var r = ex.args ? this.getContextArguments(ex, context) : this.getParsedContextValue(ex.expressions[0], context, classes);
            if (!r && classes)
                return ''; // empty class expression
            if (ex.filters)
                r = this.executeFilters(r, ex.filters, context);
            if (ex.result && ex.result != this.ExResult)
                r = ex.result.replace(this.ExResult, r);
            return r;
        };
        //----------------------------------------------------------------------------------------------------------------------------------------
        // Create expression path
        //----------------------------------------------------------------------------------------------------------------------------------------
        Expression.prototype.getName = function () {
            return 'e-' + this.counter++;
        };
        Expression.prototype.strToJsMatch = function (value) {
            var m = value.match(this.ExpressionMatchRe);
            return m && m[0] ? (m[0]).substring(1, m[0].length - 1) : 'this.internalHandler("' + value + '", e)';
        };
        Expression.prototype.parseExpressionMultiContent = function (value) {
            var _this = this;
            var matches = value.match(this.ExpressionMatchRe);
            if (!(matches && matches.length))
                return null;
            var expressions = _.map(matches, function (v) { return _this.parseExpressionContent(v.substring(1, v.length - 1)); }, this);
            var expressionVars = [];
            var result = _.reduce(matches, function (r, v, i) {
                var e = '$' + i;
                return r.replace(v, '{' + e + '}');
            }, value, this);
            var simplyfiedExpressions = _.map(expressions, this.simplifyExpression, this);
            _.each(expressions, function (v) { return expressionVars = expressionVars.concat(v.vars); });
            return { name: this.getName(), content: value, result: result, vars: expressionVars, expressions: simplyfiedExpressions };
        };
        Expression.prototype.simplifyExpression = function (expression) {
            var ex = this.ifExpression(expression);
            if (ex && !ex.filters)
                return ex.args;
            else
                return expression;
        };
        Expression.prototype.ifSimpleExpression = function (value) {
            return (_.isObject(value) ? value : null);
        };
        Expression.prototype.ifExpression = function (value) {
            return (_.isObject(value) ? value : null);
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
            var result = {
                name: this.getName(),
                content: value,
                vars: [],
                args: {},
                filters: [],
            };
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
                var firstExpression = this.ifSimpleExpression(vars[0]);
                result.args = firstExpression ? firstExpression.expression : vars[0];
            }
            _.each(vars, function (v) { return _.isObject(v) ? result.vars = [].concat(result.vars, v.vars) : result.vars.push(v); });
            // remove empty keys
            _.each(_.keys(result), function (key) { return (_.isEmpty(result[key]) ? delete result[key] : null); });
            console.log('Expression content: ', result);
            return result;
        };
        Expression.prototype.tryParseRoundBracketExpression = function (value, index) {
            //value = value.replace(expression, '$' + index);
            if (index === void 0) { index = 0; }
            var expressions = this.getExpressionFromString(value);
            if (!expressions)
                return value.replace(/!/g, ''); // @todo review this fix (replace ! sign)
            var expression = expressions[0];
            // skip direct execution (at handlers);
            if (expression.indexOf('this') > -1)
                return expression;
            var variables = _.compact(_.filter(_.map(expression.match(this.VariableMatchRe), function (v) { return v.trim(); }), function (v) { return (v.indexOf('\'') < 0 && v.indexOf('"') < 0 && v.match(/^[A-Za-z]+/gi)); }));
            //console.log(variables);
            //if (!_.isEmpty(variables)) variables = variables.sort((a:string, b:string)=>a.length > b.length ? -1 : 1);
            var convertedExpression = _.reduce(variables, function (memo, v) {
                var requestVariable = ((v.indexOf('.') > -1 && v.indexOf('state.') === -1) || v === 'data' ? ('this.' + v) :
                    (v.indexOf('state.') > -1 ? ('this.getState("' + v.replace('state.', '') + '")') : ''));
                return memo.replace(new RegExp(v, 'g'), requestVariable);
            }, expression, this);
            //console.log('Expressions ... ', value, expressions, 'result', convertedExpression);
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