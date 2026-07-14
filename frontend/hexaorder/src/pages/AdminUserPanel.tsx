// import { useState, useEffect, useCallback } from 'react';
// import { useAppSelector } from '../app/hooks';
// import { Navigate } from 'react-router-dom';
// import { Button } from '../components/ui/Button';
// import { Badge } from '../components/ui/Badge';
// import { Breadcrumb } from '../components/ui/Breadcrumb';
// import {provisionService,PendingUser,ProvisionUserRequest,} from '../services/provisionService';
// import {ShieldCheck,KeyRound,CheckCircle,Clock,RefreshCw,Users,} from 'lucide-react';
// import ConfirmationDialog from '../components/ui/ConfirmationDialog';
// import AdminSection from '@/components/ui/AdminSection';
// import AdminCard from '@/components/ui/AdminCard';
// import AdminPageHeader from '@/components/ui/AdminPageHeader';
// import AdminStatistics from '@/components/ui/AdminStatistics';
// import PendingUsersTable from '@/components/ui/PendingUserTable';
// import ProvisionForm from '@/components/ui/ProvisionForm';
// import toast from "react-hot-toast";
// // ── Role options for TYPE2 users ──────────────────────────────────────────
// const USER_ROLE_OPTIONS = [
//   { value: 'USER_TYPE1', label: 'User Type 1 (Category Browser)' },
//   { value: 'USER_TYPE2', label: 'User Type 2 (Price Comparison)' },
// ];

// const EMPTY_FORM: ProvisionUserRequest = {
//   fname: '', lname: '', email: '', password: '', phoneNumber: '', role: 'USER_TYPE1',
// };

// // ── Component ─────────────────────────────────────────────────────────────

// export default function AdminUserPanel() {
// const user = useAppSelector((s) => s.auth.user);

//   // Guard: only ADMIN or ADMIN_TYPE2
// const allowed = ['ADMIN', 'ADMIN_TYPE2'];
//   if (!user || !allowed.includes(user.rawRole)) {
//     return <Navigate to="/dashboard" replace />;
//   }

// const isRootAdmin = user.rawRole === 'ADMIN';

//   // ── Create-user form state
// const [form, setForm]           = useState<ProvisionUserRequest>(EMPTY_FORM);
// const [creating, setCreating]   = useState(false);
// const [createMsg, setCreateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

//   // ── Pending users state
// const [pending, setPending]     = useState<PendingUser[]>([]);
// const [loading, setLoading]     = useState(false);
// const [fetchErr, setFetchErr]   = useState('');

//   // ── Per-row action loading
// const [rowLoading, setRowLoading] = useState<Record<number, string>>({});
// const [rowMsg, setRowMsg] = useState<Record<number, { type: 'success' | 'error'; text: string }>>({});
// const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);

// const [dialogMode, setDialogMode] = useState<'approve' | 'reset' | null>(null);

// const [dialogLoading, setDialogLoading] =
//     useState(false);

//   // ── Fetch pending TYPE2 users
// const loadPending = useCallback(async () => {
//     setLoading(true);
//     setFetchErr('');
//     try {
//       const data = await provisionService.getPendingType2();
//       setPending(data);
//     } catch (e: any) {
//       setFetchErr(e.message || 'Failed to load pending users');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { loadPending(); }, [loadPending]);

//   // ── Create TYPE2 user
//   const handleCreate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setCreating(true);
//     setCreateMsg(null);
//     try {
//       const res = await provisionService.createUser(form);
//       setCreateMsg({ type: 'success', text: res.message || 'User created successfully.' });
//       toast.success("User created successfully.");
//       setForm(EMPTY_FORM);
//       loadPending();
//     } catch (e: any) {
//       setCreateMsg({ type: 'error', text: e.message || 'Failed to create user.' });
//     } finally {
//       setCreating(false);
//     }
//   };

//   // ── Approve TYPE2
//   // const handleApprove = async (id: number) => {
//   //   setRowLoading((p) => ({ ...p, [id]: 'approve' }));
//   //   setRowMsg((p) => { const n = { ...p }; delete n[id]; return n; });
//   //   try {
//   //     const res = await provisionService.approveType2(id);
//   //     setRowMsg((p) => ({ ...p, [id]: { type: 'success', text: res.message } }));
//   //     setPending((p) => p.filter((u) => u.id !== id));
//   //   } catch (e: any) {
//   //     setRowMsg((p) => ({ ...p, [id]: { type: 'error', text: e.message || 'Approval failed.' } }));
//   //   } finally {
//   //     setRowLoading((p) => { const n = { ...p }; delete n[id]; return n; });
//   //   }
//   // };

