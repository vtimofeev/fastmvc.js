///<reference path='d.ts'/>

module fmvc {
    declare var SockJS:any;

    export var TaskState = {
        None: 0,
        Waiting: 1,
        Executing: 2,
        Completed: 3,
        Cancelled: 4,
        Error: 5
    };


    export interface IRemoteTask {
        request:IRemoteTaskRequest;
        response?:IRemoteTaskResponse;

        state:number;
        progress?:number;

        created:number;
        finished?:number;

        timeout?:number;
        attempts?:number[];
        promise?:IPromise;
    }

    export interface IRemoteTaskRequest {
        id?:string;
        model:string;
        type:string;
        data?:any;
        result?:any;
    }


    export interface IRemoteTaskResponse {
        id:string;
        meta?:any;
        data?:any;
        error?:any;
    }

    export interface IRemoteConnection {
        isActive:Boolean;
        execute(value:IRemoteTaskRequest):boolean;
        bind(object:any, handler:any):any;

    }

    export class RemoteTaskManager {
        private uid:string;
        protected interval:number;
        protected intervalTime:number = 100;
        protected remoteConnection:IRemoteConnection = null;
        private tasks:IRemoteTask[] = [];

        constructor(rc:IRemoteConnection) {
            this.remoteConnection = rc;
            this.remoteConnection.bind(this, this.remoteConnectionMessageHandler);
            this.uid = 'web.' + this.random();
            this.interval = setInterval(this.execute.bind(this), this.intervalTime);
        }

        protected random():string {
            return Math.round(Math.random()*10e8).toString(36);
        }

        protected getDeferPromise(value:IRemoteTaskRequest):IPromise {
            var resolve: any,
                reject: any,
                p:any = <any> new Promise(function(resolveHandler, rejectHandler) {
                resolve = resolveHandler;
                reject = rejectHandler;
            });

            p.resolve = resolve;
            p.reject = reject;
            return <IPromise> p;
        }


        insert(value:IRemoteTaskRequest):IPromise {
            if(value.id) throw 'Cant insert task, that has id';

            value.id = this.uid + '.' + this.random();

            var task:IRemoteTask = {
                request: value,
                response: null,

                state:TaskState.Waiting,

                created:+new Date(),
                finished: 0,

                promise:this.getDeferPromise(value)
            };

            this.tasks.push(task);
            return task.promise;
        }

        getByProperty(name:string, value:any, operator:string = '==='):IRemoteTask[] {
            var fnc = new Function('task', 'return task["' + name + '"] ' + operator + ' value; }')();
            return this.tasks.filter(fnc);
        }

        getById(id:string):IRemoteTask {
            var result = this.getByProperty('id', id);
            return result&&result.length ? result.shift() : null;
        }

        deleteById(id:string):boolean {
            var task:IRemoteTask = this.getById(id);
            if(task && task.state < TaskState.Completed) {
                this.manualFinish('cancelled', null, task, TaskState.Cancelled);
                return true;
            }
        }

        dispose() {
            clearInterval(this.interval);
        }

        protected execute():void {
            this.remoteConnection
                && this.remoteConnection.isActive
                && this.tasks.forEach(function(task:IRemoteTask) {

                    if(task.state !== TaskState.Waiting) return;

                    this.remoteConnection.execute(task.request);
                    task.state = TaskState.Executing;

                }, this);
        }

        public remoteConnectionMessageHandler(e:IEvent) {
            var response = <IRemoteTaskResponse> e.data;

            if(!(response && response.id)) return;

            this.tasks.some((task:IRemoteTask)=>{
               if(response.id !== task.request.id) return false;

               if(response.meta && response.meta.progress < 1) {
                   this.progress(response.meta.progress, task);
               }
               else {
                   this.finish(response, task);
               }

               return true;
            }, this);
        }

        protected finish(response:IRemoteTaskResponse, task:IRemoteTask):void {
            task.state = TaskState.Completed;
            task.response = response;
            this.resolve(task);
        }

        protected manualFinish(error:string, data:any, task:IRemoteTask, state:number):void {
            task.state = state;
            task.response = { id: task.request.id, data: data, error: error };
            this.resolve(task);
        }

        protected progress(value:number, task:IRemoteTask):void {
            task.progress = value;
        }

        protected resolve(task:IRemoteTask):void {
            task.response.error ? task.promise.reject(task.response.error) : task.promise.resolve(task.response.data);
        }

    }

}