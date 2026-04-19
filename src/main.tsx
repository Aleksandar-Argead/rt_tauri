import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./main.css";
import { TooltipProvider } from "@components/ui/tooltip";
import { Toaster } from "@components/ui/sonner";

export function RouterWithContext() {
  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    context: {},
  });

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
    <>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster />
      </TooltipProvider>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterWithContext />
  </React.StrictMode>,
);