//   // ── Trigger password reset for TYPE2
//   // const handleReset = async (id: number) => {
//   //   setRowLoading((p) => ({ ...p, [id]: 'reset' }));
//   //   setRowMsg((p) => { const n = { ...p }; delete n[id]; return n; });
//   //   try {
//   //     const res = await provisionService.resetPasswordType2(id);
//   //     setRowMsg((p) => ({ ...p, [id]: { type: 'success', text: res.message } }));
//   //   } catch (e: any) {
//   //     setRowMsg((p) => ({ ...p, [id]: { type: 'error', text: e.message || 'Reset failed.' } }));
//   //   } finally {
//   //     setRowLoading((p) => { const n = { ...p }; delete n[id]; return n; });
//   //   }
//   // };

// const openApproveDialog = (user: PendingUser) => {setSelectedUser(user); setDialogMode('approve');};

// const openResetDialog = (user: PendingUser) => {setSelectedUser(user); setDialogMode('reset'); };

// const confirmDialog = async () => {

//   if (!selectedUser || !dialogMode) return;

//   setDialogLoading(true);

//   try {

//     if (dialogMode === "approve") {

//       await provisionService.approveType2(
//         selectedUser.id
//       );

//       toast.success(
//         `${selectedUser.name} approved successfully.`
//       );

//     } else {

//       await provisionService.resetPasswordType2(
//         selectedUser.id
//       );

//       toast.success(
//         `Temporary password sent to ${selectedUser.email}.`
//       );

//     }

//     await loadPending();

//   } catch (err: any) {

//     toast.error(
//       err?.response?.data?.message ??
//       "Operation failed."
//     );

//   } finally {

//     setDialogLoading(false);

//     setSelectedUser(null);

//     setDialogMode(null);

//   }

// };


//   // ── Table columns
//   const columns = [
//     {
//       key: 'name',
//       header: 'Name',
//       sortable: true,
//       render: (u: PendingUser) => (
//         <span className="font-semibold text-slate-900">{u.name}</span>
//       ),
//     },
//     {
//       key: 'email',
//       header: 'Email',
//       render: (u: PendingUser) => (
//         <span className="text-slate-600 font-mono text-xs">{u.email}</span>
//       ),
//     },
//     {
//       key: 'role',
//       header: 'Role',
//       render: (u: PendingUser) => (
//         <Badge variant="success">{u.role}</Badge>
//       ),
//     },
//     {
//       key: 'emailVerified',
//       header: 'Email Status',
//       render: (u: PendingUser) =>
//         u.emailVerified
//           ? <Badge variant="success" leftIcon={<CheckCircle className="w-3 h-3" />}>Verified</Badge>
//           : <Badge variant="warning" leftIcon={<Clock className="w-3 h-3" />}>Pending</Badge>,
//     },
//     {
//       key: 'createdByAdmin',
//       header: 'Source',
//       render: (u: PendingUser) => (
//         <span className="text-xs text-slate-500">{u.createdByAdmin}</span>
//       ),
//     },
//     {
//       key: 'actions',
//       header: 'Actions',
//       render: (u: PendingUser) => (
//         <div className="flex flex-col gap-1.5">
//           {rowMsg[u.id] && (
//             <p className={`text-xs font-medium ${rowMsg[u.id].type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
//               {rowMsg[u.id].text}
//             </p>
//           )}
//           <div className="flex gap-2">
//             <Button
//               size="sm"
//               leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
//               isLoading={rowLoading[u.id] === 'approve'}
//               disabled={!!rowLoading[u.id]}
//               onClick={() => openApproveDialog(u)}
//             >
//               Approve
//             </Button>
//             <Button
//               size="sm"
//               variant="outline"
//               leftIcon={<KeyRound className="w-3.5 h-3.5" />}
//               isLoading={rowLoading[u.id] === 'reset'}
//               disabled={!!rowLoading[u.id]}
//               onClick={() => openResetDialog(u)}
//             >
//               Reset Password
//             </Button>
//           </div>
//         </div>
//       ),
//     },
//   ];

