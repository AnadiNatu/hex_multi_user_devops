import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { OtpVerificationInput } from '../components/ui/OtpVerificationInput';
import { Package, Smartphone, ArrowLeft, KeyRound } from 'lucide-react';
import { authService } from '@/features/auth/authService';
import { phoneLogin } from '@/features/auth/authSlice';

type Step = 'phone' | 'otp';

export default function PhoneLogin() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const status = useAppSelector((state) => state.auth.status);
  const error  = useAppSelector((state) => state.auth.error);

  const [step,        setStep]        = useState<Step>('phone');
  const [phone,       setPhone]       = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError,   setSendError]   = useState('');
  const [otpError,    setOtpError]    = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError('');
    setSendLoading(true);
    try {
      await authService.sendPhoneOtp(phone);
      setStep('otp');
    } catch (err: any) {
      setSendError(err.message || 'Failed to send OTP');
    } finally {
      setSendLoading(false);
    }
  };

  const handleOtpComplete = async (otp: string) => {
    setOtpError('');
    const result = await dispatch(phoneLogin({ phone, otp }));
    if (phoneLogin.fulfilled.match(result)) {
      navigate('/dashboard');
    } else {
      setOtpError((result.payload as string) || 'Invalid OTP');
    }
  };

  const bgStyle = { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4" style={bgStyle}>
      <div className="absolute inset-0 auth-glow-green pointer-events-none" />
      <div className="absolute inset-0 auth-grid-lines pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-green rounded-2xl shadow-2xl shadow-brand-green/30 mb-4">
            <Package className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {step === 'phone' ? 'Phone Sign In' : 'Enter OTP'}
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {step === 'phone'
              ? 'Enter your number to receive a code'
              : `Code sent to ${phone}`}
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl p-8">
          {(error || sendError) && (
            <Alert variant="error" className="mb-4">{sendError || error}</Alert>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Smartphone className="w-4 h-4" />}
                placeholder="+91 9876543210"
                required
              />
              <Button type="submit" fullWidth size="lg" isLoading={sendLoading}>
                Send OTP
              </Button>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-brand-green transition-colors font-semibold mt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-green/10 rounded-2xl mb-3">
                  <KeyRound className="w-6 h-6 text-brand-green" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Enter 6-digit code
                </p>
              </div>

              <OtpVerificationInput
                onComplete={handleOtpComplete}
                disabled={status === 'loading'}
                error={otpError}
              />

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={(e) => { e.preventDefault(); handleSendOtp(e as any); }}
                  className="text-sm font-semibold text-brand-green hover:text-emerald-600 transition-colors text-center"
                >
                  Resend OTP
                </button>
                <button
                  onClick={() => { setStep('phone'); setOtpError(''); }}
                  className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors text-center flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Change number
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}