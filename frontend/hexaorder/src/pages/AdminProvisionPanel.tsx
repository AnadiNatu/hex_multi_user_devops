import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../app/hooks';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import AdminPageHeader from '../components/ui/AdminPageHeader';
import AdminSection from '../components/ui/AdminSection';
import AdminCard from '../components/ui/AdminCard';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import PendingUsersTable from '../components/ui/PendingUserTable';
import ProvisionForm from '../components/ui/ProvisionForm';
import AdminStatistics from '../components/ui/AdminStatistics';
import toast from 'react-hot-toast';
import { provisionService, PendingUser, ProvisionUserRequest } from '../services/provisionService';
import { ShieldCheck, KeyRound, RefreshCw, CheckCircle, Clock } from 'lucide-react';

const ADMIN_ROLE_OPTIONS = [
  { value: 'ADMIN_TYPE1', label: 'Admin Type 1 (Inventory Manager)' },
  { value: 'ADMIN_TYPE2', label: 'Admin Type 2 (Pricing Manager)' },
];

const EMPTY_FORM: ProvisionUserRequest = {
  fname: '', lname: '', email: '', password: '', phoneNumber: '', role: 'ADMIN_TYPE1',
};

export default function AdminProvisionPanel() {
  const user = useAppSelector((s) => s.auth.user);
  if (!user || user.rawRole !== 'ADMIN') return <Navigate to="/dashboard" replace />;

  const [form, setForm]         = useState<ProvisionUserRequest>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending]   = useState<PendingUser[]>([]);
  const [loading, setLoading]   = useState(false);
  const [fetchErr, setFetchErr] = useState('');
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [dialogMode, setDialogMode]     = useState<'approve' | 'reset' | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  const loadPending = useCallback(async () => {
    setLoading(true); setFetchErr('');
    try { setPending(await provisionService.getPendingType1()); }
    catch (e: any) { setFetchErr(e.message || 'Failed to load pending users'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPending(); }, [loadPending]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true); setCreateMsg(null);
    try {
      const res = await provisionService.createAdminUser(form);
      toast.success('Administrator created successfully.');
      setCreateMsg({ type: 'success', text: res.message || 'Admin user created.' });
      setForm(EMPTY_FORM);
      loadPending();
    } catch (e: any) {
      setCreateMsg({ type: 'error', text: e.message || 'Failed to create user.' });
    } finally { setCreating(false); }
  };

  const confirmDialog = async () => {
    if (!selectedUser || !dialogMode) return;
    setDialogLoading(true);
    try {
      if (dialogMode === 'approve') {
        await provisionService.approveType1(selectedUser.id);
        toast.success(`${selectedUser.name} approved successfully.`);
      } else {
        await provisionService.resetPasswordType1(selectedUser.id);
        toast.success(`Password reset OTP sent to ${selectedUser.email}.`);
      }
      await loadPending();
    } catch (err: any) {
      toast.error(err?.message ?? 'Operation failed.');
    } finally {
      setDialogLoading(false); setSelectedUser(null); setDialogMode(null);
    }
  };

  const columns = [
    {
      key: 'name', header: 'Name', sortable: true,
      render: (u: PendingUser) => <span className="font-semibold text-slate-800">{u.name}</span>,
    },
    {
      key: 'email', header: 'Email',
      render: (u: PendingUser) => <span className="text-slate-600 font-mono text-xs">{u.email}</span>,
    },
    {
      key: 'role', header: 'Role',
      render: (u: PendingUser) => <Badge variant="primary">{u.role}</Badge>,
    },
    {
      key: 'emailVerified', header: 'Email Status',
      render: (u: PendingUser) => u.emailVerified
        ? <Badge variant="success" leftIcon={<CheckCircle className="w-3 h-3" />}>Verified</Badge>
        : <Badge variant="warning" leftIcon={<Clock className="w-3 h-3" />}>Pending</Badge>,
    },
    {
      key: 'createdByAdmin', header: 'Source',
      render: (u: PendingUser) => <span className="text-xs text-slate-500">{u.createdByAdmin}</span>,
    },
    {
      key: 'actions', header: 'Actions',
      render: (u: PendingUser) => (
        <div className="flex gap-2">
          <Button size="sm" leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
            onClick={() => { setSelectedUser(u); setDialogMode('approve'); }}>
            Approve
          </Button>
          <Button size="sm" variant="outline" leftIcon={<KeyRound className="w-3.5 h-3.5" />}
            onClick={() => { setSelectedUser(u); setDialogMode('reset'); }}>
            Reset PW
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page-shell space-y-8 page-enter -mx-4 sm:-mx-6 lg:-mx-8 -my-8 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 sm:px-6 lg:px-8 pt-8 pb-12">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Administration' },
        { label: 'Admin Provisioning' },
      ]} />

      <AdminPageHeader
        title="Admin Provisioning"
        subtitle="Create administrator accounts, review pending approvals and manage access."
        icon={ShieldCheck}
        actions={
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={loadPending}>
            Refresh
          </Button>
        }
      />

      <AdminStatistics stats={[
        { title: 'Pending Approvals',     value: pending.length,                                 color: 'text-amber-400'   },
        { title: 'Verified Emails',        value: pending.filter(u => u.emailVerified).length,    color: 'text-emerald-400' },
        { title: 'Awaiting Verification',  value: pending.filter(u => !u.emailVerified).length,   color: 'text-red-400'     },
        { title: 'Available Admin Roles',  value: ADMIN_ROLE_OPTIONS.length,                      color: 'text-brand-green' },
      ]} />

      <AdminSection title="Create Admin User" subtitle="Provision new ADMIN_TYPE1 or ADMIN_TYPE2 accounts.">
        <AdminCard>
          <ProvisionForm
            form={form} setForm={setForm}
            creating={creating} createMsg={createMsg}
            clearMessage={() => setCreateMsg(null)}
            roleOptions={ADMIN_ROLE_OPTIONS}
            onSubmit={handleCreate}
            submitLabel="Create Admin"
          />
        </AdminCard>
      </AdminSection>

      <AdminSection title="Pending Admin Approvals" subtitle="TYPE1 admin accounts awaiting approval.">
        <AdminCard>
          <PendingUsersTable<PendingUser>
            data={pending} columns={columns}
            loading={loading} error={fetchErr}
            keyExtractor={(u) => String(u.id)}
            emptyMessage="No pending approvals."
            onRefresh={loadPending} refreshLoading={loading}
            onApprove={(u) => { setSelectedUser(u); setDialogMode('approve'); }}
            onResetPassword={(u) => { setSelectedUser(u); setDialogMode('reset'); }}
          />
        </AdminCard>
      </AdminSection>

      <ConfirmationDialog
        open={dialogMode !== null}
        title={dialogMode === 'approve' ? 'Approve Admin User' : 'Reset Admin Password'}
        description={
          dialogMode === 'approve'
            ? `${selectedUser?.name} will gain immediate access after approval.`
            : `A password-reset OTP will be emailed to ${selectedUser?.email}.`
        }
        confirmText={dialogMode === 'approve' ? 'Approve' : 'Send Reset OTP'}
        confirmVariant={dialogMode === 'approve' ? 'success' : 'danger'}
        loading={dialogLoading}
        onCancel={() => { setDialogMode(null); setSelectedUser(null); }}
        onConfirm={confirmDialog}
      />
    </div>
  );
}
