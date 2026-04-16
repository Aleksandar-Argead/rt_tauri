import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    let unlistenFunctions: UnlistenFn[] = [];

    const setupListeners = async () => {
      // Each 'listen' returns a Promise that resolves to an unlisten function
      const unlistenConnected = await listen("client-connected", (event) => {
        console.log("New client:", event.payload);
      });
      unlistenFunctions.push(unlistenConnected);

      const unlistenCommand = await listen("new-command", (event) => {
        console.log("New command:", event.payload);
      });
      unlistenFunctions.push(unlistenCommand);
    };

    setupListeners();

    return () => {
      unlistenFunctions.forEach((unlisten) => unlisten());
    };
  }, []);

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
