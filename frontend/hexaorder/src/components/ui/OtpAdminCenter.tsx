import { ShieldCheck, RefreshCw } from 'lucide-react';

import { Breadcrumb } from './Breadcrumb';
import { Button } from './Button';

import AdminPageHeader from './AdminPageHeader';
import AdminStatistics from './AdminStatistics';
import AdminSection from './AdminSection';
import OtpPanel from './OtpPanel';
import { otpAdminService } from '@/services/otpAdminService';

export default function OtpAdminCenter() {

  return (
    <div className="space-y-8 page-enter">

      {/* ---------------- Breadcrumb ---------------- */}

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
            label: 'OTP Center',
          },
        ]}
      />

      {/* ---------------- Header ---------------- */}

      <AdminPageHeader
        title="OTP Administration Center"
        subtitle="Manage Email OTP, SMS OTP and Phone Authentication services."
        icon={ShieldCheck}
        actions={
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        }
      />

      {/* ---------------- Statistics ---------------- */}

      <AdminStatistics
        stats={[
          {
            title: 'Email OTP',
            value: 'Ready',
            color: 'text-emerald-400',
          },
          {
            title: 'SMS OTP',
            value: 'Ready',
            color: 'text-blue-400',
          },
          {
            title: 'Phone Login',
            value: 'Ready',
            color: 'text-amber-400',
          },
          {
            title: 'Available Services',
            value: 3,
            color: 'text-brand-green',
          },
        ]}
      />

      {/* ---------------- OTP Services ---------------- */}

      <AdminSection
        title="OTP Services"
        subtitle="Send and verify Email, SMS and Phone authentication OTPs."
      >

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          <OtpPanel
            title="Email OTP"
            description="Send and verify Email OTP."
            type="email"
            sendOtp={otpAdminService.sendEmailOtp}
            verifyOtp={otpAdminService.verifyEmailOtp}
          />

          <OtpPanel
            title="SMS OTP"
            description="Send and verify SMS OTP."
            type="sms"
            sendOtp={otpAdminService.sendSmsOtp}
            verifyOtp={otpAdminService.verifySmsOtp}
          />

          <OtpPanel
            title="Phone Authentication"
            description="Test Phone Login authentication."
            type="phone"
            sendOtp={otpAdminService.sendPhoneOtp}
            verifyOtp={otpAdminService.verifyPhoneOtp}
          />

        </div>

      </AdminSection>

    </div>
  );
}