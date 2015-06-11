///<reference path='../src/fmvc/d.ts'/>
/* start object */

module fui {
    export class UserView extends fmvc.View {

        public close: Element;

        constructor(name: string, $root: any) {
            super(name, $root);
            /* create states */
            this.createStates(["hover", "selected", "disabled"]);
        }

        createDom() {
            this.element = this.templateElement;

            this.close = this.getElementByPath(["0", "4"]);

            this.childrenContainer = this.childrenContainer || this.element;

            this.createElementPathLinks(this.element, this.jsTemplate, true);
        }

        public get dynamicProperties(): {
            [name: string]: {
                [propertyType: string]: {
                    [path: string]: string[]
                }
            }
        } {
            return UserView.__dynamicProperties;
        }

        public isDynamicStylesEnabled(value ? : boolean): boolean {
            if (_.isBoolean(value)) UserView.__isDynamicStylesEnabled = value;
            return UserView.__isDynamicStylesEnabled;
        }

        public get dynamicStyle(): string {
            return UserView.__dynamicStyle;
        }

        public get templateElement(): Element {
            return UserView.__element(); /*.cloneNode(true);*/
        }

        public get jsTemplate(): any {
            return UserView.__jsTemplate;
        }

        private static __isDynamicStylesEnabled: boolean = false;
        private static __dynamicStyle: string = '.userview{background-color:#808080;font-size:16px;line-height:24px;display:inline-block;width:200px}.userview-selected{border:1px solid #f00}.userview-hover{font-weight:bold;background-color:#0e90d2 !important;border:1px solid #00f}.userview-disabled{font-color:#f00;text-decoration:underline}';
        private static __dynamicProperties: {
            [name: string]: {
                [propertyType: string]: {
                    [path: string]: string[]
                }
            }
        } = {
            "selected": {
                "selected": {
                    "0": ["{selected}"]
                },
                "class": {
                    "0": ["userview-{selected}"]
                }
            },
            "top": {
                "style": {
                    "0": ["top:{top}px"]
                }
            },
            "disabled": {
                "class": {
                    "0": ["userview-{disabled}"]
                }
            },
            "hover": {
                "class": {
                    "0": ["userview-{hover}"]
                }
            },
            "data.firstname": {
                "data": {
                    "0,0,0": ["F: {data.firstname}"]
                }
            },
            "data.secondname": {
                "data": {
                    "0,1,0": ["S: {data.secondname}"]
                }
            },
            "data.age": {
                "data": {
                    "0,2,0": ["A: {data.age}"]
                }
            },
            "data.value": {
                "value": {
                    "0,3": ["{data.value}"]
                }
            },
            "closeText": {
                "data": {
                    "0,4,0": ["{closeText}"]
                }
            }
        };
        private static __element: Element = function() {
            return (
                function() {
                    var element = document.createElement('div');

                    element.setAttribute('style', 'background-color:blue;');

                    element.setAttribute('class', 'userview');

                    element.appendChild(
                        function() {
                            var element = document.createElement('div');

                            element.appendChild(
                                function() {
                                    var element = document.createTextNode('[object Object]');

                                    return element;
                                }()

                            );

                            return element;
                        }()

                    );

                    element.appendChild(
                        function() {
                            var element = document.createElement('div');

                            element.appendChild(
                                function() {
                                    var element = document.createTextNode('[object Object]');

                                    return element;
                                }()

                            );

                            return element;
                        }()

                    );

                    element.appendChild(
                        function() {
                            var element = document.createElement('div');

                            element.appendChild(
                                function() {
                                    var element = document.createTextNode('[object Object]');

                                    return element;
                                }()

                            );

                            return element;
                        }()

                    );

                    element.appendChild(
                        function() {
                            var element = document.createElement('input');

                            return element;
                        }()

                    );

                    element.appendChild(
                        document.createComment('0,4')

                    );

                    element.appendChild(
                        function() {
                            var element = document.createComment(' Comment ');

                            return element;
                        }()

                    );

                    return element;
                }()

            )
        };
        private static __jsTemplate: any = {
            "type": "tag",
            "name": "div",
            "attribs": {
                "className": "UserView",
                "extend": "fmvc.View",
                "createStates": "hover,selected,disabled",
                "selected": {
                    "static": null,
                    "dynamic": {
                        "selected": ["{selected}"]
                    }
                },
                "style": {
                    "static": ["background-color:blue", ""],
                    "dynamic": {
                        "top": ["top:{top}px"]
                    }
                },
                "class": {
                    "static": ["userview"],
                    "dynamic": {
                        "selected": ["userview-{selected}"],
                        "disabled": ["userview-{disabled}"],
                        "hover": ["userview-{hover}"]
                    }
                }
            },
            "children": [{
                "type": "tag",
                "name": "div",
                "children": [{
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.firstname": ["F: {data.firstname}"]
                        }
                    },
                    "type": "text",
                    "path": "0,0,0",
                    "isStated": false
                }],
                "path": "0,0",
                "isStated": false
            }, {
                "type": "tag",
                "name": "div",
                "children": [{
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.secondname": ["S: {data.secondname}"]
                        }
                    },
                    "type": "text",
                    "path": "0,1,0",
                    "isStated": false
                }],
                "path": "0,1",
                "isStated": false
            }, {
                "type": "tag",
                "name": "div",
                "children": [{
                    "data": {
                        "static": null,
                        "dynamic": {
                            "data.age": ["A: {data.age}"]
                        }
                    },
                    "type": "text",
                    "path": "0,2,0",
                    "isStated": false
                }],
                "path": "0,2",
                "isStated": false
            }, {
                "type": "tag",
                "name": "input",
                "attribs": {
                    "type": "text",
                    "value": {
                        "static": null,
                        "dynamic": {
                            "data.value": ["{data.value}"]
                        }
                    },
                    "onKeydown": "keydown",
                    "onKeyup": "keyup"
                },
                "path": "0,3",
                "isStated": false
            }, {
                "type": "tag",
                "name": "div",
                "attribs": {
                    "link": "close",
                    "class": "close",
                    "states": "hover,touch",
                    "style": "background-color:red"
                },
                "children": [{
                    "data": {
                        "static": null,
                        "dynamic": {
                            "closeText": ["{closeText}"]
                        }
                    },
                    "type": "text",
                    "path": "0,4,0",
                    "isStated": false
                }],
                "path": "0,4",
                "isStated": true,
                "staticDomAttribs": [{
                    "name": "class",
                    "value": "close"
                }, {
                    "name": "style",
                    "value": "background-color:red"
                }]
            }, {
                "data": " Comment ",
                "type": "comment",
                "path": "0,5",
                "isStated": false
            }],
            "className": "UserView",
            "extend": "fmvc.View",
            "createStatesString": "[\"hover\",\"selected\",\"disabled\"]",
            "path": "0",
            "isStated": false,
            "staticDomAttribs": [{
                "name": "style",
                "value": "background-color:blue;"
            }, {
                "name": "class",
                "value": "userview"
            }]
        };
    }

}