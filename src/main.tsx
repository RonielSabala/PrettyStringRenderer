import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/base.css";
import "./styles/canvas/canvas.css";
import "./styles/features/editor.css";
import "./styles/features/export.css";
import "./styles/features/inputs.css";
import "./styles/features/themes.css";
import "./styles/layout/app.css";
import "./styles/layout/header.css";
import "./styles/layout/section.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
