var fmvc;
(function (fmvc) {
    var Event = (function () {
        function Event() {
        }
        Event.Model = {
            Changed: 'ModelChanged',
            StateChanged: 'ModelStateChanged',
            Disposed: 'ModelDisposed'
        };
        return Event;
    })();
    fmvc.Event = Event;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=event.js.map