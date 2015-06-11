/**
 * Created by Vasily on 27.05.2015.
 */

///<reference path='../fmvc/d.ts'/>

module fviews {
    export class List extends fmvc.ViewList {


        constructor(name:string, $root:any) {
            super(name, $root)
        }


        domNode:Element;

        static Dom() {
            var references:any = {
                children: null,
                selected: [],


            };

            var children:Element[] = [];

            var root:Element = document.createElement('div');
            root.setAttribute('class', 'first');
            root.setAttribute('class', 'second');
            references.selected.push({ element: root, name: 'list-{selected}' });
            children[0] = document.createTextNode('Any text ');
            children[1] = document.createTextNode('{text}');

            references['text'] = children[1];

            root.appendChild(children[0]);
            root.appendChild(children[1]);

            return
        }

    }
}