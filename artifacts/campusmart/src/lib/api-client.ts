// Simple API client for CampusMart
const API_BASE = '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async register(data: { username: string; email: string; password: string; phone: string }) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Products
  async getProducts(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/products?${query}`);
  }

  async getProduct(id: string) {
    return this.request<any>(`/products/${id}`);
  }

  async createProduct(data: any) {
    return this.request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Cart
  async getCart() {
    return this.request<any>('/cart');
  }

  async addToCart(data: { productId: string; quantity?: number }) {
    return this.request<any>('/cart', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCartItem(itemId: string, data: { quantity: number }) {
    return this.request<any>(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async removeCartItem(itemId: string) {
    return this.request<any>(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async createOrder(data: { deliveryAddress: string }) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrders() {
    return this.request<any[]>('/orders');
  }

  // Categories
  async getCategories() {
    return this.request<any[]>('/categories');
  }

  // Food
  async getFood(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any[]>(`/food?${query}`);
  }

  async createFood(data: any) {
    return this.request<any>('/food', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Rooms
  async getRooms(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any[]>(`/rooms?${query}`);
  }

  async createRoom(data: any) {
    return this.request<any>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Users
  async getCurrentUser() {
    return this.request<any>('/users/me');
  }
}

export const apiClient = new ApiClient();