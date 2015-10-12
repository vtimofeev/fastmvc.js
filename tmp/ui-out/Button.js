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
            "properties": {},
            "attribs": {
                "className": "Button",
                "class": {
                    "static": ["button"],
                    "dynamic": [{
                            "content": "button-{selected}",
                            "result": "button-{$0}",
                            "vars": ["$0"],
                            "expressions": ["selected"]
                        }, {
                            "content": "button-{disabled}",
                            "result": "button-{$0}",
                            "vars": ["$0"],
                            "expressions": ["disabled"]
                        }, {
                            "content": "button-{hover}",
                            "result": "button-{$0}",
                            "vars": ["$0"],
                            "expressions": ["hover"]
                        }, {
                            "content": "button-{error}",
                            "result": "button-{$0}",
                            "vars": ["$0"],
                            "expressions": ["error"]
                        }, {
                            "content": "button-{open}",
                            "result": "button-{$0}",
                            "vars": ["$0"],
                            "expressions": ["open"]
                        }, {
                            "content": "{exClass}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": ["exClass"]
                        }]
                }
            },
            "static": {},
            "dynamic": {},
            "children": [{
                    "path": "0,0",
                    "type": "text",
                    "data": {
                        "content": "{(state.content||data)}",
                        "result": "{$0}",
                        "vars": ["$0"],
                        "expressions": [{
                                "content": "(state.content||data)",
                                "vars": ["state.content", "data", "$0"],
                                "values": ["$0"],
                                "expressions": ["(this.getState(\"content\")||this.data)"]
                            }]
                    },
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }],
            "dynamicSummary": {
                "state.content": {
                    "data": {
                        "0,0": {
                            "content": "{(state.content||data)}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "(state.content||data)",
                                    "vars": ["state.content", "data", "$0"],
                                    "values": ["$0"],
                                    "expressions": ["(this.getState(\"content\")||this.data)"]
                                }]
                        }
                    }
                },
                "data": {
                    "data": {
                        "0,0": {
                            "content": "{(state.content||data)}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "(state.content||data)",
                                    "vars": ["state.content", "data", "$0"],
                                    "values": ["$0"],
                                    "expressions": ["(this.getState(\"content\")||this.data)"]
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