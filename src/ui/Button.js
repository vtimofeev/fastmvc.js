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
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.content": ["{data.content}{content}"],
                            "content": ["{data.content}{content}"]
                        },
                        "bounds": null
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
                "data.content": {
                    "data": {
                        "0,0": "{data.content}{content}"
                    }
                },
                "content": {
                    "data": {
                        "0,0": "{data.content}{content}"
                    }
                }
            },
            "tagName": "div",
            "enableStates": ["hover", "selected", "disabled", "error", "open", {
                    "name": "content",
                    "type": "string",
                    "default": "Default caption"
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