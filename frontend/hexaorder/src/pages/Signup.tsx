import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Alert } from '../components/ui/Alert';
import { Package, User, Mail, Lock, Phone, CheckCircle } from 'lucide-react';
import { SignUpRequest, UserType } from '../types';
import { signupUser } from '@/features/auth/authSlice';

const TYPE1_ROLES = [
  { value: 'ADMIN',       label: 'Admin (Full Access)' },
  { value: 'ADMIN_TYPE1', label: 'Admin Type 1 (Inventory)' },
  { value: 'ADMIN_TYPE2', label: 'Admin Type 2 (Pricing)' },
];

const TYPE2_ROLES = [
  { value: 'USER',        label: 'User (Basic)' },
  { value: 'USER_TYPE1',  label: 'User Type 1 (Category Browser)' },
  { value: 'USER_TYPE2',  label: 'User Type 2 (Price Comparison)' },
];

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const status   = useAppSelector((state) => state.auth.status);
  const error    = useAppSelector((state) => state.auth.error);

  const [success,   setSuccess]   = useState(false);
  const [userType,  setUserType]  = useState<UserType>('TYPE2');
  const [form,      setForm]      = useState({ fname: '', lname: '', email: '', password: '', confirmPassword: '', phoneNumber: '', role: 'USER' });
  const [formError, setFormError] = useState('');

  const roleOptions = userType === 'TYPE1' ? TYPE1_ROLES : TYPE2_ROLES;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    setForm((prev) => ({ ...prev, role: type === 'TYPE1' ? 'ADMIN' : 'USER' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setFormError('Passwords do not match'); return; }
    if (form.password.length < 8) { setFormError('Password must be at least 8 characters'); return; }
    const payload: SignUpRequest = { fname: form.fname, lname: form.lname, email: form.email, password: form.password, phoneNumber: form.phoneNumber || undefined, userType, role: form.role };
    const result = await dispatch(signupUser(payload));
    if (signupUser.fulfilled.match(result)) { setSuccess(true); setTimeout(() => navigate('/login'), 2000); }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-sm mx-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Account Created!</h2>
          <p className="text-slate-500 text-sm">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <div className="absolute inset-0 auth-glow-green pointer-events-none" />
      <div className="absolute inset-0 auth-grid-lines pointer-events-none" />

      <div className="w-full max-w-lg px-4 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-green rounded-2xl shadow-2xl shadow-brand-green/30 mb-4">
            <Package className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h1>
          <p className="text-slate-400 mt-1 text-sm">Join HexaOrder today</p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl p-8">
          {/* Type toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            {(['TYPE2', 'TYPE1'] as UserType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleUserTypeChange(type)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${userType === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {type === 'TYPE1' ? '🛡️ Admin Account' : '👤 User Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || formError) && <Alert variant="error">{error || formError}</Alert>}

            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" name="fname" value={form.fname} onChange={handleChange} leftIcon={<User className="w-4 h-4" />} placeholder="John" required />
              <Input label="Last Name"  name="lname" value={form.lname} onChange={handleChange} placeholder="Doe" required />
            </div>

            <Input label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} leftIcon={<Mail className="w-4 h-4" />} placeholder="name@company.com" required />
            <Input label="Phone (optional)" name="phoneNumber" type="tel" value={form.phoneNumber} onChange={handleChange} leftIcon={<Phone className="w-4 h-4" />} placeholder="+91 9876543210" />
            <Select label="Role" name="role" value={form.role} onChange={handleChange} options={roleOptions} required />
            <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} leftIcon={<Lock className="w-4 h-4" />} placeholder="Min 8 characters" required />
            <Input label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} leftIcon={<Lock className="w-4 h-4" />} placeholder="Repeat password" required />

            <Button type="submit" fullWidth size="lg" isLoading={status === 'loading'} className="mt-2">
              Create Account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-green hover:text-emerald-600 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}