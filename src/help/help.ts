///<reference path='../fastmvc/references.ts'/>

module help
{
    export class Application
    {
        facade:fastmvc.Facade;
        problemsData:any = {
            'p0': 'Частые буферизации',
            'p1': 'Потеря соединения',
            'p2':'',
            '':'',
            '':'',
            '':'',
            '':''

        }

        constructor()
        {
            this.facade = new fastmvc.Facade('HelpApplication');
        }




    }
}