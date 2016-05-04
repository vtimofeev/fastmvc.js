///<reference path='d.ts'/>

module fmvc {

    var TaskState = {
        None: 0,
        Waiting: 1,
        Executing: 2,
        Completed: 3,
        Cancelled: 4,
        Error: 5
    };

    interface ITask {
        id:string;
        data:any;
        result:any;
        meta:ITaskMeta;
    }

    interface ITaskMeta {
        state:number;
        timers:any;
        promise:IPromise;
    }

    interface ITaskManagerOptions {
    }

    interface ITaskManager {
        insert(value:ITask):IPromise;
        get(value:IPromise):ITask;
        remove(value:IPromise);
        execute():void;
    }

    interface IRemoteTask {
        id?:string;
        model:string;
        type:string;
        state:number;

        timeout?:number;
        data?:any;
        created?:number;
        finished?:number;
        attempts?:number[];
        promise?:IPromise;
        result?:IRemoteTaskResult;
    }

    interface IRemoteTaskResult {
        result:boolean;
        data?:any;
        meta?:any;
        error?:any;
    }


    class RemoteTaskManager {
        private uid:string;
        protected interval:number;
        protected intervalTime:number = 100;
        private tasks:IRemoteTask[] = [];

        protected random():string {
            return Math.round(Math.random()*10e12).toString(36);
        }

        protected getPromise(value:IRemoteTask):IPromise {
            return <IPromise>(new Promise());
        }

        constructor(uid?:string) {
            this.uid = uid || this.random();
            this.interval = setInterval(this.intervalTime, this.execute.bind(this));
        }

        insertTask(value:IRemoteTask):IPromise {
            if(value.id) throw 'Cant insert task, that has id';

            value.id = this.uid + '.' + this.random();
            value.created = +new Date();
            value.state = TaskState.Waiting;
            value.promise = this.getPromise(value);

            this.tasks.push(value);
            return value.promise;
        }

        execute():void {
            throw 'Must be overrided';
        }

        getTasksByProperty(name:string, value:any, operator:string = '==='):IRemoteTask[] {
            var fnc = new Function('return function (task) { return task["' + name + '"] ' + operator + ' value; }')();
            return this.tasks.filter(fnc);
        }

        getTaskById(id:string):IRemoteTask {
            var result = this.getTasksByProperty('id', id);
            return result&&result.length ? result.shift() : null;
        }

        removeTaskById(id:string):boolean {
            var task:IRemoteTask = this.getTaskById(id);
            if(task && task.state < TaskState.Completed) {
                this.finishTask('cancelled', null, task, TaskState.Cancelled);
                return true;
            }
        }

        protected finishTask(error:string, data:any, task:IRemoteTask, state:number) {
            task.state = state;
            task.result = data;
            error ? task.promise.reject(error) : task.promise.resolve(data);
        }



        dispose() {
            clearInterval(this.interval);
        }
        
    }



}