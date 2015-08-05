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
    }
}