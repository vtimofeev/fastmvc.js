var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='../../src/fmvc/d.ts'/>
/* start object */
var ui;
(function (ui) {
    var UserView = (function (_super) {
        __extends(UserView, _super);
        function UserView(name, modelOrData, jsTemplate) {
            _super.call(this, name, modelOrData, jsTemplate);
        }
        UserView.prototype.createDom = function () {
            this.element = this.templateElement;
            this.hellobutton = this.elementPaths["0,21"];
            this.close2 = this.elementPaths["0,23"];
            this.close = this.elementPaths["0,25"];
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        };
        Object.defineProperty(UserView.prototype, "jsTemplate", {
            get: function () {
                return UserView.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        UserView.__jsTemplate = {
            "path": "0",
            "type": "tag",
            "attribs": {
                "className": "UserView",
                "extend": "fmvc.View",
                "enableStates": "hover,selected,disabled=true,counter=100",
                "selected": {
                    "static": null,
                    "dynamic": {
                        "selected": ["{selected}"]
                    },
                    "bounds": null
                },
                "style": {
                    "static": ["background-color:blue", "color: red", ""],
                    "dynamic": {
                        "state.top": [" top:{state.top}px"]
                    },
                    "bounds": null
                },
                "class": {
                    "static": ["userview"],
                    "dynamic": {
                        "selected": ["userview-{selected}"],
                        "disabled": ["userview-{disabled}"],
                        "hover": ["userview-{hover}"]
                    },
                    "bounds": null
                },
                "fx": "hover:animation-hover,2s;hover=false:animation-hover-out,2s;{data.online}:animation-online,2s"
            },
            "staticAttributes": {
                "style": "background-color:blue;color: red;",
                "class": "userview"
            },
            "children": [{
                    "path": "0,1",
                    "type": "tag",
                    "attribs": {},
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
                                        "values": ["data.firstname"]
                                    }]
                            },
                            "attribs": {}
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,3",
                    "type": "tag",
                    "attribs": {},
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
                                        "values": ["data.secondname"]
                                    }]
                            },
                            "attribs": {}
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,5",
                    "type": "tag",
                    "attribs": {},
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
                                        "values": ["data.age"]
                                    }]
                            },
                            "attribs": {}
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,7",
                    "type": "tag",
                    "attribs": {},
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
                                        "values": ["i18n.template"]
                                    }]
                            },
                            "attribs": {}
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,9",
                    "type": "tag",
                    "attribs": {},
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
                                        "filters": ["i18n.template"]
                                    }]
                            },
                            "attribs": {}
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,11",
                    "type": "tag",
                    "attribs": {},
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
                                        "args": {
                                            "AGE": "data.age",
                                            "FIRST": "data.firstname"
                                        },
                                        "filters": ["i18n.template"]
                                    }]
                            },
                            "attribs": {}
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,13",
                    "type": "tag",
                    "attribs": {
                        "onmouseover": "overText",
                        "onmouseout": "outText"
                    },
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
                                        "args": {
                                            "AGE": "data.age",
                                            "FIRST": "data.firstname"
                                        },
                                        "filters": ["i18n.template2"]
                                    }]
                            },
                            "attribs": {}
                        }],
                    "handlers": {
                        "mouseover": "overText",
                        "mouseout": "outText"
                    },
                    "tagName": "div"
                }, {
                    "path": "0,15",
                    "type": "tag",
                    "attribs": {},
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
                                        "values": ["data.value"]
                                    }]
                            },
                            "attribs": {}
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,17",
                    "type": "tag",
                    "attribs": {},
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
                                        "values": ["data.coordinates.x"]
                                    }, {
                                        "content": "data.coordinates.y",
                                        "vars": ["data.coordinates.y"],
                                        "values": ["data.coordinates.y"]
                                    }]
                            },
                            "attribs": {}
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,19",
                    "type": "tag",
                    "attribs": {
                        "states": {
                            "content": "selected",
                            "vars": ["selected"],
                            "values": ["selected"]
                        },
                        "type": "text",
                        "value": {
                            "static": null,
                            "dynamic": {
                                "data.value": ["{data.value}"]
                            },
                            "bounds": {
                                "data.value": "{data.value}"
                            }
                        },
                        "onkeydown": "changeValueOnKeyUp",
                        "onkeyup": "changeValueOnKeyDown",
                        "validators": ""
                    },
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
                        "values": ["selected"]
                    }
                }, {
                    "path": "0,21",
                    "type": "tag",
                    "attribs": {
                        "link": "hellobutton",
                        "id": "{c.id}-ui-hellobutton",
                        "enableStates": "hover,selected,disabled",
                        "model": "{model.button}",
                        "base": "hellobutton",
                        "events": "click:helloButtonClick,mouseover:helloButtonOver,mouseout:helloButtonOut",
                        "fx": "hover=true:animation-hover,2s;hover=false:animation-hover-out,2s"
                    },
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
                                        "filters": ["second", "first"]
                                    }]
                            },
                            "attribs": {}
                        }],
                    "tagName": "ui.Button"
                }, {
                    "path": "0,23",
                    "type": "tag",
                    "attribs": {
                        "link": "close2",
                        "class": "close",
                        "states": {
                            "content": "states",
                            "vars": ["states"],
                            "values": ["states"]
                        },
                        "selected,custom": "==",
                        "one": "one",
                        ",counter": ",counter"
                    },
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
                                        "filters": ["first"]
                                    }]
                            },
                            "attribs": {}
                        }],
                    "tagName": "div",
                    "states": {
                        "content": "states",
                        "vars": ["states"],
                        "values": ["states"]
                    }
                }, {
                    "path": "0,25",
                    "type": "tag",
                    "attribs": {
                        "link": "close",
                        "class": "close",
                        "states": {
                            "content": "app.config.close&&(state==='one'||state==='two'))",
                            "vars": ["state", "app.config.close&&$0)"],
                            "values": ["app.config.close&&$0)"],
                            "expressions": ["(this.getState(\"state\")==='one'||this.getState(\"state\")==='two')"]
                        },
                        "style": "background-color:red"
                    },
                    "staticAttributes": {
                        "class": "close",
                        "style": "background-color:red"
                    },
                    "tagName": "div",
                    "states": {
                        "content": "app.config.close&&(state==='one'||state==='two'))",
                        "vars": ["state", "app.config.close&&$0)"],
                        "values": ["app.config.close&&$0)"],
                        "expressions": ["(this.getState(\"state\")==='one'||this.getState(\"state\")==='two')"]
                    }
                }, {
                    "path": "0,27",
                    "type": "tag",
                    "attribs": {
                        "id": "{id}-ui-view",
                        "states": {
                            "content": "states",
                            "vars": ["states"],
                            "values": ["states"]
                        },
                        "{(hellobutton.hover": "true||counter"
                    },
                    "tagName": "div",
                    "states": {
                        "content": "states",
                        "vars": ["states"],
                        "values": ["states"]
                    }
                }, {
                    "path": "0,29",
                    "type": "comment",
                    "data": " Comment ",
                    "attribs": {}
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
                "data.firstname": {
                    "data": {
                        "0,1,0": {
                            "content": "F: {data.firstname}",
                            "result": "F: {$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "data.firstname",
                                    "vars": ["data.firstname"],
                                    "values": ["data.firstname"]
                                }]
                        },
                        "0,9,0": {
                            "content": "{data.firstname|i18n.template}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "data.firstname|i18n.template",
                                    "vars": ["data.firstname"],
                                    "values": ["data.firstname"],
                                    "filters": ["i18n.template"]
                                }]
                        },
                        "0,11,0": {
                            "content": "Hello man ! Yo Yo {data.age as AGE, data.firstname as FIRST|i18n.template}",
                            "result": "Hello man ! Yo Yo {$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "data.age as AGE, data.firstname as FIRST|i18n.template",
                                    "vars": ["data.age", "data.firstname"],
                                    "args": {
                                        "AGE": "data.age",
                                        "FIRST": "data.firstname"
                                    },
                                    "filters": ["i18n.template"]
                                }]
                        },
                        "0,13,0": {
                            "content": "{data.age as AGE, data.firstname as FIRST|i18n.template2}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "data.age as AGE, data.firstname as FIRST|i18n.template2",
                                    "vars": ["data.age", "data.firstname"],
                                    "args": {
                                        "AGE": "data.age",
                                        "FIRST": "data.firstname"
                                    },
                                    "filters": ["i18n.template2"]
                                }]
                        },
                        "0,21,0": {
                            "content": "{data.firstname|second|first} The Text Of The button\n    ",
                            "result": "{$0} The Text Of The button\n    ",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "data.firstname|second|first",
                                    "vars": ["data.firstname"],
                                    "values": ["data.firstname"],
                                    "filters": ["second", "first"]
                                }]
                        },
                        "0,23,1": {
                            "content": "{data.firstname|first} Close Text get from .",
                            "result": "{$0} Close Text get from .",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "data.firstname|first",
                                    "vars": ["data.firstname"],
                                    "values": ["data.firstname"],
                                    "filters": ["first"]
                                }]
                        }
                    }
                },
                "data.secondname": {
                    "data": {
                        "0,3,0": {
                            "content": "S: {data.secondname}",
                            "result": "S: {$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "data.secondname",
                                    "vars": ["data.secondname"],
                                    "values": ["data.secondname"]
                                }]
                        }
                    }
                },
                "data.age": {
                    "data": {
                        "0,5,0": {
                            "content": "A: {data.age}",
                            "result": "A: {$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "data.age",
                                    "vars": ["data.age"],
                                    "values": ["data.age"]
                                }]
                        },
                        "0,11,0": {
                            "content": "Hello man ! Yo Yo {data.age as AGE, data.firstname as FIRST|i18n.template}",
                            "result": "Hello man ! Yo Yo {$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "data.age as AGE, data.firstname as FIRST|i18n.template",
                                    "vars": ["data.age", "data.firstname"],
                                    "args": {
                                        "AGE": "data.age",
                                        "FIRST": "data.firstname"
                                    },
                                    "filters": ["i18n.template"]
                                }]
                        },
                        "0,13,0": {
                            "content": "{data.age as AGE, data.firstname as FIRST|i18n.template2}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "data.age as AGE, data.firstname as FIRST|i18n.template2",
                                    "vars": ["data.age", "data.firstname"],
                                    "args": {
                                        "AGE": "data.age",
                                        "FIRST": "data.firstname"
                                    },
                                    "filters": ["i18n.template2"]
                                }]
                        }
                    }
                },
                "i18n.template": {
                    "data": {
                        "0,7,0": {
                            "content": "{i18n.template}",
                            "result": "{$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "i18n.template",
                                    "vars": ["i18n.template"],
                                    "values": ["i18n.template"]
                                }]
                        }
                    }
                },
                "data.value": {
                    "data": {
                        "0,15,0": {
                            "content": "The value is {data.value}",
                            "result": "The value is {$0}",
                            "vars": ["$0"],
                            "expressions": [{
                                    "content": "data.value",
                                    "vars": ["data.value"],
                                    "values": ["data.value"]
                                }]
                        }
                    },
                    "value": {
                        "0,19": "{data.value}"
                    }
                },
                "data.coordinates.x": {
                    "data": {
                        "0,17,0": {
                            "content": "Cooridnates {data.coordinates.x} & {data.coordinates.y}",
                            "result": "Cooridnates {$0} & {$1}",
                            "vars": ["$0", "$1"],
                            "expressions": [{
                                    "content": "data.coordinates.x",
                                    "vars": ["data.coordinates.x"],
                                    "values": ["data.coordinates.x"]
                                }, {
                                    "content": "data.coordinates.y",
                                    "vars": ["data.coordinates.y"],
                                    "values": ["data.coordinates.y"]
                                }]
                        }
                    }
                },
                "data.coordinates.y": {
                    "data": {
                        "0,17,0": {
                            "content": "Cooridnates {data.coordinates.x} & {data.coordinates.y}",
                            "result": "Cooridnates {$0} & {$1}",
                            "vars": ["$0", "$1"],
                            "expressions": [{
                                    "content": "data.coordinates.x",
                                    "vars": ["data.coordinates.x"],
                                    "values": ["data.coordinates.x"]
                                }, {
                                    "content": "data.coordinates.y",
                                    "vars": ["data.coordinates.y"],
                                    "values": ["data.coordinates.y"]
                                }]
                        }
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
        return UserView;
    })(fmvc.View);
    ui.UserView = UserView;
})(ui || (ui = {}));
//# sourceMappingURL=UserView.js.map