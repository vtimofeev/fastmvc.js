///<reference path='../../src/fmvc/d.ts'/>
/* start object */
module ui {
    export class UserView extends fmvc.View {
        public hellobutton: Element;
        public close2: Element;
        public close: Element;
        constructor(name: string, modelOrData ? : fmvc.Model | any, jsTemplate ? : IDomObject) {
            super(name, modelOrData, jsTemplate);
        }
        createDom() {
            this.element = this.templateElement;
            this.hellobutton = this.elementPaths["0,21"];
            this.close2 = this.elementPaths["0,23"];
            this.close = this.elementPaths["0,25"];
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        }
        /*
        public isDynamicStylesEnabled(value?:boolean):boolean {
             if(_.isBoolean(value)) UserView.__isDynamicStylesEnabled = value;
                return UserView.__isDynamicStylesEnabled;
        }
        private static __isDynamicStylesEnabled:boolean = false;
        */
        public get jsTemplate(): fmvc.IRootDomObject {
            return UserView.__jsTemplate;
        }
        private static __jsTemplate: fmvc.IRootDomObject = {
            "path": "0",
            "type": "tag",
            "staticAttributes": {
                "style": "background-color:blue;color: red;",
                "class": "userview"
            },
            "children": [{
                "path": "0,1",
                "type": "tag",
                "children": [{
                    "path": "0,1,0",
                    "type": "text",
                    "data": {
                        "content": "F: {data.firstname}",
                        "result": "F: {$0}",
                        "vars": ["$0"],
                        "expressions": [{
                            "content": "data.firstname",
                            "vars": ["data.firstname"],
                            "values": ["data.firstname"],
                            "args": {},
                            "filters": [],
                            "expression": []
                        }]
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,3",
                "type": "tag",
                "children": [{
                    "path": "0,3,0",
                    "type": "text",
                    "data": {
                        "content": "S: {data.secondname}",
                        "result": "S: {$0}",
                        "vars": ["$0"],
                        "expressions": [{
                            "content": "data.secondname",
                            "vars": ["data.secondname"],
                            "values": ["data.secondname"],
                            "args": {},
                            "filters": [],
                            "expression": []
                        }]
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,5",
                "type": "tag",
                "children": [{
                    "path": "0,5,0",
                    "type": "text",
                    "data": {
                        "content": "A: {data.age}",
                        "result": "A: {$0}",
                        "vars": ["$0"],
                        "expressions": [{
                            "content": "data.age",
                            "vars": ["data.age"],
                            "values": ["data.age"],
                            "args": {},
                            "filters": [],
                            "expression": []
                        }]
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,7",
                "type": "tag",
                "children": [{
                    "path": "0,7,0",
                    "type": "text",
                    "data": {
                        "content": "{i18n.template}",
                        "result": "{$0}",
                        "vars": ["$0"],
                        "expressions": [{
                            "content": "i18n.template",
                            "vars": ["i18n.template"],
                            "values": ["i18n.template"],
                            "args": {},
                            "filters": [],
                            "expression": []
                        }]
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,9",
                "type": "tag",
                "children": [{
                    "path": "0,9,0",
                    "type": "text",
                    "data": {
                        "content": "{data.firstname|i18n.template}",
                        "result": "{$0}",
                        "vars": ["$0"],
                        "expressions": [{
                            "content": "data.firstname|i18n.template",
                            "vars": ["data.firstname"],
                            "values": ["data.firstname"],
                            "args": {},
                            "filters": ["i18n.template"],
                            "expression": []
                        }]
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,11",
                "type": "tag",
                "children": [{
                    "path": "0,11,0",
                    "type": "text",
                    "data": {
                        "content": "Hello man ! Yo Yo {data.age as AGE, data.firstname as FIRST|i18n.template}",
                        "result": "Hello man ! Yo Yo {$0}",
                        "vars": ["$0"],
                        "expressions": [{
                            "content": "data.age as AGE, data.firstname as FIRST|i18n.template",
                            "vars": ["data.age", "data.firstname"],
                            "values": [],
                            "args": {
                                "AGE": "data.age",
                                "FIRST": "data.firstname"
                            },
                            "filters": ["i18n.template"],
                            "expression": []
                        }]
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,13",
                "type": "tag",
                "children": [{
                    "path": "0,13,0",
                    "type": "text",
                    "data": {
                        "content": "{data.age as AGE, data.firstname as FIRST|i18n.template2}",
                        "result": "{$0}",
                        "vars": ["$0"],
                        "expressions": [{
                            "content": "data.age as AGE, data.firstname as FIRST|i18n.template2",
                            "vars": ["data.age", "data.firstname"],
                            "values": [],
                            "args": {
                                "AGE": "data.age",
                                "FIRST": "data.firstname"
                            },
                            "filters": ["i18n.template2"],
                            "expression": []
                        }]
                    }
                }],
                "handlers": {
                    "mouseover": "overText",
                    "mouseout": "outText"
                },
                "tagName": "div"
            }, {
                "path": "0,15",
                "type": "tag",
                "children": [{
                    "path": "0,15,0",
                    "type": "text",
                    "data": {
                        "content": "The value is {data.value}",
                        "result": "The value is {$0}",
                        "vars": ["$0"],
                        "expressions": [{
                            "content": "data.value",
                            "vars": ["data.value"],
                            "values": ["data.value"],
                            "args": {},
                            "filters": [],
                            "expression": []
                        }]
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,17",
                "type": "tag",
                "children": [{
                    "path": "0,17,0",
                    "type": "text",
                    "data": {
                        "content": "Cooridnates {data.coordinates.x} & {data.coordinates.y}",
                        "result": "Cooridnates {$0} & {$1}",
                        "vars": ["$0", "$1"],
                        "expressions": [{
                            "content": "data.coordinates.x",
                            "vars": ["data.coordinates.x"],
                            "values": ["data.coordinates.x"],
                            "args": {},
                            "filters": [],
                            "expression": []
                        }, {
                            "content": "data.coordinates.y",
                            "vars": ["data.coordinates.y"],
                            "values": ["data.coordinates.y"],
                            "args": {},
                            "filters": [],
                            "expression": []
                        }]
                    }
                }],
                "tagName": "div"
            }, {
                "path": "0,19",
                "type": "tag",
                "handlers": {
                    "change": "set,data.value,{data.value}",
                    "keydown": "changeValueOnKeyUp",
                    "keyup": "changeValueOnKeyDown"
                },
                "bounds": {
                    "value": {
                        "data.value": "{data.value}"
                    }
                },
                "tagName": "input",
                "states": {
                    "content": "selected",
                    "vars": ["selected"],
                    "values": ["selected"],
                    "args": {},
                    "filters": [],
                    "expression": []
                }
            }, {
                "path": "0,21",
                "type": "tag",
                "children": [{
                    "path": "0,21,0",
                    "type": "text",
                    "data": {
                        "content": "{data.firstname|second|first} The Text Of The button\n    ",
                        "result": "{$0} The Text Of The button\n    ",
                        "vars": ["$0"],
                        "expressions": [{
                            "content": "data.firstname|second|first",
                            "vars": ["data.firstname"],
                            "values": ["data.firstname"],
                            "args": {},
                            "filters": ["second", "first"],
                            "expression": []
                        }]
                    }
                }],
                "tagName": "ui.Button"
            }, {
                "path": "0,23",
                "type": "tag",
                "staticAttributes": {
                    "class": "close"
                },
                "children": [{
                    "path": "0,23,1",
                    "type": "text",
                    "data": {
                        "content": "{data.firstname|first} Close Text get from .",
                        "result": "{$0} Close Text get from .",
                        "vars": ["$0"],
                        "expressions": [{
                            "content": "data.firstname|first",
                            "vars": ["data.firstname"],
                            "values": ["data.firstname"],
                            "args": {},
                            "filters": ["first"],
                            "expression": []
                        }]
                    }
                }],
                "tagName": "div",
                "states": {
                    "content": "states",
                    "vars": ["states"],
                    "values": ["states"],
                    "args": {},
                    "filters": [],
                    "expression": []
                }
            }, {
                "path": "0,25",
                "type": "tag",
                "staticAttributes": {
                    "class": "close",
                    "style": "background-color:red"
                },
                "tagName": "div",
                "states": {
                    "content": "app.config.close&&(state==='one'||state==='two'))",
                    "vars": ["state", "app.config.close&&$0)"],
                    "values": ["app.config.close&&$0)"],
                    "args": {},
                    "filters": [],
                    "expression": ["(this.getState(\"state\")==='one'||this.getState(\"state\")==='two')"]
                }
            }, {
                "path": "0,27",
                "type": "tag",
                "tagName": "div",
                "states": {
                    "content": "states",
                    "vars": ["states"],
                    "values": ["states"],
                    "args": {},
                    "filters": [],
                    "expression": []
                }
            }, {
                "path": "0,29",
                "type": "comment",
                "data": " Comment "
            }],
            "links": [{
                "name": "hellobutton",
                "value": "0,21"
            }, {
                "name": "close2",
                "value": "0,23"
            }, {
                "name": "close",
                "value": "0,25"
            }],
            "dynamicSummary": {
                "selected": {
                    "selected": {
                        "0": "{selected}"
                    },
                    "class": {
                        "0": "userview-{selected}"
                    }
                },
                "state.top": {
                    "style": {
                        "0": " top:{state.top}px"
                    }
                },
                "disabled": {
                    "class": {
                        "0": "userview-{disabled}"
                    }
                },
                "hover": {
                    "class": {
                        "0": "userview-{hover}"
                    }
                },
                "data.value": {
                    "value": {
                        "0,19": "{data.value}"
                    }
                }
            },
            "tagName": "div",
            "enableStates": ["hover", "selected", "disabled", {
                "name": "counter",
                "type": "int",
                "default": 0
            }, {
                "name": "top",
                "type": "int",
                "default": 0
            }, {
                "name": "value",
                "type": "int",
                "default": 0
            }, {
                "name": "type",
                "type": "string",
                "default": "none"
            }],
            "extend": "fmvc.View",
            "className": "UserView",
            "i18n": {
                "ru": {
                    "title": "Карточка пользователя",
                    "username": "Завут пацанчика/у {VALUE}",
                    "age": "Уже {VALUE} стукнуло",
                    "balance": "На текущий момент у него/нее {VALUE} бабосов",
                    "template": "Какой то щаблон без всего",
                    "template2": "Шаблон RU. Юзеру {AGE, plural, one {# год} few {# года} many {# лет} other {# лет}} , {FIRST} - FIRST"
                },
                "en": {
                    "title": "The user card",
                    "username": "His/her name is {VALUE}",
                    "age": "She/he is {VALUE} ages",
                    "balance": "She/he has {VALUE, plural, one {# ruble} other {# rubles}"
                }
            },
            "css": {
                "content": ".userview{background-color:#808080;font-size:16px;line-height:24px;display:inline-block;width:200px}.userview-selected{border:1px solid #f00}.userview-hover{font-weight:bold;background-color:#0e90d2 !important;border:1px solid #00f}.userview-disabled{font-color:#f00;text-decoration:underline}",
                "enabled": false
            }
        };
    }
}