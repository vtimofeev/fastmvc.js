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
            get: function () {
                return Button.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Button.__jsTemplate = {
            "path": "0",
            "type": "tag",
            "attribs": {
                "className": "Button",
                "extend": "fmvc.View",
                "enableStates": "hover,selected,disabled,error,open",
                "class": {
                    "static": ["button"],
                    "dynamic": {
                        "selected": ["button-{selected}"],
                        "disabled": ["button-{disabled}"],
                        "hover": ["button-{hover}"],
                        "error": ["button-{error}"],
                        "open": ["button-{open}"],
                        "exClass": ["{exClass}"]
                    },
                    "bounds": null
                }
            },
            "staticAttributes": {
                "class": "button"
            },
            "children": [{
                    "path": "0,0",
                    "type": "text",
                    "data": {
                        "content": "{(state.content||data.content)} {exClass}\n",
                        "result": "{$0} {$1}\n",
                        "vars": ["$0", "$1"],
                        "expressions": [{
                                "content": "(state.content||data.content)",
                                "vars": ["state.content", "data.content", "$0"],
                                "values": ["$0"],
                                "expressions": ["(this.getState(\"content\")||this.data.content)"]
                            }, {
                                "content": "exClass",
                                "vars": ["exClass"],
                                "values": ["exClass"]
                            }]
                    },
                    "attribs": {}
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
                "exClass": {
                    "class": {
                        "0": "{exClass}"
                    },
                    "data": {
                        "0,0": {
                            "content": "{(state.content||data.content)} {exClass}\n",
                            "result": "{$0} {$1}\n",
                            "vars": ["$0", "$1"],
                            "expressions": [{
                                    "content": "(state.content||data.content)",
                                    "vars": ["state.content", "data.content", "$0"],
                                    "values": ["$0"],
                                    "expressions": ["(this.getState(\"content\")||this.data.content)"]
                                }, {
                                    "content": "exClass",
                                    "vars": ["exClass"],
                                    "values": ["exClass"]
                                }]
                        }
                    }
                },
                "state.content": {
                    "data": {
                        "0,0": {
                            "content": "{(state.content||data.content)} {exClass}\n",
                            "result": "{$0} {$1}\n",
                            "vars": ["$0", "$1"],
                            "expressions": [{
                                    "content": "(state.content||data.content)",
                                    "vars": ["state.content", "data.content", "$0"],
                                    "values": ["$0"],
                                    "expressions": ["(this.getState(\"content\")||this.data.content)"]
                                }, {
                                    "content": "exClass",
                                    "vars": ["exClass"],
                                    "values": ["exClass"]
                                }]
                        }
                    }
                },
                "data.content": {
                    "data": {
                        "0,0": {
                            "content": "{(state.content||data.content)} {exClass}\n",
                            "result": "{$0} {$1}\n",
                            "vars": ["$0", "$1"],
                            "expressions": [{
                                    "content": "(state.content||data.content)",
                                    "vars": ["state.content", "data.content", "$0"],
                                    "values": ["$0"],
                                    "expressions": ["(this.getState(\"content\")||this.data.content)"]
                                }, {
                                    "content": "exClass",
                                    "vars": ["exClass"],
                                    "values": ["exClass"]
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
                    "name": "exClass",
                    "type": "string",
                    "default": ""
                }],
            "extend": "fmvc.View",
            "className": "Button",
            "css": {
                "content": ".button{display:inline-block;min-width:120px;width:100;background-color:#0a0;color:#fff;font-size:1}.button-hover{background-color:#0f0}.button-selected{font-weight:bold;border-bottom:2px solid #000}.buttonDefault{background-color:#f00}",
                "enabled": false
            }
        };
        return Button;
    })(fmvc.View);
    ui.Button = Button;
})(ui || (ui = {}));
//# sourceMappingURL=Button.js.map