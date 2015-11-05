///<reference path="../src/d.ts/mocha/mocha.d.ts" />
///<reference path="../../DefinitelyTyped/chai/chai.d.ts" />
///<reference path="../src/fmvc/d.ts" />
///<reference path="../src/ft/d.ts" />
var expect = chai.expect;
var assert = chai.assert;
var opts = {
    debugHtml: false,
    dispose: false
};
var templates = {
    'ft.StaticTextAttribs': {
        template: '<div id="id1" data-a="a" data-b="b" class="default-class" style="background-color: red;">text</div>',
        result: {
            root: {
                attrs: {
                    id: 'id1',
                    'data-a': 'a',
                    'data-b': 'b'
                },
                classes: ['default-class'],
                styles: {
                    backgroundColor: 'red'
                },
                innerHTML: 'text'
            }
        }
    },
    'ft.DynamicTextAttribs': {
        template: '<div ' +
            ' data-base="{state.base} {data.name}"' +
            ' class="staticClass {state.base} {state.base}-{state.hover} {state.base}-{state.selected}-{state.hover}" ' +
            ' style="position: relative;top:{state.top}px;color:{state.color||\'black\'};">' +
            'Hello, {data.name} you are {data.age} years old' +
            '</div>',
        params: {
            data: { name: 'Vasily', age: 34 },
            setStates: { base: 'user', hover: true, selected: false, top: 2 },
        },
        result: {
            root: {
                attrs: {
                    'data-base': 'user Vasily'
                },
                classes: ['staticClass', 'user', 'user-hover'],
                styles: {
                    color: 'black',
                    top: '2px',
                    position: 'relative'
                },
                innerHTML: 'Hello, Vasily you are 34 years old'
            }
        }
    },
    'ft.TestButton': {
        template: '<div .base="button" .data="Button" .stateHandlers="hover,selected" onaction="action" ' +
            'class="{state.base} {state.base}-{state.selected} {state.base}-{state.hover} {state.base}-{state.disabled}">{(data?data:\'\')}</div>',
        result: {
            root: {
                classes: ['button'],
                innerHTML: 'Button'
            }
        }
    },
    'ft.OverrideParamsWithStatic': {
        template: '<div class="test-content"><div><ft.TestButton ln="tb"></ft.TestButton></div><div><ft.TestButton ln="cb" .base="checkbox" .selected="true" .data="Checkbox"></ft.TestButton></div></div>',
        result: {
            tb: {
                classes: ['button'],
                innerHTML: 'Button'
            },
            cb: {
                classes: ['checkbox', 'checkbox-selected'],
                innerHTML: 'Checkbox'
            }
        }
    }
};
var counter = 0;
var container = document.getElementById('container');
var getIndex = function () {
    return counter++;
};
describe('ft - Templates', function () {
    _.each(templates, function (def, key) {
        var InstanceCreator = ft.createClass(key, def.template);
        var instance;
        var result;
        it(key + ': Create and render', function () {
            instance = new InstanceCreator(key + '-' + getIndex(), def.params);
            console.log(instance);
            instance.render(container);
            result = instance.getElement().outerHTML;
            assert(!!container.innerHTML, 'should has content at container');
        });
        if (opts.debugHtml) {
            it(key + ': Result ', function () { return assert(0, result); });
        }
        it(key + ': Check dom attributes and content', function () {
            _.each(def.result, function (v, k) {
                var def = v;
                console.log('On check dom: ', key, k, ft.TemplateViewHelper.getDomElement);
                var el = k === 'root' ? instance.getElement() : ft.templateHelper.getDomElement(instance[k]);
                if (!def || !el)
                    throw 'Incorrrect test result of ' + k;
                _.each(def.attrs, function (value, key) {
                    assert.strictEqual(el.getAttribute(key), value, 'attributes must be equal');
                });
                _.each(def.classes, function (value, key) {
                    assert(el.className.indexOf(value) >= 0, 'should has className: ' + value);
                });
                _.each(def.styles, function (value, key) {
                    assert(el.style[key] === value, 'should has style ' + key + '=' + value);
                });
                if (def.innerHTML)
                    assert.strictEqual(el.innerHTML, def.innerHTML, 'innerHTML must be equal');
            });
        });
        it(key + ': Unrender', function () {
            instance.unrender();
            if (opts.dispose)
                assert(!container.innerHTML, 'should not has content at container');
        });
        it(key + ': Render repeat', function () {
            instance.render(container);
            if (opts.dispose)
                assert(!!container.innerHTML, 'should has content at container');
        });
        if (opts.dispose) {
            it(key + ': Dispose', function () {
                instance.dispose();
                instance = null;
                assert(!container.innerHTML, 'should not has content at container');
            });
        }
    });
});
//# sourceMappingURL=template.test.js.map