///<reference path="./d.ts" />

namespace ft {

    function getTemplateByData(name:string, dataModel:any|fmvc.Model<any>, Template:any, mixin?:any, params?:any, pool?:TemplateView[]):TemplateView {
        var item:TemplateView = pool && pool.shift() || (new Template)(name, mixin, params);
        dataModel instanceof fmvc.Model ? (item.model = dataModel) : (item.data = dataModel);
        return item;
    }

    class ChilrenViewModel extends fmvc.CompositeModel<any> {

        constructor(name: string, source: any[], opts: fmvc.IModelOptions) {
            super(name, source, opts);
        }

        public apply():any {
            var items:TemplateView[] = this.data,
                dataModel:any[]|fmvc.Model<any> = this.sources[0],
                itemsData:any[] = dataModel instanceof fmvc.Model ? dataModel.data : dataModel,
                Template = this.sources[1],
                mixin = this.sources[2],
                params = this.sources[3],
                result:any;

            result = itemsData.map( (v:any|fmvc.Model<any>, i:number)=>getTemplateByData(this.name + i, v, Template, mixin, params, items) );

            this.reset().setData(result);
            return result;
        }

        public

    }

}