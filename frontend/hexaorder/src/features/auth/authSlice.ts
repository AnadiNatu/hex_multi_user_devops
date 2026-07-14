// src/features/auth/authSlice.ts
// FIX: loginUser thunk merges /me data on top of login data correctly,
// preserving rawRole. loginSuccess also handles OAuth2 callback correctly.

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, SignUpRequest } from '../../types';
import { authService } from './authService';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: authService.getStoredUser(),
  status: 'idle',
  error: null,
};

// ── Email login ──────────────────────────────────────────────────────────────
export const loginUser = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    // 1. Login → user with token + rawRole from response
    const user = await authService.login(credentials.email, credentials.password);

    // 2. Enrich with /me data (profilePicture, phoneNumber etc.) but keep rawRole from login
    const meData = await authService.fetchMe();

    // rawRole from login response is authoritative; don't let /me overwrite it
    // unless /me also returns a role (it does in our fixed backend).
    const merged: User = {
      ...user,
      ...meData,
      // Ensure critical identity fields from login are kept
      token:    user.token,
      rawRole:  meData.rawRole || user.rawRole,
      role:     meData.role    || user.role,
      userType: meData.userType || user.userType,
    };

    authService.storeUser(merged);
    return merged;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to log in';
    return rejectWithValue(message);
  }
});

// ── Phone OTP login ──────────────────────────────────────────────────────────
export const phoneLogin = createAsyncThunk<
  User,
  { phone: string; otp: string },
  { rejectValue: string }
>('auth/phoneLogin', async ({ phone, otp }, { rejectWithValue }) => {
  try {
    return await authService.verifyPhoneOtp(phone, otp);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'OTP verification failed'
    );
  }
});

// ── Signup ────────────────────────────────────────────────────────────────────
export const signupUser = createAsyncThunk<
  void,
  SignUpRequest,
  { rejectValue: string }
>('auth/signupUser', async (payload, { rejectWithValue }) => {
  try {
    await authService.signup(payload);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Signup failed'
    );
  }
});

// ── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser(state) {
      authService.logout();
      state.user   = null;
      state.status = 'idle';
      state.error  = null;
    },

    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        authService.storeUser(state.user);
      }
    },

    // Used by OAuth2 callback to inject the user directly into the store
    loginSuccess(state, action: PayloadAction<User>) {
      state.status = 'idle';
      state.user   = action.payload;
      state.error  = null;
      authService.storeUser(action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      // Email login
      .addCase(loginUser.pending,  (state) => { state.status = 'loading'; state.error = null; })
      .addCase(loginUser.fulfilled,(state, action) => {
        state.status = 'idle';
        state.user   = action.payload;
        state.error  = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = action.payload ?? 'Unable to log in';
      })

      // Phone login
      .addCase(phoneLogin.pending,  (state) => { state.status = 'loading'; state.error = null; })
      .addCase(phoneLogin.fulfilled,(state, action) => {
        state.status = 'idle';
        state.user   = action.payload;
        state.error  = null;
      })
      .addCase(phoneLogin.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = action.payload ?? 'OTP login failed';
      })

      // Signup
      .addCase(signupUser.pending,   (state) => { state.status = 'loading'; state.error = null; })
      .addCase(signupUser.fulfilled, (state) => { state.status = 'idle'; state.error = null; })
      .addCase(signupUser.rejected,  (state, action) => {
        state.status = 'failed';
        state.error  = action.payload ?? 'Signup failed';
      });
  },
});

export const { logoutUser, updateUser, loginSuccess } = authSlice.actions;
export default authSlice.reducer;