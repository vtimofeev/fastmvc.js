var fmvc;
(function (fmvc) {
    var Event = (function () {
        function Event() {
        }
        Event.MODEL_CHANGED = 'model.changed';
        Event.MODEL_CREATED = 'model.created';
        Event.MODEL_VALIDATED = 'model.validated';
        Event.MODEL_ADDED = 'model.added';
        Event.MODEL_UPDATED = 'model.updated';
        Event.MODEL_DELETED = 'model.deleted';
        return Event;
    })();
    fmvc.Event = Event;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=event.js.map