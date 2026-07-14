import toast from 'react-hot-toast';

export const passwordToast = {

  forgotSent: () =>
    toast.success('Password reset OTP sent.'),

  resetSuccess: () =>
    toast.success('Password updated successfully.'),

  changed: () =>
    toast.success('Password changed successfully.'),

  failed: (message: string) =>
    toast.error(message),

};