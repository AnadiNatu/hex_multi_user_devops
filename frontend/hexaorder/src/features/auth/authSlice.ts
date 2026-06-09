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

// ── EMAIL LOGIN
export const loginUser = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const user = await authService.login(credentials.email, credentials.password);
    // Enrich with /me profile data
    const meData = await authService.fetchMe();
    return { ...user, ...meData };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to log in';
    return rejectWithValue(message);
  }
});

// ── PHONE LOGIN
export const phoneLogin = createAsyncThunk<
  User,
  { phone: string; otp: string },
  { rejectValue: string }
>('auth/phoneLogin', async ({ phone, otp }, { rejectWithValue }) => {
  try {
    return await authService.verifyPhoneOtp(phone, otp);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'OTP verification failed';
    return rejectWithValue(message);
  }
});

// ── SIGNUP
export const signupUser = createAsyncThunk<
  void,
  SignUpRequest,
  { rejectValue: string }
>('auth/signupUser', async (payload, { rejectWithValue }) => {
  try {
    await authService.signup(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Signup failed';
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser(state) {
      authService.clearSession();
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },

    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        authService.storeUser(state.user);
      }
    },

    // Used by OAuth2 callback to inject user directly
    loginSuccess(state, action: PayloadAction<User>) {
      state.status = 'idle';
      state.user = action.payload;
      state.error = null;
      authService.storeUser(action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      // EMAIL LOGIN
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'idle';
        state.user = action.payload;
        state.error = null;
        authService.storeUser(action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to log in';
      })

      // PHONE LOGIN
      .addCase(phoneLogin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(phoneLogin.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'idle';
        state.user = action.payload;
        state.error = null;
        authService.storeUser(action.payload);
      })
      .addCase(phoneLogin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'OTP login failed';
      })

      // SIGNUP
      .addCase(signupUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.status = 'idle';
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Signup failed';
      });
  },
});

export const { logoutUser, updateUser, loginSuccess } = authSlice.actions;
export default authSlice.reducer;