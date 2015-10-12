var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='./d.ts'/>
var fmvc;
(function (fmvc) {
    var SourceModel = (function (_super) {
        __extends(SourceModel, _super);
        function SourceModel(name, source, opts) {
            _super.call(this, name, null, opts);
            this.throttleApplyChanges = _.throttle(_.bind(this.apply, this), 100);
            this.addSources(source);
        }
        SourceModel.prototype.addSources = function (v) {
            if (!v)
                return this;
            if (!this._sources)
                this._sources = [];
            _.each(v, this.addSource, this);
            return this;
        };
        SourceModel.prototype.addSource = function (v, mapBeforeCompareFunc) {
            if (v instanceof fmvc.Model) {
                var m = v;
                m.bind(this, this.sourceChangeHandler);
                this._sources.push(m);
                if (mapBeforeCompareFunc)
                    this.setMapBeforeCompare(m.name, mapBeforeCompareFunc);
            }
            else if (v.length) {
                this._sources.push(v);
            }
            else {
                throw 'SourceModel: Cant add source ' + v;
            }
            return this;
        };
        SourceModel.prototype.removeSource = function (v) {
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
        SourceModel.prototype.sourceChangeHandler = function (e) {
            this.throttleApplyChanges();
        };
        SourceModel.prototype.setSourceCompareFunc = function (value) {
            this._sourceCompareFunc = value;
            this.throttleApplyChanges();
            return this;
        };
        SourceModel.prototype.setMapBeforeCompare = function (name, value) {
            if (!this._mapBeforeCompareFunc)
                this._mapBeforeCompareFunc = {};
            this._mapBeforeCompareFunc[name] = value;
            this.throttleApplyChanges();
            return this;
        };
        SourceModel.prototype.setResultFunc = function () {
            var values = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                values[_i - 0] = arguments[_i];
            }
            this._resultFuncs = _.flatten([].concat(this._resultFuncs ? this._resultFuncs : [], values));
            this.throttleApplyChanges();
            return this;
        };
        SourceModel.prototype.apply = function () {
            console.log('Apply changes ...', this._sources, this._sourceCompareFunc, this._resultFuncs);
            if (!this._sources || !this._sources.length)
                this.setData(null);
            if (!this._sourceCompareFunc && this._sources.length > 1)
                throw 'SourceModel: has source datas, but method not defined';
            var result = null;
            var sourcesResult = this.getSourceResult();
            console.log('SourceModel: Source Result is ', sourcesResult);
            if (sourcesResult)
                result = _.reduce(this._resultFuncs, function (memo, method) {
                    return method.call(this, memo);
                }, sourcesResult, this);
            console.log('SourceModel: Result is ', JSON.stringify(result));
            this.reset().setData(result);
        };
        SourceModel.prototype.getSourceResult = function () {
            var _this = this;
            if (this._sourceCompareFunc && this._sources.length > 1) {
                return this._sourceCompareFunc.apply(this, _.map(this._sources, function (v) { return _this.getPreparedSourceData; }, this), this);
            }
            else {
                return this._sources[0] instanceof fmvc.Model ? this._sources[0].data : this._sources[0];
            }
        };
        SourceModel.prototype.getPreparedSourceData = function (v) {
            if (v instanceof fmvc.Model) {
                var mapper = this._mapBeforeCompareFunc && this._mapBeforeCompareFunc[v.name] ? this._mapBeforeCompareFunc[v.name] : null;
                return mapper ? _.map(v.data, mapper) : v.data;
            }
            else {
                return v;
            }
        };
        SourceModel.prototype.dispose = function () {
            var _this = this;
            _.each(this._sources, function (v) { return _this.removeSource(v); }, this);
            this._sources = null;
            this._sourceCompareFunc = null;
            this._resultFuncs = null;
        };
        return SourceModel;
    })(fmvc.Model);
    fmvc.SourceModel = SourceModel;
})(fmvc || (fmvc = {}));
//# sourceMappingURL=source.model.js.map