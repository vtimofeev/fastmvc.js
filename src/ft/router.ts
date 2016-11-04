///<reference path='d.ts'/>
declare var Grapnel:any;

module ft {
    export interface IRouter  {
        page:string,
        pageType?:string,
        pageName?:string,
        pageAction?:string,
        pageData?:string,

        overlay?:string,
        overlayType?:string,
        overlayName?:string
    }

    export class Router<IRoute> extends fmvc.Model<IRoute> {

        protected router:any;
        protected re:RegExp;

        constructor(name:string, data:any = {page: '', overlay: ''}, opts?:fmvc.IModelOptions) {
            super(name, data, opts);
            this.router = new Grapnel({ pushState : true });
            this.init();
        }
        
        init() {
            this.re = /([^-]+)(?:-([^-]+))?(?:-([^-]+))?(?:-([^-]+))?(?:---(.+))?/;

            /*
            Новая регулярка
                var ;

            Пример маршрутов
            var route = '/page-id:hash-actionOptional---seo-content/overlay-name:login/user-id---vovka/user-query:eyJmcm9tIjowLCJsaW1pdCI6MTAsIiRnZW8iOltbNTUuNDQ1NCw1NS4zNDMyXSxbMjMuMjMsNTQuMjFdXX0=/';

            Результат
             Array[6]
             0 "page-id:hash-actionOptional---seo-content"
             1 "page" - модель или константый тип (оверлей или виджет)
             2 "id:hash" - идентификатор - ид или тип:значение
             3 "actionOptional" - действие
             4 undefined - данные ддя действия
             5 "seo-content" - контент сео

            */

            this.router.get(/.*/, (req:any, e:any)=>{

                var result:any = {},
                    path:string = req.match[0] || '',
                    routerParts:string[] = path.split('/').filter( v=>!!v ),
                    routerResults = routerParts.map( v=>this.re.exec(v) );

                routerResults.reduce( (m:any, v:string[])=>{
                    var [full, model, id, action, data, seo] = v;

                    m[model] = {
                        id,
                        action,
                        data: atob(data),
                        seo
                    }
                }, {});


                this.data = result;

            });
        }

        add(expression:string|RegExp, fnc:(req:any, e:any)=>void) {
            this.router.get(expression, fnc);
        }

        navigate(url:string) {
            this.router.navigate(url);
        }

        
    }


}
