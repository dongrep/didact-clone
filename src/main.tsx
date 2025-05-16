import React from "react";
import { Didact } from "./didact";
import reactLogo from "./assets/react.svg";

/** @jsx Didact.createElement */
function Counter() {
  const posts = ["Learn", "React", "The Didact Way"];
  const [state, setState] = Didact.useState(1);
  return (
    <div
      style={{
        border: "2px solid #007BFF",
        borderRadius: "12px",
        width: "60%",
        margin: "20px auto",
        padding: "16px",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
      }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}>
        <h1 style={{ color: "#007BFF", fontSize: "24px", margin: 0 }}>
          Count: {state}
        </h1>
        <button
          onClick={() => setState((c: number) => c + 1)}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: "#007BFF",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#0056b3")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#007BFF")
          }>
          Add
        </button>
      </div>
      <div>
        {posts.map((post) => (
          <Post key={post} name={post} />
        ))}
      </div>
    </div>
  );
}

function Post({ name }: { name: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        margin: "12px 0",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        backgroundColor: "white",
        transition: "transform 0.3s, box-shadow 0.3s",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "scale(1.02)";
        e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.2)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
      }}>
      <img src={reactLogo} alt="React Logo" />
      <h2 style={{ color: "#333", margin: 0 }}>{name}</h2>
    </div>
  );
}

const element = <Counter />;
const container = document.getElementById("root");

console.log("Starting render", element, container);
Didact.render(element, container);
