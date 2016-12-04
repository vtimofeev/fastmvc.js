///<reference path='./d.ts'/>
namespace fmvc {

    /*
         var d1 = ["a", "b",1,2,3,4,5,6,7];
         var m2 = new fmvc.Model<T>('a2', [4,5,6,7,8,9,10,11]);
         var s1 = new fmvc.CompositeModel('s1', [d1,m2]);
         s1.setMapBeforeCompare(m2.name, (v)=>v).setSourceCompareFunc(_.intersection).setResultFunc((v)=>(_.chain(v).filter((r:any)=>(r%2===0)).map((d:any)=>(d*100)).value()));
     */
    export class CompositeModel<T> extends fmvc.Model<T> {

        private _sources:any[];
        private _sourceCompareFunc:any;
        private _mapBeforeCompareFunc:{[id:string]:any};
        private _resultFuncs:any[];
        private throttleApplyChanges:Function;

        constructor(name:string, source:any[], opts?:IModelOptions) {
            super(name, null, opts);
            this.throttleApplyChanges = _.throttle(_.bind(this.apply, this), 100, {leading:false});
            if(_.isArray(source)) this.addSources(<any[]>source);
            else this.addSource(source);
        }

        public addSources(v:any[]):CompositeModel<T> {
            if (!v) return this;
            if (!this._sources) this._sources = [];
            _.each(v, (source)=>this.addSource(source), this);
            return this;
        }


        public addSource(v:any, mapBeforeCompareFunc?:Function):CompositeModel<T> {
            if (v instanceof fmvc.Model) {
                var m = <Model<T>>v;
                m.bind(this, this.sourceChangeHandler);
                this._sources.push(m);
                if(mapBeforeCompareFunc) {
                    if(_.isFunction(mapBeforeCompareFunc)) {
                        this.setMapBeforeCompare(m.name, mapBeforeCompareFunc);
                    } else {
                        throw  'SourceModel: Cant set ' + mapBeforeCompareFunc + ' mapBeforeCompareFunc for model ' + m.name;
                    }
                }
            } else if(v) {
                this._sources.push(v);
            }
            else {
                throw  'SourceModel: Cant add source ' + v;
            }

            return this;
        }


        get sources(): any[] {
            return this._sources;
        }

        public removeSource(v:Model<T>):CompositeModel<T> {
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

        public setSourceCompareFunc(value:any):CompositeModel<T> {
            this._sourceCompareFunc = value;
            this.throttleApplyChanges();
            return this;
        }

        public setMapBeforeCompare(name:string, value:any):CompositeModel<T> {
            if(!this._mapBeforeCompareFunc) this._mapBeforeCompareFunc = {};
            this._mapBeforeCompareFunc[name] = value;
            this.throttleApplyChanges();
            return this;
        }

        public setResultFunc(...values:any[]):CompositeModel<T> {
            this._resultFuncs = values?_.flatten([].concat(this._resultFuncs ? this._resultFuncs : [], values)):null;
            this.throttleApplyChanges();
            return this;
        }

        public apply():any {
            if (this.disposed) return;
            if (!this._sources || !this._sources.length) this.setData(null);
            if (!this._sourceCompareFunc && this._sources.length > 1) {
                throw 'SourceModel: has source datas, but method not defined';
            }

            var result = null;
            var sourcesResult = this.getSourceResult();
            if (sourcesResult) result = _.reduce(this._resultFuncs, function (memo, method) {
                return method.call(this, memo);
            }, sourcesResult, this);
            this.reset().setData(result);
        }

        private getSourceResult():any[] {
            if (this._sourceCompareFunc && this._sources.length > 1) {
                return this._sourceCompareFunc.apply(this, _.map(this._sources, this.getPreparedSourceData, this), this);
            } else {
                return this._sources[0] instanceof Model?this._sources[0].data:this._sources[0];
            }
        }

        private getPreparedSourceData(v:any):any[] {
            if(v instanceof Model) {
                var mapper:any = this._mapBeforeCompareFunc&&this._mapBeforeCompareFunc[v.name]?this._mapBeforeCompareFunc[v.name]:null;
                var mappedResult = mapper?_.map<any,any>(v.data, mapper):v.data;
                return mappedResult;
            } else {
                return v;
            }
        }

        dispose():void {
            _.each(this._sources, v=>this.removeSource(v), this);
            _.each(this._mapBeforeCompareFunc, (v,k:string)=>delete this._mapBeforeCompareFunc[k], this);
            this._mapBeforeCompareFunc = null;
            this._sources = null;
            this._sourceCompareFunc = null;
            this._resultFuncs = null;
            this._sourceCompareFunc = null;
            super.dispose();
        }
    }
}