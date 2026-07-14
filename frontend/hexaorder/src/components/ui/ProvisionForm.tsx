// src/components/ui/ProvisionForm.tsx
// FIX: Label text-slate-300, input text readable on dark bg,
// error/success messages use correct text colors.

import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

interface RoleOption { value: string; label: string; }

interface ProvisionUserRequest {
  fname: string; lname: string; email: string;
  password: string; phoneNumber?: string; role: string;
}

interface Props {
  form:         ProvisionUserRequest;
  setForm:      (f: ProvisionUserRequest) => void;
  creating:     boolean;
  createMsg:    { type: 'success' | 'error'; text: string } | null;
  clearMessage: () => void;
  roleOptions:  RoleOption[];
  onSubmit:     (e: React.FormEvent) => void;
  submitLabel?: string;
}

export default function ProvisionForm({
  form, setForm, creating, createMsg, clearMessage,
  roleOptions, onSubmit, submitLabel = 'Create',
}: Props) {
  const update = (key: keyof ProvisionUserRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value });

  return (
    <form onSubmit={onSubmit} className="space-y-5">

      {/* Alert */}
      {createMsg && (
        <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
          createMsg.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border border-red-500/30 text-red-300'
        }`}>
          {createMsg.type === 'success'
            ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          <span className="flex-1">{createMsg.text}</span>
          <button type="button" onClick={clearMessage} className="ml-2 opacity-60 hover:opacity-100 text-xs">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="First Name" value={form.fname} onChange={update('fname')}
               placeholder="John" required />
        <Input label="Last Name"  value={form.lname} onChange={update('lname')}
               placeholder="Doe"  required />
      </div>

      <Input label="Email Address" type="email" value={form.email} onChange={update('email')}
             placeholder="user@example.com" required />

      <Input label="Password" type="password" value={form.password} onChange={update('password')}
             placeholder="Min 8 characters" required />

      <Input label="Phone Number (optional)" value={form.phoneNumber || ''}
             onChange={update('phoneNumber')} placeholder="+91XXXXXXXXXX" />

      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Role</label>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-colors"
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <Button type="submit" className="w-full" isLoading={creating}
              leftIcon={<UserPlus className="w-4 h-4" />}>
        {submitLabel}
      </Button>
    </form>
  );
}