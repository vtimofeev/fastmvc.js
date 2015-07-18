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
    var TestButtons = (function (_super) {
        __extends(TestButtons, _super);
        function TestButtons(name, modelOrData, jsTemplate) {
            _super.call(this, name, modelOrData, jsTemplate);
        }
        TestButtons.prototype.createDom = function () {
            this.element = this.templateElement;
            this.b1 = this.componentPaths["0,11"] || this.elementPaths["0,11"];
            this.b2 = this.componentPaths["0,13"] || this.elementPaths["0,13"];
            this.b2 = this.componentPaths["0,15"] || this.elementPaths["0,15"];
            this.b2 = this.componentPaths["0,17"] || this.elementPaths["0,17"];
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
            "attribs": {},
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
                    "attribs": {},
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
                    },
                    "selected": {
                        "content": "(app.test.state)",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state)"]
                    }
                }, {
                    "path": "0,5",
                    "type": "tag",
                    "attribs": {},
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
                    },
                    "selected": {
                        "content": "(!!app.test.state)",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(!!this.app.test.state)"]
                    }
                }, {
                    "path": "0,7",
                    "type": "tag",
                    "attribs": {},
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
                        "content": "SimpleButtonContentFromProperty"
                    },
                    "tagName": "ui.Button",
                    "link": "b1",
                    "selected": {
                        "content": "(app.test.state)",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state)"]
                    }
                }, {
                    "path": "0,13",
                    "type": "tag",
                    "attribs": {
                        "exClass": "buttonOne"
                    },
                    "children": [{
                            "path": "0,13,0",
                            "type": "text",
                            "data": "Selected TheContentFromContainer And Text 2",
                            "attribs": {}
                        }],
                    "tagName": "ui.Button",
                    "link": "b2",
                    "selected": {
                        "content": "(app.test.state==='one')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='one')"]
                    }
                }, {
                    "path": "0,15",
                    "type": "tag",
                    "attribs": {
                        "exClass": "buttonOne"
                    },
                    "children": [{
                            "path": "0,15,0",
                            "type": "text",
                            "data": "Button 3 / And a lot of text",
                            "attribs": {}
                        }],
                    "tagName": "ui.Button",
                    "link": "b2",
                    "selected": {
                        "content": "(app.test.state==='one')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='one')"]
                    }
                }, {
                    "path": "0,17",
                    "type": "tag",
                    "attribs": {
                        "exClass": "buttonOne"
                    },
                    "children": [{
                            "path": "0,17,0",
                            "type": "text",
                            "data": "Button 4 / And a lot of text",
                            "attribs": {}
                        }],
                    "tagName": "ui.Button",
                    "link": "b2",
                    "selected": {
                        "content": "(app.test.state==='one')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='one')"]
                    }
                }],
            "links": [{
                    "name": "b1",
                    "value": "0,11"
                }, {
                    "name": "b2",
                    "value": "0,13"
                }, {
                    "name": "b2",
                    "value": "0,15"
                }, {
                    "name": "b2",
                    "value": "0,17"
                }],
            "dynamicSummary": {
                "app.test.state": {
                    "selected": {
                        "0,3": {
                            "content": "(app.test.state)",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state)"]
                        },
                        "0,5": {
                            "content": "(!!app.test.state)",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(!!this.app.test.state)"]
                        },
                        "0,11": {
                            "content": "(app.test.state)",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state)"]
                        },
                        "0,13": {
                            "content": "(app.test.state==='one')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='one')"]
                        },
                        "0,15": {
                            "content": "(app.test.state==='one')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='one')"]
                        },
                        "0,17": {
                            "content": "(app.test.state==='one')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='one')"]
                        }
                    },
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