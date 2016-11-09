///<reference path='../../typings/tsd.d.ts'/>

namespace fmvc {

    export interface IModelOptions {
        type?: string // типы хранилища StorageModelType, например по ключу (key) или массив элементов (array)
        state?: boolean;
        event?: boolean;
        validate?: boolean;
        localStorage?: boolean;
        forceApplyChanges?: boolean;
    }

    export interface IModelData {
        _id?: string;
    }

    export interface IPromise {
        resolve(value: any): IPromise;
        reject(value?: any): IPromise;
        then(onSuccess: any, onError?: any): IPromise;
        catch(onError: any): IPromise;
    }

}

declare var MessageFormat:any;

///<reference path='./event.ts'/>

///<reference path='./facade.ts'/>

///<reference path='./notifier.ts'/>

/////<reference path='./event.dispatcher.ts'/>

///<reference path='./model.ts'/>

///<reference path='./model.logger.ts'/>


///<reference path='./remote.ts'/>

///<reference path='./source.model.ts'/>

///<reference path='./storage.model.ts'/>

///<reference path='./remote.model.ts'/>

///<reference path='./logger.ts'/>

/////<reference path='./view.i.ts'/>

///<reference path='./view.ts'/>

/////<reference path='./view.list.ts'/>

///<reference path='./mediator.ts'/>

