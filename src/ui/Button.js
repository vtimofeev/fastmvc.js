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
                    "children": [{
                            "path": "0,1,0",
                            "type": "text",
                            "data": {
                                "content": "{data.contentFirst,contentFirst,'custom text'}",
                                "result": "{$0}",
                                "vars": ["$0"],
                                "expressions": [{
                                        "content": "data.contentFirst,contentFirst,'custom text'",
                                        "vars": ["data.contentFirst", "contentFirst", "'custom text'"],
                                        "values": ["data.contentFirst", "contentFirst", "'custom text'"],
                                        "args": {},
                                        "filters": [],
                                        "expression": []
                                    }]
                            }
                        }],
                    "tagName": "div",
                    "states": {
                        "content": "contentFirst",
                        "vars": ["contentFirst"],
                        "values": ["contentFirst"],
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
                    "children": [{
                            "path": "0,3,0",
                            "type": "text",
                            "data": {
                                "content": "{data.contentFirst,contentFirst,'custom text'}",
                                "result": "{$0}",
                                "vars": ["$0"],
                                "expressions": [{
                                        "content": "data.contentFirst,contentFirst,'custom text'",
                                        "vars": ["data.contentFirst", "contentFirst", "'custom text'"],
                                        "values": ["data.contentFirst", "contentFirst", "'custom text'"],
                                        "args": {},
                                        "filters": [],
                                        "expression": []
                                    }]
                            }
                        }],
                    "tagName": "div",
                    "states": {
                        "content": "(contentFirst||contentSecond)",
                        "vars": ["contentSecond", "contentFirst", "$0"],
                        "values": ["$0"],
                        "args": {},
                        "filters": [],
                        "expression": ["(this.getState(\"contentFirst\")||this.getState(\"contentSecond\"))"]
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
                                "content": "{data.title} a button content can be {(data.title||title)}",
                                "result": "{$0} a button content can be {$1}",
                                "vars": ["$0", "$1"],
                                "expressions": [{
                                        "content": "data.title",
                                        "vars": ["data.title"],
                                        "values": ["data.title"],
                                        "args": {},
                                        "filters": [],
                                        "expression": []
                                    }, {
                                        "content": "(data.title||title)",
                                        "vars": ["data.title", "title", "$0"],
                                        "values": ["$0"],
                                        "args": {},
                                        "filters": [],
                                        "expression": ["(this.data.this.getState(\"title\")||this.getState(\"title\"))"]
                                    }]
                            }
                        }],
                    "tagName": "div",
                    "states": {
                        "content": "(data.content1 && (state.content1 === 'pizda' || state.content1 === 'ebatnya'))",
                        "vars": ["state.content1", "data.content1", "$0"],
                        "values": ["$0"],
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
                                "content": "{data.title} a button content can be {(data.title||title)}",
                                "result": "{$0} a button content can be {$1}",
                                "vars": ["$0", "$1"],
                                "expressions": [{
                                        "content": "data.title",
                                        "vars": ["data.title"],
                                        "values": ["data.title"],
                                        "args": {},
                                        "filters": [],
                                        "expression": []
                                    }, {
                                        "content": "(data.title||title)",
                                        "vars": ["data.title", "title", "$0"],
                                        "values": ["$0"],
                                        "args": {},
                                        "filters": [],
                                        "expression": ["(this.data.this.getState(\"title\")||this.getState(\"title\"))"]
                                    }]
                            }
                        }],
                    "tagName": "div",
                    "states": {
                        "content": "(data.content2||state.content2) as VALUE2, data.content3 as VALUE3|i18n.checkValue",
                        "vars": ["state.content2", "data.content2", "data.content3"],
                        "values": [],
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
                                        "content": "{data.title} a button content can be {(data.title||title)}",
                                        "result": "{$0} a button content can be {$1}",
                                        "vars": ["$0", "$1"],
                                        "expressions": [{
                                                "content": "data.title",
                                                "vars": ["data.title"],
                                                "values": ["data.title"],
                                                "args": {},
                                                "filters": [],
                                                "expression": []
                                            }, {
                                                "content": "(data.title||title)",
                                                "vars": ["data.title", "title", "$0"],
                                                "values": ["$0"],
                                                "args": {},
                                                "filters": [],
                                                "expression": ["(this.data.this.getState(\"title\")||this.getState(\"title\"))"]
                                            }]
                                    }
                                }],
                            "tagName": "10||state.content4"
                        }],
                    "tagName": "div",
                    "states": {
                        "content": "states",
                        "vars": ["states"],
                        "values": ["states"],
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