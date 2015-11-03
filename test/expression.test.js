///<reference path="../src/d.ts/mocha/mocha.d.ts" />
///<reference path="../../DefinitelyTyped/chai/chai.d.ts" />
///<reference path="../src/fmvc/d.ts" />
///<reference path="../src/ft/d.ts" />
var expect = chai.expect;
var assert = chai.assert;
var expression = new ft.Expression();
var expressionContext = {
    data: {
        name: 'Vasily',
        age: 34,
        money: 1500000,
        children: 3,
        online: true
    },
    states: {
        base: 'user',
        hover: true,
        selected: true,
        disabled: false
    },
    getDynamicProperty: function (v) {
        return undefined;
    },
    setDynamicProperty: function (n, v) {
        return undefined;
    },
    getState: function (value) {
        return this.states[value];
    }
};
function getExpressionTest(expressionStr, context, result, desc) {
    return {
        expressionStr: expressionStr,
        context: context,
        result: result,
        desc: desc
    };
}
function addSection(desc, tests) {
    describe(desc, function () {
        _.each(tests, function (obj, key) {
            var exInstance = expression.strToExpression(obj.expressionStr);
            var exResult = expression.execute(exInstance, obj.context);
            var testName = 'Expression ' + key + ' is ' + obj.expressionStr + ' must have result ' + obj.result + ', it has ' + exResult;
            it(testName, function () {
                assert(exInstance, 'instance should exists');
                assert.strictEqual(exResult, obj.result, 'result must be equal');
            });
        });
    });
}
// return value
addSection('Check return types', [
    getExpressionTest('{data.name}', expressionContext, 'Vasily', 'return string Vasily'),
    getExpressionTest('{data.age}', expressionContext, 34, 'return number 34'),
    getExpressionTest('{data.online}', expressionContext, true, 'return boolean true'),
]);
// context
addSection('Logical operations', [
    getExpressionTest('{0||data.name}', expressionContext, 'Vasily'),
    getExpressionTest('{data.undefined||data.null?0:1}', expressionContext, 1),
    getExpressionTest('{data.undefined&&data.name?"incorrect","correct"}', expressionContext, 'correct'),
    getExpressionTest('{data.age&&data.name?"correct","incorrect"}', expressionContext, 'correct') // and positive
]);
// logical operation
addSection('Comparison operations ', [
    getExpressionTest('{data.age===34?"ok":"no"}', expressionContext, "ok"),
    getExpressionTest('{data.age!==34?"ok":"no"}', expressionContext, "no"),
    getExpressionTest('{data.age>=34?"ok":"no"}', expressionContext, "ok"),
    getExpressionTest('{data.age<=34?"ok":"no"}', expressionContext, "ok"),
    getExpressionTest('{data.age<34?"ok":"no"}', expressionContext, "no"),
    getExpressionTest('{data.age>34?"ok":"no"}', expressionContext, "no")
]);
//# sourceMappingURL=expression.test.js.map