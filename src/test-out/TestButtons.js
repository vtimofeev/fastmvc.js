var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='../d.ts'/>
/* start compiled view */
var test;
(function (test) {
    var TestButtons = (function (_super) {
        __extends(TestButtons, _super);
        function TestButtons(name, modelOrData, jsTemplate) {
            _super.call(this, name, modelOrData, jsTemplate);
        }
        TestButtons.prototype.createDom = function () {
            this.element = this.templateElement;
            this.b1 = this.componentPaths["0,11"] || this.elementPaths["0,11"];
            this.b2 = this.componentPaths["0,13"] || this.elementPaths["0,13"];
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        };
        Object.defineProperty(TestButtons.prototype, "jsTemplate", {
            get: function () {
                return TestButtons.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        TestButtons.__jsTemplate = {
            "path": "0",
            "type": "tag",
            "attribs": {
                "class": "containerButtons"
            },
            "staticAttributes": {
                "class": "containerButtons"
            },
            "children": [{
                    "path": "0,1",
                    "type": "tag",
                    "attribs": {},
                    "children": [{
                            "path": "0,1,0",
                            "type": "text",
                            "data": "Simple div without anything",
                            "attribs": {}
                        }, {
                            "path": "0,1,1",
                            "type": "tag",
                            "attribs": {},
                            "children": [{
                                    "path": "0,1,1,0",
                                    "type": "text",
                                    "data": "ola!",
                                    "attribs": {}
                                }],
                            "tagName": "b"
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,3",
                    "type": "tag",
                    "attribs": {
                        "states": {
                            "content": "(app.test.state==='one')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='one')"]
                        }
                    },
                    "children": [{
                            "path": "0,3,0",
                            "type": "text",
                            "data": "State one",
                            "attribs": {}
                        }],
                    "tagName": "div",
                    "states": {
                        "content": "(app.test.state==='one')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='one')"]
                    }
                }, {
                    "path": "0,5",
                    "type": "tag",
                    "attribs": {
                        "states": {
                            "content": "(app.test.state==='two')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='two')"]
                        }
                    },
                    "children": [{
                            "path": "0,5,0",
                            "type": "text",
                            "data": "State two button",
                            "attribs": {}
                        }],
                    "tagName": "ui.Button",
                    "states": {
                        "content": "(app.test.state==='two')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='two')"]
                    }
                }, {
                    "path": "0,7",
                    "type": "tag",
                    "attribs": {
                        "states": {
                            "content": "(app.test.state==='three')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='three')"]
                        }
                    },
                    "children": [{
                            "path": "0,7,0",
                            "type": "text",
                            "data": "State three",
                            "attribs": {}
                        }],
                    "tagName": "div",
                    "states": {
                        "content": "(app.test.state==='three')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='three')"]
                    }
                }, {
                    "path": "0,9",
                    "type": "tag",
                    "attribs": {},
                    "children": [{
                            "path": "0,9,0",
                            "type": "tag",
                            "attribs": {},
                            "children": [{
                                    "path": "0,9,0,0",
                                    "type": "text",
                                    "data": {
                                        "content": "{app.test.state}",
                                        "result": "{$0}",
                                        "vars": ["$0"],
                                        "expressions": [{
                                                "content": "app.test.state",
                                                "vars": ["app.test.state"],
                                                "values": ["app.test.state"]
                                            }]
                                    },
                                    "attribs": {}
                                }],
                            "tagName": "b"
                        }, {
                            "path": "0,9,1",
                            "type": "text",
                            "data": "- has model data, sure ?",
                            "attribs": {}
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,11",
                    "type": "tag",
                    "attribs": {
                        "link": "b1",
                        "content": "SimpleButtonContentFromProperty"
                    },
                    "tagName": "ui.Button",
                    "link": "b1"
                }, {
                    "path": "0,13",
                    "type": "tag",
                    "attribs": {
                        "link": "b2",
                        "exClass": "buttonOne"
                    },
                    "children": [{
                            "path": "0,13,0",
                            "type": "text",
                            "data": "TheContentFromContainer",
                            "attribs": {}
                        }],
                    "tagName": "ui.Button",
                    "link": "b2"
                }],
            "links": [{
                    "name": "b1",
                    "value": "0,11"
                }, {
                    "name": "b2",
                    "value": "0,13"
                }],
            "dynamicSummary": {
                "app.test.state": {
                    "states": {
                        "0,3": {
                            "content": "(app.test.state==='one')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='one')"]
                        },
                        "0,5": {
                            "content": "(app.test.state==='two')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='two')"]
                        },
                        "0,7": {
                            "content": "(app.test.state==='three')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='three')"]
                        }
                    },
                    "data": {
                        "0,9,0,0": {
                            "content": "{app.test.state}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "app.test.state",
                                    "vars": ["app.test.state"],
                                    "values": ["app.test.state"]
                                }]
                        }
                    }
                }
            },
            "tagName": "div",
            "className": "TestButtons",
            "moduleName": "test",
            "enableStates": [null, null]
        };
        return TestButtons;
    })(fmvc.View);
    test.TestButtons = TestButtons;
})(test || (test = {}));
//# sourceMappingURL=TestButtons.js.map