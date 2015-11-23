var fmvc;!function(t){var e=function(){function t(){}return t.Model={Changed:"ModelChanged",StateChanged:"ModelStateChanged",Disposed:"ModelDisposed"},t}();t.Event=e}(fmvc||(fmvc={}));var fmvc;!function(t){t.VERSION="0.8.2",t.TYPE_MEDIATOR="mediator",t.TYPE_MODEL="model",t.TYPE_VIEW="view",t.FacadeModel={Log:"log"};var e=function(){function e(n,i,o){this._events={},this.model={},this.mediator={},this._name=n,this._type=i,this._root=o,e.registerInstance(this),this.register(new t.Logger(t.FacadeModel.Log)),this.init()}return Object.defineProperty(e.prototype,"mode",{get:function(){return this._mode},set:function(t){this._mode=t},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"root",{get:function(){return this._root},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"name",{get:function(){return this._name},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"type",{get:function(){return this._name},enumerable:!0,configurable:!0}),e.prototype.init=function(){this.log("Старт приложения "+name+", fmvc версия "+t.VERSION),this.log("Регистрация модулей"),this.initModels(),this.initMediators(),this.log("Старт приложения"),this.start()},e.prototype.initModels=function(){},e.prototype.initMediators=function(){},e.prototype.start=function(){},e.prototype.register=function(){for(var t=[],e=0;e<arguments.length;e++)t[e-0]=arguments[e];return _.each(t,this._register,this),this},e.prototype._register=function(e){var n=this;switch(this.log("Register "+e.name+", "+e.type),e.facade=this,e.type){case t.TYPE_MODEL:var i=e;this.model[e.name]=i;break;case t.TYPE_MEDIATOR:var o=e;this.mediator[e.name]=o,_.each(o.events,function(t){return n.addListener(o,t)},this)}},e.prototype.unregister=function(){for(var t=[],e=0;e<arguments.length;e++)t[e-0]=arguments[e];return _.each(t,this._unregister,this),this},e.prototype._unregister=function(e){switch(this.log("Unregister "+e.name+", "+e.type),e.dispose(),e.type){case t.TYPE_MODEL:delete this.model[e.name];break;case t.TYPE_MEDIATOR:delete this.mediator[e.name],this.removeListener(e)}},e.prototype.get=function(t){return this.model[t]||this.mediator[t]},e.prototype.addListener=function(t,e){return this._events[e]?this._events[e].push(t):this._events[e]=[t],this},e.prototype.removeListener=function(t,e){function n(e){e.indexOf(t)>-1&&(e=_.without(e,t))}return e?n(this._events[e]):_.each(this._events,n,this),this},e.prototype.eventHandler=function(t){var e=this._events[t.name];_.each(e,function(e){return e.eventHandler(t)})},Object.defineProperty(e.prototype,"logger",{get:function(){return this.model[t.FacadeModel.Log]},enumerable:!0,configurable:!0}),e.prototype.log=function(){for(var t=[],e=0;e<arguments.length;e++)t[e-0]=arguments[e];var n=this.logger;return n?n.add(this._name,t,0):console.log(this._name,t),this},e.registerInstance=function(t){e.__facadesByName[t.name]=t;var n=e.__facadesByType,i=t.type;(n[i]?n[i]:n[i]=[]).push(t)},e.unregisterInstance=function(t){delete e.__facadesByName[t.name],e.__facadesByType[t.type]=_.without(e.__facadesByType[t.type],t)},e.getFacadeByName=function(t){return e.__facadesByName[t]},e.getFacadesByType=function(t){return e.__facadesByType[t]},e.__facadesByName={},e.__facadesByType={},e}();t.Facade=e}(fmvc||(fmvc={}));var fmvc;!function(t){var e=function(){function t(t,e){void 0===e&&(e=null),this._disposed=!1,this._name=t,this._type=e}return Object.defineProperty(t.prototype,"facade",{get:function(){return this._facade},set:function(t){t?(this._facade=t,this.bind(this._facade,this._facade.eventHandler),this.registerHandler()):(this.removeHandler(),this.unbind(this._facade),this._facade=t)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"name",{get:function(){return this._name},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"disposed",{get:function(){return this._disposed},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"type",{get:function(){return this._type},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"listenerCount",{get:function(){return this._listeners?this._listeners.length:-1},enumerable:!0,configurable:!0}),t.prototype.setFacade=function(t){return this.facade=t,this},t.prototype.bind=function(t,e){return this.addListener(t,e),this},t.prototype.unbind=function(t,e){return this.removeListener(t,e),this},t.prototype.sendEvent=function(t,e,n,i,o){if(void 0===e&&(e=null),void 0===n&&(n=null),void 0===i&&(i=null),void 0===o&&(o=null),this._disposed)throw Error("Model "+this.name+" is disposed and cant send event");if(this._listeners){var r={name:t,sub:i,data:e,changes:n,error:o,target:this};this.sendToListeners(r)}},t.prototype.log=function(){for(var t=[],e=0;e<arguments.length;e++)t[e-0]=arguments[e];return this.facade?this.facade.logger.add(this.name,t):console.log(this.name,t),this},t.prototype.registerHandler=function(){},t.prototype.removeHandler=function(){},t.prototype.addListener=function(t,e){var n=this.hasBind(t,e);this._listeners||(this._listeners=[]),n||this._listeners.push({target:t,handler:e})},t.prototype.hasBind=function(t,e){var n,i,o;if(!this._listeners)return!1;for(i=0,n=this._listeners.length;n>i;i++)if(o=this._listeners[i],o.target===t&&o.handler===e)return!0;return!1},t.prototype.removeListener=function(t,e){var n=0;this._listeners.forEach(function(i,o){i.target!==t||e&&e!==i.handler||(this.splice(o-n,1),n++)},this._listeners)},t.prototype.removeAllListeners=function(){this._listeners=null},t.prototype.sendToListeners=function(t){for(var e,n,i=0,o=this._listeners.length;o>i;i++)e=this._listeners[i],n=e.target,n.disposed?this.unbind(e):e.handler.call(n,t)},t.prototype.dispose=function(){this.removeAllListeners(),this._facade=null,this._disposed=!0},t}();t.Notifier=e}(fmvc||(fmvc={}));var __extends=this.__extends||function(t,e){function n(){this.constructor=t}for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i]);n.prototype=e.prototype,t.prototype=new n},fmvc;!function(t){t.ModelState={None:"none",New:"new",Parsing:"parsing",Parsed:"parsed",Syncing:"syncing",Synced:"synced",Changed:"changed",Error:"error"},t.ModelAction={Get:"get",Insert:"insert",Update:"update",Delete:"delete",Add:"add"};var e=function(e){function n(n,i,o){void 0===i&&(i=null),e.call(this,n,t.TYPE_MODEL),this.enabledEvents=!0,this.enabledState=!0,this.enableValidate=!1,this.enableCommit=!1,this.autoCommit=!1,this.history=!1,o&&_.extend(this,o),i&&(this.setData(i),this.setState(t.ModelState.New))}return __extends(n,e),n.prototype.reset=function(){return this._data=null,this._changes=null,this._state=t.ModelState.None,this.sendEvent(t.Event.Model.Changed),this},Object.defineProperty(n.prototype,"d",{get:function(){return this.getData()},set:function(t){this.setData(t)},enumerable:!0,configurable:!0}),Object.defineProperty(n.prototype,"data",{get:function(){return this.getData()},set:function(t){this.setData(t)},enumerable:!0,configurable:!0}),Object.defineProperty(n.prototype,"invalid",{get:function(){return this._invalid},enumerable:!0,configurable:!0}),n.prototype.getData=function(){return this._data},n.prototype.setData=function(e){this._data===e||this.disposed||(this._data=e,this.sendEvent(t.Event.Model.Changed,this._data,this._changes))},Object.defineProperty(n.prototype,"changes",{get:function(){return this._changes},set:function(t){this.setChanges(t)},enumerable:!0,configurable:!0}),n.prototype.setChanges=function(e){this._data===e||this.disposed||(this.enableCommit?(this._changedData=_.isObject(e)&&_.isObject(this._data)?_.extend(this._changedData||_.extend({},this._data),e):e,this.state=t.ModelState.Changed,this.autoCommit&&this.commit()):this.applyChanges(e))},n.prototype.applyChanges=function(e){_.isObject(e)&&_.isObject(this._data)?_.extend(this._data,e):this._data=e,this.state=t.ModelState.Synced,this.sendEvent(t.Event.Model.Changed,this._data,this._changes)},n.prototype.commit=function(){if(this._changedData){var t=this.validate();return t?this.sync().then(this.applyChanges,this.syncErrorHandler):t}return!0},n.prototype.sync=function(){return this.state=t.ModelState.Syncing,this.syncImpl()},n.prototype.syncImpl=function(){return null},n.prototype.syncErrorHandler=function(){this.state=t.ModelState.Error},n.prototype.validate=function(){return!1},Object.defineProperty(n.prototype,"state",{get:function(){return this._state},set:function(t){this.setState(t)},enumerable:!0,configurable:!0}),Object.defineProperty(n.prototype,"prevState",{get:function(){return this._prevState},enumerable:!0,configurable:!0}),n.prototype.setState=function(e){return this.enabledState&&this._state!==e?(this._prevState=e,this._state=e,this.sendEvent(t.Event.Model.StateChanged,this._state),this):this},Object.defineProperty(n.prototype,"length",{get:function(){return _.isArray(this.data)?this.data.length:-1},enumerable:!0,configurable:!0}),n.prototype.sendEvent=function(t,n,i,o,r){void 0===n&&(n=null),void 0===i&&(i=null),void 0===o&&(o=null),void 0===r&&(r=null),this.enabledEvents&&e.prototype.sendEvent.call(this,t,n,i,o,r)},n.prototype.dispose=function(){this.sendEvent(t.Event.Model.Disposed),this._data=null,e.prototype.dispose.call(this)},n}(t.Notifier);t.Model=e}(fmvc||(fmvc={}));var fmvc;!function(t){var e=function(e){function n(t,n,i){e.call(this,t,null,i),this.throttleApplyChanges=_.throttle(_.bind(this.apply,this),100,{leading:!1}),_.isArray(n)?this.addSources(n):this.addSource(n)}return __extends(n,e),n.prototype.addSources=function(t){var e=this;return t?(this._sources||(this._sources=[]),_.each(t,function(t){return e.addSource(t)},this),this):this},n.prototype.addSource=function(e,n){if(e instanceof t.Model){var i=e;if(i.bind(this,this.sourceChangeHandler),this._sources.push(i),n){if(!_.isFunction(n))throw"SourceModel: Cant set "+n+" mapBeforeCompareFunc for model "+i.name;this.setMapBeforeCompare(i.name,n)}}else{if(!e.length)throw"SourceModel: Cant add source "+e;this._sources.push(e)}return this},n.prototype.removeSource=function(e){var n=-1;if(!(this._sources&&(n=this._sources.indexOf(e))>-1))throw"SourceModel: Can remove source "+e;return this._sources.splice(n,1),e instanceof t.Model&&e.unbind(e),this._mapBeforeCompareFunc[e.name]&&delete this._mapBeforeCompareFunc[e.name],this},n.prototype.sourceChangeHandler=function(t){this.throttleApplyChanges()},n.prototype.setSourceCompareFunc=function(t){return this._sourceCompareFunc=t,this.throttleApplyChanges(),this},n.prototype.setMapBeforeCompare=function(t,e){return this._mapBeforeCompareFunc||(this._mapBeforeCompareFunc={}),this._mapBeforeCompareFunc[t]=e,this.throttleApplyChanges(),this},n.prototype.setResultFunc=function(){for(var t=[],e=0;e<arguments.length;e++)t[e-0]=arguments[e];return this._resultFuncs=t?_.flatten([].concat(this._resultFuncs?this._resultFuncs:[],t)):null,this.throttleApplyChanges(),this},n.prototype.apply=function(){if(!this.disposed){if(this._sources&&this._sources.length||this.setData(null),!this._sourceCompareFunc&&this._sources.length>1)throw"SourceModel: has source datas, but method not defined";var t=null,e=this.getSourceResult();e&&(t=_.reduce(this._resultFuncs,function(t,e){return e.call(this,t)},e,this)),this.reset().setData(t)}},n.prototype.getSourceResult=function(){return this._sourceCompareFunc&&this._sources.length>1?this._sourceCompareFunc.apply(this,_.map(this._sources,this.getPreparedSourceData,this),this):this._sources[0]instanceof t.Model?this._sources[0].data:this._sources[0]},n.prototype.getPreparedSourceData=function(e){if(e instanceof t.Model){var n=this._mapBeforeCompareFunc&&this._mapBeforeCompareFunc[e.name]?this._mapBeforeCompareFunc[e.name]:null,i=n?_.map(e.data,n):e.data;return i}return e},n.prototype.dispose=function(){var t=this;_.each(this._sources,function(e){return t.removeSource(e)},this),_.each(this._mapBeforeCompareFunc,function(e,n){return delete t._mapBeforeCompareFunc[n]},this),this._mapBeforeCompareFunc=null,this._sources=null,this._sourceCompareFunc=null,this._resultFuncs=null,this._sourceCompareFunc=null,e.prototype.dispose.call(this)},n}(t.Model);t.CompositeModel=e}(fmvc||(fmvc={}));var fmvc;!function(t){var e=function(t){function e(e,n){t.call(this,e,[]),this._config={filter:[],length:1e5,console:!0},this._modules=[],n&&(this.config=n),console.log("Construct facade logger ")}return __extends(e,t),Object.defineProperty(e.prototype,"config",{set:function(t){_.extend(this._config,t)},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"console",{set:function(t){this._config.console=t},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"filter",{set:function(t){this._config.filter=t},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"modules",{get:function(){return this._modules},enumerable:!0,configurable:!0}),e.prototype.add=function(t,e,n){void 0===e&&(e=null),void 0===n&&(n=0);var i={name:t,data:e,level:n,date:new Date},o=this.data,r=this._config;return o.push(i),-1===this._modules.indexOf(t)&&this._modules.push(t),r.filter&&r.filter.length&&-1===r.filter.indexOf(t)?void 0:(r&&r.console&&"console"in window&&console.log("["+t+"] "+n+" ",e),o.length>2*r.length&&o.splice(0,o.length-this._config.length),this.enabledEvents&&this.sendEvent("log",i,null,null),this)},e}(t.Model);t.Logger=e}(fmvc||(fmvc={}));var fmvc;!function(t){function e(){a||(a=!0,window.requestAnimationFrame?window.requestAnimationFrame(i):setTimeout(i,0))}function n(t,n){for(var i=[],o=2;o<arguments.length;o++)i[o-2]=arguments[o];var s=function(){return t.apply(n,i)};r.push(s),e()}function i(n){if(++t.frameExecution%h===0){var i=r.splice(0,s);_.each(i,function(t,e){return t()})}a=!1,r.length&&e()}t.InvalidateType={Data:1,App:2,State:4,Parent:8,Children:16,Template:32,Theme:64,I18n:128,All:255};var o={Validate:"validate"};t.frameExecution=0;var r=[],s=5e3,a=!1,h=1;t.nextFrameHandler=n;var u=function(e){function i(n){e.call(this,n,t.TYPE_VIEW),this._states={},this._invalidate=0,this._isWaitingForValidate=!1,this._inDocument=!1,this._isDomCreated=!1,_.bindAll(this,o.Validate)}return __extends(i,e),Object.defineProperty(i.prototype,"parent",{get:function(){return this._parent},set:function(t){this._parent=t},enumerable:!0,configurable:!0}),i.prototype.getElement=function(){return this._element},i.prototype.setElement=function(t){if(this._element)throw Error("Cant set element of the fmvc.View instance "+this.name);this._element=t},i.prototype.setMediator=function(t){return this._mediator=t,this},Object.defineProperty(i.prototype,"mediator",{get:function(){return this._mediator},set:function(t){this.setMediator(t)},enumerable:!0,configurable:!0}),i.prototype.setStates=function(t){return _.each(t,this.setStateReverse,this),this},i.prototype.setStateReverse=function(t,e){return this.setState(e,t),this},i.prototype.setState=function(e,n){if(!this.disposed){var i=this.getStateValue(e,n);return this._states[e]===i?this:(this._states[e]=i,this.applyStateBinds(e,i),this.invalidate(t.InvalidateType.State),this)}},i.prototype.applyStateBinds=function(t,e){},i.prototype.getStateValue=function(t,e){return e},i.prototype.getState=function(t){return this._states[t]},Object.defineProperty(i.prototype,"model",{get:function(){return this._model},set:function(t){this.setModel(t)},enumerable:!0,configurable:!0}),Object.defineProperty(i.prototype,"data",{get:function(){return this._data},set:function(t){this.setData(t)},enumerable:!0,configurable:!0}),i.prototype.setData=function(e){return this.disposed?this:this._data===e?this:(this._data=e,this.invalidate(t.InvalidateType.Data),this)},i.prototype.setModel=function(e){return this.disposed?this:(e!=this._model&&(this._model&&this._model.unbind(this),e&&e instanceof t.Model&&e.bind(this,this.modelChangeHandler),this.setData(e?e.data:null),this._model=e),this)},Object.defineProperty(i.prototype,"app",{get:function(){return this._mediator&&this._mediator.facade?this._mediator.facade.model:this.parent?this.parent.app:null},enumerable:!0,configurable:!0}),Object.defineProperty(i.prototype,"inDocument",{get:function(){return this._inDocument},enumerable:!0,configurable:!0}),Object.defineProperty(i.prototype,"isDomCreated",{get:function(){return this._isDomCreated},enumerable:!0,configurable:!0}),i.prototype.createDom=function(){this._isDomCreated||(this.beforeCreate(),this.createDomImpl(),this._isDomCreated=!0,this.afterCreate())},i.prototype.createDomImpl=function(){this.setElement(document.createElement("div"))},i.prototype.enter=function(){if(this._inDocument)throw new Error("Cant enter, it is in document");this.enterImpl(),this._inDocument=!0,this.afterEnter()},i.prototype.enterImpl=function(){var t=this;this._model&&this._model.bind(this,this.modelChangeHandler),this._binds&&this._binds.forEach(function(e){return e.bind(t,t.invalidateApp)})},i.prototype.exit=function(){this.beforeExit(),this.exitImpl(),this._inDocument=!1,this.afterExit()},i.prototype.modelChangeHandler=function(e){this.setData(this.model.data),this.invalidateData(),e&&e.name===t.Event.Model.Disposed&&this.dispose()},i.prototype.exitImpl=function(){var t=this;this._model&&this._model.unbind(this),this._binds&&this._binds.forEach(function(e){return e.unbind(t)})},i.prototype.beforeCreate=function(){},i.prototype.afterCreate=function(){},i.prototype.beforeEnter=function(){},i.prototype.afterEnter=function(){},i.prototype.beforeExit=function(){},i.prototype.afterExit=function(){},i.prototype.afterRender=function(){},i.prototype.beforeUnrender=function(){},i.prototype.invalidate=function(t){this._invalidate=this._invalidate|t,this._isWaitingForValidate||(this._isWaitingForValidate=!0,n(this.validate,this))},Object.defineProperty(i.prototype,"isWaitingForValidate",{get:function(){return this._isWaitingForValidate},enumerable:!0,configurable:!0}),i.prototype.invalidateData=function(){this.invalidate(t.InvalidateType.Data)},i.prototype.invalidateApp=function(){this.invalidate(t.InvalidateType.App)},i.prototype.invalidateAll=function(){this.invalidate(t.InvalidateType.App|t.InvalidateType.Data|t.InvalidateType.State)},i.prototype.validate=function(){this._inDocument&&this._invalidate&&(this._invalidate&t.InvalidateType.State&&this.validateState(),this._invalidate&t.InvalidateType.Data&&this.validateData(),this._invalidate&t.InvalidateType.App&&this.validateApp(),this._invalidate=0,this._isWaitingForValidate=!1)},i.prototype.validateData=function(){},i.prototype.validateState=function(){},i.prototype.validateApp=function(){},i.prototype.render=function(t,e){var n=this.isDomCreated;return this.createDom(),this.enter(),n&&this.invalidateAll(),e?t.replaceChild(this.getElement(),e):t.appendChild(this.getElement()),this.afterRender(),this},i.prototype.unrender=function(t){this.exit(),this.beforeUnrender();var e=this.getElement().parentNode;return e?(t?e.replaceChild(t,this.getElement()):e.removeChild(this.getElement()),this):this},i.prototype.dispose=function(){this.exit(),this.unrender(),e.prototype.dispose.call(this),this._states=null,this._parent=null,this._mediator=null,this._model=null,this._data=null,this._binds=null},i.prototype.sendEvent=function(t,e,n,i,o){void 0===e&&(e=null),void 0===n&&(n=null),void 0===i&&(i=null),void 0===o&&(o=!1);var r={name:t,data:e,global:o,target:this};this.mediator&&this.mediator.internalHandler(r)},i.prototype.log=function(){for(var t=[],e=0;e<arguments.length;e++)t[e-0]=arguments[e];return this.mediator&&this.mediator.facade&&this.mediator.facade.logger.add(this.name,t),this},i.prototype.unregisterBind=function(t){var e=this._binds.indexOf(t);e>-1&&this._binds.splice(e,1),t.unbind(this)},i.prototype.registerBind=function(t){this._binds||(this._binds=[]),this._binds.indexOf(t)>-1||(this._binds.push(t),this.inDocument&&t.bind(this,this.invalidateApp))},i}(t.Notifier);t.View=u}(fmvc||(fmvc={}));var fmvc;!function(t){var e=function(e){function n(n,i){e.call(this,n,t.TYPE_MEDIATOR),this.setRoot(i),this.views=[]}return __extends(n,e),n.prototype.setRoot=function(t){return this._root=t,this},Object.defineProperty(n.prototype,"root",{get:function(){return this._root},enumerable:!0,configurable:!0}),n.prototype.addView=function(){for(var t=[],e=0;e<arguments.length;e++)t[e-0]=arguments[e];return _.each(t,this._addView,this),this},n.prototype._addView=function(t){-1===this.views.indexOf(t)?(this.views.push(t),t.setMediator(this).render(this.root)):this.log("Warn: try to duplicate view")},n.prototype.getView=function(t){return _.find(this.views,function(e){return e.name===t})},n.prototype.removeView=function(t){return this.views=_.without(this.views,this.getView(t)),this},Object.defineProperty(n.prototype,"events",{get:function(){return null},enumerable:!0,configurable:!0}),n.prototype.internalHandler=function(t){t&&t.globalScope?this.facade.eventHandler(t):this.eventHandler(t)},n.prototype.eventHandler=function(e){switch(e&&e.target?e.target.type:null){case t.TYPE_MEDIATOR:this.mediatorEventHandler(e);break;case t.TYPE_MODEL:this.modelEventHandler(e);break;case t.TYPE_VIEW:this.viewEventHandler(e)}},n.prototype.modelEventHandler=function(t){},n.prototype.mediatorEventHandler=function(t){},n.prototype.viewEventHandler=function(t){},n}(t.Notifier);t.Mediator=e}(fmvc||(fmvc={}));