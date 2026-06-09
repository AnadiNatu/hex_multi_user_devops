const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8080/api';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private buildHeaders(customHeaders?: HeadersInit): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('hexaorder.session');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch {
        // ignore parse failure
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.buildHeaders(),
      credentials: 'include',
      ...config,
    });
    return this.handleResponse<T>(response);
  }

  async post<T, D = any>(endpoint: string, data?: D, config?: RequestConfig): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.buildHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
    return this.handleResponse<T>(response);
  }

  async put<T, D = any>(endpoint: string, data?: D, config?: RequestConfig): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.buildHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
    return this.handleResponse<T>(response);
  }

  async patch<T, D = any>(endpoint: string, data?: D, config?: RequestConfig): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.buildHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.buildHeaders(),
      credentials: 'include',
      ...config,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Multipart upload - does NOT set Content-Type (browser sets it with boundary)
   */
  async upload<T>(
    endpoint: string,
    formData: FormData,
    method: 'POST' | 'PUT' = 'POST'
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers,
      credentials: 'include',
      body: formData,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * POST to a URL with query params (no body)
   */
  async postQuery<T>(endpoint: string, params: Record<string, string>): Promise<T> {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}${endpoint}?${query}`, {
      method: 'POST',
      headers: this.buildHeaders(),
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }
}

export const apiService = new ApiService(API_BASE_URL);

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  ME: '/auth/me',
  // Phone auth
  PHONE_SEND_OTP: '/auth/phone/send-otp',
  PHONE_VERIFY_OTP: '/auth/phone/verify-otp',
  // OTP
  OTP_SEND_EMAIL: '/otp/send/email',
  OTP_VERIFY_EMAIL: '/otp/verify/email',
  OTP_SEND_SMS: '/otp/send/sms',
  OTP_VERIFY_SMS: '/otp/verify/sms',
  // Password
  PASSWORD_FORGOT: '/password/forgot',
  PASSWORD_RESET: '/password/reset',
  PASSWORD_CHANGE: '/password/change',
  // Profile
  PROFILE_PHOTO: '/profile/photo',
  // Products — ADMIN
  PRODUCT_ADMIN_CREATE: '/product/admin/create',
  PRODUCT_ADMIN_ALL: '/product/admin/all',
  PRODUCT_ADMIN_DELETE: (id: string) => `/product/admin/delete/${id}`,
  // Products — ADMIN_TYPE1
  PRODUCT_AT1_UPDATE_STOCK: (id: string) => `/product/admin-type1/update-stock/${id}`,
  PRODUCT_AT1_LOW_STOCK: '/product/admin-type1/low-stock',
  // Products — ADMIN_TYPE2
  PRODUCT_AT2_UPDATE_PRICE: (id: string) => `/product/admin-type2/update-price/${id}`,
  PRODUCT_AT2_CATEGORY: (cat: string) => `/product/admin-type2/category/${cat}`,
  PRODUCT_AT2_TOGGLE_ACTIVE: (id: string) => `/product/admin-type2/toggle-active/${id}`,
  // Products — USER (basic)
  PRODUCT_USER_SEARCH: '/product/user/search',
  PRODUCT_USER_DETAILS: (id: string) => `/product/user/details/${id}`,
  // Products — USER_TYPE1
  PRODUCT_UT1_CATEGORIES: '/product/user-type1/categories',
  PRODUCT_UT1_CATEGORY: (cat: string) => `/product/user-type1/category/${cat}`,
  PRODUCT_UT1_FEATURED: '/product/user-type1/featured',
  // Products — USER_TYPE2
  // NOTE: Backend SecurityConfig maps /api/product/user-type2/** (NOT /api/products/)
  PRODUCT_UT2_PRICE_RANGE: '/product/user-type2/price-range',
  PRODUCT_UT2_SORTED: '/product/user-type2/sorted',
  PRODUCT_UT2_COMPARE: '/product/user-type2/compare',
  // Dashboard
  DASHBOARD_STATS: '/dashboard/stats',
  // Orders
  ORDERS_MY: '/orders/my',
  ORDERS_ADMIN_ALL: '/orders/admin/all',
  ORDERS_CREATE: '/orders/create',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  ORDER_STATUS: (id: string) => `/orders/admin/status/${id}`,
} as const;