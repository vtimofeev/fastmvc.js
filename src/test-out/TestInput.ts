///<reference path='../fmvc/d.ts'/>
/* start compiled view */
module test {
    export class TestInput extends fmvc.View {
        constructor(name: string, modelOrData ? : fmvc.Model | any, jsTemplate ? : fmvc.IDomObject) {
            super(name, modelOrData, jsTemplate);
        }
        createDom() {
            this.element = this.templateElement;
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        }
        public get jsTemplate(): fmvc.IRootDomObject {
            return TestInput.__jsTemplate;
        }
        private static __jsTemplate: fmvc.IRootDomObject = {
            "path": "0",
            "type": "tag",
            "attribs": {},
            "children": [{
                "path": "0,1",
                "type": "tag",
                "attribs": {
                    "type": "text",
                    "value": {
                        "static": null,
                        "dynamic": {
                            "data.firstname": ["@{data.firstname}"]
                        },
                        "bounds": null
                    },
                    "state.custom": "Wasa happens {data.firstname}?",
                    "placeholder": "{data.name|i18n.setFirstname}",
                    "customSetting": "{app.test.state}",
                    "maxlength": "{state.maxlength}"
                },
                "tagName": "input"
            }, {
                "path": "0,3",
                "type": "tag",
                "attribs": {},
                "staticAttributes": {
                    "class": "div-static",
                    "style": " position: absolute; top: 0px;"
                },
                "children": [{
                    "path": "0,3,0",
                    "type": "text",
                    "data": "Data",
                    "attribs": {}
                }],
                "tagName": "div"
            }],
            "dynamicSummary": {
                "data.firstname": {
                    "value": {
                        "0,1": "@{data.firstname}"
                    },
                    "class": {
                        "0,3": "div-{data.firstname}"
                    }
                },
                "state.hover": {
                    "class": {
                        "0,3": "div-{state.hover}"
                    }
                },
                "data.secondname": {
                    "class": {
                        "0,3": "div-{data.secondname}"
                    }
                },
                "data.color": {
                    "style": {
                        "0,3": "background-color: {data.color}"
                    }
                }
            },
            "tagName": "div",
            "className": "TestInput",
            "moduleName": "test",
            "enableStates": [null, null]
        };
    }
}