// ───────────────── Forgot Password ─────────────────

export interface ForgotPasswordRequest {
  email: string;
  method: 'EMAIL' | 'SMS';
}

export interface ForgotPasswordResponse {
  message: string;
}

// ───────────────── Reset Password ─────────────────

export interface ResetPasswordRequest {
  identifier: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// ───────────────── Change Password ─────────────────

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}