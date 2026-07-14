import { apiService, API_ENDPOINTS } from './apiService';
import type {
  ForgotPasswordRequest, ForgotPasswordResponse,
  ResetPasswordRequest, ResetPasswordResponse,
  ChangePasswordRequest, ChangePasswordResponse,
} from '../types/password';
import { authStorage } from '../utils/storage';

export const passwordService = {

  forgotPassword: (request: ForgotPasswordRequest) =>
    apiService.postQuery<ForgotPasswordResponse>(
      API_ENDPOINTS.PASSWORD_FORGOT,
      { email: request.email, method: request.method }
    ),

  // FIX: Send as query params (matches backend @RequestParam signature)
  resetPassword: (request: ResetPasswordRequest) =>
    apiService.postQuery<ResetPasswordResponse>(
      API_ENDPOINTS.PASSWORD_RESET,
      {
        identifier:  request.identifier,
        otp:         request.otp,
        newPassword: request.newPassword,
      }
    ),

  // FIX: Change password uses query params + reads email from stored user
  changePassword: (request: ChangePasswordRequest) => {
    const user = authStorage.getUser();
    if (!user?.email) return Promise.reject(new Error('Not logged in'));
    return apiService.postQuery<ChangePasswordResponse>(
      API_ENDPOINTS.PASSWORD_CHANGE,
      {
        email:           user.email,
        currentPassword: request.currentPassword,
        newPassword:     request.newPassword,
      }
    );
  },
};