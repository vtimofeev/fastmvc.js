///<reference path='./../d.ts'/>

module ft {
    interface IPointerData {
        clientX:number;
        clientY:number;
        pageX:number;
        pageY:number;
        alt:boolean;
        shift:boolean;
        control:boolean;
    }

    class PointerModel<IPointerData> extends fmvc.Model {
        public static Name:string = 'PointerModel';

        constructor(data:any, opts:fmvc.IModelOptions) {
            super(name, data, opts);
        }



    }
}
