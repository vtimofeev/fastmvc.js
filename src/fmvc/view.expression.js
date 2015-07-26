///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var Expression = (function () {
        function Expression() {
        }
        Expression.instance = function () {
            return Expression.__instance;
        };
        // @todo
        Expression.prototype.getStyleValue = function (name) {
        };
        Expression.prototype.getClassStringValue = function (propertyName, propertyValue, templateString) {
            if (_.isBoolean(propertyValue)) {
                return templateString.replace('{' + propertyName + '}', propertyName);
            }
            else {
                return templateString.replace('{' + propertyName + '}', propertyValue);
            }
        };
        Expression.prototype.getDataStringValue = function (propertyName, propertyValue, strOrExOrMEx) {
            if (_.isString(strOrExOrMEx)) {
                return strOrExOrMEx.replace('{' + propertyName + '}', propertyValue);
            }
            else if (_.isObject(strOrExOrMEx)) {
                return this.executeMultiExpression(strOrExOrMEx);
            }
        };
        Expression.prototype.executeFilters = function (value, filters) {
            if (!filters || !filters.length)
                return value;
            return _.reduce(filters, function (memo, filter, index) {
                if (filter.indexOf('i18n.') === 0)
                    return this.getFormattedMessage(this.i18n[filter.replace('i18n.', '')], memo);
                else
                    return this.executePlainFilter(filter, memo);
            }, value, this);
        };
        Expression.prototype.executePlainFilter = function (filter, value) {
            switch (filter) {
                case 'hhmmss':
                    return fmvc.ViewHelper.hhmmss(value);
                case fmvc.Filter.FIRST:
                    return 'first:' + value;
                    break;
                case fmvc.Filter.SECOND:
                    return 'second:' + value;
                    break;
            }
            return value;
        };
        Expression.prototype.executeMultiExpression = function (view, mex) {
            //console.log('------------------------------ ?* --------------------------' , mex);
            //console.log(mex);
            return _.reduce(mex.vars, function (memo, value) {
                return memo.replace('{' + value + '}', view.getVarValue(value, mex));
            }, mex.result || '{$0}', this);
        };
        Expression.prototype.executeExpression = function (view, ex) {
            //console.log(ex);
            var r = null;
            // we create object to send to first filter (like i18n method) that returns a string value
            if (ex.args && ex.filters) {
                r = {};
                _.each(ex.args, function (v, k) { return r[k] = view.getVarValue(v, ex); }, this);
            }
            else if (ex.values) {
                var i = 0, length = ex.values.length;
                while (!r && i < length) {
                    r = view.getVarValue(ex.values[i], ex);
                    //this.log(['Search positive ' + i + ' value in [', ex.values[i], ']=',  r].join(''));
                    i++;
                }
            }
            else
                throw Error('Expression must has args and filter or values');
            //console.log([this.name , ' ... ExecuteExpression ' , ex, '  result=', JSON.stringify(r), ', of content: ', ex.content].join(''), ex);
            r = this.executeFilters(r, ex.filters);
            return r;
        };
        Expression.__instance = new Expression();
        return Expression;
    })();
    fmvc.Expression = Expression;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=view.expression.js.map