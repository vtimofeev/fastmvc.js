var fmvc;
(function (fmvc) {
    var Event = (function () {
        function Event() {
        }
        Event.Model = {
            Changed: 'ModelChanged',
            StateChanged: 'ModelStateChanged',
        };
        return Event;
    })();
    fmvc.Event = Event;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=event.js.map