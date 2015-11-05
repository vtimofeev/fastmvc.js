///<reference path="./d.ts" />
var ft;
(function (ft) {
    ft.AttributePathId = 'data-path-id';
    var svgNs = "http://www.w3.org/2000/svg";
    var ComplexDomElementAttributes = ['style', 'class'];
    var DomDefType = {
        Tag: 'tag',
        Svg: 'svg',
        Text: 'text',
        Comment: 'comment'
    };
    var TemplateViewHelper = (function () {
        function TemplateViewHelper() {
            this.idCounter = 0;
            this.domElementPathIds = {};
            this.composeNames_updateDynamicTree = _.compose(_.union, _.compact, _.flatten);
        }
        TemplateViewHelper.prototype.createTree = function (data, root) {
            var treeElement = this.createTreeElement(data, root);
            root.setTreeElementPath(data.path, treeElement);
            var treeDomElement = this.getDomElement(treeElement);
            var i;
            var childrenLength;
            if (this.isCommentElement(treeDomElement)) {
                return treeElement;
            }
            else {
                for (i = 0, childrenLength = (data.children ? data.children.length : 0); i < childrenLength; i++) {
                    var childrenTreeElement = this.createTree(data.children[i], root);
                    //console.log('CreateDom Append child', childrenTreeElement);
                    treeDomElement.appendChild(childrenTreeElement instanceof ft.TemplateView ? childrenTreeElement.getElement() : childrenTreeElement);
                }
                return treeElement;
            }
        };
        TemplateViewHelper.prototype.validateTree = function (data, root) {
            var treeElement = this.getTreeElement(data, root);
            var treeDomElement = this.getDomElement(treeElement);
            var included = this.isTreeObjectIncluded(data, root);
            var isComment = this.isCommentElement(treeDomElement);
            var newElement;
            var i;
            var childrenLength;
            if (isComment && included) {
                newElement = this.createTree(data, root);
                this.enterTree(data, root);
                treeDomElement.parentNode.replaceChild(treeDomElement, this.getDomElement(newElement));
            }
            else if (!isComment && !included) {
                this.exitTree(data, root);
                newElement = this.createTree(data, root);
                treeDomElement.parentNode.replaceChild(treeDomElement, this.getDomElement(newElement));
            }
            else if (!isComment) {
                for (i = 0, childrenLength = (data.children ? data.children.length : 0); i < childrenLength; i++) {
                    this.validateTree(data.children[i], root);
                }
            }
        };
        TemplateViewHelper.prototype.enterTree = function (data, root) {
            var treeElement = this.getTreeElement(data, root);
            if (treeElement instanceof ft.TemplateView && treeElement !== root) {
                treeElement.enter();
            }
            var treeDomElement = this.getDomElement(treeElement);
            if (this.isTagElement(treeDomElement)) {
                // Регистрация элемента для диспетчера
                this.registerDomElementId(treeDomElement.getAttribute(ft.AttributePathId), data, root);
                this.enterChildrenView(data, root);
                var i;
                var childrenLength;
                for (i = 0, childrenLength = (data.children ? data.children.length : 0); i < childrenLength; i++) {
                    this.enterTree(data.children[i], root);
                }
            }
        };
        TemplateViewHelper.prototype.exitTree = function (data, root) {
            var treeElement = this.getTreeElement(data, root);
            //console.log('Exit ', treeElement, data, root);
            var i;
            var childrenLength;
            var domElement = this.getDomElement(treeElement);
            var isComment = this.isCommentElement(domElement);
            if (!isComment) {
                this.exitChildrenView(data, root);
                for (i = 0, childrenLength = (data.children ? data.children.length : 0); i < childrenLength; i++) {
                    this.exitTree(data.children[i], root);
                }
            }
            if (treeElement instanceof ft.TemplateView && treeElement !== root) {
                treeElement.exit();
            }
            else {
                var pathId = this.isTagElement(domElement) ? domElement.getAttribute(ft.AttributePathId) : null;
                this.unregisterDomElementId(pathId);
            }
        };
        TemplateViewHelper.prototype.updateDynamicTree = function (root, group, propertyName) {
            var _this = this;
            var dynamicTree = root.getTemplate().dynamicTree;
            if (!dynamicTree)
                return;
            var expressionArrays;
            if (!group) {
                expressionArrays = _.map(dynamicTree, function (v, group) { return _this.getChangedExpressionNames(group, v, root); }, this);
            }
            else {
                if (!dynamicTree[group])
                    return;
                if (propertyName) {
                    expressionArrays = root.isChangedDynamicProperty(propertyName) ? dynamicTree[group][propertyName] : null;
                }
                else {
                    expressionArrays = this.getChangedExpressionNames(group, dynamicTree[group], root);
                }
            }
            var exNames = this.composeNames_updateDynamicTree(expressionArrays);
            var tmpl = root.getTemplate();
            // console.log('Update dynamic tree ', root.name, exNames);
            var exObjArrays = _.map(exNames, function (v) { return (tmpl.expressionMap[v]); });
            _.each(exObjArrays, function (v, k) { return _this.applyExpressionToHosts(v, root); }, this);
        };
        // -----------------------------------------------------------------------------------------------------------
        // Creation
        // -----------------------------------------------------------------------------------------------------------
        TemplateViewHelper.prototype.createTreeElement = function (data, root) {
            var isIncluded = this.isTreeObjectIncluded(data, root);
            var result = null;
            if (isIncluded) {
                if (this.isComponentDef(data)) {
                    result = this.createComponentElement(data, root);
                }
                else {
                    result = this.createDomElement(data.type, data, root);
                }
                this.createChildrenView(result, data, root);
            }
            else {
                result = this.createDomElement('comment', data, root);
            }
            if (data.params && data.params.ln) {
                root[data.params.ln] = result; // Установка ссылки на рутовый элемент
            }
            return result;
        };
        TemplateViewHelper.prototype.createComponentElement = function (data, root) {
            var dataParams = this.applyFirstContextToExpressionParameters(data.params, root);
            var result = ft.templateManager.createInstance(data.name, 'view-' + data.name + '-' + this.getNextId(), dataParams);
            //console.log('CreateComponent ', data.name, result !== root, dataParams, result);
            result.parent = root;
            result.domDef = data;
            if (result !== root)
                result.createDom();
            return result;
        };
        TemplateViewHelper.prototype.createDomElement = function (type, data, root) {
            var result;
            switch (type) {
                case DomDefType.Tag:
                    var result = document.createElement(data.name);
                    this.initDomElement(result, data, root);
                    return result;
                case DomDefType.Text:
                    var result = document.createTextNode('');
                    this.initTextElement(result, data, root);
                    return result;
                case DomDefType.Comment:
                    return document.createComment(data.path);
                case DomDefType.Svg:
                    result = document.createElementNS(svgNs, data.name);
                    this.initDomElement(result, data, root);
                    return result;
                default:
                    throw 'Cant create dom element ' + type + ' of ' + data.path + ', ' + root.name;
                    return null;
            }
        };
        TemplateViewHelper.prototype.createChildrenView = function (object, data, root) {
            if (this.hasChildrenDef(data)) {
                var childrenView = new ft.TemplateChildrenView(root.name + ':ChildView-' + this.getNextId(), this.applyFirstContextToExpressionParameters(root.getParameters(), root));
                childrenView.domDef = data;
                childrenView.parent = root;
                childrenView.setElement(this.getDomElement(object));
                childrenView.createDom();
                childrenView.enter();
                root.setChildrenViewPath(data.path, childrenView);
            }
        };
        TemplateViewHelper.prototype.initDomElement = function (object, data, root) {
            var _this = this;
            //console.log('Init dom element ', object, data, root);
            var domElement = this.getDomElement(object);
            //console.log(root.name, data.path, ' SetData');
            /* Процесс установки аттрибутов, в том числе с расчетом выражений, для конкретного узла Dom */
            if (this.isTagElement(domElement) && !domElement.getAttribute(ft.AttributePathId)) {
                //console.log(root.name, data.path, ' ApplyData');
                // Вычисление аттрибутов
                var domElementPathId = this.getNextId();
                var attribs = data.attribs;
                var attrsResult = attribs ? _.reduce(attribs, function (r, value, key) { return (_this.specialDomAttrs.indexOf(key) < 0 ? (r[key] = _this.getSimpleOrExpressionValue(value, root)) : null, r); }, {}, this) : {};
                // Установка глобального идентификатора элемента для событий
                attrsResult[ft.AttributePathId] = domElementPathId;
                // Установка аттрибутов
                if (data.type === 'tag') {
                    this.setDomElementAttributes(attrsResult, domElement);
                }
                else {
                    this.setSvgElementAttributes(attrsResult, domElement);
                }
                // Установка классов
                if (attribs && attribs.class) {
                    var classesValues = this.getPropertyValues('attribs', 'class', data, root);
                    this.setDomElementClasses(classesValues, domElement, data, root); // side effect, root add map enabled classes
                }
                // Установка стилей
                if (attribs && attribs.style) {
                    var stylesValues = this.getPropertyValues('attribs', 'style', data, root);
                    this.setDomElementStyles(stylesValues, domElement, root);
                }
            }
        };
        /* Установка контента текстового элемента */
        TemplateViewHelper.prototype.initTextElement = function (object, data, root) {
            if (data.data) {
                object.textContent = this.getSimpleOrExpressionValue(data.data, root);
            }
        };
        // -----------------------------------------------------------------------------------------------------------
        // Children view
        // -----------------------------------------------------------------------------------------------------------
        TemplateViewHelper.prototype.enterChildrenView = function (data, root) {
            if (!this.hasChildrenView(data, root))
                return;
            var childrenView = root.getChildrenViewByPath(data.path);
            childrenView.enter();
        };
        TemplateViewHelper.prototype.exitChildrenView = function (data, root) {
            if (!this.hasChildrenView(data, root))
                return;
            var childrenView = root.getChildrenViewByPath(data.path);
            childrenView.exit();
        };
        // -----------------------------------------------------------------------------------------------------------
        // Updates, apply value
        // -----------------------------------------------------------------------------------------------------------
        TemplateViewHelper.prototype.applyExpressionToHosts = function (exObj, root) {
            var result;
            var el;
            var i;
            var l = exObj.hosts.length;
            var host;
            for (i = 0; i < l; i++) {
                host = exObj.hosts[i];
                /*
                 performance bench
                 if(host.group === 'data') result = Math.round(Math.random()*100);
                 */
                result = result || (host.key === 'class' ? root.getCssClassExpressionValue(exObj) : root.getExpressionValue(exObj));
                el = this.getDomElement(root.getTreeElementByPath(host.path));
                //console.log('Apply ', root.name, host.path, host.key, result);
                if (el && el.nodeType != 8)
                    this.applyValueToHost(result, el, host, root);
            }
        };
        TemplateViewHelper.prototype.applyValueToHost = function (value, el, host, root) {
            var key = host.key;
            //console.log('Apply to ', host.path, host.key, value);
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
                    // Default params changed: Data: model, data; states: selected, focused, children, base, custom
                    var view;
                    if (key.indexOf('.') < 0) {
                        view = root.getTreeElementByPath(host.path);
                        if (!(view instanceof ft.TemplateView)) {
                            view = root.getChildrenViewByPath(host.path);
                        }
                        view.applyParameter(view.getParameters()[key], key);
                    }
                    else if (key.indexOf('children.') === 0) {
                        var childrenView = root.getChildrenViewByPath(host.path);
                        if (!childrenView) {
                            console.warn('Has no ChildrenView instance and cant set hostValue ', host.path, key);
                            return;
                        }
                        if (key === 'children.data') {
                            childrenView.data = value;
                        }
                        else {
                            childrenView.applyChildrenParameter(value, key, root);
                        }
                    }
                    else {
                        console.warn('Not supported host parameter at applyToHost ', key, value, host.path);
                    }
                    return;
            }
        };
        // -----------------------------------------------------------------------------------------------------------
        // Attrs & values
        // -----------------------------------------------------------------------------------------------------------
        TemplateViewHelper.prototype.getTreeElement = function (data, root) {
            return root.getTreeElementByPath(data.path);
        };
        TemplateViewHelper.prototype.isSvgNode = function (name) {
            return name === 'svg' || name === 'circle' || false;
        };
        TemplateViewHelper.prototype.getPropertyValues = function (group, attrName, data, root) {
            var _this = this;
            var functor = (attrName === 'class') ? this.getClassSimpleOrExpressionValue : this.getSimpleOrExpressionValue;
            return _.reduce(data[group][attrName], function (result, value, key) { return (result[key] = functor.call(_this, value, root), result); }, {}, this);
        };
        TemplateViewHelper.prototype.getChangedExpressionNames = function (group, map, root) {
            return _.map(map, function (exNames, propName) { return (root.isChangedDynamicProperty(propName) ? exNames : null); }, this);
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
            //console.log('Register dom', id, data.path);
            this.domElementPathIds[id] = { data: data, root: root };
        };
        TemplateViewHelper.prototype.unregisterDomElementId = function (id) {
            if (id)
                delete this.domElementPathIds[id];
        };
        TemplateViewHelper.prototype.getPathDefinitionByPathId = function (id) {
            return this.domElementPathIds[id];
        };
        // ------------------------------------------------------------------------------------------------------------
        // Utilites
        // ------------------------------------------------------------------------------------------------------------
        TemplateViewHelper.prototype.applyFirstContextToExpressionParameters = function (params, context) {
            if (!context)
                return params;
            var r = {};
            _.each(params, function (v, k) {
                var isExpression = v instanceof ft.ExpressionName;
                if (isExpression) {
                    r[k] = !v.context ? new ft.ExpressionName(v.name, context) : v;
                }
                else {
                    r[k] = v;
                }
            });
            return r;
        };
        TemplateViewHelper.prototype.hasDelay = function (data, root, functorName) {
            return data.params && data.params[functorName + 'Delay'] && root.isDelay(data, functorName);
        };
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
            for (name in attrs) {
                var value = attrs[name];
                var method = value ? object.setAttribute : object.removeAttribute;
                method.call(object, name, value);
            }
        };
        TemplateViewHelper.prototype.setSvgElementAttributes = function (attrs, object) {
            for (name in attrs) {
                var value = attrs[name];
                var method = value ? object.setAttributeNS : object.removeAttributeNS;
                method.call(object, null, name, value);
            }
        };
        TemplateViewHelper.prototype.getDomElement = function (value) {
            return (value instanceof ft.TemplateView ? value.getElement() : value);
        };
        TemplateViewHelper.prototype.isComponentDef = function (data) {
            return data.type && data.name && (data.name.indexOf('.') > 0);
        };
        TemplateViewHelper.prototype.isTreeObjectIncluded = function (data, root) {
            var states = data.params ? data.params[ft.TemplateParams.states] : null;
            var hasDelay = this.hasDelay(data, root, 'create');
            if (hasDelay)
                root.setDelay(data, 'create');
            if (!states && !hasDelay)
                return true;
            return !hasDelay && !!this.getExpressionValue(states, root);
        };
        TemplateViewHelper.prototype.hasChildrenDef = function (data) {
            return !!(data.params && data.params[ft.TemplateParams.childrenClass]);
        };
        TemplateViewHelper.prototype.hasChildrenView = function (data, root) {
            return !!root.getChildrenViewByPath(data.path);
        };
        //-------------------------------------------------------------------------------------------------
        // Event bubbling
        //-------------------------------------------------------------------------------------------------
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
            console.log('Trigger def event, ', e.name, ' path ', def.path);
            if (!view.disabled && def.handlers && def.handlers[e.name]) {
                //console.log('Has trigger event, ', e.name, ' path ', def.path);
                view.evalHandler(def.handlers[e.name], e);
                e.executionHandlersCount++;
            }
        };
        return TemplateViewHelper;
    })();
    ft.TemplateViewHelper = TemplateViewHelper;
})(ft || (ft = {}));
//# sourceMappingURL=template.view.helper.js.map