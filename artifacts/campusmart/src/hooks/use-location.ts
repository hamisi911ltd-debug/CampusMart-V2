import { useState, useEffect } from "react";

interface UserLocation {
  city: string;
  loading: boolean;
  error: boolean;
}

export function useUserLocation(): UserLocation {
  const [city, setCity] = useState(() => localStorage.getItem("user_city") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (city) return; // already have it
    if (!navigator.geolocation) { setError(true); return; }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Use a free reverse geocoding API (no key needed)
          const { latitude: lat, longitude: lng } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const name =
            data.address?.city ||
            data.address?.town ||
            data.address?.suburb ||
            data.address?.county ||
            "Near You";
          setCity(name);
          localStorage.setItem("user_city", name);
        } catch {
          setError(true);
        } finally {
          setLoading(false);
        }
      },
      () => { setLoading(false); setError(true); },
      { timeout: 6000 }
    );
  }, []);

  return { city, loading, error };
}
