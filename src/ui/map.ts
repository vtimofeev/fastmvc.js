module ui.def {

    declare var ymaps:any;
    var ymapsScript:any;

    export var Map = {
        className: 'ui.Map',
        content: `
        <div .base="map" id="{name}" class="{state.base} {state.base}-{state.enabled}"/>`,
        mixin: {

            loadMapScript(cb:Function) {
                ymapsScript = document.createElement("script");
                ymapsScript.type = "text/javascript";
                ymapsScript.src = "https://api-maps.yandex.ru/2.1/?lang=ru-RU";
                document.head.appendChild(ymapsScript);
                ymapsScript.onload = cb;
            },

            createMap() {

                ymaps.ready( ()=> {
                    console.log('Map.ready ', this.model, this);
                    var data = this.model && this.model.data,
                        center = data && data.center || [55.76, 37.64],
                        zoom = data && data.zomm || 10;

                    this.instance = new ymaps.Map(this.getElement(), {
                        center: center,
                        zoom: zoom,
                        controls: []
                    });

                    this.model && this.model.bind(this, this.modelMapChangeHandler);

                } );

            },

            modelMapChangeHandler(e) {
                var changes = e.changes;

                if(changes.center) {
                    this.instance.setCenter( changes.center );
                }

                if(changes.zoom) {
                    this.instance.setZoom( changes.zoom );
                }
            },


            afterEnter(): void {

                if (!ymapsScript) {
                    this.loadMapScript(this.createMap.bind(this));
                }
                else {
                    !this.instance && this.createMap();
                }

            },

            disposeImpl() {
                this.instance = null;
            }

        }
    }
}
