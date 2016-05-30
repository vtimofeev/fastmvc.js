///<reference path="d.ts" />

var expect = chai.expect;
var assert = <chai.Assert> chai.assert;
var expression = new ft.Expression();


var expressionContext = {
    data: {
        name: 'Vasily',
        age: 34,
        money: 1500000,
        children: 3,
        online: true,
        tags: ['js', 'html5', 'css']
    },
    states: {
        base: 'user',
        hover: true,
        selected: true,
        disabled: false,
        step: 1
    },
    filter: {
        identify: (v)=>v,
        quote: (v)=>'"'+v+'"',
        math: {
            m10: (v)=>v*10,
            d10: (v)=>v/10
        },
        objectIn: (v)=>(v.Name + ' ' + v.Age)
    },

    getDynamicProperty(v) {
        return undefined;
    },
    setDynamicProperty(n,v) {
        return undefined;
    },
    getState: function (value) {
        return this.states[value];
    },
    getFilter: function(filter) {
        var fnc = new Function('return this.'+filter+';');
        return fnc.call(this);
    }

};


interface IExpressionTestObject {
    expressionStr:string; context:any; result:any; desc?:string, classes?:boolean;
}
function getExpressionTest(expressionStr:string, context:any, result:any, desc?:string, classes?:boolean):IExpressionTestObject {
    return {
        expressionStr: expressionStr,
        context: context,
        result: result,
        desc: desc,
        classes: classes
    }
}
function addSection(desc?:string, tests:IExpressionTestObject[]) {
    describe(desc, function () {
        _.each(tests, function (obj:IExpressionTestObject, key:number) {
            var exInstance:ft.IExpression = expression.strToExpression(obj.expressionStr);
            var exResult:any = expression.execute(exInstance, obj.context, obj.classes);
            var testName:string = 'Expression ' + key + ' is ' +  obj.expressionStr + ' should be = ' + obj.result + ', it is = ' + exResult + (obj.desc?', comment: '+obj.desc:'');
            it(testName, function () {
                assert(exInstance, 'instance should exists');
                assert.strictEqual(exResult, obj.result, 'result must be equal');
            });
        });
    })
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
    getExpressionTest('{data.undefined&&data.name?"incorrect":"correct"}', expressionContext, 'correct'),// and negative
    getExpressionTest('{data.age&&data.name?"correct":"incorrect"}', expressionContext, 'correct')// and positive
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

// combination
addSection('Combination', [
    getExpressionTest('{(data.age>=34&&data.name==="Vasily")?"ok":"no"}', expressionContext, "ok"),
    getExpressionTest('{(data.age>30&&data.age<40&&data.name==="Vasily")?"ok":"no"}', expressionContext, "ok"),
]);

addSection('Filters ', [
    getExpressionTest('{data.age|filter.identify}', expressionContext, 34, 'return number 34'),
    getExpressionTest('{data.age|filter.identify|filter.math.m10}', expressionContext, 34*10, 'return number 340'),
    getExpressionTest('{data.name|filter.quote}', expressionContext, '"Vasily"', 'return quoted name'),

    getExpressionTest('{data.name as Name, data.age as Age|filter.objectIn}', expressionContext, 'Vasily 34', 'required correct object'),
]);

addSection('Multiply', [
    getExpressionTest('{data.name} {data.age}', expressionContext, 'Vasily 34')
]);

addSection('Complex', [
    getExpressionTest('{data.name|filter.identify} {data.age|filter.math.m10|filter.math.d10}', expressionContext, 'Vasily 34'),
    getExpressionTest('{data.age>50?"older":data.age>40?"old":data.age>30?"norm":data.age>20?"young":"little"}', expressionContext, 'norm'),

]);

addSection('Other', [
    //getExpressionTest("{0}", expressionContext, 0),
    //getExpressionTest("{true}", expressionContext, true),
    //getExpressionTest("{false||1}", expressionContext, 1),
    getExpressionTest('{data.age+1.5-0.1}', expressionContext, 34 + 1.5 - 0.1),
    getExpressionTest("{data.tags[0]}", expressionContext, 'js', 'array check'),
    getExpressionTest("{data.age>50?'older':data.age>40?'old':data.age>30?'norm':data.age>20?'young':'little'}", expressionContext, 'norm'),
    getExpressionTest("{data.age>50?\"older\":data.age>40?\"old\":data.age>30?\"norm\":data.age>20?\"young\":\"little\"}", expressionContext, 'norm')
]);

addSection('Classes', [
    getExpressionTest("{state.base}", expressionContext, 'user', null, true),
    getExpressionTest("{state.selected}", expressionContext, 'selected', null, true),
    getExpressionTest("{state.disabled}", expressionContext, '', null, true),
    getExpressionTest("user-{state.hover}", expressionContext, 'user-hover', null, true),
    getExpressionTest("{state.base}-{state.step}", expressionContext, 'user-1', null, true),
    getExpressionTest("{state.base}-{state.hover}", expressionContext, 'user-hover', null, true),
    getExpressionTest("{state.base}-{state.hover}-{state.selected}", expressionContext, 'user-hover-selected', null, true),
    getExpressionTest("{state.base}-{state.hover}-{state.disabled}", expressionContext, '', null, true),
]);









