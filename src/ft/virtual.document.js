var ft;
(function (ft) {
    var VirtualClassList = (function () {
        function VirtualClassList() {
            this.classes = {};
        }
        VirtualClassList.prototype.toggle = function (name, v) {
            //console.log('class toggle ', name, v);
            if (!v)
                delete this.classes[name];
            else
                this.classes[name] = v;
        };
        return VirtualClassList;
    })();
    ft.VirtualClassList = VirtualClassList;
    var VirtualElement = (function () {
        function VirtualElement(type, tag, text) {
            this._style = null;
            this._classList = null;
            this.attribute = null;
            this.children = null;
            this.textContent = null;
            this._type = type;
            this._tag = tag;
            this.textContent = text;
        }
        Object.defineProperty(VirtualElement.prototype, "outerHtml", {
            get: function () {
                var r = '';
                if (this._type === 1)
                    r += this.openTag;
                if (this.children)
                    r += this.innerHtml;
                if (this._type !== 1 && this.textContent)
                    r += this.textContent;
                if (this._type === 1)
                    r += this.closeTag;
                return r;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VirtualElement.prototype, "innerHtml", {
            get: function () {
                var r = '';
                this.children.forEach(function (c) { return r += c.outerHtml; });
                return r;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VirtualElement.prototype, "openTag", {
            get: function () {
                return '<' + this._tag + this.attrString() + this.classString() + this.styleString() + '>';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VirtualElement.prototype, "closeTag", {
            get: function () {
                return '</' + this._tag + '>';
            },
            enumerable: true,
            configurable: true
        });
        VirtualElement.prototype.attrString = function () {
            var r = '';
            if (!this.attribute)
                return r;
            for (var p in this.attribute) {
                r += ' ' + p + '="' + this.attribute[p] + '"';
            }
            return r;
        };
        VirtualElement.prototype.styleString = function () {
            var r = '';
            if (!this._style)
                return r;
            r += ' style="';
            for (var p in this._style) {
                r += p + ':' + this._style[p] + ';';
            }
            r += '"';
            return r;
        };
        VirtualElement.prototype.classString = function () {
            var r = '';
            if (!this._classList)
                return r;
            r += ' class="';
            var classes = this._classList.classes;
            for (var n in classes) {
                if (classes[n] === true)
                    r += n + ' ';
            }
            r += '"';
            return r;
        };
        Object.defineProperty(VirtualElement.prototype, "style", {
            get: function () {
                return this._style = this._style || {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VirtualElement.prototype, "classList", {
            get: function () {
                return this._classList ? this._classList : (this._classList = new VirtualClassList());
            },
            enumerable: true,
            configurable: true
        });
        VirtualElement.prototype.appendChild = function (v) {
            if (!this.children)
                this.children = [];
            if (this.children.indexOf(v) === -1)
                this.children.push(v);
        };
        VirtualElement.prototype.removeChild = function (v) {
            var index = this.children.indexOf(v);
            if (index > -1)
                this.children.splice(index, 1);
        };
        VirtualElement.prototype.replaceChild = function (n, o) {
            var index = this.children.indexOf(o);
            if (index > -1)
                this.children.splice(index, 1, n);
        };
        VirtualElement.prototype.setAttribute = function (name, value) {
            if (!this.attribute)
                this.attribute = {};
            this.attribute[name] = value;
        };
        return VirtualElement;
    })();
    ft.VirtualElement = VirtualElement;
    var VirtualDocument = (function () {
        function VirtualDocument() {
        }
        VirtualDocument.prototype.createComment = function (text) {
            return new VirtualElement(8, null, text);
        };
        VirtualDocument.prototype.createTextNode = function (text) {
            return new VirtualElement(3, null, text);
        };
        VirtualDocument.prototype.createElement = function (name) {
            return new VirtualElement(1, name);
        };
        return VirtualDocument;
    })();
    ft.VirtualDocument = VirtualDocument;
})(ft || (ft = {}));
if (typeof module !== 'undefined') {
    module.exports = new ft.VirtualDocument();
}
//# sourceMappingURL=virtual.document.js.map