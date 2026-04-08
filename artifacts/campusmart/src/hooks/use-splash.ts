import { useEffect } from "react";

/** Fades out and removes the #splash element after the app mounts */
export function useSplash(delay = 1800) {
  useEffect(() => {
    const splash = document.getElementById("splash");
    if (!splash) return;

    const timer = setTimeout(() => {
      splash.classList.add("fade-out");
      splash.addEventListener("transitionend", () => splash.remove(), { once: true });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);
}
