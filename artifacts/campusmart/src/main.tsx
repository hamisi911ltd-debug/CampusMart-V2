import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Configure API base URL
const apiUrl = import.meta.env.VITE_API_URL || "https://api.campusmart.co.ke";
setBaseUrl(apiUrl);

createRoot(document.getElementById("root")!).render(<App />);
