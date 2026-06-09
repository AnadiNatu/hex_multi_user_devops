import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAppDispatch } from '../app/hooks';

import {
  authService,
  mapLoginResponseToUser,
} from '../features/auth/authService';

import { loginSuccess } from '../features/auth/authSlice';

import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';

import {
  Package,
  AlertTriangle,
} from 'lucide-react';

export default function OAuth2Callback() {

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [searchParams] = useSearchParams();

  const [error, setError] = useState('');

  useEffect(() => {

    // =========================================================
    // URL PARAMS
    // =========================================================

    const token =
      searchParams.get('token');

    const refreshToken =
      searchParams.get('refreshToken');

    const email =
      searchParams.get('email');

    // IMPORTANT FIX
    const username =
      searchParams.get('username');

    const role =
      searchParams.get('role');

    const userType =
      searchParams.get('userType');

    const provider =
      searchParams.get('provider');

    const urlError =
      searchParams.get('error');

    // =========================================================
    // ERROR HANDLING
    // =========================================================

    if (urlError) {

      authService.logout?.();

      setError(
        `OAuth2 login failed: ${urlError}`
      );

      return;
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    if (!token || !email) {

      authService.logout?.();

      setError(
        'Invalid OAuth2 callback — missing token or email.'
      );

      return;
    }

    try {

      // =========================================================
      // STORE TOKENS
      // =========================================================

      authService.storeToken(token);

      // OPTIONAL
      if (refreshToken) {

        localStorage.setItem(
          'refreshToken',
          refreshToken
        );
      }

      // =========================================================
      // BUILD USER
      // =========================================================

      const user =
        mapLoginResponseToUser({

          token,

          username: email,

          role: role || 'USER',

          userType: userType || 'TYPE2',

          message: 'OAuth2 login successful',

          // OPTIONAL FIELDS
          firstName: username || email,
          lastName: '',

          profilePicture: '',

        });

      // =========================================================
      // MERGED USER
      // =========================================================

      const mergedUser = {

        ...user,

        name:
          username || email,

        provider:
          provider || 'GOOGLE',
      };

      // =========================================================
      // SAVE USER
      // =========================================================

      authService.storeUser(
        mergedUser
      );

      dispatch(
        loginSuccess(mergedUser)
      );

      // =========================================================
      // CLEAN URL
      // =========================================================

      window.history.replaceState(
        {},
        document.title,
        '/dashboard'
      );

      // =========================================================
      // REDIRECT
      // =========================================================

      navigate(
        '/dashboard',
        { replace: true }
      );

    } catch (err) {

      console.error(
        'OAuth2 callback processing failed',
        err
      );

      authService.logout?.();

      setError(
        'Failed to complete OAuth2 login.'
      );
    }

  }, [searchParams, dispatch, navigate]);

  // =========================================================
  // STYLES
  // =========================================================

  const bgStyle = {
    background:
      'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
  };

  // =========================================================
  // ERROR SCREEN
  // =========================================================

  if (error) {

    return (

      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={bgStyle}
      >

        <div
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
          style={{
            animation: 'modalIn 0.3s ease'
          }}
        >

          <style>
            {`
              @keyframes modalIn {
                from {
                  opacity:0;
                  transform:translateY(-12px)
                }
                to {
                  opacity:1;
                  transform:translateY(0)
                }
              }
            `}
          </style>

          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-50 rounded-2xl mb-4">

            <AlertTriangle className="w-7 h-7 text-red-600" />

          </div>

          <h2 className="text-lg font-extrabold text-slate-900 mb-2 tracking-tight">

            OAuth2 Error

          </h2>

          <p className="text-sm text-slate-500 mb-5 leading-relaxed">

            {error}

          </p>

          <Button
            onClick={() => navigate('/login')}
            fullWidth
          >
            Back to Login
          </Button>

        </div>

      </div>
    );
  }

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  return (

    <div
      className="min-h-screen flex items-center justify-center"
      style={bgStyle}
    >

      <div className="text-center">

        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-green rounded-2xl shadow-2xl shadow-brand-green/30 mb-5">

          <Package className="text-white w-8 h-8" />

        </div>

        <LoadingSpinner
          size="md"
          text="Completing sign in..."
          className="text-white"
        />

      </div>

    </div>
  );
}