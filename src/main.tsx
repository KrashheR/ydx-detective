import React from "react";
import { createRoot } from "react-dom/client";
import BootScreen from "./BootScreen";

// BootScreen owns the loading screen: it lazy-loads App, tracks the boot
// signals behind the progress bar and calls notifyGameReady() when done.
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BootScreen />
  </React.StrictMode>,
);
