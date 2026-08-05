import { useEffect, useState, useCallback } from 'react';
import {
  UserCircle,
  RefreshCw,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Users,
} from 'lucide-react';

import { useAppSelector } from '../app/hooks';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

import AdminPageHeader from '@/components/ui/AdminPageHeader';
import AdminStatistics from '@/components/ui/AdminStatistics';
import AdminSection from '@/components/ui/AdminSection';
import AdminCard from '@/components/ui/AdminCard';
import ProfilePhotoCard from '@/components/ui/ProfilePhotoCard';

import { provisionService } from '../services/provisionService';

export default function ProfileCenter() {
  const user = useAppSelector((s) => s.auth.user);

  const [pendingAdmins, setPendingAdmins] = useState(0);
  const [pendingUsers,  setPendingUsers]  = useState(0);
  const [loadingStats,  setLoadingStats]  = useState(false);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [type1, type2] = await Promise.all([
        provisionService.getPendingType1().catch(() => []),
        provisionService.getPendingType2().catch(() => []),
      ]);
      setPendingAdmins(type1.length);
      setPendingUsers(type2.length);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const formattedJoinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : '—';

  return (
    <div className="admin-page-shell space-y-8 page-enter -mx-4 sm:-mx-6 lg:-mx-8 -my-8 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 sm:px-6 lg:px-8 pt-8 pb-12">

      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Administration' },
          { label: 'Profile Center' },
        ]}
      />

      <AdminPageHeader
        title="Profile Center"
        subtitle="Manage your profile picture and view account details."
        icon={UserCircle}
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={loadStats}
            isLoading={loadingStats}
          >
            Refresh
          </Button>
        }
      />

      <AdminStatistics
        stats={[
          { title: 'Profile Photo',      value: 'Ready',         color: 'text-emerald-400' },
          { title: 'Cloudinary',         value: 'Connected',     color: 'text-blue-400'    },
          { title: 'Pending Admins',     value: pendingAdmins,   color: 'text-amber-400'   },
          { title: 'Pending Users',      value: pendingUsers,    color: 'text-brand-green' },
        ]}
      />

      <AdminSection
        title="Profile Details"
        subtitle="Your account information."
      >
        <AdminCard>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-green/15 flex items-center justify-center flex-shrink-0">
                <UserCircle className="w-4.5 h-4.5 text-brand-green" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</p>
                <p className="text-sm font-semibold text-white truncate">{user?.name || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                <p className="text-sm font-semibold text-white truncate">{user?.email || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4.5 h-4.5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                <p className="text-sm font-semibold text-white truncate">{user?.phoneNumber || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4.5 h-4.5 text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role</p>
                <Badge variant="primary">{user?.rawRole || '—'}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-500/15 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4.5 h-4.5 text-slate-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</p>
                <p className="text-sm font-semibold text-white truncate">{formattedJoinDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <Users className="w-4.5 h-4.5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">User Type</p>
                <p className="text-sm font-semibold text-white truncate">{user?.userType || '—'}</p>
              </div>
            </div>
          </div>
        </AdminCard>
      </AdminSection>

      <AdminSection
        title="Profile Photo"
        subtitle="Upload, preview and remove your profile picture."
      >
        <ProfilePhotoCard />
      </AdminSection>

    </div>
  );
}
