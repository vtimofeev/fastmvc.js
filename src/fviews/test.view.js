/**
 * Created by Vasily on 30.05.2015.
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
    var TestView = (function (_super) {
        __extends(TestView, _super);
        function TestView(name, $root) {
            _super.call(this, name, $root);
        }
        return TestView;
    })(fmvc.View);
    fviews.TestView = TestView;
})(fviews || (fviews = {}));
//# sourceMappingURL=test.view.js.map