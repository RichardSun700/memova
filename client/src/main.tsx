import { createRoot } from "react-dom/client";
import App from "./App";
import { initializeSeoHandoff } from "./seo/seoHandoff";
import "./index.css";
import "./styles/marketing-theme.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root application mount point");
}

initializeSeoHandoff(root);
createRoot(root).render(<App />);
