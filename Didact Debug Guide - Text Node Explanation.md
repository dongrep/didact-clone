
# 🧠 Didact Internals & Debugging Log

This README documents a progressive understanding of the [Didact tutorial](https://pomb.us/build-your-own-react/) by Fernando Pombeiro. It answers practical debugging questions encountered while building a simplified React-like library from scratch.

---

## 📌 1. Why does a functional component throw an error?

**Error:**
```bash
Uncaught InvalidCharacterError: Failed to execute 'createElement' on 'Document': 
The tag name provided ('(props) => {...}') is not a valid name.
```

**Explanation:**
Functional components are **JavaScript functions**, not DOM strings like `'div'` or `'span'`. When passed to `createDom()`, the code tries to use it as a tag name — which fails.

---

## ✅ Fix: Add support for function components in `performUnitOfWork`

```ts
function performUnitOfWork(fiber) {
  const isFunctionComponent = typeof fiber.type === "function";
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  ...
}
```

---

## 📌 2. Why doesn't `updateFunctionComponent` create any DOM?

```ts
function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
```

**Answer:** Functional components don’t create DOM themselves. They return a **tree of elements** which are later turned into DOM nodes by their child fibers.

---

## 📌 3. How does `createDom()` handle function components?

It doesn't! Only host components (`'div'`, `'span'`, etc.) and `TEXT_ELEMENT` create actual DOM.

Function components are handled during `reconcileChildren` and skipped by `createDom()`.

---

## 📌 4. What does this code in `commitWork` do?

```ts
let domParentFiber = fiber.parent;
while (!!domParentFiber && !domParentFiber?.dom) {
  domParentFiber = domParentFiber.parent;
}
```

**Purpose:** Some fibers (like function components) don’t have a `.dom`. This code climbs the tree to find the nearest ancestor **with a DOM node** to use as a parent when inserting the current node.

---

## 📌 5. Why doesn't my `onClick` work?

```tsx
<h1 onClick={() => console.log("clicked")}>Hello</h1>
```

**Issue:** You must explicitly attach event listeners in `updateDom()`:

```ts
Object.keys(nextProps)
  .filter((key) => key.startsWith("on"))
  .forEach((name) => {
    const eventType = name.toLowerCase().substring(2);
    dom.addEventListener(eventType, nextProps[name]);
  });
```

Make sure your `updateDom` supports event handlers.

---

## 📌 6. How do I check if an element has an event listener?

```js
getEventListeners(document.querySelector("h1"))
```

This is a built-in helper in Chrome DevTools.

---

## 📌 7. What is `updateFunctionComponent()` doing with hooks?

```ts
let wipFiber = null;
let hookIndex = 0;

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  wipFiber.hooks = [];
  hookIndex = 0;

  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
```

**Answer:** It:
- Sets a global `wipFiber` to store hooks
- Resets `hookIndex`
- Runs the function component and captures its returned children

---

## 📌 8. What does `useState()` do?

```ts
function useState(initial) {
  const oldHook = wipFiber.alternate?.hooks?.[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  oldHook?.queue.forEach(action => {
    hook.state = action(hook.state);
  });

  const setState = (action) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}
```

### 📌 Breakdown:
1. First render → `oldHook` is `undefined`, initial state is used
2. Later renders → `oldHook` is retrieved and state is updated by applying queued actions
3. `setState` pushes new updates and schedules a **re-render**

---

## 📌 9. Why isn’t state updating?

Possibilities:
- `wipRoot` or `nextUnitOfWork` wasn’t properly updated in `setState`
- You're mutating state instead of replacing it
- No alternate fiber is set up on initial render (ensure first render creates it)

---

## 📌 10. Why is `oldHook` null on first render?

Because `fiber.alternate` is `null` the first time — there's no old fiber tree yet. So the hook uses the initial value and no actions are applied.

---

## 📌 11. Why do we do `props.children.flat()`?

```ts
const elements = fiber.props.children.flat();
```

JSX like this:

```tsx
<div>
  {posts.map(post => <div>{post}</div>)}
</div>
```

Generates:

```js
props.children = [[<div>...</div>, <div>...</div>]]
```

So we need `.flat()` to unwrap nested arrays and let `reconcileChildren()` iterate over all children.

Use `.flat(Infinity)` if you want to be safe against deeply nested arrays.

---

## 🧪 Additional Debugging Tips

- Use `console.log("Fiber", fiber)` inside `createDom` to trace what types are being rendered.
- Use Chrome’s `getEventListeners(elem)` to verify event bindings.
- Use breakpoints inside `useState`, `setState`, and `reconcileChildren` to trace render cycles.

---

## ✅ Final Checklist for Working Didact with Hooks

- [x] Handle both host and function components
- [x] Properly reconcile children
- [x] Store hooks per fiber
- [x] Re-render on `setState`
- [x] Attach event listeners in `updateDom`
- [x] Flatten `props.children` if they are arrays
