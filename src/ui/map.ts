module ui.def {

    declare var ymaps:any;
    var ymapsScript:any;

    /*

     // Создание метки со сложной фигурой активной области.
     var polygonLayout = ymaps.templateLayoutFactory.createClass('<div class="placemark_layout_container"><div class="polygon_layout">!</div></div>');

     var polygonPlacemark = new ymaps.Placemark(
     [55.662693, 37.558416], {
     hintContent: 'HTML метка сложной формы'
     }, {
     iconLayout: polygonLayout,
     // Описываем фигуру активной области "Полигон".
     iconShape: {
     type: 'Polygon',
     // Полигон описывается в виде трехмерного массива. Массив верхнего уровня содержит контуры полигона.
     // Первый элемента массива -
     это внешний контур, а остальные - внутренние.
     coordinates: [
     // Описание внешнего контура полигона в виде массива координат.
     [[-28,-76],[28,-76],[28,-20],[12,-20],[0,-4],[-12,-20],[-28,-20]]
     // , ... Описание внутренних контуров - пустых областей внутри внешнего.
     ]
     }
     }
     );

     */

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
                        items = this.model.data.items,
                        center = data && data.center || [37.64, 55.76],
                        zoom = data && data.zomm || 10;

                    this.instance = new ymaps.Map(this.getElement(), {
                        center: [].concat(center).reverse(),
                        zoom: zoom,
                        controls: []
                    });

                    this.instance.events.add('click', (e)=>{
                        console.log('Map click ', e, e.get('coords'));
                        this.model.changes = { mapclick: e.get('coords').reverse() };
                    });

                    this.model && this.model.bind(this, this.modelMapChangeHandler);
                    items && items.bind && items.bind(this, this.itemsChange);
                    items && items.data && this.itemsChange({target: items});

                } );

            },

            createPoint (v):any {
                var pointDefault = { style: 'default#redSmallPoint', content: v.name },
                    point = (v.point instanceof Array)?[].concat(v.point).reverse():null,
                    r;

                if(!point) return null;

                r = new ymaps.Placemark(point, pointDefault)
                r.events.add('click', ()=>{
                    r.options.set({preset: 'islands#blueIcon'});
                    this.model.changes = { current: v };
                });

                return r;
            },

            createCollection(type):any {

                var collectionDefault = {preset: 'islands#redIcon'},
                    collection = new ymaps.GeoObjectCollection(null, collectionDefault);

                return collection;
            },


            itemsChange(e) {

                var collectionName = 'defaultCollection',
                    col = this.collection || (this.collection = this.createCollection(collectionName)),
                    geoPoint;

                this.instance.geoObjects.add(col);
                col.removeAll();

                e.target.data && e.target.data.forEach(
                    (v,k)=>{
                        var obj = (v && v.data) || v;
                        

                        if(!(obj && obj.point)) return;
                        geoPoint = this.createPoint(obj);
                        col.add( geoPoint );

                    }
                );

                geoPoint && this.instance.setBounds( col.getBounds() );

            },

            modelMapChangeHandler(e) {

                var changes = e.changes || {};

                if(changes.center) {
                    this.instance.setCenter( [].concat(changes.center).reverse() );
                }

                if(changes.zoom) {
                    this.instance.setZoom( changes.zoom );
                }

                if(changes.current) {
                    var data = changes.current;
                    if(data && data.point) {
                        this.instance.setCenter( [].concat(data.point).reverse() );
                        this.instance.setZoom( 12 );
                    }
                    else if(this.collection) {
                        this.instance.setBounds( this.collection.getBounds() );
                    }
                    else {
                        this.instance.setCenter( this.model.data.center );
                        this.instance.setZoom( this.model.data.zoom );
                    }

                }

            },


            afterEnter(): void {

                if(ft.isNode) return;

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
