// import { API_ENDPOINTS, apiService } from '@/services/apiService';
// import { User, LoginResponse, RawRole, UserType, SignUpRequest, SignUpResponse } from '@/types';


// const SESSION_STORAGE_KEY = 'hexaorder.session';
// const TOKEN_KEY = 'auth_token';
// const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

// interface Session {
//   user: User;
//   expiresAt: string;
// }

// //Map backend role string to frontend UserRole ('ADMIN' | 'USER')
// export function mapRole(rawRole: string): 'ADMIN' | 'USER' {
//   const adminRoles = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'];
//   return adminRoles.includes(rawRole) ? 'ADMIN' : 'USER';
// }

// export function mapLoginResponseToUser(json: LoginResponse): User {
//   const fullName =
//     json.firstName && json.lastName
//       ? `${json.firstName} ${json.lastName}`.trim()
//       : json.firstName || json.username;

//   return {
//     id: json.userId ? String(json.userId) : json.username,
//     name: fullName,
//     email: json.username,
//     role: mapRole(json.role),
//     rawRole: json.role as RawRole,
//     userType: json.userType as UserType,
//     avatarUrl: json.profilePicture || '',
//     avatar: json.profilePicture || '',
//     token: json.token,
//     phoneNumber: json.phoneNumber,
//     profilePicture: json.profilePicture,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   };
// }

// const parseSession = (rawValue: string | null): User | null => {
//   if (!rawValue) return null;
//   try {
//     const session: Session = JSON.parse(rawValue);
//     const expiresAt = Date.parse(session.expiresAt);
//     if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
//       localStorage.removeItem(SESSION_STORAGE_KEY);
//       localStorage.removeItem(TOKEN_KEY);
//       return null;
//     }
//     return session.user;
//   } catch {
//     localStorage.removeItem(SESSION_STORAGE_KEY);
//     localStorage.removeItem(TOKEN_KEY);
//     return null;
//   }
// };

// export const authService = {
//   getStoredUser: (): User | null => {
//     if (typeof window === 'undefined') return null;
//     return parseSession(localStorage.getItem(SESSION_STORAGE_KEY));
//   },

//   storeUser: (user: User): void => {
//     if (typeof window === 'undefined') return;
//     const session: Session = {
//       user,
//       expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
//     };
//     localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
//     if (user.token) {
//       localStorage.setItem(TOKEN_KEY, user.token);
//     }
//   },

//   storeToken: (token: string): void => {
//     if (typeof window !== 'undefined') {
//       localStorage.setItem(TOKEN_KEY, token);
//     }
//   },

//   getToken: (): string | null => {
//     if (typeof window === 'undefined') return null;
//     return localStorage.getItem(TOKEN_KEY);
//   },

//   clearSession: (): void => {
//     if (typeof window !== 'undefined') {
//       localStorage.removeItem(SESSION_STORAGE_KEY);
//       localStorage.removeItem(TOKEN_KEY);
//     }
//   },

//   // POST /api/auth/login
//      login: async (email: string, password: string): Promise<User> => {
//     const json = await apiService.post<LoginResponse>(API_ENDPOINTS.LOGIN, {
//       username: email,   // backend field is "username"
//       password,
//     });

//     if (!json.token) {
//       throw new Error(json.message || 'Login failed');
//     }

//     // Store token immediately so subsequent /me call works
//     authService.storeToken(json.token);

//     return mapLoginResponseToUser(json);
//   },

//   fetchMe: async (): Promise<Partial<User>> => {
//     try {
//       const json = await apiService.get<any>(API_ENDPOINTS.ME);
//       return {
//         id: String(json.id || json.email),
//         name: `${json.fname || ''} ${json.lname || ''}`.trim() || json.email,
//         phoneNumber: json.phoneNumber,
//         profilePicture: json.profilePicture,
//         avatarUrl: json.profilePicture || '',
//         avatar: json.profilePicture || '',
//       };
//     } catch {
//       return {};
//     }
//   },

//   //Sign up — POST /api/auth/signup
   
//   signup: async (data: SignUpRequest): Promise<SignUpResponse> => {
//     return apiService.post<SignUpResponse>(API_ENDPOINTS.SIGNUP, data);
//   },

//   //Send phone OTP
//   sendPhoneOtp: async (phone: string): Promise<{ message: string }> => {
//     return apiService.postQuery(API_ENDPOINTS.PHONE_SEND_OTP, { phone });
//   },

//   //Verify phone OTP and login
//   verifyPhoneOtp: async (phone: string, otp: string): Promise<User> => {
//     const json = await apiService.postQuery<LoginResponse & { email: string }>(
//       API_ENDPOINTS.PHONE_VERIFY_OTP,
//       { phone, otp }
//     );
//     authService.storeToken(json.token);
//     return mapLoginResponseToUser(json);
//   },

//   hasActiveSession: (): boolean => {
//     return authService.getStoredUser() !== null;
//   },
// };

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

// =========================================================
// STORAGE KEYS
// =========================================================

const SESSION_STORAGE_KEY = 'hexaorder.session';

const TOKEN_KEY = 'auth_token';

const REFRESH_TOKEN_KEY = 'refresh_token';

// 30 days
const SESSION_TTL_MS =
  1000 * 60 * 60 * 24 * 30;

// =========================================================
// TYPES
// =========================================================

interface Session {
  user: User;
  expiresAt: string;
}

// =========================================================
// ROLE MAPPER
// =========================================================

export function mapRole(
  rawRole: string
): 'ADMIN' | 'USER' {

  const adminRoles = [
    'ADMIN',
    'ADMIN_TYPE1',
    'ADMIN_TYPE2'
  ];

  return adminRoles.includes(rawRole)
    ? 'ADMIN'
    : 'USER';
}

