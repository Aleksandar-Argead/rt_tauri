import React from "react";
import ReactDOM from "react-dom/client";
import "./main.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export const RouterWithContext = () => {
  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    context: {},
  });

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterWithContext />
  </React.StrictMode>,
);
