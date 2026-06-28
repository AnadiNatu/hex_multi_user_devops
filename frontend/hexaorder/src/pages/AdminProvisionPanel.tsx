import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../app/hooks';
import { Navigate } from 'react-router-dom';
import { Widget } from '../components/ui/Widget';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import {
  provisionService,
  PendingUser,
  ProvisionUserRequest,
} from '../services/provisionService';
import {
  UserPlus,
  ShieldCheck,
  KeyRound,
  CheckCircle,
  Clock,
  Mail,
  RefreshCw,
} from 'lucide-react';

// ── Role options ADMIN can create ─────────────────────────────────────────
const ADMIN_ROLE_OPTIONS = [
  { value: 'ADMIN_TYPE1', label: 'Admin Type 1 (Inventory Manager)' },
  { value: 'ADMIN_TYPE2', label: 'Admin Type 2 (Pricing Manager)' },
];

const EMPTY_FORM: ProvisionUserRequest = {
  fname: '', lname: '', email: '', password: '', phoneNumber: '', role: 'ADMIN_TYPE1',
};

// ── Component ─────────────────────────────────────────────────────────────

export default function AdminProvisionPanel() {
  const user = useAppSelector((s) => s.auth.user);

  // Guard: only ADMIN
  if (!user || user.rawRole !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  // ── Create-user form state
  const [form, setForm]           = useState<ProvisionUserRequest>(EMPTY_FORM);
  const [creating, setCreating]   = useState(false);
  const [createMsg, setCreateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Pending users state
  const [pending, setPending]     = useState<PendingUser[]>([]);
  const [loading, setLoading]     = useState(false);
  const [fetchErr, setFetchErr]   = useState('');

  // ── Per-row action loading (approve / reset)
  const [rowLoading, setRowLoading] = useState<Record<number, string>>({});   // id → 'approve' | 'reset'
  const [rowMsg, setRowMsg]         = useState<Record<number, { type: 'success' | 'error'; text: string }>>({});

  // ── Fetch pending TYPE1 users
  const loadPending = useCallback(async () => {
    setLoading(true);
    setFetchErr('');
    try {
      const data = await provisionService.getPendingType1();
      setPending(data);
    } catch (e: any) {
      setFetchErr(e.message || 'Failed to load pending users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPending(); }, [loadPending]);

  // ── Create admin user
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateMsg(null);
    try {
      const res = await provisionService.createAdminUser(form);
      setCreateMsg({ type: 'success', text: res.message || 'Admin user created successfully.' });
      setForm(EMPTY_FORM);
      loadPending();        // refresh list — new user may appear if not pre-approved
    } catch (e: any) {
      setCreateMsg({ type: 'error', text: e.message || 'Failed to create user.' });
    } finally {
      setCreating(false);
    }
  };

  // ── Approve TYPE1
  const handleApprove = async (id: number) => {
    setRowLoading((p) => ({ ...p, [id]: 'approve' }));
    setRowMsg((p) => { const n = { ...p }; delete n[id]; return n; });
    try {
      const res = await provisionService.approveType1(id);
      setRowMsg((p) => ({ ...p, [id]: { type: 'success', text: res.message } }));
      setPending((p) => p.filter((u) => u.id !== id));
    } catch (e: any) {
      setRowMsg((p) => ({ ...p, [id]: { type: 'error', text: e.message || 'Approval failed.' } }));
    } finally {
      setRowLoading((p) => { const n = { ...p }; delete n[id]; return n; });
    }
  };

  // ── Trigger password reset
  const handleReset = async (id: number) => {
    setRowLoading((p) => ({ ...p, [id]: 'reset' }));
    setRowMsg((p) => { const n = { ...p }; delete n[id]; return n; });
    try {
      const res = await provisionService.resetPasswordType1(id);
      setRowMsg((p) => ({ ...p, [id]: { type: 'success', text: res.message } }));
    } catch (e: any) {
      setRowMsg((p) => ({ ...p, [id]: { type: 'error', text: e.message || 'Reset failed.' } }));
    } finally {
      setRowLoading((p) => { const n = { ...p }; delete n[id]; return n; });
    }
  };

  // ── Table columns for pending TYPE1 users
  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (u: PendingUser) => (
        <span className="font-semibold text-slate-900">{u.name}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (u: PendingUser) => (
        <span className="text-slate-600 font-mono text-xs">{u.email}</span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u: PendingUser) => (
        <Badge variant="primary">{u.role}</Badge>
      ),
    },
    {
      key: 'emailVerified',
      header: 'Email Status',
      render: (u: PendingUser) =>
        u.emailVerified
          ? <Badge variant="success" leftIcon={<CheckCircle className="w-3 h-3" />}>Verified</Badge>
          : <Badge variant="warning" leftIcon={<Clock className="w-3 h-3" />}>Pending</Badge>,
    },
    {
      key: 'createdByAdmin',
      header: 'Source',
      render: (u: PendingUser) => (
        <span className="text-xs text-slate-500">{u.createdByAdmin}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u: PendingUser) => (
        <div className="flex flex-col gap-1.5">
          {rowMsg[u.id] && (
            <p className={`text-xs font-medium ${rowMsg[u.id].type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
              {rowMsg[u.id].text}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
              isLoading={rowLoading[u.id] === 'approve'}
              disabled={!!rowLoading[u.id]}
              onClick={() => handleApprove(u.id)}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<KeyRound className="w-3.5 h-3.5" />}
              isLoading={rowLoading[u.id] === 'reset'}
              disabled={!!rowLoading[u.id]}
              onClick={() => handleReset(u.id)}
            >
              Reset Password
            </Button>
          </div>
        </div>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 page-enter">
      <Breadcrumb items={[{ label: 'Admin Panel' }, { label: 'Provision Admin Users' }]} />

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin User Provisioning</h1>
        <p className="text-sm text-slate-500 mt-1">
          Create new admin-tier accounts and manage pending approvals.
        </p>
      </div>

      {/* ── Create Form ── */}
      <Widget title="Create Admin User" subtitle="Invited users receive a verification OTP email and are pre-approved.">
        <form onSubmit={handleCreate} className="space-y-5">
          {createMsg && (
            <Alert variant={createMsg.type} dismissible onDismiss={() => setCreateMsg(null)}>
              {createMsg.text}
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={form.fname}
              onChange={(e) => setForm({ ...form, fname: e.target.value })}
              placeholder="Jane"
              required
            />
            <Input
              label="Last Name"
              value={form.lname}
              onChange={(e) => setForm({ ...form, lname: e.target.value })}
              placeholder="Doe"
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              leftIcon={<Mail className="w-4 h-4" />}
              placeholder="admin@company.com"
              required
            />
            <Input
              label="Temporary Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min 8 characters"
              required
            />
            <Input
              label="Phone (optional)"
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="+91 9876543210"
            />
            {/* Role select */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Role <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 transition-all outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green hover:border-slate-300"
              >
                {ADMIN_ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              leftIcon={<UserPlus className="w-4 h-4" />}
              isLoading={creating}
            >
              Create & Invite
            </Button>
          </div>
        </form>
      </Widget>

      {/* ── Pending Approvals ── */}
      <Widget
        title="Pending Admin Approvals"
        subtitle="TYPE1 accounts awaiting your approval."
        footer={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={loadPending}
            isLoading={loading}
          >
            Refresh
          </Button>
        }
      >
        {fetchErr && (
          <Alert variant="error" className="mb-4">{fetchErr}</Alert>
        )}

        <Table<PendingUser>
          data={pending}
          columns={columns}
          keyExtractor={(u) => String(u.id)}
          emptyMessage="No pending approvals — all TYPE1 accounts are approved."
          hoverable
        />
      </Widget>
    </div>
  );
}