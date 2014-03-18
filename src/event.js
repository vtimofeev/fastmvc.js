var fastmvc;
(function (fastmvc) {
    var Event = (function () {
        function Event() {
        }
        Event.MODEL_CHANGE = 'modelChange';
        Event.MODEL_CREATE = 'modelCreate';
        Event.MODEL_ADD = 'modelAdd';
        Event.MODEL_UPDATE = 'modelUpdate';
        Event.MODEL_REMOVE = 'modelRemove';
        return Event;
    })();
    fastmvc.Event = Event;
})(fastmvc || (fastmvc = {}));
//@ sourceMappingURL=event.js.map
