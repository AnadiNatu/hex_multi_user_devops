// // src/pages/OtpAdminCenter.tsx
// // FIX: Fully functional OTP center with working send/verify panels for
// // Email OTP, SMS OTP, and Phone Login. UI colors fixed (white text on dark bg).
// // Breadcrumb text fixed with explicit text-white/text-slate-300 classes.

// import { ShieldCheck, Mail, Smartphone, Phone } from 'lucide-react';
// import { Breadcrumb } from '../components/ui/Breadcrumb';
// import { Button } from '../components/ui/Button';
// import AdminPageHeader from '../components/ui/AdminPageHeader';
// import AdminStatistics from '../components/ui/AdminStatistics';
// import AdminSection from '../components/ui/AdminSection';
// import AdminCard from '../components/ui/AdminCard';
// import OtpPanel from '../components/ui/OtpPanel';
// import { otpAdminService } from '../services/otpAdminService';

// export default function OtpAdminCenter() {
//   return (
//     <div className="space-y-8 page-enter">

//       {/* Breadcrumb */}
//       <Breadcrumb
//         items={[
//           { label: 'Dashboard', href: '/dashboard' },
//           { label: 'Administration' },
//           { label: 'OTP Center' },
//         ]}
//       />

//       {/* Header */}
//       <AdminPageHeader
//         title="OTP Administration Center"
//         subtitle="Send and verify Email, SMS and Phone one-time passwords."
//         icon={ShieldCheck}
//         actions={
//           <Button variant="outline">Refresh</Button>
//         }
//       />

//       {/* Stats */}
//       <AdminStatistics
//         stats={[
//           { title: 'Email OTP',          value: 'Ready', color: 'text-emerald-400' },
//           { title: 'SMS OTP',            value: 'Ready', color: 'text-blue-400'    },
//           { title: 'Phone Login',        value: 'Ready', color: 'text-amber-400'   },
//           { title: 'Available Services', value: 3,       color: 'text-brand-green' },
//         ]}
//       />

//       {/* Interactive OTP panels */}
//       <AdminSection
//         title="OTP Services"
//         subtitle="Send and verify one-time passwords for email, SMS or phone login."
//       >
//         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

//           {/* Email OTP */}
//           <OtpPanel
//             title="Email OTP"
//             description="Send and verify email one-time passwords."
//             type="email"
//             sendOtp={(email) => otpAdminService.sendEmailOtp(email)}
//             verifyOtp={(email, otp) => otpAdminService.verifyEmailOtp(email, otp)}
//           />

//           {/* SMS OTP */}
//           <OtpPanel
//             title="SMS OTP"
//             description="Send and verify SMS one-time passwords."
//             type="sms"
//             sendOtp={(phone) => otpAdminService.sendSmsOtp(phone)}
//             verifyOtp={(phone, otp) => otpAdminService.verifySmsOtp(phone, otp)}
//           />

//           {/* Phone Login */}
//           <OtpPanel
//             title="Phone Authentication"
//             description="Test phone login OTP authentication."
//             type="phone"
//             sendOtp={(phone) => otpAdminService.sendPhoneOtp(phone)}
//             verifyOtp={(phone, otp) => otpAdminService.verifyPhoneOtp(phone, otp)}
//           />

//         </div>
//       </AdminSection>
//     </div>
//   );
// }

// src/pages/OtpAdminCenter.tsx
// FIX: Fully functional OTP center with working send/verify panels for
// Email OTP, SMS OTP, and Phone Login. UI colors fixed (white text on dark bg).
// Breadcrumb text fixed with explicit text-white/text-slate-300 classes.

import { ShieldCheck} from 'lucide-react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import AdminPageHeader from '../components/ui/AdminPageHeader';
import AdminStatistics from '../components/ui/AdminStatistics';
import AdminSection from '../components/ui/AdminSection';
import OtpPanel from '../components/ui/OtpPanel';
import { otpAdminService } from '../services/otpAdminService';

export default function OtpAdminCenter() {
  return (
    <div className="space-y-8 page-enter">

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Administration' },
          { label: 'OTP Center' },
        ]}
      />

      {/* Header */}
      <AdminPageHeader
        title="OTP Administration Center"
        subtitle="Send and verify Email, SMS and Phone one-time passwords."
        icon={ShieldCheck}
        actions={
          <Button variant="outline">Refresh</Button>
        }
      />

      {/* Stats */}
      <AdminStatistics
        stats={[
          { title: 'Email OTP',          value: 'Ready', color: 'text-emerald-400' },
          { title: 'SMS OTP',            value: 'Ready', color: 'text-blue-400'    },
          { title: 'Phone Login',        value: 'Ready', color: 'text-amber-400'   },
          { title: 'Available Services', value: 3,       color: 'text-brand-green' },
        ]}
      />

      {/* Interactive OTP panels */}
      <AdminSection
        title="OTP Services"
        subtitle="Send and verify one-time passwords for email, SMS or phone login."
      >
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Email OTP */}
          <OtpPanel
            title="Email OTP"
            description="Send and verify email one-time passwords."
            type="email"
            sendOtp={(email) => otpAdminService.sendEmailOtp(email)}
            verifyOtp={(email, otp) => otpAdminService.verifyEmailOtp(email, otp)}
          />

          {/* SMS OTP */}
          <OtpPanel
            title="SMS OTP"
            description="Send and verify SMS one-time passwords."
            type="sms"
            sendOtp={(phone) => otpAdminService.sendSmsOtp(phone)}
            verifyOtp={(phone, otp) => otpAdminService.verifySmsOtp(phone, otp)}
          />

          {/* Phone Login */}
          <OtpPanel
            title="Phone Authentication"
            description="Test phone login OTP authentication."
            type="phone"
            sendOtp={(phone) => otpAdminService.sendPhoneOtp(phone)}
            verifyOtp={(phone, otp) => otpAdminService.verifyPhoneOtp(phone, otp)}
          />

        </div>
      </AdminSection>
    </div>
  );
}