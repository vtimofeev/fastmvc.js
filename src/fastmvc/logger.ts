module fastmvc {
    export class Logger extends fastmvc.Notifier {
        private _data:any = [];
        private _config:any = {filter: [], length: 100000, console: true};
        private _modules:any = [];

        constructor(facade:fastmvc.Facade, name:string) {
            super(name);
            super.facade(facade);
        }

        public config(value:any):void {
            this._config = value;
        }

        public config():any {
            this._config;
        }

        public console(value:boolean):any {
            this._config.console = value;
        }

        public filtres(value:any):void {
            this._config.filtres = value;
        }

        public filtres():any {
            this._config.filtres;
        }

        public modules():any {
            return this._modules;
        }

        public saveLog(name:string, message:string, level?:number = 0):void {
            var data = {name: name, message: message, level: level, date: new Date() };

            this._data.push(data);

            // clean logs
            if (this._data.length > this._config.length * 2) {
                this._data.length = this._data.slice(this._config.length);
            }

            if (this._modules.indexOf(name) === -1) {
                this._modules.push(name);
            }

            // send log event

            // exit if it has filters and has no the name in the array
            if (this._config && this._config.filtres && this._config.filtres.length && this._config.filtres.indexOf(name) === -1) return;

            // console
            if (this._config && this._config.console && console) {
                console.log('[' + name + '] ' + level + ' ' + message);
            }

            this.sendEvent('log', data);
            return;
        }


    }
}