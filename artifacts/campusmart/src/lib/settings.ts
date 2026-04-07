import { useQuery } from "@tanstack/react-query";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function fetchPublicSettings() {
  const res = await fetch(`${BASE}/api/settings/public`);
  if (!res.ok) return {};
  return res.json();
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ["public-settings"],
    queryFn: fetchPublicSettings,
    staleTime: 5 * 60 * 1000,
  });
}
