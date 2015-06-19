///<reference path='../../src/fmvc/d.ts'/>
/* start object */
module ui {
    export class Button extends fmvc.View {
        constructor(name: string, $root: any) {
            super(name, $root);
            /* create states */
            this.createStates(["hover", "selected", "disabled", "error", "open"]);
        }
        createDom() {
            this.element = this.templateElement;
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        }
        public isDynamicStylesEnabled(value ? : boolean): boolean {
            if (_.isBoolean(value)) Button.__isDynamicStylesEnabled = value;
            return Button.__isDynamicStylesEnabled;
        }
        public get i18n(): any {
            return this.jsTemplate.i18n ? this.jsTemplate.i18n[this.locale] : null;
        }
        public get jsTemplate(): fmvc.IRootDomObject {
            return Button.__jsTemplate;
        }
        private static __isDynamicStylesEnabled: boolean = false;
        private static __jsTemplate: fmvc.IRootDomObject = {
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
            "createStates": ["hover", "selected", "disabled", "error", "open"],
            "className": "Button",
            "css": "button{display:inline-block;min-width:120px;width:100;background-color:#000;color:#fff;font-size:1}.button-hover{background-color:#008000}.button-selected{font-weight:bold;border-bottom:2px solid #000}"
        };
    }
}