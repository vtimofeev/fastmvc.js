///<reference path="./d.ts" />
var ft;
(function (ft) {
    var TemplateViewHelper = (function () {
        function TemplateViewHelper() {
            this.createTreeObject = this.createTreeObjectFunctor();
            this.enterTreeObject = this.enterTreeObjectFunctor();
            this.exitTreeObject = this.exitTreeObjectFunctor();
            this.updateTreeObject = this.updateTreeObjectFunctor();
            this.setDataTreeObject = this.setDataTreeObjectFunctor();
        }
        TemplateViewHelper.prototype.functorTreeObject = function (treeObjGetter, treeObjFunctor, childrenTreeObjMapper /* reverse if true */, childrenModificator) {
            var t = this;
            function instanceFunctor(data, root) {
                var treeObject = treeObjGetter(data, root);
                if (!treeObject)
                    return null;
                // tree child handler
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
            return this.functorTreeObject(this.createTreeObjectFunc, this.setElementPathToRoot, true, this.addTreeObjectFunc);
        };
        TemplateViewHelper.prototype.enterTreeObjectFunctor = function () {
            return this.functorTreeObject(this.getTreeObject, this.enterTreeObjectFunc, true, null);
        };
        TemplateViewHelper.prototype.updateTreeObjectFunctor = function () {
            return this.functorTreeObject(this.updateTreeOfTreeObjectFunc, null, true, null);
        };
        TemplateViewHelper.prototype.exitTreeObjectFunctor = function () {
            return this.functorTreeObject(this.getTreeObject, this.exitTreeObjectFunc, true, this.removeTreeObject);
        };
        TemplateViewHelper.prototype.setDataTreeObjectFunctor = function () {
            return this.functorTreeObject(this.getTreeObject, this.setDataTreeObjectFunc, true, null);
        };
        // Simple commands
        TemplateViewHelper.prototype.setElementPathToRoot = function (value, data, root) {
            root.setPathOfCreatedElement(data.path, value);
            root.setTemplateElementProperty(data.link, value);
        };
        TemplateViewHelper.prototype.getTreeObject = function (data, root) {
            return this.isComponentDef(data) ? root.getElementByPath(data.path) : root.getComponentByPath(data.path);
        };
        TemplateViewHelper.prototype.createTreeObjectFunc = function (data, root) {
            var isIncluded = this.isTreeObjectIncluded(data, root);
            return isIncluded ? (this.getTreeObject(data, root) || this.isComponentDef(data) ? this.createComponentElement(data, root) : this.createDomElement(data, root)) : null;
        };
        TemplateViewHelper.prototype.createComponentElement = function (data, root) {
            return null;
        };
        TemplateViewHelper.prototype.createDomElement = function (data, root) {
            return null;
        };
        TemplateViewHelper.prototype.updateTreeOfTreeObjectFunc = function (data, root) {
            var updateType = this.getUpdateTreeTypeFunc(data, root);
            if (updateType === 1)
                return (this.createTreeObject(data, root), this.enterTreeObjec(data, root), this.setDataTreeObject(data, root));
            else if (updateType === -1)
                return (this.exitTreeObject(data, root));
        };
        TemplateViewHelper.prototype.getUpdateTreeTypeFunc = function (data, root) {
            var isIncluded = this.isTreeObjectIncluded(data, root);
            var treeObject = this.getTreeObject(data, root);
            // 0 - skip, 1 - create, -1 - remove
            return (isIncluded && treeObject) ? 0 : isIncluded ? 1 : -1;
        };
        TemplateViewHelper.prototype.enterTreeObjectFunc = function (object, data, root) {
            if (object && object instanceof ft.TemplateView)
                object.enter();
        };
        TemplateViewHelper.prototype.exitTreeObjectFunc = function (object, data, root) {
            if (object && object instanceof ft.TemplateView)
                object.exit();
        };
        TemplateViewHelper.prototype.setDataTreeObjectFunc = function (object, data, root) {
            var _this = this;
            var typeAttrs = { s: {}, d: {} };
            var domElement = this.getDomElement(object);
            _.each(data, function (value, key) { return (_this.excludedDomAttrs.indexOf(key) < 0) ? _.isObject(value) ? typeAttrs.d[key] = _this.getAttrValue(value, root) : typeAttrs.s[key] = value : null; }, this);
            _.each(typeAttrs, function (attrs) { return _this.setDomAttrs(attrs, domElement); }, this);
            if (data.class)
                this.setDomElementClasses(object, this.getAttrPropertyValues('class', data, root), root);
            if (data.style)
                this.setDomElementStyles(object, this.getAttrPropertyValues('style', data, root), root);
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
        TemplateViewHelper.prototype.getAttrPropertyValues = function (attrName, data, root) {
            var _this = this;
            return _.reduce(data[attrName], function (result, value, key) { return (result[key] = _this.getAttrValue(value, root), result); }, {}, this);
        };
        TemplateViewHelper.prototype.getAttrValue = function (value, root) {
            return _.isObject(value) ? this.getExpressionValue(value, root) : value;
        };
        TemplateViewHelper.prototype.getExpressionValue = function (value, root) {
            return ExpressionHelper.execute.call(root, data.states);
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
                return ['tag', 'path', 'link', 'states', 'children'];
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
        TemplateViewHelper.prototype.setDomElementClasses = function (vals, object, root) {
            _.each(vals, function (value, name) { return object.classList.toggle(_.isString(value) ? value : name, !!value); });
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
            return value ? _.isElement(value) ? value : value.getElement() : null;
        };
        TemplateViewHelper.prototype.isComponentDef = function (data) {
            return !!(data.tag.indexOf('.') > 0);
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