module fastmvc {
    export class Model extends fastmvc.Notifier
    {
        private _data:any;

        constructor(facade:fastmvc.Facade, name:string, data:any = null)
        {
            super(facade, name);
            this._data = data;
        }




    }
}