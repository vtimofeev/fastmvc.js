module fastmvc
{
    export class Logger extends fastmvc.Notifier {
        private _data:any = [];
        private _config:any = {filter: [], length:100000, console:true};
        private _facade:fastmvc.Facade;
        private _modules:any = [];

        constructor(facade:fastmvc.Facade, name:string)
        {
           super(facade, name);
        }

        public config(value:any):void
        {
            this._config = value;
        }

        public config():any
        {
            this._config;
        }

        public filtres(value:any):void
        {
            this._config.filtres = value;
        }

        public filtres():any
        {
            this._config.filtres;
        }

        public modules():any
        {
            return this._modules;
        }

        public saveLog(name:string, message:string, level?:number = 0):void {
            var data = {name: name, message: message, level:level, date: new Date() };

            this._data.push(data);

            // clean logs
            if(this._data.length > this._config.length * 2) {
                this._data.length = this._data.slice(this._config.length);
            }

            if(this._modules.indexOf(name) === -1)
            {
                this._modules.push(name);
            }

            // send log event
            if(this._config)
            {
                // filtres log event
                var filtres:any = this._config.filtres;
                if (filtres && filtres.length)
                {
                    if(filtres.indexOf(name) === -1) return;
                }
                this.sendEvent('log', data);
            }
            return;
        }



    }
}