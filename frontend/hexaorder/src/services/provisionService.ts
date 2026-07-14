import { apiService } from './apiService';

export interface PendingUser {
  id: number;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  createdByAdmin: string;
}

export interface ProvisionUserRequest {
  fname: string;
  lname: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: string;
}

export interface ProvisionResponse {
  id?: number;
  message: string;
  email?: string;
  role?: string;
}

export interface ApprovalResponse {
  message: string;
  userId: number;
  email?: string;
  role?: string;
}

export interface PasswordResetResponse {
  message: string;
  userId: number;
}

export interface EmailVerifyResponse {
  verified: boolean;
  message: string;
  userType?: string;
}

export interface ResendVerifyResponse {
  message: string;
}

export const provisionService = {
  createAdminUser: (data: ProvisionUserRequest): Promise<ProvisionResponse> =>
    apiService.post('/api/admin/provision/admin-user', data),

  getPendingType1: (): Promise<PendingUser[]> =>
    apiService.get('/api/admin/provision/pending/type1'),

  approveType1: (id: number): Promise<ApprovalResponse> =>
    apiService.post(`/api/admin/provision/approve/type1/${id}`),

  resetPasswordType1: (id: number): Promise<PasswordResetResponse> =>
    apiService.post(`/api/admin/provision/reset-password/type1/${id}`),

  createUser: (data: ProvisionUserRequest): Promise<ProvisionResponse> =>
    apiService.post('/api/admin/provision/user', data),

  getPendingType2: (): Promise<PendingUser[]> =>
    apiService.get('/api/admin/provision/pending/type2'),

  approveType2: (id: number): Promise<ApprovalResponse> =>
    apiService.post(`/api/admin/provision/approve/type2/${id}`),

  resetPasswordType2: (id: number): Promise<PasswordResetResponse> =>
    apiService.post(`/api/admin/provision/reset-password/type2/${id}`),
};

export const emailVerifyService = {
  verifyEmail: (email: string, otp: string): Promise<EmailVerifyResponse> =>
    apiService.postQuery('/api/auth/verify-email', { email, otp }),

  resendVerification: (email: string): Promise<ResendVerifyResponse> =>
    apiService.postQuery('/api/auth/resend-verification', { email }),
};