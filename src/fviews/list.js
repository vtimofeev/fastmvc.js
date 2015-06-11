/**
 * Created by Vasily on 27.05.2015.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='../fmvc/d.ts'/>
var fviews;
(function (fviews) {
    var List = (function (_super) {
        __extends(List, _super);
        function List(name, $root) {
            _super.call(this, name, $root);
        }
        List.Dom = function () {
            var references = {
                children: null,
                selected: [],
            };
            var children = [];
            var root = document.createElement('div');
            root.setAttribute('class', 'first');
            root.setAttribute('class', 'second');
            references.selected.push({ element: root, name: 'list-{selected}' });
            children[0] = document.createTextNode('Any text ');
            children[1] = document.createTextNode('{text}');
            references['text'] = children[1];
            root.appendChild(children[0]);
            root.appendChild(children[1]);
            return;
        };
        return List;
    })(fmvc.ViewList);
    fviews.List = List;
})(fviews || (fviews = {}));
//# sourceMappingURL=list.js.map