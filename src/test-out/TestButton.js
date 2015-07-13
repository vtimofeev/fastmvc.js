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
    var TestButton = (function (_super) {
        __extends(TestButton, _super);
        function TestButton(name, modelOrData, jsTemplate) {
            _super.call(this, name, modelOrData, jsTemplate);
        }
        TestButton.prototype.createDom = function () {
            this.element = this.templateElement;
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        };
        Object.defineProperty(TestButton.prototype, "jsTemplate", {
            get: function () {
                return TestButton.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        TestButton.__jsTemplate = {
            "path": "0",
            "type": "tag",
            "attribs": {
                "className": "TestButton",
                "extend": "fmvc.View",
                "enableStates": "hover,selected,disabled,error,open",
                "class": {
                    "static": ["button"],
                    "dynamic": {
                        "selected": ["button-{selected}"],
                        "disabled": ["button-{disabled}"],
                        "hover": ["button-{hover}"],
                        "error": ["button-{error}"],
                        "open": ["button-{open}"]
                    },
                    "bounds": null
                }
            },
            "staticAttributes": {
                "class": "button"
            },
            "children": [{
                    "path": "0,1",
                    "type": "tag",
                    "attribs": {
                        "states": {
                            "content": "(content==='TheContent')",
                            "vars": ["content", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.getState(\"content\")==='TheContent')"]
                        }
                    },
                    "children": [{
                            "path": "0,1,0",
                            "type": "text",
                            "data": {
                                "content": "{data.content,content,'custom content inline in html'} - test of list vars, text",
                                "result": "{$0} - test of list vars, text",
                                "vars": ["$0"],
                                "expressions": [{
                                        "content": "data.content,content,'custom content inline in html'",
                                        "vars": ["data.content", "content", "'custom content inline in html'"],
                                        "values": ["data.content", "content", "'custom content inline in html'"]
                                    }]
                            },
                            "attribs": {}
                        }],
                    "tagName": "div",
                    "states": {
                        "content": "(content==='TheContent')",
                        "vars": ["content", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.getState(\"content\")==='TheContent')"]
                    }
                }, {
                    "path": "0,3",
                    "type": "tag",
                    "attribs": {
                        "states": {
                            "content": "(state.content2)",
                            "vars": ["state.content2", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.getState(\"content2\"))"]
                        }
                    },
                    "children": [{
                            "path": "0,3,0",
                            "type": "text",
                            "data": "only text without vars",
                            "attribs": {}
                        }],
                    "tagName": "div",
                    "states": {
                        "content": "(state.content2)",
                        "vars": ["state.content2", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.getState(\"content2\"))"]
                    }
                }, {
                    "path": "0,5",
                    "type": "tag",
                    "attribs": {
                        "states": {
                            "content": "(state.content2)",
                            "vars": ["state.content2", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.getState(\"content2\"))"]
                        }
                    },
                    "children": [{
                            "path": "0,5,0",
                            "type": "text",
                            "data": {
                                "content": "{state.content}, {data.content}: content, data.content with text",
                                "result": "{$0}, {$1}: content, data.content with text",
                                "vars": ["$0", "$1"],
                                "expressions": [{
                                        "content": "state.content",
                                        "vars": ["state.content"],
                                        "values": ["state.content"]
                                    }, {
                                        "content": "data.content",
                                        "vars": ["data.content"],
                                        "values": ["data.content"]
                                    }]
                            },
                            "attribs": {}
                        }],
                    "tagName": "div",
                    "states": {
                        "content": "(state.content2)",
                        "vars": ["state.content2", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.getState(\"content2\"))"]
                    }
                }, {
                    "path": "0,7",
                    "type": "tag",
                    "attribs": {
                        "states": {
                            "content": "((state.content2 === 'Default content2' || data.content))",
                            "vars": ["state.content2", "data.content", "$0"],
                            "values": ["$0"],
                            "expressions": ["((this.getState(\"content2\") === 'Default content2' || this.data.content))"]
                        }
                    },
                    "children": [{
                            "path": "0,7,0",
                            "type": "text",
                            "data": {
                                "content": "{data.title} - data.title, data expression (data.title||state.title) {(data.title||state.title)}",
                                "result": "{$0} - data.title, data expression (data.title||state.title) {$1}",
                                "vars": ["$0", "$1"],
                                "expressions": [{
                                        "content": "data.title",
                                        "vars": ["data.title"],
                                        "values": ["data.title"]
                                    }, {
                                        "content": "(data.title||state.title)",
                                        "vars": ["state.title", "data.title", "$0"],
                                        "values": ["$0"],
                                        "expressions": ["(this.data.title||this.getState(\"title\"))"]
                                    }]
                            },
                            "attribs": {}
                        }],
                    "tagName": "div",
                    "states": {
                        "content": "((state.content2 === 'Default content2' || data.content))",
                        "vars": ["state.content2", "data.content", "$0"],
                        "values": ["$0"],
                        "expressions": ["((this.getState(\"content2\") === 'Default content2' || this.data.content))"]
                    }
                }, {
                    "path": "0,9",
                    "type": "tag",
                    "attribs": {},
                    "children": [{
                            "path": "0,9,0",
                            "type": "text",
                            "data": {
                                "content": "{(data.content2||state.content2) as VALUE2, data.content as VALUE|i18n.test} - expression with i18n",
                                "result": "{$0} - expression with i18n",
                                "vars": ["$0"],
                                "expressions": [{
                                        "content": "(data.content2||state.content2) as VALUE2, data.content as VALUE|i18n.test",
                                        "vars": ["state.content2", "data.content2", "data.content"],
                                        "args": {
                                            "VALUE2": "$0",
                                            "VALUE": "data.content"
                                        },
                                        "filters": ["i18n.test"],
                                        "expressions": ["(this.data.content2||this.getState(\"content2\"))"]
                                    }]
                            },
                            "attribs": {}
                        }],
                    "tagName": "div"
                }],
            "dynamicSummary": {
                "selected": {
                    "class": {
                        "0": "button-{selected}"
                    }
                },
                "disabled": {
                    "class": {
                        "0": "button-{disabled}"
                    }
                },
                "hover": {
                    "class": {
                        "0": "button-{hover}"
                    }
                },
                "error": {
                    "class": {
                        "0": "button-{error}"
                    }
                },
                "open": {
                    "class": {
                        "0": "button-{open}"
                    }
                },
                "content": {
                    "states": {
                        "0,1": {
                            "content": "(content==='TheContent')",
                            "vars": ["content", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.getState(\"content\")==='TheContent')"]
                        }
                    },
                    "data": {
                        "0,1,0": {
                            "content": "{data.content,content,'custom content inline in html'} - test of list vars, text",
                            "result": "{$0} - test of list vars, text",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "data.content,content,'custom content inline in html'",
                                    "vars": ["data.content", "content", "'custom content inline in html'"],
                                    "values": ["data.content", "content", "'custom content inline in html'"]
                                }]
                        }
                    }
                },
                "data.content": {
                    "data": {
                        "0,1,0": {
                            "content": "{data.content,content,'custom content inline in html'} - test of list vars, text",
                            "result": "{$0} - test of list vars, text",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "data.content,content,'custom content inline in html'",
                                    "vars": ["data.content", "content", "'custom content inline in html'"],
                                    "values": ["data.content", "content", "'custom content inline in html'"]
                                }]
                        },
                        "0,5,0": {
                            "content": "{state.content}, {data.content}: content, data.content with text",
                            "result": "{$0}, {$1}: content, data.content with text",
                            "vars": ["$0", "$1"],
                            "expressions": [{
                                    "content": "state.content",
                                    "vars": ["state.content"],
                                    "values": ["state.content"]
                                }, {
                                    "content": "data.content",
                                    "vars": ["data.content"],
                                    "values": ["data.content"]
                                }]
                        },
                        "0,9,0": {
                            "content": "{(data.content2||state.content2) as VALUE2, data.content as VALUE|i18n.test} - expression with i18n",
                            "result": "{$0} - expression with i18n",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "(data.content2||state.content2) as VALUE2, data.content as VALUE|i18n.test",
                                    "vars": ["state.content2", "data.content2", "data.content"],
                                    "args": {
                                        "VALUE2": "$0",
                                        "VALUE": "data.content"
                                    },
                                    "filters": ["i18n.test"],
                                    "expressions": ["(this.data.content2||this.getState(\"content2\"))"]
                                }]
                        }
                    },
                    "states": {
                        "0,7": {
                            "content": "((state.content2 === 'Default content2' || data.content))",
                            "vars": ["state.content2", "data.content", "$0"],
                            "values": ["$0"],
                            "expressions": ["((this.getState(\"content2\") === 'Default content2' || this.data.content))"]
                        }
                    }
                },
                "state.content2": {
                    "states": {
                        "0,3": {
                            "content": "(state.content2)",
                            "vars": ["state.content2", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.getState(\"content2\"))"]
                        },
                        "0,5": {
                            "content": "(state.content2)",
                            "vars": ["state.content2", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.getState(\"content2\"))"]
                        },
                        "0,7": {
                            "content": "((state.content2 === 'Default content2' || data.content))",
                            "vars": ["state.content2", "data.content", "$0"],
                            "values": ["$0"],
                            "expressions": ["((this.getState(\"content2\") === 'Default content2' || this.data.content))"]
                        }
                    },
                    "data": {
                        "0,9,0": {
                            "content": "{(data.content2||state.content2) as VALUE2, data.content as VALUE|i18n.test} - expression with i18n",
                            "result": "{$0} - expression with i18n",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "(data.content2||state.content2) as VALUE2, data.content as VALUE|i18n.test",
                                    "vars": ["state.content2", "data.content2", "data.content"],
                                    "args": {
                                        "VALUE2": "$0",
                                        "VALUE": "data.content"
                                    },
                                    "filters": ["i18n.test"],
                                    "expressions": ["(this.data.content2||this.getState(\"content2\"))"]
                                }]
                        }
                    }
                },
                "state.content": {
                    "data": {
                        "0,5,0": {
                            "content": "{state.content}, {data.content}: content, data.content with text",
                            "result": "{$0}, {$1}: content, data.content with text",
                            "vars": ["$0", "$1"],
                            "expressions": [{
                                    "content": "state.content",
                                    "vars": ["state.content"],
                                    "values": ["state.content"]
                                }, {
                                    "content": "data.content",
                                    "vars": ["data.content"],
                                    "values": ["data.content"]
                                }]
                        }
                    }
                },
                "data.title": {
                    "data": {
                        "0,7,0": {
                            "content": "{data.title} - data.title, data expression (data.title||state.title) {(data.title||state.title)}",
                            "result": "{$0} - data.title, data expression (data.title||state.title) {$1}",
                            "vars": ["$0", "$1"],
                            "expressions": [{
                                    "content": "data.title",
                                    "vars": ["data.title"],
                                    "values": ["data.title"]
                                }, {
                                    "content": "(data.title||state.title)",
                                    "vars": ["state.title", "data.title", "$0"],
                                    "values": ["$0"],
                                    "expressions": ["(this.data.title||this.getState(\"title\"))"]
                                }]
                        }
                    }
                },
                "state.title": {
                    "data": {
                        "0,7,0": {
                            "content": "{data.title} - data.title, data expression (data.title||state.title) {(data.title||state.title)}",
                            "result": "{$0} - data.title, data expression (data.title||state.title) {$1}",
                            "vars": ["$0", "$1"],
                            "expressions": [{
                                    "content": "data.title",
                                    "vars": ["data.title"],
                                    "values": ["data.title"]
                                }, {
                                    "content": "(data.title||state.title)",
                                    "vars": ["state.title", "data.title", "$0"],
                                    "values": ["$0"],
                                    "expressions": ["(this.data.title||this.getState(\"title\"))"]
                                }]
                        }
                    }
                },
                "data.content2": {
                    "data": {
                        "0,9,0": {
                            "content": "{(data.content2||state.content2) as VALUE2, data.content as VALUE|i18n.test} - expression with i18n",
                            "result": "{$0} - expression with i18n",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "(data.content2||state.content2) as VALUE2, data.content as VALUE|i18n.test",
                                    "vars": ["state.content2", "data.content2", "data.content"],
                                    "args": {
                                        "VALUE2": "$0",
                                        "VALUE": "data.content"
                                    },
                                    "filters": ["i18n.test"],
                                    "expressions": ["(this.data.content2||this.getState(\"content2\"))"]
                                }]
                        }
                    }
                }
            },
            "tagName": "div",
            "enableStates": ["hover", "selected", "disabled", "error", "open", {
                    "name": "content",
                    "type": "string",
                    "default": ""
                }, {
                    "name": "content2",
                    "type": "string",
                    "default": "Default content2"
                }, {
                    "name": "title",
                    "type": "string",
                    "default": "Default title"
                }, {
                    "name": "counter",
                    "type": "int",
                    "default": 0
                }],
            "extend": "fmvc.View",
            "className": "TestButton",
            "moduleName": "test"
        };
        return TestButton;
    })(fmvc.View);
    test.TestButton = TestButton;
})(test || (test = {}));
//# sourceMappingURL=TestButton.js.map