///<reference path='../fmvc/d.ts'/>
/* start compiled view */
module c: \Winginx\ home\ js.ru\ public_html\ fastmvc.js\ src\ test {
    export class TestButtons extends fmvc.View {
        public b1: any;
        public b2: any;
        public b3: any;
        public b4: any;
        constructor(name: string, modelOrData ? : fmvc.Model | any, jsTemplate ? : fmvc.IDomObject) {
            super(name, modelOrData, jsTemplate);
        }
        createDom() {
            this.element = this.templateElement;
            this.b1 = this.componentPaths["0,11"] || this.elementPaths["0,11"];
            this.b2 = this.componentPaths["0,13"] || this.elementPaths["0,13"];
            this.b3 = this.componentPaths["0,15"] || this.elementPaths["0,15"];
            this.b4 = this.componentPaths["0,17"] || this.elementPaths["0,17"];
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        }
        public get jsTemplate(): fmvc.IRootDomObject {
            return TestButtons.__jsTemplate;
        }
        private static __jsTemplate: fmvc.IRootDomObject = {
            "path": "0",
            "type": "tag",
            "properties": {},
            "attribs": {
                "class": {
                    "static": ["containerButtons"],
                    "dynamic": []
                }
            },
            "static": {},
            "dynamic": {},
            "children": [{
                "path": "0,0",
                "type": "text",
                "properties": {},
                "attribs": {},
                "static": {},
                "dynamic": {}
            }, {
                "path": "0,1",
                "type": "tag",
                "properties": {},
                "attribs": {},
                "static": {},
                "dynamic": {},
                "children": [{
                    "path": "0,1,0",
                    "type": "text",
                    "data": "Simple div without anything",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }, {
                    "path": "0,1,1",
                    "type": "tag",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {},
                    "children": [{
                        "path": "0,1,1,0",
                        "type": "text",
                        "data": "ola!",
                        "properties": {},
                        "attribs": {},
                        "static": {},
                        "dynamic": {}
                    }],
                    "tagName": "b"
                }],
                "tagName": "div"
            }, {
                "path": "0,2",
                "type": "text",
                "properties": {},
                "attribs": {},
                "static": {},
                "dynamic": {}
            }, {
                "path": "0,3",
                "type": "tag",
                "properties": {},
                "attribs": {},
                "static": {},
                "dynamic": {},
                "children": [{
                    "path": "0,3,0",
                    "type": "text",
                    "data": "State one",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }],
                "tagName": "div",
                "states": {
                    "content": "(app.test.state==='one')",
                    "vars": ["app.test.state", "$0"],
                    "values": ["$0"],
                    "expressions": ["(this.app.test.state==='one')"]
                },
                "selected": "(app.test.state)"
            }, {
                "path": "0,4",
                "type": "text",
                "properties": {},
                "attribs": {},
                "static": {},
                "dynamic": {}
            }, {
                "path": "0,5",
                "type": "tag",
                "properties": {},
                "attribs": {},
                "static": {},
                "dynamic": {},
                "children": [{
                    "path": "0,5,0",
                    "type": "text",
                    "data": "State two button",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }],
                "tagName": "ui.Button",
                "states": {
                    "content": "(app.test.state==='two')",
                    "vars": ["app.test.state", "$0"],
                    "values": ["$0"],
                    "expressions": ["(this.app.test.state==='two')"]
                },
                "selected": "(!!app.test.state)"
            }, {
                "path": "0,6",
                "type": "text",
                "properties": {},
                "attribs": {},
                "static": {},
                "dynamic": {}
            }, {
                "path": "0,7",
                "type": "tag",
                "properties": {},
                "attribs": {},
                "static": {},
                "dynamic": {},
                "children": [{
                    "path": "0,7,0",
                    "type": "text",
                    "data": "State three",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }],
                "tagName": "div",
                "states": {
                    "content": "(app.test.state==='three')",
                    "vars": ["app.test.state", "$0"],
                    "values": ["$0"],
                    "expressions": ["(this.app.test.state==='three')"]
                }
            }, {
                "path": "0,8",
                "type": "text",
                "properties": {},
                "attribs": {},
                "static": {},
                "dynamic": {}
            }, {
                "path": "0,9",
                "type": "tag",
                "properties": {},
                "attribs": {},
                "static": {},
                "dynamic": {},
                "children": [{
                    "path": "0,9,0",
                    "type": "tag",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {},
                    "children": [{
                        "path": "0,9,0,0",
                        "type": "text",
                        "data": {
                            "content": "{app.test.state}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": ["app.test.state"]
                        },
                        "properties": {},
                        "attribs": {},
                        "static": {},
                        "dynamic": {}
                    }],
                    "tagName": "b"
                }, {
                    "path": "0,9,1",
                    "type": "text",
                    "data": "- has model data, sure ?",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }],
                "tagName": "div"
            }, {
                "path": "0,10",
                "type": "text",
                "properties": {},
                "attribs": {},
                "static": {},
                "dynamic": {}
            }, {
                "path": "0,11",
                "type": "tag",
                "properties": {},
                "attribs": {
                    "content": "SimpleButtonContentFromProperty"
                },
                "static": {},
                "dynamic": {},
                "tagName": "ui.Button",
                "link": "b1",
                "selected": "(app.test.state)"
            }, {
                "path": "0,12",
                "type": "text",
                "properties": {},
                "attribs": {},
                "static": {},
                "dynamic": {}
            }, {
                "path": "0,13",
                "type": "tag",
                "properties": {},
                "attribs": {
                    "hover": "(data.hover)",
                    "exClass": "buttonOne"
                },
                "static": {},
                "dynamic": {},
                "children": [{
                    "path": "0,13,0",
                    "type": "text",
                    "data": "Selected TheContentFromContainer And Text 2",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }],
                "tagName": "ui.Button",
                "link": "b2",
                "selected": "(app.test.state==='one')"
            }, {
                "path": "0,14",
                "type": "text",
                "properties": {},
                "attribs": {},
                "static": {},
                "dynamic": {}
            }, {
                "path": "0,15",
                "type": "tag",
                "properties": {},
                "attribs": {
                    "exClass": "buttonOne"
                },
                "static": {},
                "dynamic": {},
                "children": [{
                    "path": "0,15,0",
                    "type": "text",
                    "data": "Button 3 / And a lot of text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }],
                "tagName": "ui.Button",
                "link": "b3",
                "selected": "(app.test.state==='one')"
            }, {
                "path": "0,16",
                "type": "text",
                "properties": {},
                "attribs": {},
                "static": {},
                "dynamic": {}
            }, {
                "path": "0,17",
                "type": "tag",
                "properties": {},
                "attribs": {
                    "exClass": "buttonOne"
                },
                "static": {},
                "dynamic": {},
                "children": [{
                    "path": "0,17,0",
                    "type": "text",
                    "data": "Button 4 / And a lot of text",
                    "properties": {},
                    "attribs": {},
                    "static": {},
                    "dynamic": {}
                }],
                "tagName": "ui.Button",
                "link": "b4",
                "selected": "(app.test.state==='one')"
            }, {
                "path": "0,18",
                "type": "text",
                "properties": {},
                "attribs": {},
                "static": {},
                "dynamic": {}
            }],
            "links": [{
                "name": "b1",
                "value": "0,11"
            }, {
                "name": "b2",
                "value": "0,13"
            }, {
                "name": "b3",
                "value": "0,15"
            }, {
                "name": "b4",
                "value": "0,17"
            }],
            "dynamicSummary": {},
            "tagName": "div",
            "className": "TestButtons",
            "moduleName": "c:\\Winginx\\home\\js.ru\\public_html\\fastmvc.js\\src\\test",
            "enableStates": [null, null]
        };
    }
}