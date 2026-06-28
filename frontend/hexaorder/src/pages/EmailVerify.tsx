import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { OtpVerificationInput } from '../components/ui/OtpVerificationInput';
import { emailVerifyService } from '../services/provisionService';
import { Package, MailCheck, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';

type Stage = 'verify' | 'success';

const bgStyle = {
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
};

export default function EmailVerifyPage() {
  const navigate            = useNavigate();
  const [searchParams]      = useSearchParams();

  // email can come in via ?email= query param (set after signup redirect)
  const [email, setEmail]   = useState(searchParams.get('email') || '');
  const [stage, setStage]   = useState<Stage>('verify');

  const [verifying, setVerifying]   = useState(false);
  const [resending, setResending]   = useState(false);
  const [otpError,  setOtpError]    = useState('');
  const [resendMsg, setResendMsg]   = useState('');
  const [resendErr, setResendErr]   = useState('');
  const [cooldown,  setCooldown]    = useState(0);   // seconds until resend allowed

  // Cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleOtpComplete = async (otp: string) => {
    if (!email) { setOtpError('Please enter your email address first.'); return; }
    setVerifying(true);
    setOtpError('');
    try {
      const res = await emailVerifyService.verifyEmail(email, otp);
      if (res.verified) {
        setStage('success');
      } else {
        setOtpError(res.message || 'Invalid or expired OTP. Please try again.');
      }
    } catch (e: any) {
      setOtpError(e.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!email) { setResendErr('Enter your email address before resending.'); return; }
    if (cooldown > 0) return;
    setResending(true);
    setResendMsg('');
    setResendErr('');
    try {
      const res = await emailVerifyService.resendVerification(email);
      setResendMsg(res.message || 'A new OTP has been sent.');
      setCooldown(60);   // 60-second cooldown
    } catch (e: any) {
      setResendErr(e.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (stage === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={bgStyle}>
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-sm w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-5">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Email Verified!
          </h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Your email address has been confirmed. Your account is now pending admin approval — you'll be able to log in once approved.
          </p>
          <Button fullWidth onClick={() => navigate('/login')}>
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  // ── Verify screen ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4" style={bgStyle}>
      {/* Ambient effects matching the rest of the auth UI */}
      <div className="absolute inset-0 auth-glow-green pointer-events-none" />
      <div className="absolute inset-0 auth-grid-lines pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo + header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-green rounded-2xl shadow-2xl shadow-brand-green/30 mb-4">
            <Package className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Verify Your Email</h1>
          <p className="text-slate-400 mt-1 text-sm">
            {email
              ? `Enter the 6-digit code sent to ${email}`
              : 'Enter your email and the 6-digit code we sent you'}
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl p-8 space-y-6">

          {/* Icon */}
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-green/10 rounded-2xl">
              <MailCheck className="w-7 h-7 text-brand-green" />
            </div>
          </div>

          {/* Email input (editable only when not pre-filled) */}
          {!searchParams.get('email') && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setOtpError(''); }}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green hover:border-slate-300 transition-all"
              />
            </div>
          )}

          {/* Inline alerts */}
          {resendMsg && (
            <Alert variant="success" dismissible onDismiss={() => setResendMsg('')}>
              {resendMsg}
            </Alert>
          )}
          {resendErr && (
            <Alert variant="error" dismissible onDismiss={() => setResendErr('')}>
              {resendErr}
            </Alert>
          )}

          {/* OTP input */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center mb-4">
              Enter 6-digit code
            </p>
            <OtpVerificationInput
              onComplete={handleOtpComplete}
              disabled={verifying || !email}
              error={otpError}
            />
          </div>

          {/* Loading indicator */}
          {verifying && (
            <p className="text-xs text-center text-slate-400 animate-pulse">Verifying…</p>
          )}

          {/* Resend */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <p className="text-xs text-slate-500">Didn't receive a code?</p>
            <button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
            </button>
          </div>

          {/* Back link */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-600 font-semibold transition-colors mt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}