///<reference path='../../src/fmvc/d.ts'/>
/* start object */
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
    }
}