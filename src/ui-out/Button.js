var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='../fmvc/d.ts'/>
/* start compiled view */
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
                "className": "Button"
            },
            "staticAttributes": {
                "class": "button"
            },
            "children": [{
                    "path": "0,0",
                    "type": "text",
                    "data": {
                        "content": "\n    {(state.content||data.content)}\n",
                        "result": "\n    {$0}\n",
                        "vars": ["$0"],
                        "expressions": [{
                                "content": "(state.content||data.content)",
                                "vars": ["state.content", "data.content", "$0"],
                                "values": ["$0"],
                                "expressions": ["(this.getState(\"content\")||this.data.content)"]
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
                    }
                },
                "state.content": {
                    "data": {
                        "0,0": {
                            "content": "\n    {(state.content||data.content)}\n",
                            "result": "\n    {$0}\n",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "(state.content||data.content)",
                                    "vars": ["state.content", "data.content", "$0"],
                                    "values": ["$0"],
                                    "expressions": ["(this.getState(\"content\")||this.data.content)"]
                                }]
                        }
                    }
                },
                "data.content": {
                    "data": {
                        "0,0": {
                            "content": "\n    {(state.content||data.content)}\n",
                            "result": "\n    {$0}\n",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "(state.content||data.content)",
                                    "vars": ["state.content", "data.content", "$0"],
                                    "values": ["$0"],
                                    "expressions": ["(this.getState(\"content\")||this.data.content)"]
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
            "moduleName": "ui"
        };
        return Button;
    })(fmvc.View);
    ui.Button = Button;
})(ui || (ui = {}));
//# sourceMappingURL=Button.js.map