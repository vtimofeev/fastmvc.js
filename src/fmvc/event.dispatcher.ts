/**
 * Created by Vasily on 19.06.2015.
 */


///<reference path='./d.ts'/>

module fmvc {
    export class EventDispatcher extends Notifier {
        public static NAME:string = 'EventDispatcher';
        private elementHashMap = {};
        private windowHashMap = {};

        constructor() {
            super(EventDispatcher.NAME, 'controller');
            _.bindAll(this, 'windowHandler');
        }

        listen(el:Element, type:string, handler:Function):EventDispatcher {
            var id = el.getAttribute('id');
            if(!id || !type || !handler) return;
            var uid = id + ':' + type;

            if(!this.windowHashMap[type]) this.createWindowListener(type);
            if(!this.elementHashMap[uid]) this.elementHashMap[uid] = handler;
            return this;
        }

        unlisten(el:Element, type:string) {
            var id = el.getAttribute('id');
            var uid = id + ':' + type;
            if(!id) return;
            delete this.elementHashMap[uid];
        }

        windowHandler(e) {
            var id = e.target.getAttribute('id');
            var uid = id + ':' + e.type;
            if(this.elementHashMap[uid]) this.elementHashMap[uid](e);
        }


        private createWindowListener(type:string) {
           //console.log('listen window type');
           this.windowHashMap[type] = true;
           window.addEventListener(type, this.windowHandler, true);
        }

    }
}