//   // ── Render ────────────────────────────────────────────────────────────────
//   return (
//   <div className="space-y-8 page-enter">

//     {/* ───────────────── Breadcrumb ───────────────── */}
//     <Breadcrumb
//       items={[
//         {
//           label: 'Dashboard',
//           href: '/dashboard',
//         },
//         {
//           label: 'Administration',
//         },
//         {
//           label: 'User Management',
//         },
//       ]}
//     />

//     {/* ───────────────── Header ───────────────── */}
//     <AdminPageHeader
//       title="User Management"
//       subtitle="Create end-user accounts, review pending registrations and manage user access."
//       icon={Users}
//       actions={
//         <Button
//           variant="outline"
//           leftIcon={<RefreshCw className="w-4 h-4" />}
//           onClick={loadPending}
//         >
//           Refresh
//         </Button>
//       }
//     />

//     {/* ───────────────── Statistics ───────────────── */}
//     <AdminStatistics
//       stats={[
//         {
//           title: 'Pending Approvals',
//           value: pending.length,
//           color: 'text-amber-400',
//         },
//         {
//           title: 'Verified Users',
//           value: pending.filter((u) => u.emailVerified).length,
//           color: 'text-emerald-400',
//         },
//         {
//           title: 'Awaiting Verification',
//           value: pending.filter((u) => !u.emailVerified).length,
//           color: 'text-red-400',
//         },
//         {
//           title: 'Available User Roles',
//           value: USER_ROLE_OPTIONS.length,
//           color: 'text-brand-green',
//         },
//       ]}
//     />

//     {/* ───────────────── Create User ───────────────── */}
//     <AdminSection
//       title="Create User"
//       subtitle="Provision new user accounts."
//     >
//       <AdminCard>

//         <ProvisionForm
//           form={form}
//           setForm={setForm}
//           creating={creating}
//           createMsg={createMsg}
//           clearMessage={() => setCreateMsg(null)}
//           roleOptions={USER_ROLE_OPTIONS}
//           onSubmit={handleCreate}
//           submitLabel="Create User"
//         />

//       </AdminCard>
//     </AdminSection>

//     {/* ───────────────── Pending Users ───────────────── */}

//     <AdminSection
//       title="Pending User Approvals"
//       subtitle="TYPE2 users waiting for approval."
//     >

//       <AdminCard>

//         <PendingUsersTable<PendingUser>
//           data={pending}
//           columns={columns}
//           loading={loading}
//           error={fetchErr}
//           keyExtractor={(u) => String(u.id)}
//           emptyMessage="No pending approvals — all user accounts are approved."
//           onRefresh={loadPending}
//           refreshLoading={loading}
//           onApprove={openApproveDialog}
//           onResetPassword={openResetDialog}
//         />

//       </AdminCard>

//     </AdminSection>

//     {/* ───────────────── Recent Activity ───────────────── */}

//     <AdminSection
//       title="Recent Activity"
//       subtitle="User provisioning activity overview."
//     >

//       <AdminCard>

//         <div className="space-y-3">

//           <p className="text-sm text-slate-300">
//             No recent user management events.
//           </p>

//           <p className="text-xs text-slate-500">
//             Activity logs will appear here in a future update.
//           </p>

//         </div>

//       </AdminCard>

//     </AdminSection>

//     {/* ───────────────── Confirmation Dialog ───────────────── */}

//     <ConfirmationDialog
//       open={dialogMode !== null}
//       title={
//         dialogMode === 'approve'
//           ? 'Approve User'
//           : 'Reset User Password'
//       }
//       description={
//         dialogMode === 'approve'
//           ? 'This user will immediately gain access after approval.'
//           : 'A temporary password will be emailed to this user.'
//       }
//       confirmText={
//         dialogMode === 'approve'
//           ? 'Approve'
//           : 'Reset Password'
//       }
//       confirmVariant={
//         dialogMode === 'approve'
//           ? 'success'
//           : 'danger'
//       }
//       loading={dialogLoading}
//       onCancel={() => {
//         setDialogMode(null);
//         setSelectedUser(null);
//       }}
//       onConfirm={confirmDialog}
//     />

