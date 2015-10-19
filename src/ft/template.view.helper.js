///<reference path="./d.ts" />
var ft;
(function (ft) {
    ft.AttributePathId = 'data-path-id';
    var svgNs = "http://www.w3.org/2000/svg";
    var ComplexDomElementAttributes = ['style', 'class'];
    var TemplateViewHelper = (function () {
        function TemplateViewHelper() {
            this.idCounter = 0;
            this.domElementPathIds = {};
            this.composeNames_updateDynamicTree = _.compose(_.compact, _.flatten);
            _.bindAll(this, 'createTreeObjectFunc', 'initTreeElement', 'addTreeObjectFunc', 'getTreeObject', 'setDataTreeObjectFunc', 'enterTreeObjectFunc', 'exitTreeObjectFunc', 'removeTreeObject');
            this.createTreeObject = this.createTreeObjectFunctor();
            this.enterTreeObject = this.enterTreeObjectFunctor();
            this.exitTreeObject = this.exitTreeObjectFunctor();
            this.setDataTreeObject = this.setDataTreeObjectFunctor();
        }
        TemplateViewHelper.prototype.functorTreeObject = function (treeObjGetter, treeObjFunctor, childrenTreeObjMapper /* reverse if true */, childrenModificator, functorName) {
            var t = this;
            function instanceFunctor(data, root) {
                var treeObject = treeObjGetter(data, root);
                //console.log('[%s] object is ', data.path, treeObject);
                if (!treeObject)
                    return null;
                if (this.isCommentElement(this.getDomElement(treeObject)))
                    return treeObject;
                // execute tree object functor
                if (treeObjFunctor)
                    treeObjFunctor(treeObject, data, root);
                // execute tree child mapper
                if (childrenTreeObjMapper) {
                    // create children mapper, or use this
                    var childrenMapperInstance = _.partial((childrenTreeObjMapper === true ? instanceFunctor.bind(t) : childrenTreeObjMapper), _, root);
                    var childrenMap = _.map(data.children, childrenMapperInstance, this);
                    // children result executor, appendChild for example
                    if (childrenModificator) {
                        var childrenModificatorInstance = _.partial(childrenModificator, _, _, treeObject, data, root);
                        _.each(childrenMap, function (v, k) { return childrenModificatorInstance(v, data.children[k]); }, this);
                    }
                }
                return treeObject;
            }
            return instanceFunctor.bind(t);
        };
        TemplateViewHelper.prototype.createTreeObjectFunctor = function () {
            return this.functorTreeObject(this.createTreeObjectFunc, this.initTreeElement, true, this.addTreeObjectFunc, 'create');
        };
        TemplateViewHelper.prototype.enterTreeObjectFunctor = function () {
            return this.functorTreeObject(this.getTreeObject, this.enterTreeObjectFunc, true, null, 'enter');
        };
        TemplateViewHelper.prototype.exitTreeObjectFunctor = function () {
            return this.functorTreeObject(this.getTreeObject, this.exitTreeObjectFunc, true, this.removeTreeObject, 'exit');
        };
        TemplateViewHelper.prototype.setDataTreeObjectFunctor = function () {
            return this.functorTreeObject(this.getTreeObject, this.setDataTreeObjectFunc, true, null, 'setdata');
        };
        TemplateViewHelper.prototype.initTreeElement = function (value, data, root) {
            if (value instanceof ft.TemplateView) {
                if (value.inDocument)
                    return;
                var view = value;
                if (value !== root)
                    view.createDom();
            }
        };
        TemplateViewHelper.prototype.getTreeObject = function (data, root) {
            return root.getTreeElementByPath(data.path);
        };
        TemplateViewHelper.prototype.createTreeObjectFunc = function (data, root) {
            var isIncluded = this.isTreeObjectIncluded(data, root);
            var result;
            var currentTreeElement = this.getTreeObject(data, root);
            var hasVirtual = currentTreeElement && this.isCommentElement(currentTreeElement);
            if (isIncluded) {
                if (!currentTreeElement || hasVirtual) {
                    result = this.isComponentDef(data) ? this.createComponentElement(data, root) : this.createDomElement(data.type, data, root);
                    this.createChildrenViewTreeObjecFunc(result, data, root);
                }
                else {
                    result = currentTreeElement;
                }
            }
            else {
                result = hasVirtual ? currentTreeElement : this.createDomElement('comment', data, root);
            }
            return result;
        };
        TemplateViewHelper.prototype.createChildrenViewTreeObjecFunc = function (object, data, root) {
            if (this.hasChildrenDef(data)) {
                var childrenView = new ft.TemplateViewChildren();
                childrenView.domDef = data;
                childrenView.parent = root;
                var childrenData = data.params[ft.TemplateParams.childrenData] ? this.getExpressionValue(data.params[ft.TemplateParams.childrenData], root) : null;
                var childrenModel = data.params[ft.TemplateParams.childrenModel] ? this.getExpressionValue(data.params[ft.TemplateParams.childrenModel], root) : null;
                if (childrenModel && _.isArray(childrenModel))
                    childrenView.model = childrenModel;
                if (childrenData && _.isArray(childrenData))
                    childrenView.data = childrenData;
                childrenView.setElement(this.getDomElement(object));
                childrenView.createDom();
                root.setChildrenViewPath(data.path, childrenView);
            }
        };
        TemplateViewHelper.prototype.createComponentElement = function (data, root) {
            var ComponentConstructor = window[data.name];
            var result = ComponentConstructor('view-' + data.name + '-' + this.getNextId(), data.params);
            result.parent = root;
            result.domDef = data;
            return result;
        };
        TemplateViewHelper.prototype.createDomElement = function (type, data, root) {
            var name = data.name;
            switch (type) {
                case 'text':
                    return document.createTextNode(_.isString(data.data) ? data.data : '');
                case 'comment':
                    return document.createComment(data.path);
                default:
                    if (name === 'svg' || name === 'circle') {
                        return document.createElementNS(svgNs, name);
                    }
                    else {
                        return document.createElement(name);
                    }
            }
        };
        TemplateViewHelper.prototype.getUpdateTreeTypeFunc = function (data, root) {
            var isIncluded = this.isTreeObjectIncluded(data, root);
            var treeElement = this.getTreeObject(data, root);
            // 0 - skip, 1 - create, -1 - remove
            return ((isIncluded && treeElement && !this.isCommentElement(treeElement)) ? 0 : isIncluded ? 1 : -1);
        };
        TemplateViewHelper.prototype.enterTreeObjectFunc = function (object, data, root) {
            this.setDataTreeObjectFunc(object, data, root);
            if (object && object instanceof ft.TemplateView && !object.inDocument) {
                object.enter();
            }
            if (this.hasChildrenView(data, root)) {
                var childrenView = root.getChildrenViewByPath(data.path);
                childrenView.enter();
            }
        };
        TemplateViewHelper.prototype.exitTreeObjectFunc = function (object, data, root) {
            var domElement = this.getDomElement(object);
            var pathId = this.isTagElement(domElement) ? domElement.getAttribute(ft.AttributePathId) : null;
            this.unregisterDomElementId(pathId);
            if (this.hasChildrenView(data, root)) {
                var childrenView = root.getChildrenViewByPath(data.path);
                childrenView.dispose();
            }
            if (object && object instanceof ft.TemplateView && !object === root)
                object.exit();
            return object;
        };
        //private applyPatitions = _.partial(this.applyExpressionToHosts, _, root)
        TemplateViewHelper.prototype.updateDynamicTree = function (root, group) {
            var _this = this;
            var dynamicTree = root.getTemplate().dynamicTree;
            var exArrays;
            if (!group) {
                exArrays = _.map(dynamicTree, function (v, group) { return _this.getChangedExpressionNames(group, v, root); }, this);
            }
            else {
                if (!dynamicTree[group])
                    return;
                exArrays = this.getChangedExpressionNames(group, dynamicTree[group], root);
            }
            var exNames = this.composeNames_updateDynamicTree(exArrays);
            var tmpl = root.getTemplate();
            var exObjArrays = _.map(exNames, function (v) { return (tmpl.expressionMap[v]); });
            _.each(exObjArrays, function (v, k) { return _this.applyExpressionToHosts(v, root); }, this);
        };
        TemplateViewHelper.prototype.getChangedExpressionNames = function (group, map, root) {
            return _.map(map, function (exNames, propName) { return (root.isChangedDynamicProperty(propName) ? exNames : null); }, this);
        };
        TemplateViewHelper.prototype.dispatchTreeEventDown = function (e) {
            var def = (e.currentDef || e.def);
            var view = (e.currentTarget || e.target);
            var template = view.getTemplate();
            // Execute current def handler
            this.triggerDefEvent(e);
            while (!e.cancelled && (def = template.pathMap[def.parentPath])) {
                // Execute on defs tree in view template scope
                e.currentDef = def;
                this.triggerDefEvent(e);
            }
            // Send to parent template defs tree
            view.handleTreeEvent(e);
            if (view.parent) {
                // exec event on parent
                def = view.domDef;
                e.currentTarget = view.parent;
                e.currentDef = def;
                this.triggerDefEvent(e);
                // check canceled
                e.cancelled = !!e.executionHandlersCount && e.name === 'click';
                // exec parent next domDef to root
                e.currentDef = def.parentPath ? view.parent.getTemplate().pathMap[def.parentPath] : null;
                if (!e.cancelled && e.currentDef)
                    this.dispatchTreeEventDown(e);
            }
        };
        TemplateViewHelper.prototype.triggerDefEvent = function (e) {
            var def = (e.currentDef || e.def);
            var view = (e.currentTarget || e.target);
            if (!view.disabled && def.handlers && def.handlers[e.name]) {
                view.evalHandler(def.handlers[e.name], e);
                e.executionHandlersCount++;
            }
        };
        TemplateViewHelper.prototype.applyExpressionToHosts = function (exObj, root) {
            var result;
            var el;
            var i;
            var l = exObj.hosts.length;
            var host;
            for (i = 0; i < l; i++) {
                host = exObj.hosts[i];
                result = result || (host.key === 'class' ? root.getCssClassExpressionValue(exObj) : root.getExpressionValue(exObj));
                el = this.getDomElement(root.getTreeElementByPath(host.path));
                if (el && el.nodeType != 8)
                    this.applyValueToHost(result, el, host, root);
            }
        };
        TemplateViewHelper.prototype.applyValueToHost = function (value, el, host, root) {
            switch (host.group) {
                case 'data':
                    el.textContent = value;
                    return;
                case 'attribs':
                    switch (host.key) {
                        case 'style':
                            el.style[host.keyProperty] = (value ? value : '');
                            return;
                        case 'class':
                            var previousClassValue = root.getPathClassValue(host.path, host.keyProperty);
                            console.log('Toggle: ', host.path, host.key, el.classList, previousClassValue);
                            previousClassValue && previousClassValue !== value ? el.classList.toggle(previousClassValue, false) : null;
                            value ? el.classList.toggle(value, true) : null;
                            root.setPathClassValue(host.path, host.keyProperty, value);
                            return;
                        default:
                            if (this.isSvgNode(el.nodeName)) {
                                var method = value ? el.setAttributeNS : el.removeAttributeNS;
                                if (host.key)
                                    method.call(el, null, host.key, value);
                            }
                            else {
                                var method = value ? el.setAttribute : el.removeAttribute;
                                if (host.key)
                                    method.call(el, host.key, value);
                            }
                            return;
                    }
                    return;
                case 'params':
                    switch (host.key) {
                        case ft.TemplateParams.setData:
                            var view = root.getTreeElementByPath(host.path);
                            if (view)
                                view.setData(value);
                            return;
                        case ft.TemplateParams.setModel:
                            var view = root.getTreeElementByPath(host.path);
                            if (view)
                                view.setModel(value);
                            return;
                        case ft.TemplateParams.setStateSelected:
                            var view = root.getTreeElementByPath(host.path);
                            if (view)
                                view.setState('selected', !!value);
                            return;
                        case ft.TemplateParams.setStateDisabled:
                            var view = root.getTreeElementByPath(host.path);
                            if (view)
                                view.setState('disabled', !!value);
                            return;
                        case ft.TemplateParams.childrenData:
                            var childrenView = root.getChildrenViewByPath(host.path);
                            if (childrenView) {
                                childrenView.data = value;
                                childrenView.validate();
                            }
                            return;
                        case ft.TemplateParams.childrenSetStateSelected:
                            var childrenView = root.getChildrenViewByPath(host.path);
                            if (childrenView) {
                                setTimeout(function () { return childrenView.checkSelected(); });
                            }
                            return;
                        case ft.TemplateParams.childrenSetStateDisabled:
                            var childrenView = root.getChildrenViewByPath(host.path);
                            if (childrenView) {
                                setTimeout(function () { return childrenView.checkDisabled(); });
                            }
                            return;
                    }
                    return;
            }
        };
        TemplateViewHelper.prototype.setDataTreeObjectFunc = function (object, data, root) {
            var _this = this;
            var domElement = this.getDomElement(object);
            //set all dom attributes
            if (this.isTagElement(domElement)) {
                // simple attributes (id, title, name...)
                var attribs = data.attribs;
                var attrsResult = attribs ? _.reduce(attribs, function (r, value, key) { return (_this.specialDomAttrs.indexOf(key) < 0 ? (r[key] = _this.getSimpleOrExpressionValue(value, root)) : null, r); }, {}, this) : {};
                //attrsResult.id = this.getElementId(domElement, attribs);
                var domElementPathId = this.getNextId();
                attrsResult[ft.AttributePathId] = domElementPathId;
                if (this.isSvgNode(data.name)) {
                    this.setDomElementAttributes(attrsResult, domElement);
                }
                else {
                    this.setSvgElementAttributes(attrsResult, domElement);
                }
                this.registerDomElementId(domElementPathId, data, root);
                // class
                if (attribs && attribs.class) {
                    var classesValues = this.getPropertyValues('attribs', 'class', data, root);
                    this.setDomElementClasses(classesValues, domElement, data, root); // side effect, root add map enabled classes
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
        TemplateViewHelper.prototype.isSvgNode = function (name) {
            return name === 'svg' || name === 'circle' || false;
        };
        TemplateViewHelper.prototype.addTreeObjectFunc = function (object, data, parent, parentData, root) {
            var objectElement = this.getDomElement(object);
            if (objectElement.parentNode)
                return;
            var parentElement = this.getDomElement(parent);
            if (!parentElement)
                throw 'Has no parent element';
            var previousObject = this.getTreeObject(data, root);
            var previousElement = previousObject ? this.getDomElement(previousObject) : null;
            if (previousObject && previousObject !== object) {
                parentElement.replaceChild(objectElement, previousElement);
                if (object instanceof ft.TemplateView) {
                    object.enter();
                    object.validate();
                }
                else {
                    this.setDataTreeObjectFunc(object, data, root);
                }
            }
            else {
                console.log('Append child. ', data.path, objectElement.parentNode, objectElement);
                parentElement.appendChild(objectElement);
            }
            if (previousObject && !this.isCommentElement(previousObject)) {
                this.exitTreeObject(data, root);
            }
            root.setTreeElementPath(data.path, object);
        };
        TemplateViewHelper.prototype.removeTreeObject = function (object, data, parent, parentData, root) {
            //this.getDomElement(parent).replaceChild(this.getDomElement(object), this.getCommentElement(data));
            this.getDomElement(parent).removeChild(this.getDomElement(object));
            if (object instanceof ft.TemplateView)
                object.setTreeElementPath(data.path, null);
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
            return _.isObject(value) ? root.getCssClassExpressionValue(value) : value;
        };
        TemplateViewHelper.prototype.getExpressionValue = function (value, root) {
            return root.getExpressionValue(value);
        };
        TemplateViewHelper.prototype.registerDomElementId = function (id, data, root) {
            this.domElementPathIds[id] = { data: data, root: root };
        };
        TemplateViewHelper.prototype.unregisterDomElementId = function (id) {
            if (id) {
                delete this.domElementPathIds[id];
            }
        };
        TemplateViewHelper.prototype.getPathDefinitionByPathId = function (id) {
            return this.domElementPathIds[id];
        };
        // ------------------------------------------------------------------------------------------------------------
        // Utilites
        // ------------------------------------------------------------------------------------------------------------
        TemplateViewHelper.prototype.isTagElement = function (e) {
            return e && e.nodeType === 1;
        };
        TemplateViewHelper.prototype.isCommentElement = function (e) {
            return e && e.nodeType === 8;
        };
        TemplateViewHelper.prototype.getNextId = function () {
            return (this.idCounter++).toString(36);
        };
        Object.defineProperty(TemplateViewHelper.prototype, "specialDomAttrs", {
            get: function () {
                return ComplexDomElementAttributes;
            },
            enumerable: true,
            configurable: true
        });
        TemplateViewHelper.prototype.setDomElementClasses = function (vals, object, data, root) {
            var previousClassValue;
            _.each(vals, function (value, name) {
                if (!object.classList)
                    return;
                previousClassValue = root.getPathClassValue(data.path, name);
                previousClassValue && previousClassValue !== value ? object.classList.toggle(previousClassValue, false) : null,
                    value ? object.classList.toggle(value, true) : null,
                    root.setPathClassValue(data.path, name, value);
            });
        };
        TemplateViewHelper.prototype.setDomElementStyles = function (vals, object, root) {
            _.each(vals, function (value, name) { return object.style[name] = (value ? value : ''); });
        };
        TemplateViewHelper.prototype.setDomElementAttributes = function (attrs, object) {
            _.each(attrs, function (value, name) {
                var method = value ? object.setAttribute : object.removeAttribute;
                method.call(object, name, value);
            });
        };
        TemplateViewHelper.prototype.setSvgElementAttributes = function (attrs, object) {
            _.each(attrs, function (value, name) {
                var method = value ? object.setAttributeNS : object.removeAttributeNS;
                method.call(object, null, name, value);
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
            return !!this.getExpressionValue(states, root);
        };
        TemplateViewHelper.prototype.hasChildrenDef = function (data) {
            return !!(data.params
                && data.params[ft.TemplateParams.childrenClass] // has constructor
                && (data.params[ft.TemplateParams.childrenData] || data.params[ft.TemplateParams.childrenModel]) // has data
            );
        };
        TemplateViewHelper.prototype.hasChildrenView = function (data, root) {
            return !!root.getChildrenViewByPath(data.path);
        };
        return TemplateViewHelper;
    })();
    ft.TemplateViewHelper = TemplateViewHelper;
})(ft || (ft = {}));
//# sourceMappingURL=template.view.helper.js.map