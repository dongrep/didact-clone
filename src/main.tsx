import React from "react";
import { Didact } from "./didact";

/** @jsx Didact.createElement */
function Counter() {
  const posts = ["post 1", "post 2", "post 3"];
  const [state, setState] = Didact.useState(1);
  return (
    <div>
      <h1>Count: {state}</h1>
      <button onClick={() => setState((c: number) => c + 1)}>Add</button>
      {posts.map((post) => (
        <div>{post}</div>
      ))}
    </div>
  );
}
const element = <Counter />;
const container = document.getElementById("root");

console.log("Starting render", element, container);
Didact.render(element, container);
