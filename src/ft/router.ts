///<reference path='d.ts'/>
declare var Grapnel:any;

namespace ft {

    export interface IRoute {
        id?:string;
        action?:string;
        data?:any;
        seo?:string;

    }

    export interface IRoutes  {
        [name:string]:IRoute
    }

    export class Router<IRoutes> extends fmvc.Model<IRoute> {

        private _navigateHandler:any;
        protected router:any;
        protected re:RegExp;

        constructor(name:string, data:any = {page: '', overlay: ''}, opts?:fmvc.IModelOptions) {
            super(name, data, opts);
            this.router = new Grapnel({ pushState : true });
            this.init();
        }

        set navigateHandler(value:any) {
            this._navigateHandler = value;
        }

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
        init() {
            this.re = /([^-]+)(?:-([^-]+))?(?:-([^-]+))?(?:-([^-]+))?(?:---(.+))?/;

            this.router.get(/.*/, (req:any, e:any)=>{

                var result:any = {},
                    path:string = req.match[0] || '',
                    routerParts:string[] = path.split('/').filter( v=>!!v ),
                    routerResults = routerParts.map( v=>this.re.exec(v) );

                routerResults.reduce( (m:any, v:string[])=>{
                    var [full, model, id, action, data, seo] = v;

                    m[model] = { id, action, data: this.tryAtob(data) || data, seo };

                    return m;
                }, result);

                this.data = result;
            });
        }

        tryAtob(value:any) {
            try {
                return value && JSON.parse(atob(value));
            }
            catch(e) {
                return null;
            }
        }

        add(expression:string|RegExp, fnc:(req:any, e:any)=>void) {
            this.router.get(expression, fnc);
        }

        navigate(url:string):Promise<any> {
            console.log('Navigate href handler ... ', url);
            this.router.navigate(url);
            return this._navigateHandler ? this._navigateHandler(this.data) : Promise.resolve(true);
        }

        test(v) {
            return v && v.indexOf('//') === -1;
        }

        hrefHandler(v) {
            var href = v && v.getAttribute('href');
            console.log('Href handler prepare... ', href, v);
            if(v && v.getAttribute && this.test(href)) {
                href && this.navigate(href);
                return true;
            } else {
                return false;
            }
        }

    }


}