// =========================================================
// LOGIN RESPONSE → USER
// =========================================================

export function mapLoginResponseToUser(
  json: LoginResponse
): User {

  const fullName =
    json.firstName && json.lastName
      ? `${json.firstName} ${json.lastName}`.trim()
      : json.firstName
      || json.username;

  return {

    id:
      json.userId
        ? String(json.userId)
        : json.username,

    name: fullName,

    email: json.username,

    role: mapRole(json.role),

    rawRole:
      json.role as RawRole,

    userType:
      json.userType as UserType,

    avatarUrl:
      json.profilePicture || '',

    avatar:
      json.profilePicture || '',

    token:
      json.token,

    phoneNumber:
      json.phoneNumber,

    profilePicture:
      json.profilePicture,

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),
  };
}

// =========================================================
// SESSION PARSER
// =========================================================

const parseSession = (
  rawValue: string | null
): User | null => {

  if (!rawValue) {
    return null;
  }

  try {

    const session: Session =
      JSON.parse(rawValue);

    if (
      !session.user ||
      !session.expiresAt
    ) {

      authService.clearSession();

      return null;
    }

    const expiresAt =
      Date.parse(session.expiresAt);

    if (
      !Number.isFinite(expiresAt)
      || expiresAt <= Date.now()
    ) {

      authService.clearSession();

      return null;
    }

    return session.user;

  } catch {

    authService.clearSession();

    return null;
  }
};

// =========================================================
// AUTH SERVICE
// =========================================================

export const authService = {

  // =========================================================
  // GET STORED USER
  // =========================================================

  getStoredUser: (): User | null => {

    if (typeof window === 'undefined') {
      return null;
    }

    return parseSession(
      localStorage.getItem(
        SESSION_STORAGE_KEY
      )
    );
  },

  // =========================================================
  // STORE USER SESSION
  // =========================================================

  storeUser: (
    user: User
  ): void => {

    if (typeof window === 'undefined') {
      return;
    }

    const session: Session = {

      user,

      expiresAt:
        new Date(
          Date.now() + SESSION_TTL_MS
        ).toISOString(),
    };

    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(session)
    );

    if (user.token) {

      localStorage.setItem(
        TOKEN_KEY,
        user.token
      );
    }
  },

  // =========================================================
  // STORE ACCESS TOKEN
  // =========================================================

  storeToken: (
    token: string
  ): void => {

    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(
      TOKEN_KEY,
      token
    );
  },

  // =========================================================
  // STORE REFRESH TOKEN
  // =========================================================

  storeRefreshToken: (
    refreshToken: string
  ): void => {

    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      refreshToken
    );
  },

  // =========================================================
  // GET ACCESS TOKEN
  // =========================================================

  getToken: (): string | null => {

    if (typeof window === 'undefined') {
      return null;
    }

    return localStorage.getItem(
      TOKEN_KEY
    );
  },

  // =========================================================
  // GET REFRESH TOKEN
  // =========================================================

  getRefreshToken: (): string | null => {

    if (typeof window === 'undefined') {
      return null;
    }

    return localStorage.getItem(
      REFRESH_TOKEN_KEY
    );
  },

  // =========================================================
  // CLEAR SESSION
  // =========================================================

  clearSession: (): void => {

    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem(
      SESSION_STORAGE_KEY
    );

    localStorage.removeItem(
      TOKEN_KEY
    );

    localStorage.removeItem(
      REFRESH_TOKEN_KEY
    );
  },

  // =========================================================
  // LOGOUT
  // =========================================================

  logout: (): void => {

    authService.clearSession();

    // OPTIONAL:
    // clear redux / query cache here
  },

  // =========================================================
  // LOGIN
  // POST /api/auth/login
  // =========================================================

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

    // =========================================================
    // STORE TOKEN
    // =========================================================

    authService.storeToken(
      json.token
    );

    // OPTIONAL REFRESH TOKEN
    if ((json as any).refreshToken) {

      authService.storeRefreshToken(
        (json as any).refreshToken
      );
    }

    const user =
      mapLoginResponseToUser(json);

    authService.storeUser(user);

    return user;
  },

  // =========================================================
  // FETCH CURRENT USER
  // =========================================================

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
      };

    } catch (error) {

      console.error(
        'fetchMe failed',
        error
      );

      return {};
    }
  },

  // =========================================================
  // SIGNUP
  // =========================================================

  signup: async (
    data: SignUpRequest
  ): Promise<SignUpResponse> => {

    return apiService.post<SignUpResponse>(
      API_ENDPOINTS.SIGNUP,
      data
    );
  },

  // =========================================================
  // SEND PHONE OTP
  // =========================================================

  sendPhoneOtp: async (
    phone: string
  ): Promise<{ message: string }> => {

    return apiService.postQuery(
      API_ENDPOINTS.PHONE_SEND_OTP,
      { phone }
    );
  },

  // =========================================================
  // VERIFY PHONE OTP
  // =========================================================

  verifyPhoneOtp: async (
    phone: string,
    otp: string
  ): Promise<User> => {

    const json =
      await apiService.postQuery<
        LoginResponse & {
          email: string
        }
      >(
        API_ENDPOINTS.PHONE_VERIFY_OTP,
        {
          phone,
          otp
        }
      );

    authService.storeToken(
      json.token
    );

    const user =
      mapLoginResponseToUser(json);

    authService.storeUser(user);

    return user;
  },

  // =========================================================
  // ACTIVE SESSION
  // =========================================================

  hasActiveSession: (): boolean => {

    return (
      authService.getStoredUser()
      !== null
    );
  },
};