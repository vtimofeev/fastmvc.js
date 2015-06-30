///<reference path='../../src/fmvc/d.ts'/>
/* start object */
module ui {
    export class Button extends fmvc.View {
        constructor(name: string, modelOrData ? : fmvc.Model | any, jsTemplate ? : any) {
            super(name, modelOrData, jsTemplate);
        }
        createDom() {
            this.element = this.templateElement;
            this.childrenContainer = this.childrenContainer || this.element;
            return this;

        }
        /*
        public isDynamicStylesEnabled(value?:boolean):boolean {
             if(_.isBoolean(value)) Button.__isDynamicStylesEnabled = value;
                return Button.__isDynamicStylesEnabled;
        }
        private static __isDynamicStylesEnabled:boolean = false;
        */
        public get jsTemplate(): fmvc.IRootDomObject {
            return Button.__jsTemplate;
        }

        private static __jsTemplate: fmvc.IRootDomObject = {
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
    }
}