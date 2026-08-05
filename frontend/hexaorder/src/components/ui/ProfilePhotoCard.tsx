import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Upload,
  Loader2,
  UserCircle,
  Trash2,
} from 'lucide-react';

import AdminCard from './AdminCard';
import { Button } from '../ui/Button';
import ConfirmationDialog from '../ui/ConfirmationDialog';

import { profileService } from '@/services/profileService';

export default function ProfilePhotoCard() {

  const [currentPhoto, setCurrentPhoto] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProfilePhoto();
  }, []);

  async function loadProfilePhoto() {
    try {
      setLoading(true);
      const res = await profileService.getProfilePhoto();
      setCurrentPhoto(res.photoUrl ?? '');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Unable to load profile photo.');
    } finally {
      setLoading(false);
    }
  }

  const preview = useMemo(() => {
    return selectedFile ? URL.createObjectURL(selectedFile) : currentPhoto;
  }, [selectedFile, currentPhoto]);

  useEffect(() => {
    return () => {
      if (selectedFile && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview, selectedFile]);

  async function uploadPhoto() {
    if (!selectedFile) {
      toast.error('Please choose an image.');
      return;
    }
    try {
      setUploading(true);
      const res = await profileService.uploadProfilePhoto(selectedFile);
      await loadProfilePhoto();
      setSelectedFile(null);
      toast.success(res.message || 'Profile photo updated.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Unable to upload photo.');
    } finally {
      setUploading(false);
    }
  }

  async function deletePhoto() {
    try {
      setDeleting(true);
      const res = await profileService.removeProfilePhoto();
      toast.success(res.message || 'Profile photo removed.');
      setCurrentPhoto('');
      setSelectedFile(null);
      setDeleteDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Unable to remove profile photo.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminCard>
      <div className="space-y-5">

        <div>
          <h3 className="text-lg font-bold text-white">Profile Photo</h3>
          <p className="text-sm text-slate-400 mt-1">Upload a new profile picture.</p>
        </div>

        <div className="flex justify-center">
          <div className="relative">
            {loading ? (
              <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
              </div>
            ) : preview ? (
              <img
                src={preview}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-brand-green shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <UserCircle className="w-16 h-16 text-slate-500" />
              </div>
            )}
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.length) setSelectedFile(e.target.files[0]);
          }}
          className="block w-full text-xs text-slate-300
          file:mr-3
          file:px-3
          file:py-1.5
          file:text-xs
          file:border-0
          file:rounded-lg
          file:bg-brand-green
          file:text-white
          file:cursor-pointer"
        />

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            leftIcon={<Upload className="w-3.5 h-3.5" />}
            isLoading={uploading}
            onClick={uploadPhoto}
          >
            Upload
          </Button>
          <Button
            size="sm"
            variant="danger"
            className="flex-1"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => setDeleteDialogOpen(true)}
            disabled={!currentPhoto && !selectedFile}
          >
            Remove
          </Button>
        </div>

      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Remove Profile Photo"
        description="This will permanently remove your current profile photo from Cloudinary."
        confirmText="Remove Photo"
        confirmVariant="danger"
        loading={deleting}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={deletePhoto}
      />

    </AdminCard>
  );
}
