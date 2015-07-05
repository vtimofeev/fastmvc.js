var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='../../src/fmvc/d.ts'/>
/* start object */
var ui;
(function (ui) {
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(name, modelOrData, jsTemplate) {
            _super.call(this, name, modelOrData, jsTemplate);
        }
        Button.prototype.createDom = function () {
            this.element = this.templateElement;
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        };
        Object.defineProperty(Button.prototype, "jsTemplate", {
            /*
            public isDynamicStylesEnabled(value?:boolean):boolean {
                 if(_.isBoolean(value)) Button.__isDynamicStylesEnabled = value;
                    return Button.__isDynamicStylesEnabled;
            }
            private static __isDynamicStylesEnabled:boolean = false;
            */
            get: function () {
                return Button.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Button.__jsTemplate = {
            "path": "0",
            "type": "tag",
            "staticAttributes": {
                "class": "button"
            },
            "children": [{
                    "path": "0,0",
                    "type": "text",
                    "data": "\n     "
                }, {
                    "path": "0,1",
                    "type": "tag",
                    "tagName": "div",
                    "states": {
                        "start": "content00",
                        "values": ["content00"],
                        "vars": ["content00"],
                        "args": {},
                        "filters": [],
                        "expression": []
                    }
                }, {
                    "path": "0,2",
                    "type": "text",
                    "data": "\n     "
                }, {
                    "path": "0,3",
                    "type": "tag",
                    "staticAttributes": {
                        "class": "content content-{(!!(content))}"
                    },
                    "tagName": "div",
                    "states": {
                        "start": "data.content0,content0",
                        "values": ["data.content0", "content0"],
                        "vars": ["data.content0", "content0"],
                        "args": {},
                        "filters": [],
                        "expression": []
                    }
                }, {
                    "path": "0,4",
                    "type": "text",
                    "data": "\n     "
                }, {
                    "path": "0,5",
                    "type": "tag",
                    "children": [{
                            "path": "0,5,0",
                            "type": "text",
                            "data": {
                                "static": null,
                                "dynamic": {
                                    "data.title": ["{data.title} a button content can be {(data.title||title)}"],
                                    "(data.title": [{
                                            "args": {
                                                "VALUE": "(data.title"
                                            },
                                            "filters": ["", "title)"],
                                            "source": "{replace} a button content can be {(data.title||title)}"
                                        }]
                                },
                                "bounds": null
                            }
                        }],
                    "tagName": "div",
                    "states": {
                        "start": "(data.content1 && (state.content1 === 'pizda' || state.content1 === 'ebatnya'))",
                        "values": ["$0"],
                        "vars": ["state.content1", "data.content1", "$0"],
                        "args": {},
                        "filters": [],
                        "expression": ["(this.data.content1 && (this.getState(\"content1\") === 'pizda' || this.getState(\"content1\") === 'ebatnya'))"]
                    }
                }, {
                    "path": "0,6",
                    "type": "text",
                    "data": "\n     "
                }, {
                    "path": "0,7",
                    "type": "tag",
                    "children": [{
                            "path": "0,7,0",
                            "type": "text",
                            "data": {
                                "static": null,
                                "dynamic": {
                                    "data.title": ["{data.title} a button content can be {(data.title||title)}"],
                                    "(data.title": [{
                                            "args": {
                                                "VALUE": "(data.title"
                                            },
                                            "filters": ["", "title)"],
                                            "source": "{replace} a button content can be {(data.title||title)}"
                                        }]
                                },
                                "bounds": null
                            }
                        }],
                    "tagName": "div",
                    "states": {
                        "start": "(data.content2||state.content2) as VALUE2, data.content3 as VALUE3|i18n.checkValue",
                        "values": ["state.content2", "data.content2", "$0", "data.content3"],
                        "vars": ["state.content2", "data.content2"],
                        "args": {
                            "VALUE2": "$0",
                            "VALUE3": "data.content3"
                        },
                        "filters": ["i18n.checkValue"],
                        "expression": ["(this.data.content2||this.getState(\"content2\"))"]
                    }
                }, {
                    "path": "0,8",
                    "type": "text",
                    "data": "\n     "
                }, {
                    "path": "0,9",
                    "type": "tag",
                    "children": [{
                            "path": "0,9,0",
                            "type": "tag",
                            "children": [{
                                    "path": "0,9,0,1",
                                    "type": "text",
                                    "data": {
                                        "static": null,
                                        "dynamic": {
                                            "data.title": ["{data.title} a button content can be {(data.title||title)}"],
                                            "(data.title": [{
                                                    "args": {
                                                        "VALUE": "(data.title"
                                                    },
                                                    "filters": ["", "title)"],
                                                    "source": "{replace} a button content can be {(data.title||title)}"
                                                }]
                                        },
                                        "bounds": null
                                    }
                                }],
                            "tagName": "10||state.content4"
                        }],
                    "tagName": "div",
                    "states": {
                        "start": "states",
                        "values": ["states"],
                        "vars": ["states"],
                        "args": {},
                        "filters": [],
                        "expression": []
                    }
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
                "data.title": {
                    "data": {
                        "0,5,0": "{data.title} a button content can be {(data.title||title)}",
                        "0,7,0": "{data.title} a button content can be {(data.title||title)}",
                        "0,9,0,1": "{data.title} a button content can be {(data.title||title)}"
                    }
                },
                "(data.title": {
                    "data": {
                        "0,5,0": {
                            "args": {
                                "VALUE": "(data.title"
                            },
                            "filters": ["", "title)"],
                            "source": "{replace} a button content can be {(data.title||title)}"
                        },
                        "0,7,0": {
                            "args": {
                                "VALUE": "(data.title"
                            },
                            "filters": ["", "title)"],
                            "source": "{replace} a button content can be {(data.title||title)}"
                        },
                        "0,9,0,1": {
                            "args": {
                                "VALUE": "(data.title"
                            },
                            "filters": ["", "title)"],
                            "source": "{replace} a button content can be {(data.title||title)}"
                        }
                    }
                }
            },
            "tagName": "div",
            "enableStates": ["hover", "selected", "disabled", "error", "open", {
                    "name": "content",
                    "type": "string",
                    "default": "Default caption"
                }, {
                    "name": "title",
                    "type": "string",
                    "default": "Can be also a content"
                }],
            "extend": "fmvc.View",
            "className": "Button",
            "css": {
                "content": ".button{display:inline-block;min-width:120px;width:100;background-color:#0a0;color:#fff;font-size:1}.button-hover{background-color:#0f0}.button-selected{font-weight:bold;border-bottom:2px solid #000}",
                "enabled": false
            }
        };
        return Button;
    })(fmvc.View);
    ui.Button = Button;
})(ui || (ui = {}));
//# sourceMappingURL=Button.js.map