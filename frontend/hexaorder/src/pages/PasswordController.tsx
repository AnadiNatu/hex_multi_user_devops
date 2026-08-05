// import {
//   KeyRound,
//   RefreshCw,
// } from 'lucide-react';

// import { Breadcrumb } from '../components/ui/Breadcrumb';
// import { Button } from '../components/ui/Button';

// import AdminPageHeader from '@/components/ui/AdminPageHeader';
// import AdminStatistics from '@/components/ui/AdminStatistics';
// import AdminSection from '@/components/ui/AdminSection';

// import ForgotPasswordCard from '@/components/ui/ForgotPassword';
// import ResetPasswordCard from '@/components/ui/ResetPassword';
// import ChangePasswordCard from '@/components/ui/ChangePassword';

// export default function PasswordController() {

//   return (
//     <div className="space-y-8 page-enter">

//       {/* -------------------------------------------------- */}
//       {/* Breadcrumb */}
//       {/* -------------------------------------------------- */}

//       <Breadcrumb
//         items={[
//           {
//             label: 'Dashboard',
//             href: '/dashboard',
//           },
//           {
//             label: 'Administration',
//           },
//           {
//             label: 'Password Center',
//           },
//         ]}
//       />

//       {/* -------------------------------------------------- */}
//       {/* Header */}
//       {/* -------------------------------------------------- */}

//       <AdminPageHeader
//         title="Password Center"
//         subtitle="Manage password recovery, password reset and secure password updates."
//         icon={KeyRound}
//         actions={
//           <Button
//             variant="outline"
//             leftIcon={<RefreshCw className="w-4 h-4" />}
//             onClick={() => window.location.reload()}
//           >
//             Refresh
//           </Button>
//         }
//       />

//       {/* -------------------------------------------------- */}
//       {/* Statistics */}
//       {/* -------------------------------------------------- */}

//       <AdminStatistics
//         stats={[
//           {
//             title: 'Forgot Password',
//             value: 'Ready',
//             color: 'text-emerald-400',
//           },
//           {
//             title: 'Reset Password',
//             value: 'Ready',
//             color: 'text-blue-400',
//           },
//           {
//             title: 'Change Password',
//             value: 'Ready',
//             color: 'text-amber-400',
//           },
//           {
//             title: 'Available Services',
//             value: 3,
//             color: 'text-brand-green',
//           },
//         ]}
//       />

//       {/* -------------------------------------------------- */}
//       {/* Password Services */}
//       {/* -------------------------------------------------- */}

//       <AdminSection
//         title="Password Services"
//         subtitle="Recover forgotten passwords, reset passwords using OTP, or securely change an existing password."
//       >

//         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

//           <ForgotPasswordCard />

//           <ResetPasswordCard />

//           <ChangePasswordCard />

//         </div>

//       </AdminSection>

//     </div>
//   );

// }

import {
  KeyRound,
  RefreshCw,
} from 'lucide-react';

import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';

import AdminPageHeader from '@/components/ui/AdminPageHeader';
import AdminStatistics from '@/components/ui/AdminStatistics';
import AdminSection from '@/components/ui/AdminSection';

import ForgotPasswordCard from '@/components/ui/ForgotPassword';
import ResetPasswordCard from '@/components/ui/ResetPassword';
import ChangePasswordCard from '@/components/ui/ChangePassword';

export default function PasswordController() {
  return (
    <div className="admin-page-shell space-y-8 page-enter -mx-4 sm:-mx-6 lg:-mx-8 -my-8 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 sm:px-6 lg:px-8 pt-8 pb-12">

      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Administration' },
          { label: 'Password Center' },
        ]}
      />

      <AdminPageHeader
        title="Password Center"
        subtitle="Manage password recovery, password reset and secure password updates."
        icon={KeyRound}
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        }
      />

      <AdminStatistics
        stats={[
          { title: 'Forgot Password',     value: 'Ready', color: 'text-emerald-400' },
          { title: 'Reset Password',      value: 'Ready', color: 'text-blue-400'    },
          { title: 'Change Password',     value: 'Ready', color: 'text-amber-400'   },
          { title: 'Available Services',  value: 3,       color: 'text-brand-green' },
        ]}
      />

      <AdminSection
        title="Password Services"
        subtitle="Recover forgotten passwords, reset passwords using OTP, or securely change an existing password."
      >
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <ForgotPasswordCard />
          <ResetPasswordCard />
          <ChangePasswordCard />
        </div>
      </AdminSection>

    </div>
  );
}
