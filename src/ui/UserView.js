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
        function UserView(name, $root) {
            _super.call(this, name, $root);
            /* create states */
            this.createStates(["hover", "selected", "disabled"]);
        }
        UserView.prototype.createDom = function () {
            this.element = this.templateElement;
            this.close2 = this.elementPaths["0,23"];
            this.close = this.elementPaths["0,25"];
            this.childrenContainer = this.childrenContainer || this.element;
            return this;
        };
        UserView.prototype.isDynamicStylesEnabled = function (value) {
            if (_.isBoolean(value))
                UserView.__isDynamicStylesEnabled = value;
            return UserView.__isDynamicStylesEnabled;
        };
        Object.defineProperty(UserView.prototype, "i18n", {
            get: function () {
                return this.jsTemplate.i18n ? this.jsTemplate.i18n[this.locale] : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UserView.prototype, "jsTemplate", {
            get: function () {
                return UserView.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        UserView.__isDynamicStylesEnabled = false;
        UserView.__jsTemplate = {
            "path": "0",
            "type": "tag",
            "staticAttributes": [{
                    "name": "style",
                    "value": "background-color:blue;color: red;"
                }, {
                    "name": "class",
                    "value": "userview"
                }],
            "children": [{
                    "path": "0,1",
                    "type": "tag",
                    "children": [{
                            "path": "0,1,0",
                            "type": "text",
                            "data": {
                                "static": null,
                                "dynamic": {
                                    "data.firstname": ["F: {data.firstname}"]
                                },
                                "bounds": null
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
                                "static": null,
                                "dynamic": {
                                    "data.secondname": ["S: {data.secondname}"]
                                },
                                "bounds": null
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
                                "static": null,
                                "dynamic": {
                                    "data.age": ["A: {data.age}"]
                                },
                                "bounds": null
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
                                "static": null,
                                "dynamic": {
                                    "i18n.template": ["{i18n.template}"]
                                },
                                "bounds": null
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
                                "static": null,
                                "dynamic": {
                                    "data.firstname": [{
                                            "args": {
                                                "VALUE": "data.firstname"
                                            },
                                            "filters": [
                                                ["i18n", "template"]
                                            ],
                                            "source": "{replace}"
                                        }]
                                },
                                "bounds": null
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
                                "static": null,
                                "dynamic": {
                                    "data.age": [{
                                            "args": {
                                                "AGE": "data.age",
                                                "FIRST": "data.firstname"
                                            },
                                            "filters": [
                                                ["i18n", "template"]
                                            ],
                                            "source": "Hello man ! Yo Yo {replace}"
                                        }],
                                    "data.firstname": [{
                                            "args": {
                                                "AGE": "data.age",
                                                "FIRST": "data.firstname"
                                            },
                                            "filters": [
                                                ["i18n", "template"]
                                            ],
                                            "source": "Hello man ! Yo Yo {replace}"
                                        }]
                                },
                                "bounds": null
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
                                "static": null,
                                "dynamic": {
                                    "data.age": [{
                                            "args": {
                                                "AGE": "data.age",
                                                "FIRST": "data.firstname"
                                            },
                                            "filters": [
                                                ["i18n", "template2"]
                                            ],
                                            "source": "{replace}"
                                        }],
                                    "data.firstname": [{
                                            "args": {
                                                "AGE": "data.age",
                                                "FIRST": "data.firstname"
                                            },
                                            "filters": [
                                                ["i18n", "template2"]
                                            ],
                                            "source": "{replace}"
                                        }]
                                },
                                "bounds": null
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
                                "static": null,
                                "dynamic": {
                                    "data.value": ["The value is {data.value}"]
                                },
                                "bounds": null
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
                                "static": null,
                                "dynamic": {
                                    "data.coordinates.x": ["Cooridnates {data.coordinates.x} & {data.coordinates.y}"]
                                },
                                "bounds": null
                            }
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,19",
                    "type": "tag",
                    "handlers": {
                        "change": "set,data.value,{data.value}",
                        "keydown": "changeValueOnKeyUp",
                        "keyup": "changeValueOnKeyDown",
                        "click": "stopPropagation"
                    },
                    "bounds": {
                        "value": {
                            "data.value": "{data.value}"
                        }
                    },
                    "tagName": "input",
                    "states": ["selected"]
                }, {
                    "path": "0,21",
                    "type": "tag",
                    "children": [{
                            "path": "0,21,0",
                            "type": "text",
                            "data": {
                                "static": null,
                                "dynamic": {
                                    "data.firstname": [{
                                            "args": {
                                                "VALUE": "data.firstname"
                                            },
                                            "filters": ["second", "first"],
                                            "source": "{replace} The Text Of The button"
                                        }]
                                },
                                "bounds": null
                            }
                        }],
                    "tagName": "ui.Button"
                }, {
                    "path": "0,23",
                    "type": "tag",
                    "staticAttributes": [{
                            "name": "class",
                            "value": "close"
                        }],
                    "children": [{
                            "path": "0,23,0",
                            "type": "text",
                            "data": {
                                "static": null,
                                "dynamic": {
                                    "data.firstname": [{
                                            "args": {
                                                "VALUE": "data.firstname"
                                            },
                                            "filters": ["first"],
                                            "source": "{replace} Close Text get from ."
                                        }]
                                },
                                "bounds": null
                            }
                        }],
                    "tagName": "div",
                    "states": ["selected", ["custom", "one"]]
                }, {
                    "path": "0,25",
                    "type": "tag",
                    "staticAttributes": [{
                            "name": "class",
                            "value": "close"
                        }, {
                            "name": "style",
                            "value": "background-color:red"
                        }],
                    "tagName": "div",
                    "states": ["hover", "touch"]
                }, {
                    "path": "0,27",
                    "type": "comment",
                    "data": " Comment "
                }],
            "links": [{
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
                "top": {
                    "style": {
                        "0": " top:{top}px"
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
                        "0,1,0": "F: {data.firstname}",
                        "0,9,0": {
                            "args": {
                                "VALUE": "data.firstname"
                            },
                            "filters": [
                                ["i18n", "template"]
                            ],
                            "source": "{replace}"
                        },
                        "0,11,0": {
                            "args": {
                                "AGE": "data.age",
                                "FIRST": "data.firstname"
                            },
                            "filters": [
                                ["i18n", "template"]
                            ],
                            "source": "Hello man ! Yo Yo {replace}"
                        },
                        "0,13,0": {
                            "args": {
                                "AGE": "data.age",
                                "FIRST": "data.firstname"
                            },
                            "filters": [
                                ["i18n", "template2"]
                            ],
                            "source": "{replace}"
                        },
                        "0,21,0": {
                            "args": {
                                "VALUE": "data.firstname"
                            },
                            "filters": ["second", "first"],
                            "source": "{replace} The Text Of The button"
                        },
                        "0,23,0": {
                            "args": {
                                "VALUE": "data.firstname"
                            },
                            "filters": ["first"],
                            "source": "{replace} Close Text get from ."
                        }
                    }
                },
                "data.secondname": {
                    "data": {
                        "0,3,0": "S: {data.secondname}"
                    }
                },
                "data.age": {
                    "data": {
                        "0,5,0": "A: {data.age}",
                        "0,11,0": {
                            "args": {
                                "AGE": "data.age",
                                "FIRST": "data.firstname"
                            },
                            "filters": [
                                ["i18n", "template"]
                            ],
                            "source": "Hello man ! Yo Yo {replace}"
                        },
                        "0,13,0": {
                            "args": {
                                "AGE": "data.age",
                                "FIRST": "data.firstname"
                            },
                            "filters": [
                                ["i18n", "template2"]
                            ],
                            "source": "{replace}"
                        }
                    }
                },
                "i18n.template": {
                    "data": {
                        "0,7,0": "{i18n.template}"
                    }
                },
                "data.value": {
                    "data": {
                        "0,15,0": "The value is {data.value}"
                    },
                    "value": {
                        "0,19": "{data.value}"
                    }
                },
                "data.coordinates.x": {
                    "data": {
                        "0,17,0": "Cooridnates {data.coordinates.x} & {data.coordinates.y}"
                    }
                }
            },
            "tagName": "div",
            "extend": "fmvc.View",
            "createStates": ["hover", "selected", "disabled"],
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
            "css": ".userview{background-color:#808080;font-size:16px;line-height:24px;display:inline-block;width:200px}.userview-selected{border:1px solid #f00}.userview-hover{font-weight:bold;background-color:#0e90d2 !important;border:1px solid #00f}.userview-disabled{font-color:#f00;text-decoration:underline}"
        };
        return UserView;
    })(fmvc.View);
    ui.UserView = UserView;
})(ui || (ui = {}));
//# sourceMappingURL=UserView.js.map