module fmvc {
    export class Logger extends fmvc.Notifier {
        private _data:any = [];
        private _config:any = {filter: [], length: 100000, console: true};
        private _modules:any = [];

        constructor(facade:fmvc.Facade, name:string) {
            super(name);
            this.setFacade(facade);
        }

        public setConfig(value:any):void {
            this._config = value;
        }

        public console(value:boolean):any {
            this._config.console = value;
        }

        public setFilter(value:any):void {
            this._config.filter = value;
        }

        public modules():any {
            return this._modules;
        }

        public saveLog(name:string, message:string, level:number = 0):void {
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
            if (this._config && this._config.filter && this._config.filter.length && this._config.filter.indexOf(name) === -1) {
                return;
            }

            // console
            if (this._config && this._config.console && ('console' in window)) {
                console.log('[' + name + '] ' + level + ' ' + message);
            }

            // log
            this.sendEvent('log', data, null, null, false);
            return;
        }


    }
}