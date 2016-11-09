///<reference path='./d.ts'/>
declare var SockJS:any;

namespace fmvc {

        export class RemoteConnectionModel extends fmvc.Model<any> implements IRemoteConnection {

        public getConnected():boolean {
            return this.data && this.data.connected;
        }

        public execute(data:IRemoteTaskRequest):boolean {
            return false;
        }

    }

    export class TestRemoteConnectionModel extends RemoteConnectionModel {
        protected connection:any;

        constructor(name:string, url:string) {
            super(name, {connected: false, received: 0, lastResult: null});
            console.log('Create remote connection model ', name, url);
            this.connection = {url: url};
            setTimeout(this.openHandler.bind(this), 0);
        }

        protected openHandler():void {
            this.changes = { connected: true };
        }

        protected closeHandler():void {
            this.changes = { connected: false };
        }

        protected messageHandler(dataStr:string) {
            //console.log('MessageHandler: ', dataStr);
            var data = JSON.parse(dataStr);
            this.changes = { received: this.data.received + 1 , lastResult: data };
        }

        public execute(data:IRemoteTaskRequest):boolean {
            this.getConnected() && this.send(data);
            return this.getConnected();
        }

        public send(data:any):void {
            var t = this;

            setTimeout(function () {
                t.messageHandler(JSON.stringify({id: data.id, meta: {progress: 0}}));
            }, 0);

            setTimeout(function () {
                t.messageHandler(JSON.stringify(t.getRemoteTaskResponse(data)))
            }, 20);

        }

        public getRemoteTaskResponse(data:IRemoteTaskRequest):IRemoteTaskResponse {
            return null;
        }

        dispose():void {
            super.dispose();
        }

    }

    export class SocketRemoteConnectionModel extends RemoteConnectionModel {
        protected connection:any;

        constructor(name:string, url:string) {
            super(name, {url: url, connected: false, sended: 0, received: 0, errors: 0, sendedItems: [], receivedItems: [] });
            if(typeof SockJS === 'undefined') throw 'SocketRemoteConnectionModel: SockJS client library required';

            this.createConnection(this.data.url);
        }

        protected createConnection(url:string):void {

            try {
                if(this.connection) {
                    this.connection.onmessage = this.connection.onclose = this.connection.onopen = null;
                }

                this.connection = new SockJS(url);
                this.connection.onopen = this.openHandler.bind(this);
                this.connection.onmessage = this.messageHandler.bind(this);
                this.connection.onclose = this.closeHandler.bind(this);

            } catch (e) {

                console.log('Error on create ', arguments, this.data);
                this.changes = { errors: (this.data.errors + 1) };
                setTimeout( ()=>this.createConnection(url) , 1000 * this.data.errors );
            }

        }

        protected openHandler():void {
            this.changes = { connected: true };
        }

        protected closeHandler():void {
            this.changes = { connected: false , errors: (this.data.errors + 1) };
            setTimeout( ()=>this.createConnection(this.data.url), 1000 * this.data.errors );
        }

        protected messageHandler(data:any) {
            this.data.receivedItems.push(data);
            this.changes = { received: this.data.received + 1 , lastResult: JSON.parse(data.data) };
        }

        public execute(data:IRemoteTaskRequest):boolean {
            this.data.connected && this.send(data);
            return this.data.connected;
        }

        public send(data:any):void {
            this.data.sendedItems.push(data);
            this.changes = { sended: this.data.sended + 1 };
            this.connection.send(JSON.stringify(data));
        }

        public dispose():void {
            super.dispose();
            this.connection.close();
        }

    }

}