import toast from 'react-hot-toast';

export const otpToast = {

  sent: (target: string) =>
    toast.success(`OTP sent to ${target}`),

  verified: () =>
    toast.success('OTP verified successfully'),

  phoneLogin: () =>
    toast.success('Phone login verified'),

  failed: (message: string) =>
    toast.error(message),

};