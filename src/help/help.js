///<reference path='../fastmvc/references.ts'/>
var help;
(function (help) {
    var Application = (function () {
        function Application() {
            this.problemsData = {
                'p0': 'Частые буферизации',
                'p1': 'Потеря соединения',
                'p2': '',
                '': '',
                '': '',
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
