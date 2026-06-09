export type UserRole = 'ADMIN' | 'USER';

// 6 backend roles
export type RawRole =
  | 'ADMIN'
  | 'ADMIN_TYPE1'
  | 'ADMIN_TYPE2'
  | 'USER'
  | 'USER_TYPE1'
  | 'USER_TYPE2';

export type UserType = 'TYPE1' | 'TYPE2';

export interface User {
  id: string;               // backend numeric id as string, or email as fallback
  name: string;             // fname + lname
  email: string;
  role: UserRole;           // mapped: ADMIN* → 'ADMIN', USER* → 'USER'
  rawRole: RawRole;         // exact backend role
  userType: UserType;       // TYPE1 or TYPE2
  avatarUrl: string;
  avatar: string;
  token?: string;           // JWT stored here briefly before localStorage
  createdAt: string;
  updatedAt: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'success' | 'failed';
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpRequest {
  fname: string;
  lname: string;
  email: string;
  password: string;
  phoneNumber?: string;
  userType: UserType;
  role: string;
}

export interface SignUpResponse {
  id: number;
  fname: string;
  lname: string;
  email: string;
  userType: string;
  role: string;
  message: string;
}


export interface LoginResponse {
  token: string;
  username: string;   // email used as username on backend
  userType: string;   // TYPE1 | TYPE2
  role: string;       // ADMIN | ADMIN_TYPE1 | ADMIN_TYPE2 | USER | USER_TYPE1 | USER_TYPE2
  message: string;
  // enriched fields from backend LoginResponse
  userId?: number;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  phoneNumber?: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

// Product Types 
export type ProductCategory =
  | 'Electronics'
  | 'Clothing'
  | 'Accessories'
  | 'Food'
  | 'Furniture'
  | 'Books'
  | 'Toys'
  | 'Sports'
  | 'Home'
  | 'Office Supplies'
  | 'Other';

export interface Product {
  id: string;
  name: string;
  description: string;
  category?: ProductCategory | string;
  price: number;
  stock: number;          // maps to backend stockQuantity
  image?: string;         // maps to backend imageUrl
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Raw backend product shape (before mapping)
export interface BackendProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  isActive?: boolean;
}

export interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  statistics: ProductStatistics | null;
  pagination: PaginationState;
  fetchStatus: 'idle' | 'loading' | 'failed';
  createStatus: 'idle' | 'loading' | 'failed';
  updateStatus: 'idle' | 'loading' | 'failed';
  deleteStatus: 'idle' | 'loading' | 'failed';
  message: string | null;
  error: string | null;
}

export interface ProductStatistics {
  totalProducts: number;
  activeProducts: number;
  inactive: number;
  totalInventoryValue: number;
  totalStock: number;
}

export interface PaginationState {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// Order Types 
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

//Payload for POST /api/orders/create
export interface CreateOrderData {
  items: Array<{
    productId: number;   // Long on backend — must be numeric
    quantity: number;
  }>;
}

export interface OrdersState {
  items: Order[];
  selectedOrder: Order | null;
  fetchStatus: 'idle' | 'loading' | 'failed';
  createStatus: 'idle' | 'loading' | 'failed';
  updateStatus: 'idle' | 'loading' | 'failed';
  error: string | null;
  message: string | null;
}

// Dashboard Types 
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  activeProducts: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface OrdersData {
  date: string;
  orders: number;
}

// API Response Types 
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// UI Types 
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface UiState {
  sidebarOpen: boolean;
  toasts: Toast[];
  theme: 'light' | 'dark';
}

// Form Types
export interface FormField {
  name: string;
  value: any;
  error?: string;
  touched?: boolean;
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

//  Table Types
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  [key: string]: any;
}

// Chart Types 
export interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: any;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: ChartDataPoint[];
  colors?: string[];
  height?: number;
}