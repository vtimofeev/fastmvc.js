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
        function Button(name, $root) {
            _super.call(this, name, $root);
            /* create states */
            this.enableStates(["hover", "selected", "disabled", "error", "open"]);
        }
        Button.prototype.createDom = function () {
            this.element = this.templateElement;
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        };
        Button.prototype.isDynamicStylesEnabled = function (value) {
            if (_.isBoolean(value))
                Button.__isDynamicStylesEnabled = value;
            return Button.__isDynamicStylesEnabled;
        };
        Object.defineProperty(Button.prototype, "i18n", {
            get: function () {
                return this.jsTemplate.i18n ? this.jsTemplate.i18n[this.locale] : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "jsTemplate", {
            get: function () {
                return Button.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Button.__isDynamicStylesEnabled = false;
        Button.__jsTemplate = {
            "path": "0",
            "type": "tag",
            "staticAttributes": [{
                    "name": "class",
                    "value": "button"
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
            "extend": "fmvc.View",
            "enableStates": ["hover", "selected", "disabled", "error", "open"],
            "className": "Button",
            "css": "button{display:inline-block;min-width:120px;width:100;background-color:#000;color:#fff;font-size:1}.button-hover{background-color:#008000}.button-selected{font-weight:bold;border-bottom:2px solid #000}"
        };
        return Button;
    })(fmvc.View);
    ui.Button = Button;
})(ui || (ui = {}));
//# sourceMappingURL=Button.js.map