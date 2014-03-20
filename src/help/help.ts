///<reference path='../fastmvc/references.ts'/>

module help
{
    export class Application
    {
        facade:fastmvc.Facade;
        errorsData:any = {
            '': '',
            '': ''
        }

        constructor()
        {
            this.facade = new fastmvc.Facade('HelpApplication');
        }




    }
}