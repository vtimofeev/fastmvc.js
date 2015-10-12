///<reference path='./d.ts'/>
module fmvc {
    export class SourceModel extends Model {
        private _sources:any[];
        private _sourceCompareFunc:any;
        private _mapBeforeCompareFunc:any;
        private _resultFuncs:any[];
        private throttleApplyChanges:Function;

        constructor(name:string, source:Model|Model[], opts?:IModelOptions) {
            super(name, null, opts);
            this.throttleApplyChanges = _.throttle(_.bind(this.apply, this), 100);
            this.addSources(source);
        }

        addSources(v:any[]):SourceModel {
            if (!v) return this;
            if (!this._sources) this._sources = [];
            _.each(v, this.addSource, this);
            return this;
        }

        addSource(v:Model|any, mapBeforeCompareFunc?:Function):SourceModel {
            if (v instanceof Model) {
                var m = <Model>v;
                m.bind(this, this.sourceChangeHandler);
                this._sources.push(m);
                if(mapBeforeCompareFunc) this.setMapBeforeCompare(m.name, mapBeforeCompareFunc);
            } else if(v.length) {
                this._sources.push(v);
            }
            else {
                throw  'SourceModel: Cant add source ' + v;
            }

            return this;
        }

        removeSource(v:Model):SourceModel {
            var index:number = -1;
            if (this._sources && (index = this._sources.indexOf(v)) > -1) {
                this._sources.splice(index, 1);
                if(v instanceof Model) v.unbind(v);
                if(this._mapBeforeCompareFunc[v.name]) delete this._mapBeforeCompareFunc[v.name];
            } else {
                throw  'SourceModel: Can remove source ' + v;
            }
            return this;
        }

        private sourceChangeHandler(e:IEvent):void {
            this.throttleApplyChanges();
        }

        setSourceCompareFunc(value:any):SourceModel {
            this._sourceCompareFunc = value;
            this.throttleApplyChanges();
            return this;
        }

        setMapBeforeCompare(name:string, value:any):SourceModel {
            if(!this._mapBeforeCompareFunc) this._mapBeforeCompareFunc = {};
            this._mapBeforeCompareFunc[name] = value;
            this.throttleApplyChanges();
            return this;
        }

        setResultFunc(...values:any[]):SourceModel {
            this._resultFuncs = _.flatten([].concat(this._resultFuncs ? this._resultFuncs : [], values));
            this.throttleApplyChanges();
            return this;
        }

        apply() {
            console.log('Apply changes ...', this._sources, this._sourceCompareFunc, this._resultFuncs);
            if (!this._sources || !this._sources.length) this.setData(null);
            if (!this._sourceCompareFunc && this._sources.length > 1) throw 'SourceModel: has source datas, but method not defined';

            var result = null;
            var sourcesResult = this.getSourceResult();

            console.log('SourceModel: Source Result is ', sourcesResult);
            if (sourcesResult) result = _.reduce(this._resultFuncs, function (memo, method) {
                return method.call(this, memo);
            }, sourcesResult, this);
            console.log('SourceModel: Result is ', JSON.stringify(result));
            this.reset().setData(result);
        }

        private getSourceResult():any[] {
            if (this._sourceCompareFunc && this._sources.length > 1) {
                return this._sourceCompareFunc.apply(this, _.map(this._sources, (v:Model|any)=>this.getPreparedSourceData, this), this);
            } else {
                return this._sources[0] instanceof Model?this._sources[0].data:this._sources[0];
            }
        }

        private getPreparedSourceData(v:Model|any):any[] {
            if(v instanceof Model) {
                var mapper:Function = this._mapBeforeCompareFunc&&this._mapBeforeCompareFunc[v.name]?this._mapBeforeCompareFunc[v.name]:null;
                return mapper?_.map(v.data, mapper):v.data;
            } else {
                return v;
            }
        }

        dispose() {
            _.each(this._sources, v=>this.removeSource(v), this);
            this._sources = null;
            this._sourceCompareFunc = null;
            this._resultFuncs = null;
            super.dispose();
        }
    }
}