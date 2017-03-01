///<reference path="./d.ts" />

namespace ft {

    function getTemplateByData(className:string, name:string, dataModel:any|fmvc.Model<any>, Template:any, mixin?:any, params?:any, pool?:TemplateView[]):TemplateView {
        var item:TemplateView = pool && pool.shift() || ft.templateManager.createInstance(className, name, mixin, params);
        dataModel instanceof fmvc.Model ? (item.model = dataModel) : (item.data = dataModel);
        return item;
    }

    export class ChilrenViewModel extends fmvc.CompositeModel<any> {

        public viewParent:TemplateView;

        constructor(name: string, source: any[], opts?: fmvc.IModelOptions) {
            super(name, source, opts);
        }

        public apply():any {
            if(this.disposed) return;


            var items:TemplateView[] = this.data || [],
                dataModel:any[]|fmvc.Model<any> = this.sources[1],
                itemsData:any[] = dataModel instanceof fmvc.Model ? dataModel.data : dataModel ,
                templateClassName = this.sources[0],
                mixin = this.sources[2],
                params = this.sources[3],
                result:any;

            delete params.data;
            delete params.model;


            items.forEach( (v:TemplateView)=>v.unrender() );

            result = (itemsData || []).map(
                (v:any|fmvc.Model<any>, i:number)=>{
                    var t = getTemplateByData(templateClassName, this.name + ':' + templateClassName + i, itemsData[i], mixin, params, items)
                    t.parent = this.viewParent;
                    return t;
                }
            );

            this.reset().setData(result);
            return result;
        }


        dispose(): void {
            //console.log('Dispose TC ', this.name);
            this.data && this.data.forEach( (v:TemplateView)=>v.dispose() );
            super.dispose();
        }
    }

}