import { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { updateUser } from '../features/auth/authSlice';
import { Widget } from '../components/ui/Widget';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { apiService, API_ENDPOINTS } from '../services/apiService';
import {
  User, Mail, Phone, MapPin, Calendar,
  Shield, Camera, Trash2, Lock, Loader2,
} from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { useToast } from '../components/ui/Toast';

export default function Profile() {
  const dispatch = useAppDispatch();
  const { success, error: toastError } = useToast();
  const user = useAppSelector((state) => state.auth.user);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing,   setIsEditing]   = useState(false);
  const [formData,    setFormData]    = useState({
    name: user?.name || '', email: user?.email || '',
    phone: user?.phoneNumber || '', address: '',
  });
  const [saveLoading, setSaveLoading] = useState(false);

  const [photoUrl,     setPhotoUrl]     = useState(user?.avatarUrl || user?.profilePicture || '');
  const [photoLoading, setPhotoLoading] = useState(false);

  useEffect(() => {
    apiService
      .get<{ photoUrl: string }>(API_ENDPOINTS.PROFILE_PHOTO)
      .then((res) => {
        if (res.photoUrl) {
          setPhotoUrl(res.photoUrl);
          dispatch(updateUser({ avatarUrl: res.photoUrl, profilePicture: res.photoUrl }));
        }
      })
      .catch(() => {});
  }, [dispatch]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiService.upload<{ photoUrl: string; message: string }>(API_ENDPOINTS.PROFILE_PHOTO, fd, 'POST');
      setPhotoUrl(res.photoUrl);
      dispatch(updateUser({ avatarUrl: res.photoUrl, profilePicture: res.photoUrl }));
      success('Profile photo updated!');
    } catch (err: any) {
      toastError(err.message || 'Failed to upload photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handlePhotoRemove = async () => {
    setPhotoLoading(true);
    try {
      await apiService.delete(API_ENDPOINTS.PROFILE_PHOTO);
      setPhotoUrl('');
      dispatch(updateUser({ avatarUrl: '', profilePicture: '' }));
      success('Profile photo removed');
    } catch (err: any) {
      toastError(err.message || 'Failed to remove photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwForm,      setPwForm]      = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading,   setPwLoading]   = useState(false);
  const [pwError,     setPwError]     = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('New passwords do not match'); return; }
    if (pwForm.newPassword.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    setPwLoading(true);
    try {
      await apiService.postQuery(API_ENDPOINTS.PASSWORD_CHANGE, {
        email: user!.email, currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword,
      });
      success('Password changed successfully!');
      setPwModalOpen(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPwError(err.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      dispatch(updateUser({ name: formData.name }));
      success('Profile updated!');
      setIsEditing(false);
    } catch {
      toastError('Failed to save profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: user?.name || '', email: user?.email || '', phone: user?.phoneNumber || '', address: '' });
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumb items={[{ label: 'Profile' }]} />

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Profile Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account information and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Photo + meta */}
        <Widget className="lg:col-span-1">
          <div className="text-center">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl ring-2 ring-slate-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-brand-green to-emerald-400 rounded-full flex items-center justify-center shadow-xl ring-2 ring-brand-green/20">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={photoLoading}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                {photoLoading
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <Camera className="w-5 h-5 text-white" />
                }
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handlePhotoUpload} />
            </div>

            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-0.5">{user.name}</h2>
            <p className="text-xs text-slate-400 mb-3">{user.email}</p>

            <Badge variant={user.role === 'ADMIN' ? 'primary' : 'success'} leftIcon={<Shield className="w-3 h-3" />}>
              {user.rawRole || user.role}
            </Badge>

            <div className="flex gap-2 justify-center mt-4">
              <Button size="sm" variant="outline" leftIcon={<Camera className="w-3 h-3" />} onClick={() => fileInputRef.current?.click()} isLoading={photoLoading}>
                Change
              </Button>
              {photoUrl && (
                <Button size="sm" variant="ghost" leftIcon={<Trash2 className="w-3 h-3" />} className="text-red-500 hover:bg-red-50" onClick={handlePhotoRemove} isLoading={photoLoading}>
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-xs text-slate-600">Joined {formatDate(user.createdAt)}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-xs text-slate-600 truncate">ID: {user.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-xs text-slate-600">
                {user.userType === 'TYPE1' ? 'Admin Account' : 'User Account'}
              </span>
            </div>
          </div>
        </Widget>

        {/* Right: Forms */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal info */}
          <Widget title="Personal Information">
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name"      name="name"    value={formData.name}    onChange={(e) => setFormData({ ...formData, name:    e.target.value })} leftIcon={<User    className="w-4 h-4" />} disabled={!isEditing} required />
                <Input label="Email Address"  name="email"   type="email" value={formData.email}   onChange={(e) => setFormData({ ...formData, email:   e.target.value })} leftIcon={<Mail    className="w-4 h-4" />} disabled={!isEditing} required />
                <Input label="Phone Number"   name="phone"   type="tel"   value={formData.phone}   onChange={(e) => setFormData({ ...formData, phone:   e.target.value })} leftIcon={<Phone   className="w-4 h-4" />} disabled={!isEditing} placeholder="+91 9876543210" />
                <Input label="Address"        name="address"              value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} leftIcon={<MapPin  className="w-4 h-4" />} disabled={!isEditing} placeholder="City, State" />
              </div>
              <div className="flex gap-2.5 pt-1">
                {!isEditing ? (
                  <Button type="button" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                ) : (
                  <>
                    <Button type="submit" isLoading={saveLoading}>Save Changes</Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                  </>
                )}
              </div>
            </form>
          </Widget>

          {/* Security */}
          <Widget title="Security">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Password</h3>
                  <p className="text-xs text-slate-500">Keep your account secure with a strong password.</p>
                </div>
                <Button variant="outline" size="sm" leftIcon={<Lock className="w-3.5 h-3.5" />} onClick={() => setPwModalOpen(true)} className="flex-shrink-0">
                  Change
                </Button>
              </div>

              <div className="flex items-start justify-between gap-4 pt-4 border-t border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Two-Factor Authentication</h3>
                  <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                </div>
                <Badge variant="warning" className="flex-shrink-0">Not Enabled</Badge>
              </div>
            </div>
          </Widget>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={pwModalOpen}
        onClose={() => { setPwModalOpen(false); setPwError(''); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
        title="Change Password"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPwModalOpen(false)} disabled={pwLoading}>Cancel</Button>
            <Button onClick={handlePasswordChange as any} isLoading={pwLoading}>Update Password</Button>
          </>
        }
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {pwError && <Alert variant="error">{pwError}</Alert>}
          <Input label="Current Password"   type="password" value={pwForm.currentPassword}  onChange={(e) => setPwForm({ ...pwForm, currentPassword:  e.target.value })} leftIcon={<Lock className="w-4 h-4" />} required />
          <Input label="New Password"       type="password" value={pwForm.newPassword}      onChange={(e) => setPwForm({ ...pwForm, newPassword:      e.target.value })} leftIcon={<Lock className="w-4 h-4" />} placeholder="Min 8 characters" required />
          <Input label="Confirm New Password" type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword:  e.target.value })} leftIcon={<Lock className="w-4 h-4" />} required />
        </form>
      </Modal>
    </div>
  );
}