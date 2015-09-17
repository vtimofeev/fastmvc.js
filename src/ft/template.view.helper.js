///<reference path="./d.ts" />
var ft;
(function (ft) {
    var TemplateViewHelper = (function () {
        function TemplateViewHelper() {
            this.idCounter = 0;
            this.idMap = {};
            _.bindAll(this, 'createTreeObjectFunc', 'setElementPathToRoot', 'addTreeObjectFunc', 'getTreeObject', 'setDataTreeObjectFunc');
            this.createTreeObject = this.createTreeObjectFunctor();
            this.enterTreeObject = this.enterTreeObjectFunctor();
            this.exitTreeObject = this.exitTreeObjectFunctor();
            this.updateTreeObject = this.updateTreeObjectFunctor();
            this.setDataTreeObject = this.setDataTreeObjectFunctor();
        }
        TemplateViewHelper.prototype.functorTreeObject = function (treeObjGetter, treeObjFunctor, childrenTreeObjMapper /* reverse if true */, childrenModificator, functorName) {
            var t = this;
            function instanceFunctor(data, root) {
                console.log('[%s]', functorName, ' instanceFunctor data, root: ', data, root, ' getter, functorm childrenTree, modificator ', treeObjGetter, treeObjFunctor, childrenTreeObjMapper, childrenModificator);
                var treeObject = treeObjGetter(data, root);
                if (!treeObject)
                    return null;
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
        TemplateViewHelper.prototype.isDomElementComment = function (e) {
            return e.nodeType === 8;
        };
        TemplateViewHelper.prototype.getIdMap = function () {
            return this.idMap;
        };
        // Simple commands
        TemplateViewHelper.prototype.setElementPathToRoot = function (value, data, root) {
            root.setPathOfCreatedElement(data.path, value);
            if (data.link)
                root.setTemplateElementProperty(data.link, value);
        };
        TemplateViewHelper.prototype.getTreeObject = function (data, root) {
            return this.isComponentDef(data) ? root.getComponentByPath(data.path) : root.getElementByPath(data.path);
        };
        TemplateViewHelper.prototype.createTreeObjectFunc = function (data, root) {
            var isIncluded = this.isTreeObjectIncluded(data, root);
            return isIncluded ?
                (this.getTreeObject(data, root)
                    || this.isComponentDef(data) ? this.createComponentElement(data, root) : this.createDomElement(data.type, data, root))
                : this.createDomElement('comment', data, root);
        };
        TemplateViewHelper.prototype.createComponentElement = function (data, root) {
            return null;
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
            if (updateType === 1)
                return (this.createTreeObject(data, root), this.enterTreeObject(data, root), this.setDataTreeObject(data, root));
            else if (updateType === -1)
                return (this.exitTreeObject(data, root));
        };
        TemplateViewHelper.prototype.getUpdateTreeTypeFunc = function (data, root) {
            var isIncluded = this.isTreeObjectIncluded(data, root);
            //var treeObject:TreeElement = this.getTreeObject(data, root);
            // 0 - skip, N1 - create, -1 - remove
            return ((isIncluded && treeObject) ? 0 : isIncluded ? 1 : -1);
        };
        TemplateViewHelper.prototype.enterTreeObjectFunc = function (object, data, root) {
            if (object && object instanceof ft.TemplateView) {
                object.enter();
            }
        };
        TemplateViewHelper.prototype.exitTreeObjectFunc = function (object, data, root) {
            if (object && object instanceof ft.TemplateView)
                object.exit();
        };
        TemplateViewHelper.prototype.updateDynamicTree = function (root) {
            var _this = this;
            var dynamicTree = root.getTemplate().dynamicTree;
            var exArrays = _.map(dynamicTree, function (v, group) { return _this.getChangedExpressionNames(group, v, root); }, this);
            var exNames = _.compose(_.compact, _.flatten)(exArrays);
            var tmpl = root.getTemplate();
            var exObjArrays = _.map(exNames, function (v) { return (tmpl.expressionMap[v]); });
            var expressionFunctor = _.partial(this.applyExpressionToHosts, _, root);
            _.each(exObjArrays, expressionFunctor, this);
        };
        TemplateViewHelper.prototype.getChangedExpressionNames = function (group, map, root) {
            return _.map(map, function (exNames, prorName) { return (root.isChangedDynamicProperty(prorName) ? exNames : null); }, this);
        };
        TemplateViewHelper.prototype.getEventPath = function (e) {
            var el = (e.previousTarget ? e.previousTarget.getElement().parent : e.e.target);
            return el.getAttribute('data-path');
        };
        TemplateViewHelper.prototype.dispatchTreeEvent = function (e) {
            // side effect tree event
            this.execEventDefsFromPathToRoot(e, this.getEventPath(e));
        };
        TemplateViewHelper.prototype.execEventDefsFromPathToRoot = function (e, path) {
            var view = e.currentTarget;
            var template = view.getTemplate();
            var def = template.pathMap[path];
            this.executeEventDef(e, def, view);
            console.log('execute ', e.name, !!e.cancelled, 'path', def.path);
            while ((def = template.pathMap[def.parentPath]) && !e.cancelled) {
                console.log('execute ', e.name, !!e.cancelled, 'path', def.path);
                this.executeEventDef(e, def, view);
            }
        };
        TemplateViewHelper.prototype.executeEventDef = function (e, def, view) {
            if (!(def.handlers && def.handlers[e.name]))
                return null;
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
                    return;
                case 'data':
                    el.textContent = value;
                    return;
            }
        };
        TemplateViewHelper.prototype.setDataTreeObjectFunc = function (object, data, root) {
            var _this = this;
            var domElement = this.getDomElement(object);
            // set all dom attributes
            var attribs;
            var hasHandlers = !!data.handlers;
            if ((attribs = (data.attribs || (hasHandlers ? {} : null)))) {
                // simple attributes (id, title, name...)
                var attrsResult = _.reduce(attribs, function (r, value, key) { return (_this.specialDomAttrs.indexOf(key) < 0 ? (r[key] = _this.getSimpleOrExpressionValue(value, root)) : null, r); }, {}, this);
                console.log('ATTRIBS: was , is ', data.attribs, attribs);
                if (hasHandlers) {
                    console.log('HANDLERS!!!', data);
                    attrsResult.id = this.getElementId(domElement, attribs);
                    attrsResult['data-path'] = data.path;
                }
                console.log('Set attrs to ', domElement.nodeType);
                this.setDomAttrs(attrsResult, domElement);
                this.addIdToMap(attrsResult.id, root);
                // class
                if (attribs.class) {
                    var classesValues = this.getPropertyValues('attribs', 'class', data, root);
                    // side effect, root add map enabled classes
                    this.setDomElementClasses(classesValues, domElement, data, root);
                }
                // style
                if (attribs.style) {
                    var stylesValues = this.getPropertyValues('attribs', 'style', data, root);
                    this.setDomElementStyles(stylesValues, domElement, root);
                }
            }
            // data
            if (data.data) {
                domElement.textContent = this.getSimpleOrExpressionValue(data.data, root);
            }
        };
        TemplateViewHelper.prototype.getElementId = function (element, attribs) {
            return (attribs && attribs.id) ? attribs.id : ('el-' + (this.idCounter++).toString(36));
        };
        TemplateViewHelper.prototype.addTreeObjectFunc = function (object, parent, data, root) {
            var parentElement = this.getDomElement(parent);
            if (!parentElement)
                throw 'Has no parent element';
            var objectElement = this.getDomElement(object) || this.getCommentElement(data);
            if (!object)
                this.setElementPathToRoot(objectElement, data, root); // todo rewrite and remove setElementPath
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
            _.each(attrs, function (value, name) {
                var method = value ? object.setAttribute : object.removeAttribute;
                method.call(object, name, value);
            });
        };
        TemplateViewHelper.prototype.getDomElement = function (value) {
            return (value ? 'getElement' in value ? value.getElement() : value : null);
        };
        TemplateViewHelper.prototype.isComponentDef = function (data) {
            return data.type && data.name && (data.name.indexOf('.') > 0);
        };
        TemplateViewHelper.prototype.isTreeObjectIncluded = function (data, root) {
            if (!data.states)
                return true;
            else
                !!this.getExpressionValue(data.states, root);
        };
        return TemplateViewHelper;
    })();
    ft.TemplateViewHelper = TemplateViewHelper;
})(ft || (ft = {}));
//# sourceMappingURL=template.view.helper.js.map