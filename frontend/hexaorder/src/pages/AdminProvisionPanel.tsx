// import { useState, useEffect, useCallback } from 'react';
// import { useAppSelector } from '../app/hooks';
// import { Navigate } from 'react-router-dom';
// import { Button } from '../components/ui/Button';
// import { Badge } from '../components/ui/Badge';
// import { Breadcrumb } from '../components/ui/Breadcrumb';
// import AdminPageHeader from '../components/ui/AdminPageHeader';
// import AdminSection from '../components/ui/AdminSection';
// import AdminCard from '../components/ui/AdminCard';
// import ConfirmationDialog from '../components/ui/ConfirmationDialog';
// import toast from "react-hot-toast";
// import {provisionService,PendingUser,ProvisionUserRequest,} from '../services/provisionService';
// import {ShieldCheck,KeyRound,RefreshCw,} from 'lucide-react';
// import PendingUsersTable from '@/components/ui/PendingUserTable';
// import ProvisionForm from '@/components/ui/ProvisionForm';
// import AdminStatistics from '@/components/ui/AdminStatistics';
// import StatusChip from '@/components/ui/StatusChip';

// // ── Role options ADMIN can create ─────────────────────────────────────────
// const ADMIN_ROLE_OPTIONS = [
//   { value: 'ADMIN_TYPE1', label: 'Admin Type 1 (Inventory Manager)' },
//   { value: 'ADMIN_TYPE2', label: 'Admin Type 2 (Pricing Manager)' },
// ];

// const EMPTY_FORM: ProvisionUserRequest = {
//   fname: '', lname: '', email: '', password: '', phoneNumber: '', role: 'ADMIN_TYPE1',
// };

// // ── Component 
// export default function AdminProvisionPanel() {
//   const user = useAppSelector((s) => s.auth.user);
//   if (!user || user.rawRole !== 'ADMIN') {
//     return <Navigate to="/dashboard" replace />;
//   }

//   // ── Create-user form state
//   const [form, setForm]           = useState<ProvisionUserRequest>(EMPTY_FORM);
//   const [creating, setCreating]   = useState(false);
//   const [createMsg, setCreateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

//   // ── Pending users state
//   const [pending, setPending]     = useState<PendingUser[]>([]);
//   const [loading, setLoading]     = useState(false);
//   const [fetchErr, setFetchErr]   = useState('');

//   // ── Per-row action loading (approve / reset)
//   const [rowLoading, setRowLoading] = useState<Record<number, string>>({});   // id → 'approve' | 'reset'
//   const [rowMsg, setRowMsg]         = useState<Record<number, { type: 'success' | 'error'; text: string }>>({});

//   const [selectedUser,setSelectedUser]=useState<PendingUser|null>(null);

//   const [dialogMode,setDialogMode]=useState<'approve'|'reset'|null>(null);

//   const [dialogLoading,setDialogLoading]=useState(false);

//   // ── Fetch pending TYPE1 users
//   const loadPending = useCallback(async () => {
//     setLoading(true);
//     setFetchErr('');
//     try {
//       const data = await provisionService.getPendingType1();
//       setPending(data);
//     } catch (e: any) {
//       setFetchErr(e.message || 'Failed to load pending users');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { loadPending(); }, [loadPending]);

//   // ── Create admin user
//   const handleCreate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setCreating(true);
//     setCreateMsg(null);
//     try {
//       const res = await provisionService.createAdminUser(form);
//       toast.success("Administrator created successfully.");
//       setCreateMsg({ type: 'success', text: res.message || 'Admin user created successfully.' });
//       setForm(EMPTY_FORM);
//       loadPending();        // refresh list — new user may appear if not pre-approved
//     } catch (e: any) {
//       setCreateMsg({ type: 'error', text: e.message || 'Failed to create user.' });
//     } finally {
//       setCreating(false);
//     }
//   };

//   // ── Approve TYPE1
//   // const handleApprove = async (id: number) => {
//   //   setRowLoading((p) => ({ ...p, [id]: 'approve' }));
//   //   setRowMsg((p) => { const n = { ...p }; delete n[id]; return n; });
//   //   try {
//   //     const res = await provisionService.approveType1(id);
//   //     setRowMsg((p) => ({ ...p, [id]: { type: 'success', text: res.message } }));
//   //     setPending((p) => p.filter((u) => u.id !== id));
//   //   } catch (e: any) {
//   //     setRowMsg((p) => ({ ...p, [id]: { type: 'error', text: e.message || 'Approval failed.' } }));
//   //   } finally {
//   //     setRowLoading((p) => { const n = { ...p }; delete n[id]; return n; });
//   //   }
//   // };

// const openApproveDialog=(user:PendingUser)=>{

// setSelectedUser(user);
// setDialogMode('approve');
// };

// const openResetDialog=(user:PendingUser)=>{

// setSelectedUser(user);
// setDialogMode('reset');
// };

// const confirmDialog = async () => {
//   if (!selectedUser || !dialogMode) return;
//   setDialogLoading(true);
//   try {
//     if (dialogMode === "approve") {

//       await provisionService.approveType1(
//         selectedUser.id
//       );

//       toast.success(
//         `${selectedUser.name} approved successfully.`
//       );

//     } else {

//       await provisionService.resetPasswordType1(
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

