var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    /*
         var d1 = ["a", "b",1,2,3,4,5,6,7];
         var m2 = new fmvc.Model<T>('a2', [4,5,6,7,8,9,10,11]);
         var s1 = new fmvc.CompositeModel('s1', [d1,m2]);
         s1.setMapBeforeCompare(m2.name, (v)=>v).setSourceCompareFunc(_.intersection).setResultFunc((v)=>(_.chain(v).filter((r:any)=>(r%2===0)).map((d:any)=>(d*100)).value()));
     */
    var CompositeModel = (function (_super) {
        __extends(CompositeModel, _super);
        function CompositeModel(name, source, opts) {
            _super.call(this, name, null, opts);
            this.throttleApplyChanges = _.throttle(_.bind(this.apply, this), 100, { leading: false });
            if (_.isArray(source))
                this.addSources(source);
            else
                this.addSource(source);
        }
        CompositeModel.prototype.addSources = function (v) {
            var _this = this;
            if (!v)
                return this;
            if (!this._sources)
                this._sources = [];
            _.each(v, function (source) { return _this.addSource(source); }, this);
            return this;
        };
        CompositeModel.prototype.addSource = function (v, mapBeforeCompareFunc) {
            if (v instanceof fmvc.Model) {
                var m = v;
                m.bind(this, this.sourceChangeHandler);
                this._sources.push(m);
                if (mapBeforeCompareFunc) {
                    if (_.isFunction(mapBeforeCompareFunc)) {
                        this.setMapBeforeCompare(m.name, mapBeforeCompareFunc);
                    }
                    else {
                        throw 'SourceModel: Cant set ' + mapBeforeCompareFunc + ' mapBeforeCompareFunc for model ' + m.name;
                    }
                }
            }
            else if (v.length) {
                this._sources.push(v);
            }
            else {
                throw 'SourceModel: Cant add source ' + v;
            }
            return this;
        };
        CompositeModel.prototype.removeSource = function (v) {
            var index = -1;
            if (this._sources && (index = this._sources.indexOf(v)) > -1) {
                this._sources.splice(index, 1);
                if (v instanceof fmvc.Model)
                    v.unbind(v);
                if (this._mapBeforeCompareFunc[v.name])
                    delete this._mapBeforeCompareFunc[v.name];
            }
            else {
                throw 'SourceModel: Can remove source ' + v;
            }
            return this;
        };
        CompositeModel.prototype.sourceChangeHandler = function (e) {
            this.throttleApplyChanges();
        };
        CompositeModel.prototype.setSourceCompareFunc = function (value) {
            this._sourceCompareFunc = value;
            this.throttleApplyChanges();
            return this;
        };
        CompositeModel.prototype.setMapBeforeCompare = function (name, value) {
            if (!this._mapBeforeCompareFunc)
                this._mapBeforeCompareFunc = {};
            this._mapBeforeCompareFunc[name] = value;
            this.throttleApplyChanges();
            return this;
        };
        CompositeModel.prototype.setResultFunc = function () {
            var values = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                values[_i - 0] = arguments[_i];
            }
            this._resultFuncs = values ? _.flatten([].concat(this._resultFuncs ? this._resultFuncs : [], values)) : null;
            this.throttleApplyChanges();
            return this;
        };
        CompositeModel.prototype.apply = function () {
            if (this.disposed)
                return;
            if (!this._sources || !this._sources.length)
                this.setData(null);
            if (!this._sourceCompareFunc && this._sources.length > 1) {
                throw 'SourceModel: has source datas, but method not defined';
            }
            var result = null;
            var sourcesResult = this.getSourceResult();
            if (sourcesResult)
                result = _.reduce(this._resultFuncs, function (memo, method) {
                    return method.call(this, memo);
                }, sourcesResult, this);
            this.reset().setData(result);
        };
        CompositeModel.prototype.getSourceResult = function () {
            if (this._sourceCompareFunc && this._sources.length > 1) {
                return this._sourceCompareFunc.apply(this, _.map(this._sources, this.getPreparedSourceData, this), this);
            }
            else {
                return this._sources[0] instanceof fmvc.Model ? this._sources[0].data : this._sources[0];
            }
        };
        CompositeModel.prototype.getPreparedSourceData = function (v) {
            if (v instanceof fmvc.Model) {
                var mapper = this._mapBeforeCompareFunc && this._mapBeforeCompareFunc[v.name] ? this._mapBeforeCompareFunc[v.name] : null;
                var mappedResult = mapper ? _.map(v.data, mapper) : v.data;
                return mappedResult;
            }
            else {
                return v;
            }
        };
        CompositeModel.prototype.dispose = function () {
            var _this = this;
            _.each(this._sources, function (v) { return _this.removeSource(v); }, this);
            _.each(this._mapBeforeCompareFunc, function (v, k) { return delete _this._mapBeforeCompareFunc[k]; }, this);
            this._mapBeforeCompareFunc = null;
            this._sources = null;
            this._sourceCompareFunc = null;
            this._resultFuncs = null;
            this._sourceCompareFunc = null;
            _super.prototype.dispose.call(this);
        };
        return CompositeModel;
    })(fmvc.Model);
    fmvc.CompositeModel = CompositeModel;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=source.model.js.map