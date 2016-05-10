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
import TestRemoteConnectionModel = fmvc.TestRemoteConnectionModel;
import RemoteTaskManager = fmvc.RemoteTaskManager;
import ArrayModel = fmvc.ArrayModel;

var expect = chai.expect;
var assert = chai.assert;


interface IUser extends fmvc.IModelData {
    name:string;
    email: string;
    age:number;
}

var baseUserApiUrl = 'http://localhost/api/user';
var socket:any;


class User extends fmvc.Model<IUser> {



    protected getRemoteModel():string {
        return 'user';
    }

}


class UserDictionary extends fmvc.DictionaryModel<User> {


    protected getChildModelClass():any {
        return User;
    }

    protected getRemoteModel():string {
        return 'user';
    }

}



class UserArray extends fmvc.ArrayModel<User> {

    protected getChildModelClass():any {
        return User;
    }

    protected getRemoteModel():string {
        return 'user';
    }

}

class TestRemoteConnection extends fmvc.TestRemoteConnectionModel {
    private collection = {
        user: [
            { _id: '1', name: 'Vasily', age: 34, email: 'vasily@gmail.com' },
            { _id: '2', name: 'Elena', age: 26, email: 'elena@gmail.com' },
            { _id: '3', name: 'Tima', age: 6, email: 'tima@gmail.com' },
            { _id: '4', name: 'Pasha', age: 5, email: 'pasha@gmail.com' },
            { _id: '5', name: 'Liza', age: 2, email: 'lisa@gmail.com' }
        ]
    };

    public getRemoteTaskResponse(data:fmvc.IRemoteTaskRequest):fmvc.IRemoteTaskResponse {
        console.log('--- start task by request ', data);

        var result:fmvc.IRemoteTaskResponse = {id: data.id, meta: {progress: 1}, data: null, error: null},
            index,
            item,
            isAllowed:boolean;

        switch (data.type) {
            case 'get':

                if (data.data.query._id) result.data = this.getUserById(data.data.query._id);
                else if (data.data.query._ids) result.data = data.data.query._ids.map(this.getUserById, this);
                else if (data.data.query.name) result.data = this.collection.user.filter((item)=>item.name.indexOf(data.data.query.name) > -1);
                else result.error = 400;

            break;

            case 'insert':

                item = data.data;
                isAllowed = !!(item.name && item.email);

                if(isAllowed) {
                    item._id = (Math.round(Math.random()*10e5)).toString(36);
                    this.collection.user.push(item);

                    result.data = item;
                }
                else {
                    result.error = 403;
                }

            break;

            case 'update':

                if(data.data.query._id && data.data.set) {
                    item = this.getUserById(data.data.query._id);
                    _.extend(item, data.data.set);
                    result.data = item;

                }

            break;

            case 'delete':

                item = this.getUserById(data.data.query._id);
                if(item) this.collection.user.splice(this.collection.user.indexOf(item), 1);
                else result.error = 404;

            break;
        }


        console.log('+++ send result ', result);
        return result;
    }

    public getUserById(_id:string):IUser {
        var results = this.collection.user.filter((i)=>i._id === _id);
        return results && results[0] || null;

    }
}


describe('check advanced models', function () {
    
    before(function () {
        var remoteManager:RemoteTaskManager = new RemoteTaskManager(new TestRemoteConnection('testRCModel', 'http://test.org/socket'));
        window['remoteTaskManager'] = remoteManager;


    });

    it('try get user model by id - 1', (done)=>{
        var user:User = new User('defaultUser');


        user.getById('1').then((v)=> {
            console.log('user.getById(`1`) has result at then ', v, user.data);

            assert(user.data._id === '1', 'check id');
            assert(user.data.name === 'Vasily', 'check name');

            done();
        }).catch((e)=>{

            console.log('user.getById(`1`) has error ', e);
            assert(false, 'error is unexpected behavior');

            done();
        });


    });

    it('try save/update/delete model ', (done)=> {
        var user = new User('testUser');
        user.opts.remote = true;

        user.data = { name: 'Frankenshtain', age: 60, email: 'frankenshtain@mail.ru' };
        user.save()
            .then((v)=> {

                console.log('user.save() has Result at then ', v, user.data);
                assert(!!user.data._id, 'check id');
                assert(user.data.name === 'Frankenshtain', 'check name');
                assert(v.name === 'Frankenshtain', 'check name in data');
                return user.setChanges({name: 'Vasily'}).save()

            })
            .then((v)=> {

                console.log('user.save() has Changes at then ', v, user.data);
                assert(user.data.name === 'Vasily', 'check name after update');
                assert(user.data.name === 'Vasily', 'check name in data after update');
                return user.delete();
            })
            .then((v)=> {

                console.log('user.delete() result ', v, user.data);
                assert(user.disposed, 'should be disposed');
                done();
            })
            .catch((e)=> {

                console.log('chain has an error ', e);
                assert(false, 'error on insert/update/delete is unexpected behavior');
                done();
            });

    });

    it('try get dictionary model data', (done)=> {
        var userDict = new UserDictionary('userDict');
        var getInstance = userDict.getInstanceById.bind(userDict);
        var users:User[] = <User[]> ['1','2','3'].map(getInstance);

        Promise.all(userDict.getPromises)
            .then((v)=>{

                console.log('get instances result ', v, users);
                assert(users[0].data.name === 'Vasily', 'check user 0 name');
                assert(users[1].data.name === 'Elena', 'check user 1 name');
                assert(users[2].data.name === 'Tima', 'check user 2 name');
                done();

            })
            .catch((v)=>{

                console.log('chain has an error ', v);
                assert(false, 'error on insert/update/delete is unexpected behavior');
                done();

            });





    });


    it('try get array model data', (done)=> {
        var userArray = new UserArray('userArray');

        userArray.get({name: 'i'})
            .then((v)=>{

                console.log('get Array result ', v, userArray.data);
                assert(userArray.data[0].data.name === 'Vasily', 'check user 0 name');
                assert(userArray.count === 3, 'check results count');
                done();

            })
            .catch((v)=>{

                console.log('chain has an error ', v);
                assert(false, 'error on insert/update/delete is unexpected behavior');
                done();

            });

    });


});
