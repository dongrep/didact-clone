import React, { act } from "react";
import { Dom, Fiber, Hook } from "./types";

function createElement(type: any, props: any, ...children: any[]) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text: any) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createDom(fiber: Fiber) {
  console.log("Fiber:", fiber);
  console.log("Creating DOM for type:", fiber.type);

  const dom =
    fiber.type && fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode(fiber.props.nodeValue)
      : document.createElement(fiber.type as string);

  console.log("Creating DOM for:", fiber.type, fiber.props);

  const isProp = (key: string) => key != "children";
  Object.keys(fiber.props)
    .filter(isProp)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });

  Object.keys(fiber.props)
    .filter(isEvent)
    .forEach((name) => {
      const eventName = name.toLowerCase().substring(2);
      dom.addEventListener(eventName, fiber.props[name]);
    });

  return dom;
}

function commitRoot() {
  deletions?.forEach(commitWork);
  commitWork(wipRoot?.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

const isEvent = (key: string) => key.startsWith("on");
const isProperty = (key: string) => key !== "children" && !isEvent(key);
const isNew =
  (prev: Record<string, any>, next: Record<string, any>) => (key: string) =>
    prev[key] !== next[key];
const isGone =
  (_: Record<string, any>, next: Record<string, any>) => (key: string) =>
    !(key in next);
function updateDom(
  dom: Dom,
  prevProps?: Record<string, any>,
  nextProps?: Record<string, any>
) {
  if (dom && prevProps && nextProps) {
    // Remove old or changed event listeners
    Object.keys(prevProps)
      .filter(isEvent)
      .filter(
        (key: string) => !(key in nextProps) || isNew(prevProps, nextProps)
      )
      .forEach((name) => {
        const eventName = name.toLowerCase().substring(2);
        dom.removeEventListener(eventName, prevProps[name]);
      });

    // Add new event listeners
    Object.keys(nextProps)
      .filter(isEvent)
      .filter(isNew(prevProps, nextProps))
      .forEach((name) => {
        const eventName = name.toLowerCase().substring(2);
        dom.addEventListener(eventName, nextProps[name]);
      });

    console.log("current dom element eventListeners", { dom });

    // Remove old properties
    Object.keys(prevProps)
      .filter(isProperty)
      .filter(isGone(prevProps, nextProps))
      .forEach((name) => (dom[name] = ""));

    // Set new or changed properties
    Object.keys(nextProps)
      .filter(isProperty)
      .filter(isNew(prevProps, nextProps))
      .forEach((name) => (dom[name] = nextProps[name]));
  }
}

function commitWork(fiber?: Fiber | null) {
  if (!fiber) {
    return;
  }
  console.log("Committing:", fiber.type, fiber.effectTag);

  let domParentFiber: Fiber | null = fiber.parent;

  while (!!domParentFiber && !domParentFiber?.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent: Dom | undefined = domParentFiber?.dom;

  if (!!fiber.dom && !!domParent) {
    if (fiber.effectTag == "PLACEMENT") {
      domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === "DELETE") {
      commitDeletion(fiber, domParent);
    } else if (fiber.effectTag == "UPDATE") {
      updateDom(fiber.dom, fiber.alternate?.props, fiber.props);
    }
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber: Fiber, domParent: Dom) {
  console.log("Commiting deletion for ", { fiber, domParent });

  if (fiber.dom) {
    domParent?.removeChild(fiber.dom);
  } else {
    const child = fiber.child;
    if (child) {
      console.log("Calling commitDeletion for fiber child ", {
        child,
        domParent,
      });
      commitDeletion(child, domParent);
    }
  }
}

function render(element: React.JSX.Element, container: HTMLElement | null) {
  wipRoot = {
    type: "ROOT",
    dom: container,
    parent: null,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

let nextUnitOfWork: Fiber | null = null;
let currentRoot: Fiber | null = null;
let wipRoot: Fiber | null = null;
let deletions: Fiber[] | null = null;

function workloop(deadline: IdleDeadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workloop);
}

requestIdleCallback(workloop);

function performUnitOfWork(fiber: Fiber): Fiber | null {
  console.log("PerformUnitOfWork ", { fiber });
  const isFunctionalComponent = fiber.type instanceof Function;

  if (isFunctionalComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
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

let wipFiber: Fiber | null = null;
let hookIndex: number = 0;
let useSatateCallCount = 0;

function updateFunctionComponent(fiber: Fiber) {
  wipFiber = fiber;
  wipFiber.hooks = [];
  hookIndex = 0;
  const children = [(fiber.type as Function)(fiber.props)];
  reconcileChildren(fiber, children);
}

function useState(initial: any): [any, (action: Function) => void] {
  console.log("useState hook rendered : ", useSatateCallCount++);
  const oldHook =
    wipFiber?.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  oldHook && console.log("oldHook", { oldHook });

  const hook: Hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  console.log("current hook ", { hook });

  const actions = oldHook?.queue;
  actions?.forEach((action) => {
    hook.state = action(hook.state);
  });

  console.log("current hook post actions ", { hook });

  const setState = (action: Function) => {
    hook.queue.push(action);
    console.log("hook queue after setState is called", { oldHook });
    if (currentRoot && currentRoot.dom) {
      wipRoot = {
        type: null,
        dom: currentRoot?.dom,
        props: currentRoot?.props,
        alternate: currentRoot,
        parent: null,
      };
      nextUnitOfWork = wipRoot;
      deletions = [];
    }
  };

  wipFiber?.hooks?.push(hook);
  if (!!hookIndex) hookIndex = hookIndex + 1;
  console.log("wipFiber hooks and hook index", { wipFiber, hookIndex });
  return [hook.state, setState];
}

function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  const elements = fiber.props.children.flat(Infinity);
  reconcileChildren(fiber, elements);
}

function reconcileChildren(wipFiber: Fiber, elements: any) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling: Fiber | null = null;

  while (index < elements.length || !!oldFiber) {
    const element = elements[index];
    let newFiber: Fiber | null = null;

    // TODO compare old fiber with element
    const sameType = oldFiber && element && oldFiber.type == element.type;

    if (oldFiber && sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        parent: wipFiber,
        alternate: oldFiber,
        dom: oldFiber.dom,
        effectTag: "UPDATE",
      };
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        alternate: null,
        dom: null,
        effectTag: "PLACEMENT",
      };
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETE";
      deletions && deletions.push(oldFiber);
    }

    if (index == 0) {
      wipFiber.child = newFiber;
    } else {
      if (prevSibling != null) prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
    if (oldFiber) oldFiber = oldFiber?.sibling;
  }
}

export const Didact = {
  createElement,
  render,
  useState,
};
