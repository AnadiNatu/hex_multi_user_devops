export interface OtpSendRequest {
  email?: string;
  phone?: string;
}

export interface OtpVerifyRequest {
  email?: string;
  phone?: string;
  otp: string;
}

export interface OtpResponse {
  message: string;
}

export interface OtpVerifyResponse {
  verified: boolean;
  message: string;

  // Phone login verification returns these
  token?: string;
  role?: string;
  userType?: string;
  email?: string;
}