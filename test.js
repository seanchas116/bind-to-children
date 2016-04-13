"use strict";

const test = require("tape");
const Binder = require("./index");

class TodoController {
  constructor(element, todo) {
    this.element = element;
    this.todo = todo;
  }
  dispose() {
    this.disposed = true;
  }
}

test("Binder", (t) => {
  const elem = document.createElement("ul");
  elem.appendChild(document.createElement("li"));

  const binder = new Binder({
    element: elem,
    key: (todo) => todo.id,
    willAdd: (elem, todo) => {
      return new TodoController(elem, todo);
    },
    update: (elem, oldTodo, newTodo, controller) => {
      controller.element = elem;
      controller.todo = newTodo;
    },
    didRemove: (elem, todo, controller) => {
      controller.dispose();
    }
  });

  binder.values = [
    {title: "Task", done: false, id: 0},
    {title: "Another Task", done: true, id: 1},
  ];

  t.deepEqual(elem.childNodes, binder.contexts.map(c => c.element), "elements sould be bound correctly");
  t.deepEqual(binder.values, binder.contexts.map(c => c.todo), "data sould be bound correctly");
  const controllers1 = [].concat(binder.contexts);

  binder.values = [
    {title: "Task", done: true, id: 0},
    {title: "Another Task", done: true, id: 1},
    {title: "New Task", done: false, id: 2},
  ];

  t.deepEqual(elem.childNodes, binder.contexts.map(c => c.element), "elements sould be bound correctly");
  t.deepEqual(binder.values, binder.contexts.map(c => c.todo), "data sould be bound correctly");
  const controllers2 = [].concat(binder.contexts);

  t.equal(controllers1[0], controllers2[0], "controller should be reused");
  t.equal(controllers1[1], controllers2[1], "controller should be reused");

  binder.values = [];

  for (const c of controllers2) {
    t.equal(c.disposed, true, "controller should be disposed");
  }
});
