///<reference path="./d.ts" />
var ft;
(function (ft) {
    var GetContext = {
        string: 'string',
        model: 'model',
        modelField: 'model.',
        data: 'data',
        dataField: 'data.',
        appField: 'app.',
        stateField: 'state',
        openBracket: '(',
        thisDot: 'this.'
    };
    var ExpressionName = (function () {
        function ExpressionName(name, context) {
            if (context === void 0) { context = null; }
            this.name = name;
            this.context = context;
        }
        return ExpressionName;
    })();
    ft.ExpressionName = ExpressionName;
    var Expression = (function () {
        function Expression() {
            this.counter = 0;
            this.ExpressionMatchRe = /\{[\(\)\\\.,\|\?:;'"!@A-Za-z<>=\[\]& \+\-\/\*%0-9]+\}/g;
            this.VariableMatchRe = /([A-Za-z0-9 _\-"'\.]+)/gi;
            this.ExResult = '{$0}';
            this.funcMap = {};
        }
        Expression.prototype.strToExpression = function (value) {
            var r = this.parseExpressionMultiContent(value);
            return r;
        };
        Expression.prototype.getExpressionNameObject = function (value) {
            return new ExpressionName(value.name);
        };
        Expression.prototype.execute = function (value, context, classes) {
            return this.executeMultiExpression(value, context, classes);
        };
        //----------------------------------------------------------------------------------------------------------------------------------------
        // Execute
        //----------------------------------------------------------------------------------------------------------------------------------------
        Expression.prototype.executeFilters = function (value /* primitive, object args of i18n */, filters, context) {
            if (!filters || !filters.length)
                return value;
            return _.reduce(filters, function (memo /* primitive/object args of i18n */, filter, index) {
                return this.executePlainFilter(filter, memo, context);
            }, value, this);
        };
        Expression.prototype.executePlainFilter = function (filter, value, context) {
            if (filter.indexOf('i18n.') === 0) {
                return context.getFormattedMessage(filter.replace('i18n.', ''), value);
            }
            else {
                if (!this.funcMap[filter])
                    this.funcMap[filter] = context.getFilter(filter);
                try {
                    var fnc = this.funcMap[filter];
                    return fnc.call(context, value);
                }
                catch (e) {
                    return '{error[' + filter + ']}';
                }
            }
        };
        Expression.prototype.executeMultiExpression = function (ex, context, classes) {
            var _this = this;
            var isSimpleExpression = (ex.expressions.length === 1);
            var contextValue;
            return isSimpleExpression ?
                this.executeExpression(ex, context, classes) :
                _.reduce(ex.expressions, function (memo, value, index) {
                    contextValue = _this.getParsedContextValue(value, context, classes);
                    if (classes && (!memo || !contextValue))
                        return '';
                    var result = memo ? memo.replace('{$' + index + '}', contextValue) : '{error:multiExpression}';
                    return result;
                }, ex.result, this);
        };
        Expression.prototype.getParsedContextValue = function (value, context, classes) {
            return this.parseContextValue(this.getContextValue(value, context), value, classes);
        };
        Expression.prototype.parseContextValue = function (value, ex, classes) {
            if (classes) {
                if (!!value) {
                    if (value === true) {
                        if (!_.isString(ex))
                            throw 'Incorrect type at parseContextValue with classes true';
                        return ex.split('.')[1];
                    }
                    else {
                        return value;
                    }
                }
                else {
                    return null;
                }
            }
            return value;
        };
        Expression.prototype.ifString = function (value) {
            return (_.isString(value) ? value : null);
        };
        Expression.prototype.getContextValue = function (v, context) {
            var r, safeV;
            if (r = context.getDynamicProperty(v))
                return r;
            console.log('V is ', v, ' check');
            if (typeof v === 'string') {
                ft.counters.expressionCtx++;
                if (v === GetContext.data || v === GetContext.model) {
                    r = context[v];
                    if (r === undefined)
                        r = null;
                    context.setDynamicProperty(v, r);
                }
                else if (v.indexOf(GetContext.dataField) === 0 || v.indexOf(GetContext.appField) === 0 || v.indexOf(GetContext.modelField) === 0) {
                    if (!this.funcMap[v]) {
                        //safeV = v.replace(/'/g, '"');
                        this.funcMap[v] = new Function('var v=null; try {v=this.' + v + ';} catch(e) {v=\'{' + v + '}\';} return v;');
                    }
                    r = this.funcMap[v].apply(context);
                    console.log('V is ', v, ' in internal exp ', r, this.funcMap[v]);
                    r = r === undefined ? null : r;
                    context.setDynamicProperty(v, r);
                }
                else if (v.indexOf(GetContext.stateField) === 0) {
                    if (!this.funcMap[v]) {
                        var state = v.substring(6);
                        this.funcMap[v] = new Function('return this.getState("' + state + '");');
                    }
                    r = this.funcMap[v].apply(context);
                    if (r === undefined)
                        r = null;
                    context.setDynamicProperty(v, r);
                }
                else if (v.indexOf(GetContext.openBracket) === 0 || v.indexOf(GetContext.thisDot) >= 0) {
                    if (!this.funcMap[v]) {
                        safeV = v.replace(/'/g, '"');
                        this.funcMap[v] = new Function('var v=null; try {v=' + v + ';} catch(e) {v=\'{' + safeV + '}\';} return v;');
                    }
                    r = this.funcMap[v].apply(context);
                    if (r === undefined)
                        r = null;
                }
                if (r !== undefined)
                    return r;
            }
            else if (_.isObject(v)) {
                ft.counters.expressionEx++;
                return this.executeExpression(v, context);
            }
            throw new Error('Not supported variable ' + v + ' in ' + context.name);
        };
        Expression.prototype.getContextArguments = function (ex, context) {
            var _this = this;
            return _.isString(ex.args) ? this.getContextValue(ex.args, context) : _.reduce(ex.args, function (r, v, k) { return (r[k] = _this.getContextValue(v, context), r); }, {}, this);
        };
        Expression.prototype.executeExpression = function (ex, context, classes) {
            ft.counters.expression++;
            var r = ex.args ? this.getContextArguments(ex, context) : this.getParsedContextValue(ex.expressions[0], context, classes);
            if (!r && classes)
                return ''; // empty class expression
            if (ex.filters)
                r = this.executeFilters(r, ex.filters, context);
            if (ex.result && ex.result !== this.ExResult)
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
            var r = { name: this.getName(), content: value, result: result, vars: expressionVars, expressions: simplyfiedExpressions };
            return r;
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
         {a||b||c} - expression executed in context
         {a||b?'one':'two'} - expression executed in context
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
            var valueReplacedOr = value.replace(/\|\|/g, '###or');
            var valueSpitByFilter = valueReplacedOr.split(/\|/); // get before first `|`
            var expression = (_.first(valueSpitByFilter)).replace(/###or/g, '||');
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
            return result;
        };
        Expression.prototype.tryParseRoundBracketExpression = function (expression, index) {
            //var expressions:string = value;
            //if(!expressions) return value; // @todo review this fix (replace ! sign)
            var _this = this;
            if (index === void 0) { index = 0; }
            //var expression = _.isArray(expressions)?expressions[0]:expressions ;
            // skip direct execution (at handlers);
            var variableMatches = expression.match(this.VariableMatchRe);
            var hasOneMatch = variableMatches && variableMatches.length === 1;
            if (expression.indexOf('this') > -1 || hasOneMatch)
                return expression;
            var variables = _.compact(_.filter(_.map(expression.match(this.VariableMatchRe), function (v) { return v.trim(); }), function (v) { return (v.indexOf('\'') < 0 && v.indexOf('"') < 0 && v.match(/^[A-Za-z]+/gi)); }));
            var convertedExpression = _.reduce(variables, function (memo, v, k) {
                return memo.replace(new RegExp(v, 'g'), '###' + k);
            }, expression, this);
            _.each(variables, function (v, k) { return convertedExpression = convertedExpression.replace(new RegExp('###' + k, 'g'), _this.getExVarToJsVar(v)); }, this);
            var r = { content: expression, expression: convertedExpression, vars: variables };
            return r;
        };
        Expression.prototype.getExVarToJsVar = function (v) {
            var requestVariable = ((v.indexOf('.') > -1 && v.indexOf('state.') === -1) || v === 'data' ? ('this.' + v) : (v.indexOf('state.') > -1 ? ('this.getState("' + v.replace('state.', '') + '")') : ''));
            return requestVariable;
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