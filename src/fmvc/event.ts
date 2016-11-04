module fmvc
{
    export class Event
    {
        public static Model = {
            Changed: 'ModelChanged',
            StateChanged: 'ModelStateChanged',
            Disposed: 'ModelDisposed',
            Over: 'Over'
        };



        /*
        public static MODEL_STATE_CHANGED:string = 'model.state.changed';
        public static MODEL_CHANGED:string = 'model.changed';
        public static MODEL_CREATED:string = 'model.created';
        public static MODEL_VALIDATED:string = 'model.validated';

        public static MODEL_ADDED:string = 'model.added';
        public static MODEL_UPDATED:string = 'model.updated';
        public static MODEL_DELETED:string = 'model.deleted';
        */
    }

}