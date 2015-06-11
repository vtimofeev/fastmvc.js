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
            this.close = this.elementPaths["0,9"];
            this.childrenContainer = this.childrenContainer || this.element;
        };
        UserView.prototype.isDynamicStylesEnabled = function (value) {
            if (_.isBoolean(value))
                UserView.__isDynamicStylesEnabled = value;
            return UserView.__isDynamicStylesEnabled;
        };
        Object.defineProperty(UserView.prototype, "jsTemplate", {
            get: function () {
                return UserView.__jsTemplate;
            },
            enumerable: true,
            configurable: true
        });
        UserView.__isDynamicStylesEnabled = false;
        UserView.__jsTemplate = {
            "path": 0,
            "type": "tag",
            "staticAttributes": [{
                    "name": "style",
                    "value": "background-color:blue "
                }, {
                    "name": "class",
                    "value": "userview"
                }],
            "children": [{
                    "path": "0,0",
                    "type": "text"
                }, {
                    "path": "0,1",
                    "type": "tag",
                    "children": [{
                            "path": "0,1,0",
                            "type": "text"
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,2",
                    "type": "text"
                }, {
                    "path": "0,3",
                    "type": "tag",
                    "children": [{
                            "path": "0,3,0",
                            "type": "text"
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,4",
                    "type": "text"
                }, {
                    "path": "0,5",
                    "type": "tag",
                    "children": [{
                            "path": "0,5,0",
                            "type": "text"
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,6",
                    "type": "text"
                }, {
                    "path": "0,7",
                    "type": "tag",
                    "tagName": "input"
                }, {
                    "path": "0,8",
                    "type": "text"
                }, {
                    "path": "0,9",
                    "type": "tag",
                    "staticAttributes": [{
                            "name": "class",
                            "value": "close"
                        }, {
                            "name": "style",
                            "value": "background-color:red"
                        }],
                    "children": [{
                            "path": "0,9,0",
                            "type": "text"
                        }],
                    "tagName": "div"
                }, {
                    "path": "0,10",
                    "type": "text"
                }, {
                    "path": "0,11",
                    "type": "comment"
                }, {
                    "path": "0,12",
                    "type": "text"
                }],
            "links": [{
                    "name": "close",
                    "value": "0,9"
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
                        "0": "top:{top}px"
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
                        "0,1,0": "{data.firstname}"
                    }
                },
                "data.secondname": {
                    "data": {
                        "0,3,0": "{data.secondname}"
                    }
                },
                "data.age": {
                    "data": {
                        "0,5,0": "{data.age}"
                    }
                },
                "data.value": {
                    "value": {
                        "0,7": "{data.value}"
                    }
                },
                "closeText": {
                    "data": {
                        "0,9,0": "{closeText}"
                    }
                }
            },
            "tagName": "div",
            "extend": "fmvc.View",
            "createStates": ["hover", "selected", "disabled"],
            "className": "UserView",
            "css": ".userview{background-color:#808080;font-size:16px;line-height:24px;display:inline-block;width:200px}.userview-selected{border:1px solid #f00}.userview-hover{font-weight:bold;background-color:#0e90d2 !important;border:1px solid #00f}.userview-disabled{font-color:#f00;text-decoration:underline}"
        };
        return UserView;
    })(fmvc.View);
    ui.UserView = UserView;
})(ui || (ui = {}));
//# sourceMappingURL=UserView.js.map