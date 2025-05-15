import React from "react";
import { Fiber, UnitOfWork } from "./types";

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child),
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createDom(fiber: Fiber) {
  const dom =
    fiber.type && fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type as string);

  const isProp = (key: string) => key != "children";
  Object.keys(fiber.props)
    .filter(isProp)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });

  return dom;
}

function render(element, container) {
  nextUnitOfWork = {
    type: "ROOT",
    dom: container,
    parent: null,
    props: {
      children: [element],
    },
  };
}

let nextUnitOfWork: Fiber | null = null;

function workloop(deadline: IdleDeadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    shouldYield = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workloop);
}

requestIdleCallback(workloop);

function performUnitOfWork(fiber: Fiber): Fiber | null {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  if (fiber.parent && fiber.parent.dom) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  const elements = fiber.props.children;
  let index = 0;
  let prevSibling: Fiber | null = null;

  while (index < elements.length) {
    const element = elements[index];

    const newFiber: Fiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    if (index == 0) {
      fiber.child = newFiber;
    } else {
      if (prevSibling != null) prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber: Fiber | null = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    if (nextFiber.parent) nextFiber = nextFiber.parent;
    else nextFiber = null;
  }

  return null;
}

const Didact = {
  createElement,
  render,
};

/** @jsx Didact.createElement */
const element = (
  <div id="foo">
    <p>bar</p>
    <br />
  </div>
);

const container = document.getElementById("root");

Didact.render(element, container);
