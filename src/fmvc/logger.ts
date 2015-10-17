///<reference path='./d.ts'/>

module fmvc {
    export interface ILoggerConfig {
        filter?:string[];
        length?:number;
        console?:boolean;
    }

    export class Logger extends fmvc.Model<any> {
        private _config:any = {filter: [], length: 100000, console: true};
        private _modules:any = [];

        constructor(name:string, config?:ILoggerConfig) {
            super(name, [], {enabledEvents:false, watchChanges:false});
            if(config) this.config = config;
            console.log('Construct facade logger ');
        }

        public set config(value:any) {
            _.extend(this._config, value);
        }

        public set console(value:boolean) {
            this._config.console = value;
        }

        public set filter(value:string[]) {
            this._config.filter = value;
        }

        public get modules():any {
            return this._modules;
        }

        public add(name:string, messages:any[] = null, level:number = 0):Logger {
            var data = {name: name, data: messages, level: level, date: new Date() };
            var dataArray:any[] = this.data;
            var config = this._config;
            dataArray.push(data);

            // add module
            if (this._modules.indexOf(name) === -1) this._modules.push(name);

            // exit if it has filters and has no the name in the array
            if (config.filter && config.filter.length && config.filter.indexOf(name) === -1) {
                return;
            }

            // console
            if (config && config.console && ('console' in window)) {
                console.log('[' + name + '] ' + level + ' ' , messages);
            }

            // clean: remove part of logs
            if (dataArray.length > config.length * 2) {
                dataArray.splice(0, dataArray.length - this._config.length);
            }

            // send event
            if(this.enabledEvents) this.sendEvent('log', data, null, null);
            return this;
        }
    }
}