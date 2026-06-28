import { apiService } from '@/services/apiService';

// ── Types ──────────────────────────────────────────────────────────────────

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
  role: string;           // e.g. 'ADMIN_TYPE1' | 'ADMIN_TYPE2' | 'USER_TYPE1' | 'USER_TYPE2'
}

export interface ProvisionResponse {
  id?: number;
  message: string;
  email?: string;
  role?: string;
  userId?: number;
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

// ── Admin Provision endpoints (/api/admin/provision/*) ────────────────────

export const provisionService = {

  // ADMIN only: create ADMIN_TYPE1 or ADMIN_TYPE2
  createAdminUser: (data: ProvisionUserRequest): Promise<ProvisionResponse> =>
    apiService.post('/admin/provision/admin-user', data),

  // ADMIN only: list pending (unapproved) TYPE1 users
  getPendingType1: (): Promise<PendingUser[]> =>
    apiService.get('/admin/provision/pending/type1'),

  // ADMIN only: approve a TYPE1 user by id
  approveType1: (id: number): Promise<ApprovalResponse> =>
    apiService.post(`/admin/provision/approve/type1/${id}`),

  // ADMIN only: trigger password-reset OTP for a TYPE1 user
  resetPasswordType1: (id: number): Promise<PasswordResetResponse> =>
    apiService.post(`/admin/provision/reset-password/type1/${id}`),

  // ADMIN + ADMIN_TYPE2: create USER_TYPE1 or USER_TYPE2
  createUser: (data: ProvisionUserRequest): Promise<ProvisionResponse> =>
    apiService.post('/admin/provision/user', data),

  // ADMIN + ADMIN_TYPE2: list pending (unapproved) TYPE2 users
  getPendingType2: (): Promise<PendingUser[]> =>
    apiService.get('/admin/provision/pending/type2'),

  // ADMIN + ADMIN_TYPE2: approve a TYPE2 user by id
  approveType2: (id: number): Promise<ApprovalResponse> =>
    apiService.post(`/admin/provision/approve/type2/${id}`),

  // ADMIN + ADMIN_TYPE2: trigger password-reset OTP for a TYPE2 user
  resetPasswordType2: (id: number): Promise<PasswordResetResponse> =>
    apiService.post(`/admin/provision/reset-password/type2/${id}`),
};

// ── Email Verification endpoints (/api/auth/*) ────────────────────────────

export const emailVerifyService = {

  // POST /api/auth/verify-email?email=&otp=
  verifyEmail: (email: string, otp: string): Promise<EmailVerifyResponse> =>
    apiService.postQuery('/auth/verify-email', { email, otp }),

  // POST /api/auth/resend-verification?email=
  resendVerification: (email: string): Promise<ResendVerifyResponse> =>
    apiService.postQuery('/auth/resend-verification', { email }),
};