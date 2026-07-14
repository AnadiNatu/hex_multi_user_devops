import { apiService } from './apiService';
import { API_ENDPOINTS } from './apiService';

import type {
  OtpResponse,
  OtpVerifyResponse,
} from '../types/otp';

export const otpAdminService = {

  // -------------------------------------------------
  // EMAIL OTP
  // -------------------------------------------------

  sendEmailOtp: (email: string) =>

    apiService.post<OtpResponse>(
      `${API_ENDPOINTS.OTP_SEND_EMAIL}?email=${encodeURIComponent(email)}`
    ),

  verifyEmailOtp: (
    email: string,
    otp: string
  ) =>

    apiService.post<OtpVerifyResponse>(
      `${API_ENDPOINTS.OTP_VERIFY_EMAIL}?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
    ),

  // -------------------------------------------------
  // SMS OTP
  // -------------------------------------------------

  sendSmsOtp: (phone: string) =>

    apiService.post<OtpResponse>(
      `${API_ENDPOINTS.OTP_SEND_SMS}?phone=${encodeURIComponent(phone)}`
    ),

  verifySmsOtp: (
    phone: string,
    otp: string
  ) =>

    apiService.post<OtpVerifyResponse>(
      `${API_ENDPOINTS.OTP_VERIFY_SMS}?phone=${encodeURIComponent(phone)}&otp=${encodeURIComponent(otp)}`
    ),

  // -------------------------------------------------
  // PHONE LOGIN
  // -------------------------------------------------

  sendPhoneOtp: (phone: string) =>

    apiService.post<OtpResponse>(
      `${API_ENDPOINTS.PHONE_SEND_OTP}?phone=${encodeURIComponent(phone)}`
    ),

  verifyPhoneOtp: (
    phone: string,
    otp: string
  ) =>

    apiService.post<OtpVerifyResponse>(
      `${API_ENDPOINTS.PHONE_VERIFY_OTP}?phone=${encodeURIComponent(phone)}&otp=${encodeURIComponent(otp)}`
    ),

};