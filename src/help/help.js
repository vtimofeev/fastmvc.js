///<reference path='../fastmvc/references.ts'/>
var help;
(function (help) {
    var Application = (function () {
        function Application() {
            this.errorsData = {
                '': '',
                '': ''
            };
            this.facade = new fastmvc.Facade('HelpApplication');
        }
        return Application;
    })();
    help.Application = Application;
})(help || (help = {}));
//# sourceMappingURL=help.js.map
