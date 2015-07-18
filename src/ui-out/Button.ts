///<reference path='../fmvc/d.ts'/>
/* start compiled view */
module ui {
    export class Button extends fmvc.View {
        constructor(name: string, modelOrData ? : fmvc.Model | any, jsTemplate ? : fmvc.IDomObject) {
            super(name, modelOrData, jsTemplate);
        }
        createDom() {
            this.element = this.templateElement;
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        }
        public get jsTemplate(): fmvc.IRootDomObject {
            return Button.__jsTemplate;
        }
        private static __jsTemplate: fmvc.IRootDomObject = {
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
    }
}