import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// ---------------------------------------------------------------------------
// Deregister any stale service workers (e.g. old sw.js from a previous PWA
// setup). A lingering SW intercepts fetch events and rejects them with
// net::ERR_FAILED when the cached API origin (localhost:3001) is unreachable.
// ---------------------------------------------------------------------------
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((sw) => {
      sw.unregister();
      console.info("[CampusMart] Unregistered stale service worker:", sw.scope);
    });
  });
}

// Configure API base URL for mobile devices
const getApiUrl = () => {
  // In development, use proxy for localhost
  if (import.meta.env.DEV && window.location.hostname === 'localhost') {
    return "";
  }
  
  // For mobile devices accessing via IP, use explicit API URL
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) return apiUrl;
  
  // Fallback: construct API URL from current location
  if (window.location.hostname !== 'localhost') {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  
  return "";
};

setBaseUrl(getApiUrl());

createRoot(document.getElementById("root")!).render(<App />);