//   // ── Trigger password reset
//   // const handleReset = async (id: number) => {
//   //   setRowLoading((p) => ({ ...p, [id]: 'reset' }));
//   //   setRowMsg((p) => { const n = { ...p }; delete n[id]; return n; });
//   //   try {
//   //     const res = await provisionService.resetPasswordType1(id);
//   //     setRowMsg((p) => ({ ...p, [id]: { type: 'success', text: res.message } }));
//   //   } catch (e: any) {
//   //     setRowMsg((p) => ({ ...p, [id]: { type: 'error', text: e.message || 'Reset failed.' } }));
//   //   } finally {
//   //     setRowLoading((p) => { const n = { ...p }; delete n[id]; return n; });
//   //   }
//   // };

//   // ── Table columns for pending TYPE1 users
//   const columns = [
//     {
//       key: 'name',
//       header: 'Name',
//       sortable: true,
//       render: (u: PendingUser) => (<span className="font-semibold text-slate-900">{u.name}</span>),
//     },
//     {
//       key: 'email',
//       header: 'Email',
//       render: (u: PendingUser) => (<span className="text-slate-600 font-mono text-xs">{u.email}</span>),
//     },
//     {
//       key: 'role',
//       header: 'Role',
//       render: (u: PendingUser) => (<Badge variant="primary">{u.role}</Badge>),
//     },
//     {
//       key: 'emailVerified',
//       header: 'Email Status',
//       render: (u: PendingUser) => (u.emailVerified? (<StatusChip status="success" text="Verified"/>): (<StatusChip status="warning" text="Pending"/>))
//     },
//     {
//       key: 'createdByAdmin',
//       header: 'Source',
//       render: (u: PendingUser) => (<span className="text-xs text-slate-500">{u.createdByAdmin}</span>),
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
//               onClick={() => openApproveDialog(u)}>
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
//           label: 'Admin Provisioning',
//         },
//       ]}
//     />

//     {/* ───────────────── Header ───────────────── */}
//     <AdminPageHeader
//       title="Admin Provisioning"
//       subtitle="Create administrator accounts, review pending approvals and manage administrator access."
//       icon={ShieldCheck}
//       actions={
//         <Button
//           variant="outline"
//           leftIcon={<RefreshCw className="w-4 h-4" />}
//           onClick={loadPending}>
//           Refresh
//         </Button>
//       }
//     />

// <AdminStatistics
//   stats={[
//     {
//       title: 'Pending Approvals',
//       value: pending.length,
//       color: 'text-amber-400',
//     },
//     {
//       title: 'Verified',
//       value: pending.filter((u) => u.emailVerified).length,
//       color: 'text-emerald-400',
//     },
//     {
//       title: 'Awaiting Verification',
//       value: pending.filter((u) => !u.emailVerified).length,
//       color: 'text-red-400',
//     },
//     {
//       title: 'Administrator Roles',
//       value: ADMIN_ROLE_OPTIONS.length,
//       color: 'text-brand-green',
//     },
//   ]}
// />

//     {/* ───────────────── Create Administrator ───────────────── */}
//     <AdminSection
//       title="Create Administrator"
//       subtitle="Provision new administrator accounts."
//     >
//       <AdminCard>

//   <ProvisionForm

//     form={form}

//     setForm={setForm}

//     creating={creating}

//     createMsg={createMsg}

//     clearMessage={() => setCreateMsg(null)}

//     roleOptions={ADMIN_ROLE_OPTIONS}

//     onSubmit={handleCreate}

//   />

// </AdminCard>
//     </AdminSection>

//     {/* ───────────────── Pending Approvals ───────────────── */}

//     <AdminSection
//       title="Pending Administrator Approvals"
//       subtitle="Administrators waiting for approval."
//     >

//       {/* {fetchErr && (
//         <Alert
//           variant="error"
//           className="mb-4"
//         >
//           {fetchErr}
//         </Alert>
//       )} */}

//       <AdminCard>

//     <PendingUsersTable<PendingUser>

//     data={pending}

//     columns={columns}

//     loading={loading}

//     error={fetchErr}

//     keyExtractor={(u) => String(u.id)}

//     emptyMessage="No pending approvals — all TYPE1 accounts are approved."

//     onRefresh={loadPending}

//     refreshLoading={loading}

//     onApprove={openApproveDialog}

// onResetPassword={openResetDialog}

// />

//       </AdminCard>

//     </AdminSection>

//     {/* ───────────────── Recent Activity ───────────────── */}

//     <AdminSection
//       title="Recent Activity"
//       subtitle="Administration activity overview."
//     >

//       <AdminCard>

//         <div className="space-y-3">

//           <p className="text-sm text-slate-300">

//             No recent administration events.

//           </p>

//           <p className="text-xs text-slate-500">

//             Activity logs will appear here in a future update.

//           </p>

//         </div>

//       </AdminCard>

//     </AdminSection>

//     <ConfirmationDialog

// open={dialogMode!==null}

// title={
// dialogMode==='approve'
// ?'Approve Administrator'
// :'Reset Password'
// }

// description={
// dialogMode==='approve'
// ?'This administrator will immediately gain access after email verification.'
// :'A temporary password will be emailed to this administrator.'
// }

// confirmText={
// dialogMode==='approve'
// ?'Approve'
// :'Reset Password'
// }

// confirmVariant={
// dialogMode==='approve'
// ?'success'
// :'danger'
// }

// loading={dialogLoading}

// onCancel={()=>{
// setDialogMode(null);
// setSelectedUser(null);
// }}

// onConfirm={confirmDialog}

// />
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
    <div className="space-y-8 page-enter">
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
          <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={loadPending}>
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