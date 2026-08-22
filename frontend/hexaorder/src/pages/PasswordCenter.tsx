import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

import { Breadcrumb } from '../components/ui/Breadcrumb';
import AdminPageHeader from '../components/ui/AdminPageHeader';
import AdminStatistics from '../components/ui/AdminStatistics';
import AdminSection from '../components/ui/AdminSection';
import AdminCard from '../components/ui/AdminCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

import { passwordService } from '../services/passwordService';

type PasswordMode = 'forgot' | 'reset' | 'change';

export default function PasswordCenter() {
  const [mode, setMode] = useState<PasswordMode>('reset');

  const [userEmail, setUserEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [recoveryMethod, setRecoveryMethod] = useState<'EMAIL' | 'SMS'>(
    'EMAIL'
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const passwordRequirements = useMemo(
    () => ({
      minLength: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*]/.test(newPassword),
    }),
    [newPassword]
  );

  const requirementCount = Object.values(passwordRequirements).filter(
    Boolean
  ).length;

  const passwordStrength = useMemo(() => {
    if (!newPassword) {
      return {
        score: 0,
        label: 'Weak',
      };
    }

    if (requirementCount === 5) {
      return {
        score: 4,
        label: 'Strong',
      };
    }

    if (requirementCount >= 4) {
      return {
        score: 3,
        label: 'Good',
      };
    }

    if (requirementCount >= 2) {
      return {
        score: 2,
        label: 'Fair',
      };
    }

    return {
      score: 1,
      label: 'Weak',
    };
  }, [newPassword, requirementCount]);

  const passwordsMatch =
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const clearMessages = () => {
    setMessage('');
    setError('');
  };

  const handleModeChange = (nextMode: PasswordMode) => {
    setMode(nextMode);
    clearMessages();
  };

  const handleRefresh = () => {
    setUserEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRecoveryMethod('EMAIL');
    clearMessages();
  };

  const handleForgotPassword = async () => {
    clearMessages();

    if (!userEmail.trim()) {
      setError('Please enter the user email address.');
      return;
    }

    try {
      setLoading(true);

      await passwordService.forgotPassword({
        email: userEmail.trim(),
        method: recoveryMethod,
      });

      setMessage(
        `Password recovery OTP sent through ${
          recoveryMethod === 'EMAIL' ? 'email' : 'SMS'
        }.`
      );
    } catch (err: any) {
      setError(
        err?.message ||
          'Unable to send password recovery OTP.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    clearMessages();

    if (!userEmail.trim()) {
      setError('Please enter the user email address.');
      return;
    }

    if (!otp.trim()) {
      setError('Please enter the OTP.');
      return;
    }

    if (requirementCount !== 5) {
      setError(
        'Please satisfy all password requirements.'
      );
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      await passwordService.resetPassword({
        identifier: userEmail.trim(),
        otp: otp.trim(),
        newPassword,
      });

      setMessage('Password reset successfully.');

      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(
        err?.message ||
          'Unable to reset the password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    clearMessages();

    if (requirementCount !== 5) {
      setError(
        'Please satisfy all password requirements.'
      );
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setError(
      'Current password input is required for Change Password. Use the Change Password service with your current password.'
    );
  };

  return (
    <div className="space-y-8 page-enter bg-slate-50">

      <div className="[&>nav_*]:text-slate-500 [&>nav_span>span:last-child]:text-slate-900">
        <Breadcrumb
          items={[
            {
              label: 'Dashboard',
              href: '/dashboard',
            },
            {
              label: 'Administration',
            },
            {
              label: 'Password Center',
            },
          ]}
        />
      </div>

      <div
        className="
          [&_h1]:!text-slate-900
          [&_p]:!text-slate-500
          [&_div.bg-brand-green\/15]:!bg-brand-green\/10
        "
      >
        <AdminPageHeader
          title="Password Center"
          subtitle="Manage password recovery, reset and password updates securely."
          icon={KeyRound}
          actions={
            <Button
              variant="outline"
              type="button"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          }
        />
      </div>

      <div
        className="
          [&>div>div]:!bg-white
          [&>div>div]:!border-slate-200
          [&>div>div]:!shadow-sm
          [&>div>div>p:first-child]:!text-slate-500
        "
      >
        <AdminStatistics
          stats={[
            {
              title: 'Forgot Password',
              value: 'Ready',
              color: 'text-emerald-500',
            },
            {
              title: 'Reset Password',
              value: 'Ready',
              color: 'text-blue-500',
            },
            {
              title: 'Change Password',
              value: 'Ready',
              color: 'text-amber-500',
            },
            {
              title: 'Available Services',
              value: 3,
              color: 'text-brand-green',
            },
          ]}
        />
      </div>

      <div
        className="
          [&_h2]:!text-slate-900
          [&_p]:!text-slate-500
        "
      >
        <AdminSection
          title="Password Management"
          subtitle="Recover, reset or change passwords using the available security services."
        >

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            <AdminCard
              className={`
                !bg-white !border-slate-200 !shadow-sm
                cursor-pointer transition-all duration-200
                hover:-translate-y-1 hover:shadow-md
                ${
                  mode === 'forgot'
                    ? '!border-brand-green !ring-2 !ring-brand-green/10'
                    : ''
                }
              `}
            >
              <button
                type="button"
                onClick={() => handleModeChange('forgot')}
                className="w-full text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-green/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-brand-green" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Forgot Password
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      Send a recovery OTP using Email or SMS.
                    </p>
                  </div>
                </div>
              </button>
            </AdminCard>

            <AdminCard
              className={`
                !bg-white !border-slate-200 !shadow-sm
                cursor-pointer transition-all duration-200
                hover:-translate-y-1 hover:shadow-md
                ${
                  mode === 'reset'
                    ? '!border-brand-green !ring-2 !ring-brand-green/10'
                    : ''
                }
              `}
            >
              <button
                type="button"
                onClick={() => handleModeChange('reset')}
                className="w-full text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-blue-500" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Reset Password
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      Verify OTP and create a new password.
                    </p>
                  </div>
                </div>
              </button>
            </AdminCard>

            <AdminCard
              className={`
                !bg-white !border-slate-200 !shadow-sm
                cursor-pointer transition-all duration-200
                hover:-translate-y-1 hover:shadow-md
                ${
                  mode === 'change'
                    ? '!border-brand-green !ring-2 !ring-brand-green/10'
                    : ''
                }
              `}
            >
              <button
                type="button"
                onClick={() => handleModeChange('change')}
                className="w-full text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Change Password
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      Update your password securely.
                    </p>
                  </div>
                </div>
              </button>
            </AdminCard>

          </div>

        </AdminSection>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <AdminCard className="!bg-white !border-slate-200 !shadow-sm">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {mode === 'forgot'
                  ? 'Password Recovery'
                  : mode === 'reset'
                  ? 'Reset Password'
                  : 'Change Password'}
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                {mode === 'forgot'
                  ? 'Send a one-time recovery code to the user.'
                  : mode === 'reset'
                  ? 'Verify the recovery OTP and create a new password.'
                  : 'Update the currently authenticated user password.'}
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center">
              {mode === 'forgot' ? (
                <Mail className="w-5 h-5 text-brand-green" />
              ) : mode === 'reset' ? (
                <Lock className="w-5 h-5 text-brand-green" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-brand-green" />
              )}
            </div>

          </div>

          <div className="space-y-5">

            <Input
              label="User Email"
              type="email"
              value={userEmail}
              onChange={(event) => {
                setUserEmail(event.target.value);
                clearMessages();
              }}
              placeholder="user@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            {mode === 'forgot' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Recovery Method
                </label>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() => setRecoveryMethod('EMAIL')}
                    className={`
                      flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition
                      ${
                        recoveryMethod === 'EMAIL'
                          ? 'border-brand-green bg-brand-green/5 text-brand-green'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }
                    `}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecoveryMethod('SMS')}
                    className={`
                      flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition
                      ${
                        recoveryMethod === 'SMS'
                          ? 'border-brand-green bg-brand-green/5 text-brand-green'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }
                    `}
                  >
                    <Smartphone className="w-4 h-4" />
                    SMS
                  </button>

                </div>
              </div>
            )}

            {mode === 'reset' && (
              <Input
                label="OTP Code"
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value);
                  clearMessages();
                }}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              />
            )}

            {mode !== 'forgot' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>

                  <div className="relative">

                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(event) => {
                        setNewPassword(event.target.value);
                        clearMessages();
                      }}
                      placeholder="Enter new password"
                      className="pr-11"
                      leftIcon={<Lock className="w-4 h-4" />}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>

                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>

                  <div className="relative">

                    <Input
                      type={
                        showConfirmPassword
                          ? 'text'
                          : 'password'
                      }
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        clearMessages();
                      }}
                      placeholder="Confirm new password"
                      className="pr-11"
                      leftIcon={<Lock className="w-4 h-4" />}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>

                  </div>

                  {confirmPassword && (
                    <p
                      className={`mt-1.5 text-xs font-medium ${
                        passwordsMatch
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {passwordsMatch
                        ? 'Passwords match.'
                        : 'Passwords do not match.'}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <div className="flex items-center justify-between mb-3">

                    <span className="text-sm font-semibold text-slate-700">
                      Password Strength
                    </span>

                    <span
                      className={`text-sm font-bold ${
                        passwordStrength.score === 4
                          ? 'text-emerald-600'
                          : passwordStrength.score === 3
                          ? 'text-blue-600'
                          : passwordStrength.score === 2
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {passwordStrength.label} (
                      {passwordStrength.score}/4)
                    </span>

                  </div>

                  <div className="flex gap-1.5">

                    {[1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className={`
                          h-2 flex-1 rounded-full
                          ${
                            index <= passwordStrength.score
                              ? passwordStrength.score === 4
                                ? 'bg-emerald-500'
                                : passwordStrength.score === 3
                                ? 'bg-blue-500'
                                : passwordStrength.score === 2
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                              : 'bg-slate-200'
                          }
                        `}
                      />
                    ))}

                  </div>

                </div>
              </>
            )}

            {message && (
              <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-sm text-emerald-700">
                  {message}
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}

            <Button
              type="button"
              fullWidth
              isLoading={loading}
              onClick={
                mode === 'forgot'
                  ? handleForgotPassword
                  : mode === 'reset'
                  ? handleResetPassword
                  : handleChangePassword
              }
              leftIcon={
                mode === 'forgot' ? (
                  <Mail className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )
              }
            >
              {mode === 'forgot'
                ? 'Send Recovery OTP'
                : mode === 'reset'
                ? 'Reset Password'
                : 'Change Password'}
            </Button>

          </div>

        </AdminCard>

        <div className="space-y-6">

          <AdminCard className="!bg-white !border-slate-200 !shadow-sm">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-brand-green" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Password Requirements
                </h3>

                <p className="text-xs text-slate-500">
                  Create a strong and secure password.
                </p>
              </div>

            </div>

            <div className="space-y-3">

              {[
                [
                  passwordRequirements.minLength,
                  'Minimum 8 characters',
                ],
                [
                  passwordRequirements.uppercase,
                  'At least one uppercase letter',
                ],
                [
                  passwordRequirements.lowercase,
                  'At least one lowercase letter',
                ],
                [
                  passwordRequirements.number,
                  'At least one number',
                ],
                [
                  passwordRequirements.special,
                  'At least one special character (!@#$%^&*)',
                ],
              ].map(([valid, text]) => (
                <div
                  key={text as string}
                  className="flex items-center gap-2"
                >
                  {valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300" />
                  )}

                  <span
                    className={`text-sm ${
                      valid
                        ? 'text-emerald-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {text as string}
                  </span>
                </div>
              ))}

            </div>

          </AdminCard>

          <AdminCard className="!bg-white !border-slate-200 !shadow-sm">

            <h3 className="text-lg font-bold text-slate-900">
              Password Best Practices
            </h3>

            <div className="space-y-4 mt-5">

              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Use unique passwords
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Avoid reusing passwords across accounts.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Lock className="w-5 h-5 text-blue-500 shrink-0" />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Keep credentials private
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Never share passwords through insecure channels.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Verify the account
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Confirm the intended user before performing
                    password recovery or reset operations.
                  </p>
                </div>
              </div>

            </div>

          </AdminCard>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">

            <div className="flex gap-3">

              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />

              <div>

                <h3 className="text-sm font-bold text-amber-800">
                  Security Warning
                </h3>

                <p className="text-xs text-amber-700 mt-1.5 leading-relaxed">
                  Password resets should only be performed for
                  authorized users. Never expose OTP codes or
                  passwords in logs or shared communication.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      <AdminSection
        title="Recent Password Changes"
        subtitle="Password administration activity and audit history."
      >
        <AdminCard className="!bg-white !border-slate-200 !shadow-sm">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Audit history
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Password change history can be displayed here when
                the audit-log endpoint is connected.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500">
              Audit Log
            </span>

          </div>

        </AdminCard>
      </AdminSection>

    </div>
  );
}
