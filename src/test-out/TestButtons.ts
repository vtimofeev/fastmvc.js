///<reference path='../d.ts'/>
/* start compiled view */
module test {
    export class TestButtons extends fmvc.View {
        public b1: any;
        public b2: any;
        constructor(name: string, modelOrData ? : fmvc.Model | any, jsTemplate ? : fmvc.IDomObject) {
            super(name, modelOrData, jsTemplate);
        }
        createDom() {
            this.element = this.templateElement;
            this.b1 = this.componentPaths["0,11"] || this.elementPaths["0,11"];
            this.b2 = this.componentPaths["0,13"] || this.elementPaths["0,13"];
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        }
        public get jsTemplate(): fmvc.IRootDomObject {
            return TestButtons.__jsTemplate;
        }
        private static __jsTemplate: fmvc.IRootDomObject = {
            "path": "0",
            "type": "tag",
            "attribs": {
                "class": "containerButtons"
            },
            "staticAttributes": {
                "class": "containerButtons"
            },
            "children": [{
                "path": "0,1",
                "type": "tag",
                "attribs": {},
                "children": [{
                    "path": "0,1,0",
                    "type": "text",
                    "data": "Simple div without anything",
                    "attribs": {}
                }, {
                    "path": "0,1,1",
                    "type": "tag",
                    "attribs": {},
                    "children": [{
                        "path": "0,1,1,0",
                        "type": "text",
                        "data": "ola!",
                        "attribs": {}
                    }],
                    "tagName": "b"
                }],
                "tagName": "div"
            }, {
                "path": "0,3",
                "type": "tag",
                "attribs": {
                    "states": {
                        "content": "(app.test.state==='one')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='one')"]
                    }
                },
                "children": [{
                    "path": "0,3,0",
                    "type": "text",
                    "data": "State one",
                    "attribs": {}
                }],
                "tagName": "div",
                "states": {
                    "content": "(app.test.state==='one')",
                    "vars": ["app.test.state", "$0"],
                    "values": ["$0"],
                    "expressions": ["(this.app.test.state==='one')"]
                }
            }, {
                "path": "0,5",
                "type": "tag",
                "attribs": {
                    "states": {
                        "content": "(app.test.state==='two')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='two')"]
                    }
                },
                "children": [{
                    "path": "0,5,0",
                    "type": "text",
                    "data": "State two button",
                    "attribs": {}
                }],
                "tagName": "ui.Button",
                "states": {
                    "content": "(app.test.state==='two')",
                    "vars": ["app.test.state", "$0"],
                    "values": ["$0"],
                    "expressions": ["(this.app.test.state==='two')"]
                }
            }, {
                "path": "0,7",
                "type": "tag",
                "attribs": {
                    "states": {
                        "content": "(app.test.state==='three')",
                        "vars": ["app.test.state", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.state==='three')"]
                    }
                },
                "children": [{
                    "path": "0,7,0",
                    "type": "text",
                    "data": "State three",
                    "attribs": {}
                }],
                "tagName": "div",
                "states": {
                    "content": "(app.test.state==='three')",
                    "vars": ["app.test.state", "$0"],
                    "values": ["$0"],
                    "expressions": ["(this.app.test.state==='three')"]
                }
            }, {
                "path": "0,9",
                "type": "tag",
                "attribs": {},
                "children": [{
                    "path": "0,9,0",
                    "type": "tag",
                    "attribs": {},
                    "children": [{
                        "path": "0,9,0,0",
                        "type": "text",
                        "data": {
                            "content": "{app.test.state}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                "content": "app.test.state",
                                "vars": ["app.test.state"],
                                "values": ["app.test.state"]
                            }]
                        },
                        "attribs": {}
                    }],
                    "tagName": "b"
                }, {
                    "path": "0,9,1",
                    "type": "text",
                    "data": "- has model data, sure ?",
                    "attribs": {}
                }],
                "tagName": "div"
            }, {
                "path": "0,11",
                "type": "tag",
                "attribs": {
                    "link": "b1",
                    "content": "SimpleButtonContentFromProperty"
                },
                "tagName": "ui.Button",
                "link": "b1"
            }, {
                "path": "0,13",
                "type": "tag",
                "attribs": {
                    "link": "b2",
                    "exClass": "buttonOne"
                },
                "children": [{
                    "path": "0,13,0",
                    "type": "text",
                    "data": "TheContentFromContainer",
                    "attribs": {}
                }],
                "tagName": "ui.Button",
                "link": "b2"
            }],
            "links": [{
                "name": "b1",
                "value": "0,11"
            }, {
                "name": "b2",
                "value": "0,13"
            }],
            "dynamicSummary": {
                "app.test.state": {
                    "states": {
                        "0,3": {
                            "content": "(app.test.state==='one')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='one')"]
                        },
                        "0,5": {
                            "content": "(app.test.state==='two')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='two')"]
                        },
                        "0,7": {
                            "content": "(app.test.state==='three')",
                            "vars": ["app.test.state", "$0"],
                            "values": ["$0"],
                            "expressions": ["(this.app.test.state==='three')"]
                        }
                    },
                    "data": {
                        "0,9,0,0": {
                            "content": "{app.test.state}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                "content": "app.test.state",
                                "vars": ["app.test.state"],
                                "values": ["app.test.state"]
                            }]
                        }
                    }
                }
            },
            "tagName": "div",
            "className": "TestButtons",
            "moduleName": "test",
            "enableStates": [null, null]
        };
    }
}