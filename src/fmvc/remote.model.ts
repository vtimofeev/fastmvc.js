///<reference path='./d.ts'/>
declare var SockJS:any;

namespace fmvc {

    export class RemoteConnectionModel extends Model<any> implements IRemoteConnection {
        isActive:boolean = false;

        public execute(data:IRemoteTaskRequest):boolean {
            return this.isActive;
        }
    }

    export class TestRemoteConnectionModel extends RemoteConnectionModel {
        protected connection:any;

        constructor(name:string, url:string) {
            super(name, null);
            console.log('Create remote connection model ', name, url);

            this.connection = {url: url};

            this.openHandler = this.openHandler.bind(this);
            this.messageHandler = this.messageHandler.bind(this);
            this.closeHandler = this.closeHandler.bind(this);

            setTimeout(this.openHandler, 0);
        }

        protected openHandler():void {
            this.isActive = true;
        }

        protected closeHandler():void {
            this.isActive = false;
        }

        protected messageHandler(data) {
            this.data = JSON.parse(data);
        }

        public execute(data:IRemoteTaskRequest):boolean {
            this.isActive && this.send(data);
            return this.isActive;
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
        public status:fmvc.Model<any>;

        constructor(name:string, url:string) {
            super(name, null);
            if(typeof SockJS === 'undefined') throw 'SocketRemoteConnectionModel: SockJS client library required';

            var internalStateModel = new Model('status', {active: false, sended: 0, received: 0, errors: 0});
            this.compose(internalStateModel);

            this.createConnection.bind(this);
            this.createConnection(url);
        }

        protected createConnection(url) {
            var t = this;

            try {
                this.connection = new SockJS(url);
                this.connection.onopen = this.openHandler.bind(this);
                this.connection.onmessage = this.messageHandler.bind(this);
                this.connection.onclose = this.closeHandler.bind(this);
            } catch (e) {
                this.status.changes = { errors: this.status.data.errors++ };
                setTimeout( ()=>t.createConnection(url) , 1000 );
            }

        }

        protected openHandler():void {
            this.status.changes = { active: true };
            this.isActive = true;
        }

        protected closeHandler():void {
            this.status.changes = { active: false , errors: this.status.data.errors++ };
            this.isActive = false;
        }

        protected messageHandler(data) {
            this.status.changes = { received: this.status.data.received++};
            this.data = JSON.parse(data.data);
        }

        public execute(data:IRemoteTaskRequest):boolean {
            this.isActive && this.send(data);
            return this.isActive;
        }

        public send(data:any):void {
            this.status.changes = { sended: this.status.data.sended++};
            this.connection.send(JSON.stringify(data));
        }


        dispose():void {
            super.dispose();
            this.connection.close();
        }

    }

}