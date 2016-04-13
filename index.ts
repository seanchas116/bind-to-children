"use strict";

interface Options<TValue, TContext> {
  element: HTMLElement;
  template?: HTMLElement;
  key?: (TValue) => any | null;
  willAdd?: (element: HTMLElement, value: TValue) => TContext | null;
  update?: (element: HTMLElement, oldValue: TValue, newValue: TValue, TContext) => void | null;
  didRemove?: (HTMLElement, value: TValue, TContext) => void | null;
}

class Binder<TValue, TContext> {
  element: HTMLElement;
  template: HTMLElement;
  key: (TValue) => any;
  willAdd: (element: HTMLElement, value: TValue) => TContext | null;
  update: (element: HTMLElement, oldValue: TValue, newValue: TValue, TContext) => void | null;
  didRemove: (HTMLElement, value: TValue, TContext) => void | null;

  _values: TValue[] = [];
  elements: HTMLElement[] = [];
  contexts: TContext[] = [];

  get values() {
    return this._values;
  }

  set values(newValues: TValue[]) {
    const parent = this.element;
    const elements = this.elements;
    const contexts = this.contexts;
    const values = this._values;

    const indexMap = new Map<any, number>();
    for (let index = 0; index < values.length; ++index) {
      const key = this.key(values[index]);
      indexMap.set(key, index);
    }

    const newElements: HTMLElement[] = [];
    const newContexts: TContext[] = [];

    for (let newIndex = 0; newIndex < newValues.length; ++newIndex) {
      const key = this.key(newValues[newIndex]);
      const index = indexMap.get(key);
      if (index != null) {
        // move element
        const element = this.elements[index];
        parent.insertBefore(element, parent.childNodes[newIndex]);
        const context = this.contexts[index];
        this.update(element, values[index], newValues[newIndex], context);
        newContexts.push(context);
        newElements.push(element);
        indexMap.delete(index);
      } else {
        // add element
        const element = this.template.cloneNode(true) as HTMLElement;
        const context = this.willAdd(element, newValues[newIndex]);
        parent.insertBefore(element, parent.childNodes[newIndex]);
        newContexts.push(context);
        newElements.push(element);
      }
    }

    indexMap.forEach(index => {
      const element = parent.removeChild(elements[index]);
      this.didRemove(element, values[index], contexts[index]);
    });

    this.contexts = newContexts;
    this.elements = newElements;
    this._values = newValues;
  }

  constructor(opts: Options<TValue, TContext>) {
    this.element = opts.element;
    if (opts.template != null) {
      if (this.element.childNodes.length !== 0) {
        throw new Error("The element must not have children");
      }
      this.template = opts.template;
    } else {
      this.template = (() => {
        if (this.element.childNodes.length === 1) {
          const child = this.element.childNodes[0];
          if (child instanceof HTMLElement) {
            this.element.removeChild(child);
            return child;
          }
        }
        throw new Error("The element must have just 1 child HTMLElement for template");
      })();
    }
    this.key = opts.key || (x => x);
    this.willAdd = opts.willAdd;
    this.update = opts.update;
    this.didRemove = opts.didRemove;
  }
}

export = Binder;
