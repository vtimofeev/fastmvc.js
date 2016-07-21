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

        constructor(name:string, data:any = {page: '', overlay: ''}, opts?:fmvc.IModelOptions) {
            super(name, data, opts);
            this.router = new Grapnel({ pushState : true });
            this.init();
        }
        
        init() {
            var reOverlay = /.*\/overlay\/([^\/]+)\//,
                rePages = /.*\/page\/([^\/]+)\//;
            

            this.router.get(/.*/, (req, e)=>{
                var path = req.match[0] || '';
                    req.page = (path.match(rePages) || [])[1] || '',
                    req.overlay = (path.match(reOverlay) || [])[1] || '';

                //console.log('FINAL', req, req.page, path.match(rePages));

                var page = req.page || '',
                    pageParts = page.split('_'),
                    overlay = req.overlay || '',
                    overlayParts = overlay.split('_');

                this.changes = {
                    page: page,
                    pageType: pageParts[0],
                    pageName: pageParts[1],
                    pageAction: pageParts[2],
                    pageData: pageParts[3],

                    overlay: overlay,
                    overlayType: overlayParts[0],
                    overlayName: pageParts[1],
                }
            });
        }

        add(expression:string|RegExp, fnc:(req,e)=>void) {
            this.router.get(expression, fnc);
        }

        navigate(url:string) {
            this.router.navigate(url);
        }

        
    }


}
