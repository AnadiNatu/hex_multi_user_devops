import { ShieldCheck, RefreshCw } from 'lucide-react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import AdminPageHeader from '../components/ui/AdminPageHeader';
import AdminStatistics from '../components/ui/AdminStatistics';
import AdminSection from '../components/ui/AdminSection';
import OtpPanel from '../components/ui/OtpPanel';
import { otpAdminService } from '../services/otpAdminService';

export default function OtpAdminCenter() {
  return (
    <div className="admin-page-shell space-y-8 page-enter -mx-4 sm:-mx-6 lg:-mx-8 -my-8 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 sm:px-6 lg:px-8 pt-8 pb-12">

      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Administration' },
          { label: 'OTP Center' },
        ]}
      />

      <AdminPageHeader
        title="OTP Administration Center"
        subtitle="Send and verify Email, SMS and Phone one-time passwords."
        icon={ShieldCheck}
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
          { title: 'Email OTP',          value: 'Ready', color: 'text-emerald-400' },
          { title: 'SMS OTP',            value: 'Ready', color: 'text-blue-400'    },
          { title: 'Phone Login',        value: 'Ready', color: 'text-amber-400'   },
          { title: 'Available Services', value: 3,       color: 'text-brand-green' },
        ]}
      />

      <AdminSection
        title="OTP Services"
        subtitle="Send and verify one-time passwords for email, SMS or phone login."
      >
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <OtpPanel
            title="Email OTP"
            description="Send and verify email one-time passwords."
            type="email"
            sendOtp={(email) => otpAdminService.sendEmailOtp(email)}
            verifyOtp={(email, otp) => otpAdminService.verifyEmailOtp(email, otp)}
          />
          <OtpPanel
            title="SMS OTP"
            description="Send and verify SMS one-time passwords."
            type="sms"
            sendOtp={(phone) => otpAdminService.sendSmsOtp(phone)}
            verifyOtp={(phone, otp) => otpAdminService.verifySmsOtp(phone, otp)}
          />
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
