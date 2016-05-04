///<reference path="../../typings/mocha/mocha.d.ts" />
///<reference path="../../typings/chai/chai.d.ts" />
///<reference path="../../src/fmvc/d.ts" />

/*
Состояние модели:

Клиент:

Новая = 1
Измененая = 2
Удаленная = 4
Синхронизирована = 8

Сервер:

Не синхронизируется = 0
Отсутсвует: 1
Существует: 2
Удалена: 4

Локально - на сервере:

1,2,4,8 - 0
1->8 - 1,2

2->8 - 1,2
1->2->8 - 1,2

4->8 - 1,2,4

8 - 2,4
*/

import IPromise = fmvc.IPromise;
var expect = chai.expect;
var assert = chai.assert;

interface IModelData {
    name:string;
    value: number;
}

interface IUser {
    name:string;
    email: string;
    age:number;
}

interface ITask {
    id: string,
    model: string,
    type: string,
    data: any,
    sendTime: number;
    promise: IPromise
}

var baseUserApiUrl = 'http://localhost/api/user';
var socket:any;



interface IRemoteProvider  {
    isActive:boolean;
    execute():IPromise;
}


class Remote extends fmvc.Model<IPromise[]> {
    constructor(name:string, opts:fmvc.IModelOptions) {
        super(name, [], opts);
    }

    createTask(model, type, data):IPromise {
        var task:ITask = {
            model: model,
            type: type,
            data: data,
            promise: $.Deferred()
        };

        this.data.push(task);
        return task.promise;
    }

    socketHandler(data:any):void {
        if(data.domain === 'task') {
            var task = tasks.find(data.id);
            task&&data.result?task.promise.resolve(data):task.promise.reject(data);
        }
    }

    executeTask(task:ITask) {
        var promise;

        task.id = (+new Date()).toString(36)+ '.' + Math.round(Math.random()*10e12).toString(36);
        task.sendTime = +new Date();

        if (socket.connected) {
            socket.send({id: task.id, domain: 'task', model: task.model, type: task.type, data: task.data});
        }
        return;


        switch (task.type) {
            case 'select':
                promise = $.ajax({url: baseUserApiUrl + '/' + task.model + '/select/' + task.data.id , type: 'GET'});
                break;

            case 'multiByIds':
                // {base}/user/ids?{ids|query}
                break;

            case 'get':
                // {base}/{model}/id/{id}
                promise = $.ajax({url: baseUserApiUrl + '/' + task.model + '/id/' + task.data.id , type: 'GET'});
                break;

            case 'insert':
                promise = $.ajax({url: baseUserApiUrl + '/' + task.model, type: 'POST'});
                break;

            default:
                break;
        }

        promise.then(
            (v)=>task.promise.resolve(v),
            (e)=>task.promise.reject(e)
        );
    }
}

var remote = new Remote();

class User extends fmvc.Model<IUser> {

    protected getImpl(opts:any):fmvc.IPromise {
        return remote.createTask('user', 'get', {id: opts.id} )
    }

    protected saveImpl(opts:any):fmvc.IPromise {
        return remote.createTask('user', 'insert', this.data);
    }

}

class UserStorage extends fmvc.DictionaryModel<User> {

}

class UserArray extends fmvc.ArrayModel<User> {

    public getBy(field:string, opts:any) {
        return this.getByImpl(field, opts);
    }

    protected getByImpl(field:string, opts:any) {
        var optsQuery:string = '';

        for(var i in opts) {
            optsQuery += (optsQuery?'&':'') + i + '=' + encodeURIComponent(opts[i]);
        }

        // Examples:
        // http://localhost/api/user/by/time?from=10022016&to=now
        // http://localhost/api/user/by/name?pattern=a*
        // http://localhost/api/user/by/name?equal=Vasily
        return $.ajax({
            url: baseUserApiUrl + '/by/' + field + '?' + optsQuery,
            type: 'GET',
        }).then(
            (data)=> {
                data.result.forEach( (v:IUser)=>this.push(v), this );
            }
        )
    }
}



describe('check advanced models', function () {
    
    before(function () {

    });

    it('try get base model', (done)=>{
        var user:User = new User('defaultUser');
        user.get({id: 1}).then((v)=> {

            assert(user.id === 1, 'Check id');
            assert(user.name === 'Vasily', 'Check name');
            
            done();
        })

    });

});