import {
  API_ENDPOINTS,
  apiService
} from '@/services/apiService';

import {
  User,
  LoginResponse,
  RawRole,
  UserType,
  SignUpRequest,
  SignUpResponse
} from '@/types';
import { authStorage } from '@/utils/storage';

const ADMIN_ROLES: RawRole[] = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'];
 
export function mapRole(rawRole: string): 'ADMIN' | 'USER' {
  return ADMIN_ROLES.includes(rawRole as RawRole) ? 'ADMIN' : 'USER';
}

// LOGIN RESPONSE → USER
export function mapLoginResponseToUser(json: LoginResponse): User {
  // Backend now sends firstName + lastName (from AuthController fix).
  // Fall back gracefully if an older build sends only username.
  const firstName =  json.fname || json.firstname ||'';
  const lastName  = json.lname  || json.lastname || '';
  const fullName  = firstName && lastName
    ? `${firstName} ${lastName}`.trim()
    : firstName || json.username || json.email || '';
 
  const rawRole = (json.role || 'USER_TYPE2') as RawRole;
 
  return {
    id:             json.userId ? String(json.userId) : (json.username || json.email || ''),
    name:           fullName,
    email:          json.email || json.username || '',
    role:           mapRole(rawRole),   // 'ADMIN' | 'USER' — for legacy guards
    rawRole,                            // 'ADMIN_TYPE1' etc. — for navbar + route guards
    userType:       (json.userType || 'TYPE2') as UserType,
    avatarUrl:      json.profilePicture || '',
    avatar:         json.profilePicture || '',
    token:          json.token,
    phoneNumber:    json.phoneNumber,
    profilePicture: json.profilePicture,
    createdAt:      new Date().toISOString(),
    updatedAt:      new Date().toISOString(),
  };
}

// AUTH SERVICE
export const authService = {

  // GET STORED USER
  getStoredUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return authStorage.getUser();
},

  // STORE USER SESSION
storeUser(user: User): void {

  if (typeof window === 'undefined') {
    return;
  }

  authStorage.setUser(user);

  if (user.token) {
    authStorage.setToken(user.token);
  }

},

// STORE ACCESS TOKEN
  storeToken(token: string): void {

  if (typeof window === 'undefined') {
    return;
  }

  authStorage.setToken(token);

},

  // STORE REFRESH TOKEN
  storeRefreshToken: (
    // refreshToken: string
  ): void => {
  },

  // GET ACCESS TOKEN
getToken(): string | null {

  if (typeof window === 'undefined') {
    return null;
  }

  return authStorage.getToken();

},

  // GET REFRESH TOKEN
  getRefreshToken: (): string | null => {
      return null;
  },

  // CLEAR SESSION
  clearSession: (): void => {

    if (typeof window === 'undefined') {
      return;
    }

    authStorage.clearAuth();
  },

  // LOGOUT
  logout: (): void => {
    authService.clearSession();
  },

  // LOGIN
  // POST /api/auth/login
  login: async (
    email: string,
    password: string
  ): Promise<User> => {

    const json =
      await apiService.post<LoginResponse>(
        API_ENDPOINTS.LOGIN,
        {
          username: email,
          password,
        }
      );

    if (!json.token) {

      throw new Error(
        json.message || 'Login failed'
      );
    }

    // STORE TOKEN
    // authService.storeToken(json.token);

    // // OPTIONAL REFRESH TOKEN
    // if ((json as any).refreshToken) {

    //   authService.storeRefreshToken(
    //     (json as any).refreshToken
    //   );
    // }

    // const user =mapLoginResponseToUser(json);

    // authService.storeUser(user);

    const user = mapLoginResponseToUser(json);

authService.storeUser(user);

return user;
},

  // FETCH CURRENT USER
  fetchMe: async (): Promise<Partial<User>> => {

    try {

      const token =
        authService.getToken();

      if (!token) {
        return {};
      }

      const json =
        await apiService.get<any>(
          API_ENDPOINTS.ME
        );

      return {

        id:
          String(
            json.id || json.email
          ),

        name:
          `${json.fname || ''} ${json.lname || ''}`.trim()
          || json.email,

        phoneNumber:
          json.phoneNumber,

        profilePicture:
          json.profilePicture,

        avatarUrl:
          json.profilePicture || '',

        avatar:
          json.profilePicture || '',

        role : json.role,
        
        rawRole : json.rawRole,

        userType : json.userType,

        email : json.email,
      };

    } catch (error) {

      console.error(
        'fetchMe failed',
        error
      );

      return {};
    }
  },

  // SIGNUP
  signup: async (
    data: SignUpRequest
  ): Promise<SignUpResponse> => {

    return apiService.post<SignUpResponse>(
      API_ENDPOINTS.SIGNUP,
      data
    );
  },

  // SEND PHONE OTP
  sendPhoneOtp: async (
    phone: string
  ): Promise<{ message: string }> => {

    return apiService.postQuery(
      API_ENDPOINTS.PHONE_SEND_OTP,
      { phone }
    );
  },

  // VERIFY PHONE OTP
  verifyPhoneOtp: async (
    phone: string,
    otp: string
  ): Promise<User> => {

    const json =await apiService.postQuery< LoginResponse & {email: string}>(
        API_ENDPOINTS.PHONE_VERIFY_OTP,
        {phone,otp});

    // authService.storeToken(json.token);

    // const user = mapLoginResponseToUser(json);

    // authService.storeUser(user);

    const user = mapLoginResponseToUser(json);

authService.storeUser(user);

return user;
  },

  // ACTIVE SESSION
 hasActiveSession(): boolean {

  return !!(

    authStorage.getToken()

    &&

    authStorage.getUser()

  );

},
};