//   </div>
// );
// }


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
import { Users, ShieldCheck, KeyRound, RefreshCw, CheckCircle, Clock } from 'lucide-react';

const USER_ROLE_OPTIONS = [
  { value: 'USER_TYPE1', label: 'User Type 1 (Category Browser)' },
  { value: 'USER_TYPE2', label: 'User Type 2 (Price Comparison)' },
];

const EMPTY_FORM: ProvisionUserRequest = {
  fname: '', lname: '', email: '', password: '', phoneNumber: '', role: 'USER_TYPE1',
};

export default function AdminUserPanel() {
  const user = useAppSelector((s) => s.auth.user);
  const allowed = ['ADMIN', 'ADMIN_TYPE2'];
  if (!user || !allowed.includes(user.rawRole)) return <Navigate to="/dashboard" replace />;

  const [form, setForm]           = useState<ProvisionUserRequest>(EMPTY_FORM);
  const [creating, setCreating]   = useState(false);
  const [createMsg, setCreateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending]     = useState<PendingUser[]>([]);
  const [loading, setLoading]     = useState(false);
  const [fetchErr, setFetchErr]   = useState('');
  const [selectedUser, setSelectedUser]   = useState<PendingUser | null>(null);
  const [dialogMode, setDialogMode]       = useState<'approve' | 'reset' | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  const loadPending = useCallback(async () => {
    setLoading(true); setFetchErr('');
    try { setPending(await provisionService.getPendingType2()); }
    catch (e: any) { setFetchErr(e.message || 'Failed to load pending users'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPending(); }, [loadPending]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true); setCreateMsg(null);
    try {
      const res = await provisionService.createUser(form);
      toast.success('User created successfully.');
      setCreateMsg({ type: 'success', text: res.message || 'User created.' });
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
        await provisionService.approveType2(selectedUser.id);
        toast.success(`${selectedUser.name} approved successfully.`);
      } else {
        await provisionService.resetPasswordType2(selectedUser.id);
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
      render: (u: PendingUser) => <Badge variant="success">{u.role}</Badge>,
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
    <div className="space-y-8 page-enter">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Administration' },
        { label: 'User Management' },
      ]} />

      <AdminPageHeader
        title="User Management"
        subtitle="Create end-user accounts, review pending registrations and manage access."
        icon={Users}
        actions={
          <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={loadPending}>
            Refresh
          </Button>
        }
      />

      <AdminStatistics stats={[
        { title: 'Pending Approvals',    value: pending.length,                              color: 'text-amber-400'   },
        { title: 'Verified Users',        value: pending.filter(u => u.emailVerified).length, color: 'text-emerald-400' },
        { title: 'Awaiting Verification', value: pending.filter(u => !u.emailVerified).length,color: 'text-red-400'     },
        { title: 'Available User Roles',  value: USER_ROLE_OPTIONS.length,                    color: 'text-brand-green' },
      ]} />

      <AdminSection title="Create User" subtitle="Provision new USER_TYPE1 or USER_TYPE2 accounts.">
        <AdminCard>
          <ProvisionForm
            form={form} setForm={setForm}
            creating={creating} createMsg={createMsg}
            clearMessage={() => setCreateMsg(null)}
            roleOptions={USER_ROLE_OPTIONS}
            onSubmit={handleCreate}
            submitLabel="Create User"
          />
        </AdminCard>
      </AdminSection>

      <AdminSection title="Pending User Approvals" subtitle="TYPE2 user accounts awaiting approval.">
        <AdminCard>
          <PendingUsersTable<PendingUser>
            data={pending} columns={columns}
            loading={loading} error={fetchErr}
            keyExtractor={(u) => String(u.id)}
            emptyMessage="No pending approvals — all accounts are approved."
            onRefresh={loadPending} refreshLoading={loading}
            onApprove={(u) => { setSelectedUser(u); setDialogMode('approve'); }}
            onResetPassword={(u) => { setSelectedUser(u); setDialogMode('reset'); }}
          />
        </AdminCard>
      </AdminSection>

      <ConfirmationDialog
        open={dialogMode !== null}
        title={dialogMode === 'approve' ? 'Approve User' : 'Reset User Password'}
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