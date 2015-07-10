///<reference path='../../src/fmvc/d.ts'/>
/* start object */
module ui {
    export class TestButtons extends fmvc.View {
        public b1: Element;
        public b2: Element;
        constructor(name: string, modelOrData ? : fmvc.Model | any, jsTemplate ? : fmvc.IDomObject) {
            super(name, modelOrData, jsTemplate);
        }
        createDom() {
            this.element = this.templateElement;
            this.b1 = this.elementPaths["0,5"];
            this.b2 = this.elementPaths["0,7"];
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
                "attribs": {
                    "states": {
                        "content": "(app.test.data.custom%2===0)",
                        "vars": ["app.test.data.custom", "$0"],
                        "values": ["$0"],
                        "expressions": ["(this.app.test.data.custom%2===0)"]
                    }
                },
                "children": [{
                    "path": "0,1,0",
                    "type": "text",
                    "data": {
                        "content": "{app.test.data.custom}",
                        "result": "{$0}",
                        "vars": ["$0"],
                        "expressions": [{
                            "content": "app.test.data.custom",
                            "vars": ["app.test.data.custom"],
                            "values": ["app.test.data.custom"]
                        }]
                    },
                    "attribs": {}
                }],
                "tagName": "div",
                "states": {
                    "content": "(app.test.data.custom%2===0)",
                    "vars": ["app.test.data.custom", "$0"],
                    "values": ["$0"],
                    "expressions": ["(this.app.test.data.custom%2===0)"]
                }
            }, {
                "path": "0,3",
                "type": "tag",
                "attribs": {},
                "children": [{
                    "path": "0,3,0",
                    "type": "text",
                    "data": {
                        "content": "{app.test.state} - has model data, sure ?",
                        "result": "{$0} - has model data, sure ?",
                        "vars": ["$0"],
                        "expressions": [{
                            "content": "app.test.state",
                            "vars": ["app.test.state"],
                            "values": ["app.test.state"]
                        }]
                    },
                    "attribs": {}
                }],
                "tagName": "div"
            }, {
                "path": "0,5",
                "type": "tag",
                "attribs": {
                    "link": "b1",
                    "content": "SimpleButtonContentFromProperty"
                },
                "tagName": "ui.Button"
            }, {
                "path": "0,7",
                "type": "tag",
                "attribs": {
                    "link": "b2",
                    "exClass": "buttonOne"
                },
                "tagName": "ui.Button"
            }],
            "links": [{
                "name": "b1",
                "value": "0,5"
            }, {
                "name": "b2",
                "value": "0,7"
            }],
            "dynamicSummary": {
                "app.test.data.custom": {
                    "data": {
                        "0,1,0": {
                            "content": "{app.test.data.custom}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                "content": "app.test.data.custom",
                                "vars": ["app.test.data.custom"],
                                "values": ["app.test.data.custom"]
                            }]
                        }
                    }
                },
                "app.test.state": {
                    "data": {
                        "0,3,0": {
                            "content": "{app.test.state} - has model data, sure ?",
                            "result": "{$0} - has model data, sure ?",
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
            "enableStates": [null, null]
        };
    }
}