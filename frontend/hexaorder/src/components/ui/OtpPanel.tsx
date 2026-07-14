// src/components/ui/OtpPanel.tsx
// FIX: White text on dark bg. Fully functional send+verify cycle.
// Shows icon, input for address, send OTP button, then OTP entry + verify button.

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, Smartphone, CheckCircle, Send } from 'lucide-react';
import AdminCard from './AdminCard';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface Props {
  title:       string;
  description: string;
  type:        'email' | 'sms' | 'phone';
  sendOtp:   (value: string) => Promise<any>;
  verifyOtp: (value: string, otp: string) => Promise<any>;
}

const ICON_MAP = { email: Mail, sms: Smartphone, phone: Phone };

export default function OtpPanel({ title, description, type, sendOtp, verifyOtp }: Props) {
  const [value,     setValue]     = useState('');
  const [otp,       setOtp]       = useState('');
  const [sending,   setSending]   = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent,      setSent]      = useState(false);
  const [verified,  setVerified]  = useState(false);

  const Icon        = ICON_MAP[type];
  const placeholder = type === 'email' ? 'example@gmail.com' : '+91XXXXXXXXXX';
  const label       = type === 'email' ? 'Email Address' : 'Phone Number';

  const handleSend = async () => {
    if (!value.trim()) { toast.error('Please enter a value.'); return; }
    setSending(true);
    try {
      const res = await sendOtp(value.trim());
      toast.success(res.message || 'OTP sent!');
      setSent(true);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send OTP.');
    } finally { setSending(false); }
  };

  const handleVerify = async () => {
    if (!otp.trim()) { toast.error('Enter the OTP code.'); return; }
    setVerifying(true);
    try {
      const res = await verifyOtp(value.trim(), otp.trim());
      if (res?.verified === false) {
        toast.error(res.message || 'Invalid OTP.');
      } else {
        toast.success(res?.message || 'Verified successfully!');
        setVerified(true);
      }
    } catch (e: any) {
      toast.error(e?.message || 'Verification failed.');
    } finally { setVerifying(false); }
  };

  const handleReset = () => {
    setValue(''); setOtp(''); setSent(false); setVerified(false);
  };

  return (
    <AdminCard>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-brand-green/15 flex items-center justify-center">
          <Icon className="w-5 h-5 text-brand-green" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>

      {/* Success state */}
      {verified ? (
        <div className="flex flex-col items-center py-6 gap-3">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <p className="text-white font-semibold">Verified!</p>
          <Button variant="outline" size="sm" onClick={handleReset}>Test Again</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Address input */}
          <Input
            label={label}
            value={value}
            onChange={(e) => { setValue(e.target.value); setSent(false); }}
            placeholder={placeholder}
            disabled={sent}
            leftIcon={<Icon className="w-4 h-4" />}
          />

          {!sent ? (
            <Button className="w-full" isLoading={sending} onClick={handleSend}
                    leftIcon={<Send className="w-4 h-4" />}>
              Send OTP
            </Button>
          ) : (
            <>
              {/* OTP input */}
              <Input
                label="OTP Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleReset} className="flex-1">
                  Resend
                </Button>
                <Button className="flex-1" isLoading={verifying} onClick={handleVerify}
                        leftIcon={<CheckCircle className="w-4 h-4" />}>
                  Verify
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </AdminCard>
  );
}