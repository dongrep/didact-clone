# Didact – A Minimal React-like Library

This project is a simplified reimplementation of React, inspired by the [Didact](https://pomb.us/build-your-own-react/) tutorial. It is designed to help understand how React works under the hood by rebuilding core concepts such as the fiber architecture, the reconciliation process, function components, hooks (like `useState`), and the commit phase.

## Features Implemented

- Fiber tree construction and traversal
- Function and host components
- Basic reconciliation algorithm
- DOM creation and updates
- `useState` implementation and state persistence
- Event handling through props (e.g., `onClick`)
- Lazy rendering and `requestIdleCallback` scheduling

## Project Structure

```
/src
  main.tsx          – Entry point, renders the app using Didact
  didact.ts         – Core implementation of the Didact library
  app.tsx           – Example functional component using Didact
```

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/didact-clone.git
   cd didact-clone
   ```

2. Install dependencies and start a local server. If you're using Vite or Parcel:
   ```bash
   npm install
   npm run dev
   ```

3. Open the browser and go to `http://localhost:3000` (or whatever port your dev server uses).

## Development Notes

### Rendering Functional Components

The `performUnitOfWork` function handles both host and function components. Functional components do not return DOM nodes directly but instead return a fiber tree that describes the desired UI.

### Handling Hooks

Hooks are registered during `updateFunctionComponent`, where a new `hook` is added to the current `wipFiber`. The `useState` hook persists state across renders by keeping the hook list in the alternate fiber.

### Known Limitations

- No support for context or advanced lifecycle methods
- No built-in support for JSX without a compiler like Babel
- Minimal support for nested or deeply composed components
- Limited event system; only basic props like `onClick` are handled

## Questions and Debugging Guide

See [`Didact-Debug-Guide.md`](./Didact-Debug-Guide.md) for a deep dive into the learning and debugging process behind this project.

## Credits

Built as an educational project based on the [Build Your Own React](https://pomb.us/build-your-own-react/) tutorial by Pedro Duarte.

---
Feel free to contribute by opening issues or submitting pull requests!