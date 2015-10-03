///<reference path="./d.ts" />
var ft;
(function (ft) {
    var TemplateViewHelper = (function () {
        function TemplateViewHelper() {
            this.idCounter = 0;
            this.idMap = {};
            _.bindAll(this, 'createTreeObjectFunc', 'setElementPathToRoot', 'addTreeObjectFunc', 'getTreeObject', 'setDataTreeObjectFunc', 'enterTreeObjectFunc');
            this.createTreeObject = this.createTreeObjectFunctor();
            this.enterTreeObject = this.enterTreeObjectFunctor();
            this.exitTreeObject = this.exitTreeObjectFunctor();
            this.updateTreeObject = this.updateTreeObjectFunctor();
            this.setDataTreeObject = this.setDataTreeObjectFunctor();
        }
        TemplateViewHelper.prototype.functorTreeObject = function (treeObjGetter, treeObjFunctor, childrenTreeObjMapper /* reverse if true */, childrenModificator, functorName) {
            var t = this;
            function instanceFunctor(data, root) {
                //console.log('[%s]', functorName, ' instanceFunctor data, root: ', data, root, ' getter, functorm childrenTree, modificator ', treeObjGetter, treeObjFunctor, childrenTreeObjMapper, childrenModificator);
                var treeObject = treeObjGetter(data, root);
                if (!treeObject)
                    return null;
                //console.log('Check for ', functorName, ' treeObject ', treeObject);
                if (this.isDomElementComment(this.getDomElement(treeObject)))
                    return treeObject;
                // execute tree object functor
                if (treeObjFunctor)
                    treeObjFunctor(treeObject, data, root);
                // execute tree child mapper
                if (childrenTreeObjMapper) {
                    // create children mapper, or use this
                    var childrenMapperInstance = _.partial(childrenTreeObjMapper === true ? instanceFunctor.bind(t) : childrenTreeObjMapper, _, root);
                    var childrenMap = _.map(data.children, childrenMapperInstance, this);
                    // children result executor, appendChild for example
                    if (childrenModificator) {
                        var childrenModificatorInstance = _.partial(childrenModificator, _, treeObject, data, root);
                        _.each(childrenMap, childrenModificatorInstance, this);
                    }
                }
                return treeObject;
            }
            return instanceFunctor.bind(t);
        };
        TemplateViewHelper.prototype.createTreeObjectFunctor = function () {
            return this.functorTreeObject(this.createTreeObjectFunc, this.setElementPathToRoot, true, this.addTreeObjectFunc, 'create');
        };
        TemplateViewHelper.prototype.enterTreeObjectFunctor = function () {
            return this.functorTreeObject(this.getTreeObject, this.enterTreeObjectFunc, true, null);
        };
        TemplateViewHelper.prototype.updateTreeObjectFunctor = function () {
            return this.functorTreeObject(this.updateTreeOfTreeObjectFunc, null, true, null, 'update');
        };
        TemplateViewHelper.prototype.exitTreeObjectFunctor = function () {
            return this.functorTreeObject(this.getTreeObject, this.exitTreeObjectFunc, true, this.removeTreeObject);
        };
        TemplateViewHelper.prototype.setDataTreeObjectFunctor = function () {
            return this.functorTreeObject(this.getTreeObject, this.setDataTreeObjectFunc, true, null, 'setdata');
        };
        TemplateViewHelper.prototype.isTagElement = function (e) {
            return e && e.nodeType === 1;
        };
        TemplateViewHelper.prototype.isDomElementComment = function (e) {
            return e && e.nodeType === 8;
        };
        TemplateViewHelper.prototype.getIdMap = function () {
            return this.idMap;
        };
        // Simple commands
        TemplateViewHelper.prototype.setElementPathToRoot = function (value, data, root) {
            this.initIfComponent(value, data, root);
            root.setPathOfCreatedElement(data.path, value);
            //if (data.link) root.setTemplateElementProperty(data.link, value);
        };
        TemplateViewHelper.prototype.initIfComponent = function (value, data, root) {
            if (value instanceof ft.TemplateView) {
                //console.log('Init component on create, ', value, value.getElement());
                var view = value;
                view.parent = root;
                if (data) {
                    view.parentDomDef = root.getDomDefinitionByPath(data.parentPath);
                    this.initTemplateParams(view, data, root);
                    this.initTemplateHandlers(view, data, root);
                }
                view.createDom();
            }
        };
        TemplateViewHelper.prototype.initTemplateParams = function (view, data, root) {
            _.each(data.params, _.partial(this.setTemplateParam, _, _, view, root), this);
        };
        TemplateViewHelper.prototype.initTemplateHandlers = function (view, data, root) {
            _.each(data.handlers, function (value, name) { return view.on(name, function () { view.evalHandler(value); }); });
        };
        TemplateViewHelper.prototype.setTemplateParam = function (value, key, view, root) {
            console.log('Set template params', value, key, view, root);
            switch (key) {
                case ft.TemplateParams.ln:
                    if (root[value])
                        throw 'Can set template param ' + key + ', cause it exist';
                    root[value] = view;
                    break;
                case ft.TemplateParams.setData:
                    view.data = this.getExpressionValue(value, root);
                    break;
                case ft.TemplateParams.setModel:
                    view.model = this.getExpressionValue(value, root);
                    break;
                case ft.TemplateParams.setStateSelected:
                    console.log('State selected:', this.getExpressionValue(value, root));
                    view.setState('selected', !!this.getExpressionValue(value, root));
                    break;
            }
        };
        TemplateViewHelper.prototype.getTreeObject = function (data, root) {
            return this.isComponentDef(data) ? root.getComponentByPath(data.path) : root.getElementByPath(data.path);
        };
        TemplateViewHelper.prototype.createTreeObjectFunc = function (data, root) {
            var isIncluded = this.isTreeObjectIncluded(data, root);
            var result;
            if (isIncluded) {
                //@todo should get or maybe no?
                result = this.getTreeObject(data, root) || (this.isComponentDef(data) ? this.createComponentElement(data, root) : this.createDomElement(data.type, data, root));
            }
            else {
                result = this.createDomElement('comment', data, root);
            }
            return result;
        };
        TemplateViewHelper.prototype.removeDataChildrenOfTreeObject = function (object, data, root) {
            var children = root.getDataChildrenByPath(data.path);
            //console.log('Remove children ', children);
            _.each(children, function (child) { return child.dispose(); });
            //@todo use object pool
        };
        TemplateViewHelper.prototype.createDataChildrenOfTreeObject = function (object, data, root) {
            //@todo use object pool
            //console.log('Create data children start');
            var _this = this;
            var className = data.params[ft.TemplateParams.childrenClass];
            var ViewClass = (ft.global[className]);
            if (!ViewClass)
                throw 'Children class ' + className + ' not found';
            var childrenData = data.params[ft.TemplateParams.childrenData] ? this.getExpressionValue(data.params[ft.TemplateParams.childrenData], root) : null;
            var childrenModel = data.params[ft.TemplateParams.childrenModel] ? this.getExpressionValue(data.params[ft.TemplateParams.childrenModel]) : null;
            var childrenMap = _.map(childrenData, function (v) { return new ViewClass(className + '-' + _this.getNextId(), { data: v }); });
            var parentElement = this.getDomElement(object);
            _.each(childrenMap, function (child) {
                this.initIfComponent(child, null, root);
                child.parentDomDef = data;
                child.enter();
                parentElement.appendChild(child.getElement());
            }, this);
            //console.log('Create data children ex, data, map ', data.params.childrendata, childrenData, root.data, childrenMap);
            if (!_.isEmpty(childrenMap))
                root.setDataChildrenByPath(data.path, childrenMap);
        };
        TemplateViewHelper.prototype.createComponentElement = function (data, root) {
            var ComponentConstructor = window[data.name];
            var result = ComponentConstructor('view-' + data.name + '-' + this.getNextId(), data.params);
            //console.log('ComponentConstructor: ', data.name, ComponentConstructor, result);
            return result;
        };
        TemplateViewHelper.prototype.createDomElement = function (type, data, root) {
            switch (type) {
                case 'text':
                    return document.createTextNode(_.isString(data.data) ? data.data : '');
                case 'comment':
                    return document.createComment(data.path);
                default:
                    return document.createElement(data.name);
            }
        };
        TemplateViewHelper.prototype.updateTreeOfTreeObjectFunc = function (data, root) {
            var updateType = this.getUpdateTreeTypeFunc(data, root);
            ////console.log('Update func for: ', data.path, updateType, data, root);
            if (updateType === 1)
                return (this.createTreeObject(data, root), this.enterTreeObject(data, root), this.setDataTreeObject(data, root));
            else if (updateType === -1)
                return (this.exitTreeObject(data, root));
        };
        TemplateViewHelper.prototype.getUpdateTreeTypeFunc = function (data, root) {
            var isIncluded = this.isTreeObjectIncluded(data, root);
            var treeObject = this.getTreeObject(data, root);
            // 0 - skip, N1 - create, -1 - remove
            return ((isIncluded && treeObject) ? 0 : isIncluded ? 1 : -1);
        };
        TemplateViewHelper.prototype.enterTreeObjectFunc = function (object, data, root) {
            if (object && object instanceof ft.TemplateView) {
                object.enter();
            }
            //console.log('!! Enter for tree element createDataChildren ', this.hasDataChildren(data), data.attribs, data.params);
            if (this.hasDataChildren(data))
                this.createDataChildrenOfTreeObject(object, data, root);
        };
        TemplateViewHelper.prototype.hasDataChildren = function (data) {
            return !!(data.params
                && data.params[ft.TemplateParams.childrenClass] // has constructor
                && (data.params[ft.TemplateParams.childrenData] || data.params[ft.TemplateParams.childrenModel]) // has data
            );
        };
        TemplateViewHelper.prototype.exitTreeObjectFunc = function (object, data, root) {
            if (object && object instanceof ft.TemplateView)
                object.exit();
        };
        TemplateViewHelper.prototype.updateDynamicTree = function (root) {
            var _this = this;
            //console.log('Update start');
            var dynamicTree = root.getTemplate().dynamicTree;
            //console.log('Update start 1');
            var exArrays = _.map(dynamicTree, function (v, group) { return _this.getChangedExpressionNames(group, v, root); }, this);
            var exNames = _.compose(_.compact, _.flatten)(exArrays);
            //console.log('Changed values (expression): ', exNames);
            var tmpl = root.getTemplate();
            var exObjArrays = _.map(exNames, function (v) { return (tmpl.expressionMap[v]); });
            _.each(exObjArrays, _.partial(this.applyExpressionToHosts, _, root), this);
        };
        TemplateViewHelper.prototype.getChangedExpressionNames = function (group, map, root) {
            return _.map(map, function (exNames, prorName) { return (root.isChangedDynamicProperty(prorName) ? exNames : null); }, this);
        };
        TemplateViewHelper.prototype.getEventPath = function (e) {
            var previousElement = (e.previousTarget instanceof ft.TemplateView) ? e.previousTarget.getElement().parentNode : null;
            var el = previousElement || e.e.target;
            console.log('Get event path, ', e.name, el.getAttribute('data-path'));
            return el.getAttribute('data-path');
        };
        TemplateViewHelper.prototype.dispatchTreeEvent = function (e, path) {
            // side effect tree event
            this.execEventDefsFromPathToRoot(e, path ? path : this.getEventPath(e));
        };
        TemplateViewHelper.prototype.execEventDefsFromPathToRoot = function (e, path) {
            var view = e.currentTarget;
            var template = view.getTemplate();
            var def = template.pathMap[path];
            console.log('execute for path %s, name %s, parent %s, canceled %s', def.path, e.name, def.parentPath, !!e.cancelled);
            // Выполняем событие на текущем уровне
            this.executeEventDef(e, def, view);
            while ((def = template.pathMap[def.parentPath]) && !e.cancelled) {
                // Выполняем для дочерних, присваивая def родителю
                this.executeEventDef(e, def, view);
            }
        };
        TemplateViewHelper.prototype.executeEventDef = function (e, def, view) {
            console.log("executeEventOnDef, def, event name ", def, e.name);
            if (e instanceof ft.TemplateView) {
                e.handleTreeEvent(e);
            }
            else {
                if (!(def.handlers && def.handlers[e.name]))
                    return null;
            }
            view.evalHandler(def.handlers[e.name], e);
        };
        TemplateViewHelper.prototype.applyExpressionToHosts = function (exObj, root) {
            var _this = this;
            var result;
            var el;
            _.each(exObj.hosts, function (host) { return (result = result || (host.key === 'class' ? root.getClassExpressionValue(exObj) : root.getExpressionValue(exObj)),
                el = root.getElementByPath(host.path),
                el && el.nodeType != 8 ? _this.applyValueToHost(result, el, host, root) : null); }, this);
        };
        TemplateViewHelper.prototype.applyValueToHost = function (value, el, host, root) {
            //console.log('Apply value: ', host.group, host.key, host.path, value);
            switch (host.group) {
                case 'attribs':
                    switch (host.key) {
                        case 'style':
                            el.style[host.keyProperty] = (value ? value : '');
                            return;
                        case 'class':
                            var previousClassValue = root.getPathClassValue(host.path, host.keyProperty);
                            previousClassValue && previousClassValue !== value ? el.classList.toggle(previousClassValue, false) : null;
                            value ? el.classList.toggle(value, true) : null;
                            root.setPathClassValue(host.path, host.keyProperty, value);
                            return;
                        default:
                            var method = value ? el.setAttribute : el.removeAttribute;
                            if (host.key)
                                method.call(el, host.key, value);
                            return;
                    }
                    return;
                case 'params':
                    switch (host.key) {
                        case 'childrendata':
                            var domDef = root.getDomDefinitionByPath(host.path);
                            //console.log('Domdef on childrendata change', domDef, el);
                            this.removeDataChildrenOfTreeObject(el, domDef, root);
                            this.createDataChildrenOfTreeObject(el, domDef, root);
                            return;
                    }
                    return;
                case 'data':
                    el.textContent = value;
                    return;
            }
        };
        TemplateViewHelper.prototype.setDataTreeObjectFunc = function (object, data, root) {
            var _this = this;
            var domElement = this.getDomElement(object);
            //console.log('Set data tree object: object, data ', object, data);
            //set all dom attributes
            if (this.isTagElement(domElement) && !(object instanceof ft.TemplateView)) {
                // simple attributes (id, title, name...)
                var attribs = data.attribs;
                var attrsResult = attribs ? _.reduce(attribs, function (r, value, key) { return (_this.specialDomAttrs.indexOf(key) < 0 ? (r[key] = _this.getSimpleOrExpressionValue(value, root)) : null, r); }, {}, this) : {};
                attrsResult.id = this.getElementId(domElement, attribs);
                attrsResult['data-path'] = data.path;
                //console.log('Set attrs to ', domElement.nodeType);
                this.setDomAttrs(attrsResult, domElement);
                this.addIdToMap(attrsResult.id, root);
                // class
                if (attribs && attribs.class) {
                    var classesValues = this.getPropertyValues('attribs', 'class', data, root);
                    // side effect, root add map enabled classes
                    this.setDomElementClasses(classesValues, domElement, data, root);
                }
                // style
                if (attribs && attribs.style) {
                    var stylesValues = this.getPropertyValues('attribs', 'style', data, root);
                    this.setDomElementStyles(stylesValues, domElement, root);
                }
            }
            // data
            if (data.data) {
                domElement.textContent = this.getSimpleOrExpressionValue(data.data, root);
            }
        };
        TemplateViewHelper.prototype.setTagElementAttributes = function (attrs, element) {
        };
        TemplateViewHelper.prototype.getElementId = function (element, attribs) {
            return (attribs && attribs.id) ? attribs.id : ('el-' + this.getNextId());
        };
        TemplateViewHelper.prototype.getNextId = function () {
            return (this.idCounter++).toString(36);
        };
        TemplateViewHelper.prototype.addTreeObjectFunc = function (object, parent, parentData, root) {
            var parentElement = this.getDomElement(parent);
            //console.log('Check for parent ... obj, parentEl, parent ', object, parentElement, parent);
            if (!parentElement)
                throw 'Has no parent element';
            var objectElement = this.getDomElement(object) || this.getCommentElement(parentData);
            if (!object)
                this.setElementPathToRoot(objectElement, parentData, root); // todo rewrite and remove setElementPath
            parentElement.appendChild(objectElement);
        };
        TemplateViewHelper.prototype.removeTreeObject = function (object, parent, data, root) {
            this.getDomElement(parent).replaceChild(this.getDomElement(object), this.getCommentElement(data));
        };
        // -----------------------------------------------------------------------------------------------------------
        // Attrs & values
        // -----------------------------------------------------------------------------------------------------------
        TemplateViewHelper.prototype.getPropertyValues = function (group, attrName, data, root) {
            var _this = this;
            var functor = (attrName === 'class') ? this.getClassSimpleOrExpressionValue : this.getSimpleOrExpressionValue;
            return _.reduce(data[group][attrName], function (result, value, key) { return (result[key] = functor.call(_this, value, root), result); }, {}, this);
        };
        TemplateViewHelper.prototype.getSimpleOrExpressionValue = function (value, root) {
            return _.isObject(value) ? this.getExpressionValue(value, root) : value;
        };
        TemplateViewHelper.prototype.getClassSimpleOrExpressionValue = function (value, root) {
            return _.isObject(value) ? root.getClassExpressionValue(value) : value;
        };
        TemplateViewHelper.prototype.getExpressionValue = function (value, root) {
            return root.getExpressionValue(value);
        };
        /*
         applyClassExpressionValue(value:any, ex:IExpressionName, root:ITemplateView):any {
         return _.isBoolean(value)  root.getExpressionValue(value);
         }
         */
        TemplateViewHelper.prototype.addIdToMap = function (id, view) {
            this.idMap[id] = view;
        };
        TemplateViewHelper.prototype.getCommentElement = function (data) {
            return document.createComment(data.path);
        };
        Object.defineProperty(TemplateViewHelper.prototype, "excludedDomAttrs", {
            get: function () {
                return this._excludedDomAttrs ? this._excludedDomAttrs : (this._excludedDomAttrs = [].concat(this.systemDataAttrs, this.specialDomAttrs));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateViewHelper.prototype, "systemDataAttrs", {
            get: function () {
                return ['tag', 'path', 'link', 'ln', 'states', 'children'];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateViewHelper.prototype, "specialDomAttrs", {
            get: function () {
                return ['style', 'class'];
            },
            enumerable: true,
            configurable: true
        });
        TemplateViewHelper.prototype.setDomElementClasses = function (vals, object, data, root) {
            var previousClassValue;
            _.each(vals, function (value, name) {
                return (previousClassValue = root.getPathClassValue(data.path, name),
                    previousClassValue && previousClassValue !== value ? object.classList.toggle(previousClassValue, false) : null,
                    value ? object.classList.toggle(value, true) : null,
                    root.setPathClassValue(data.path, name, value));
            });
        };
        TemplateViewHelper.prototype.setDomElementStyles = function (vals, object, root) {
            _.each(vals, function (value, name) { return object.style[name] = (value ? value : ''); });
        };
        TemplateViewHelper.prototype.setDomAttrs = function (attrs, object) {
            console.log('Set dom attrs ', attrs, object);
            _.each(attrs, function (value, name) {
                var method = value ? object.setAttribute : object.removeAttribute;
                method.call(object, name, value);
            });
        };
        TemplateViewHelper.prototype.getDomElement = function (value) {
            return (value instanceof ft.TemplateView ? value.getElement() : value);
        };
        TemplateViewHelper.prototype.isComponentDef = function (data) {
            return data.type && data.name && (data.name.indexOf('.') > 0);
        };
        TemplateViewHelper.prototype.isTreeObjectIncluded = function (data, root) {
            var states = data.params ? data.params[ft.TemplateParams.states] : null;
            if (!states)
                return true;
            console.log('Check include for state ', states, ' result ', this.getExpressionValue(states, root));
            return !!this.getExpressionValue(states, root);
        };
        return TemplateViewHelper;
    })();
    ft.TemplateViewHelper = TemplateViewHelper;
})(ft || (ft = {}));
//# sourceMappingURL=template.view.helper.js.map