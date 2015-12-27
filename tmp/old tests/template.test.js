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
        template: '<div .state.my="my" .base="button" .stateHandlers="hover,selected" onaction="action" ' +
            'class="{state.base} {state.my} {state.base}-{state.selected} {state.base}-{state.hover} {state.base}-{state.disabled}">{(data?data:\'Button\')}{state.selected?\' is selected\':\'\'}{state.hover?\' is hover\':\'\'}</div>',
        result: {
            root: {
                classes: ['button', 'my'],
                innerHTML: 'Button'
            }
        }
    },
    'ft.TestStateButton': {
        template: '<div .base="button" .stateHandlers="hover,selected" onaction="action" ' +
            'class="{state.base} {state.base}-{state.selected} {state.base}-{state.hover} {state.base}-{state.disabled}">{data?data:"TestStateButton"}{state.selected?" is selected":""}{state.hover?\' is hover\':\'\'} ' +
            '<div .states="{state.hover}">Hover state div</div></div>',
        result: {
            root: {
                classes: ['button']
            }
        }
    },
    'ft.OverrideParamsWithStatic': {
        template: '<div class="test-content"><div><ft.TestButton ln="tb"></ft.TestButton></div><div><ft.TestButton ln="cb" .state.my="their" .base="checkbox" .selected="true" .data="Checkbox"></ft.TestButton></div></div>',
        result: {
            tb: {
                classes: ['button'],
                innerHTML: 'Button'
            },
            cb: {
                classes: ['checkbox', 'checkbox-selected', 'their'],
                innerHTML: 'Checkbox is selected'
            }
        }
    },
    'ft.TestGroup': {
        template: '<div><h4>Test group {data.name}</h4><div children.state.my="listTestGroup" ' +
            ' children.selected="{child.data === data.selected}" ' +
            ' children.hover="{child.data === data.hover}" ' +
            ' children.class="ft.TestButton" children.data="{data.items}"></div></div>',
        params: {
            data: { items: [1, 2, 3, 4, 5], selected: 1, hover: 5, name: '5 items' }
        }
    },
    'ft.ChildrenTest': {
        template: '<div>' +
            '<h4>Simple children</h4>' +
            '<div id="children0" ln="cl" children.state.my="list0" ' +
            ' children.selected="{data.selected.indexOf(child.data)>=0}" children.hover="true" ' +
            ' children.class="ft.TestButton" children.data="{data.list0}"></div>' +
            '</div>',
        params: {
            data: { list0: ["a", "b", "c", "d", "e"], selected: ["a", "b", "c"] }
        },
        result: {
            cl: {
                childNodes: 5
            }
        }
    },
    'ft.StateTest': {
        template: '<div><h4>Test state data {data}</h4><div .states="{data}">Showed when data exist.</div></div>',
        params: {
            data: { items: [1, 2, 3, 4, 5], selected: 1, hover: 5, name: '5 items' }
        }
    },
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
                    assert(el.className.indexOf(value) >= 0, 'should has className: ' + value + ' in ' + el.className);
                });
                _.each(def.styles, function (value, key) {
                    assert(el.style[key] === value, 'should has style ' + key + '=' + value);
                });
                if (def.innerHTML)
                    assert.strictEqual(el.innerHTML, def.innerHTML, 'innerHTML must be equal');
                if (def.childNodes)
                    assert.strictEqual(el.children.length, def.childNodes, 'childNodes length must be equal');
            });
        });
        it(key + ': Unrender, skip assert ' + !opts.dispose, function () {
            instance.unrender();
            if (opts.dispose)
                assert(!container.innerHTML, 'should not has content at container');
        });
        it(key + ': Render repeat, skip assert ' + !opts.dispose, function () {
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