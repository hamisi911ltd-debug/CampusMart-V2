const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

function authHeaders() {
  const token = localStorage.getItem("campusmart_token");
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function req<T>(method: string, path: string, body?: any): Promise<T> {
  const res = await fetch(`${BASE}/api/admin${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const adminApi = {
  stats: () => req<any>("GET", "/stats"),
  // users
  users: (params?: Record<string, string>) => req<any>("GET", `/users?${new URLSearchParams(params || {})}`),
  setUserRole: (id: string, role: string) => req<any>("PUT", `/users/${id}/role`, { role }),
  deleteUser: (id: string) => req<any>("DELETE", `/users/${id}`),
  // products
  products: (params?: Record<string, string>) => req<any>("GET", `/products?${new URLSearchParams(params || {})}`),
  setProductStatus: (id: string, status: string) => req<any>("PUT", `/products/${id}/status`, { status }),
  setProductFeatured: (id: string, featured: boolean) => req<any>("PUT", `/products/${id}/featured`, { featured }),
  deleteProduct: (id: string) => req<any>("DELETE", `/products/${id}`),
  // rooms
  rooms: (params?: Record<string, string>) => req<any>("GET", `/rooms?${new URLSearchParams(params || {})}`),
  setRoomAvailable: (id: string, available: boolean) => req<any>("PUT", `/rooms/${id}/available`, { available }),
  deleteRoom: (id: string) => req<any>("DELETE", `/rooms/${id}`),
  // food
  foodVendors: (params?: Record<string, string>) => req<any>("GET", `/food-vendors?${new URLSearchParams(params || {})}`),
  toggleVendor: (id: string) => req<any>("PUT", `/food-vendors/${id}/toggle`, {}),
  deleteVendor: (id: string) => req<any>("DELETE", `/food-vendors/${id}`),
  // orders
  orders: (params?: Record<string, string>) => req<any>("GET", `/orders?${new URLSearchParams(params || {})}`),
  setOrderStatus: (id: string, status: string) => req<any>("PUT", `/orders/${id}/status`, { status }),
  // bootstrap
  bootstrap: () => req<any>("POST", "/bootstrap"),
};
