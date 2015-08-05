var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='../fmvc/d.ts'/>
/* start compiled view */
var test;
(function (test) {
    var TestInput = (function (_super) {
        __extends(TestInput, _super);
        function TestInput(name, modelOrData, jsTemplate) {
            _super.call(this, name, modelOrData, jsTemplate);
        }
        TestInput.prototype.createDom = function () {
            this.element = this.templateElement;
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        };
        Object.defineProperty(TestInput.prototype, "jsTemplate", {
            get: function () {
                return TestInput.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        TestInput.__jsTemplate = {
            "path": "0",
            "type": "tag",
            "properties": {},
            "attribs": {},
            "static": {},
            "dynamic": {},
            "children": [{
                    "path": "0,0",
                    "type": "text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }, {
                    "path": "0,1",
                    "type": "tag",
                    "properties": {},
                    "attribs": {
                        "type": "text",
                        "value": {
                            "content": "@{data.firstname}",
                            "result": "@{$0}",
                            "vars": ["$0"],
                            "expressions": ["data.firstname"]
                        },
                        "state.custom": {
                            "content": "Wasa happens {data.firstname}?",
                            "result": "Wasa happens {$0}?",
                            "vars": ["$0"],
                            "expressions": ["data.firstname"]
                        },
                        "placeholder": {
                            "content": "{data.name|i18n.setFirstname}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": ["data.name|i18n.setFirstname"]
                        },
                        "customSetting": "{app.test.state}",
                        "maxlength": "{state.maxlength}"
                    },
                    "static": {},
                    "dynamic": {},
                    "tagName": "input"
                }, {
                    "path": "0,2",
                    "type": "text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }, {
                    "path": "0,3",
                    "type": "tag",
                    "properties": {},
                    "attribs": {
                        "class": {
                            "static": ["div-static"],
                            "dynamic": [{
                                    "content": "div-{state.hover}",
                                    "result": "div-{$0}",
                                    "vars": ["$0"],
                                    "expressions": ["state.hover"]
                                }, {
                                    "content": "div-{data.firstname}",
                                    "result": "div-{$0}",
                                    "vars": ["$0"],
                                    "expressions": ["data.firstname"]
                                }, {
                                    "content": "div-{data.secondname}",
                                    "result": "div-{$0}",
                                    "vars": ["$0"],
                                    "expressions": ["data.secondname"]
                                }]
                        },
                        "style": {
                            "static": [{
                                    "position": "absolute"
                                }, {
                                    "top": "0px"
                                }, {}],
                            "dynamic": [{
                                    "background-color": {
                                        "content": "{data.color}",
                                        "result": "{$0}",
                                        "vars": ["$0"],
                                        "expressions": ["data.color"]
                                    }
                                }]
                        }
                    },
                    "static": {},
                    "dynamic": {},
                    "children": [{
                            "path": "0,3,0",
                            "type": "text",
                            "data": "Data",
                            "properties": {},
                            "attribs": {},
                            "static": {},
                            "dynamic": {}
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,4",
                    "type": "text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }],
            "dynamicSummary": {},
            "tagName": "div",
            "className": "TestInput",
            "moduleName": "test",
            "enableStates": [null, null]
        };
        return TestInput;
    })(fmvc.View);
    test.TestInput = TestInput;
})(test || (test = {}));
//# sourceMappingURL=TestInput.js.map