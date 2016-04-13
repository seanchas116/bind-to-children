"use strict";
var Binder = (function () {
    function Binder(opts) {
        var _this = this;
        this._values = [];
        this.elements = [];
        this.contexts = [];
        this.element = opts.element;
        if (opts.template != null) {
            if (this.element.childNodes.length !== 0) {
                throw new Error("The element must not have children");
            }
            this.template = opts.template;
        }
        else {
            this.template = (function () {
                if (_this.element.childNodes.length === 1) {
                    var child = _this.element.childNodes[0];
                    if (child instanceof HTMLElement) {
                        _this.element.removeChild(child);
                        return child;
                    }
                }
                throw new Error("The element must have just 1 child HTMLElement for template");
            })();
        }
        this.key = opts.key || (function (x) { return x; });
        this.willAdd = opts.willAdd;
        this.update = opts.update;
        this.didRemove = opts.didRemove;
    }
    Object.defineProperty(Binder.prototype, "values", {
        get: function () {
            return this._values;
        },
        set: function (newValues) {
            var _this = this;
            var parent = this.element;
            var elements = this.elements;
            var contexts = this.contexts;
            var values = this._values;
            var indexMap = new Map();
            for (var index = 0; index < values.length; ++index) {
                var key = this.key(values[index]);
                indexMap.set(key, index);
            }
            var newElements = [];
            var newContexts = [];
            for (var newIndex = 0; newIndex < newValues.length; ++newIndex) {
                var key = this.key(newValues[newIndex]);
                var index = indexMap.get(key);
                if (index != null) {
                    var element = this.elements[index];
                    parent.insertBefore(element, parent.childNodes[newIndex]);
                    var context = this.contexts[index];
                    this.update(element, values[index], newValues[newIndex], context);
                    newContexts.push(context);
                    newElements.push(element);
                    indexMap.delete(index);
                }
                else {
                    var element = this.template.cloneNode(true);
                    var context = this.willAdd(element, newValues[newIndex]);
                    parent.insertBefore(element, parent.childNodes[newIndex]);
                    newContexts.push(context);
                    newElements.push(element);
                }
            }
            indexMap.forEach(function (index) {
                var element = parent.removeChild(elements[index]);
                _this.didRemove(element, values[index], contexts[index]);
            });
            this.contexts = newContexts;
            this.elements = newElements;
            this._values = newValues;
        },
        enumerable: true,
        configurable: true
    });
    return Binder;
}());
module.exports = Binder;
