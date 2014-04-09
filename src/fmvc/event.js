var fmvc;
(function (fmvc) {
    var Event = (function () {
        function Event() {
        }
        Event.MODEL_CHANGE = 'modelChange';
        Event.MODEL_CREATE = 'modelCreate';
        Event.MODEL_ADD = 'modelAdd';
        Event.MODEL_UPDATE = 'modelUpdate';
        Event.MODEL_REMOVE = 'modelRemove';
        Event.MODEL_VALIDATE = 'modelValidate';
        return Event;
    })();
    fmvc.Event = Event;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=event.js.map
