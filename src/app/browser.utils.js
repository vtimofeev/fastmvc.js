var fmvc;
(function (fmvc) {
    var BrowserUtils = (function () {
        function BrowserUtils() {
        }
        BrowserUtils.getClient = function () {
            return bowser;
        };
        return BrowserUtils;
    })();
    fmvc.BrowserUtils = BrowserUtils;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=browser.utils.js.map