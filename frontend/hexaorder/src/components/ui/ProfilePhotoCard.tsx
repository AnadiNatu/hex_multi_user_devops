import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Upload,
  Loader2,
  UserCircle
} from 'lucide-react';

import AdminCard from './AdminCard';
import { Button } from '../ui/Button';
import { Trash2 } from 'lucide-react';
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

      toast.error(

        err?.response?.data?.message ??

        'Unable to load profile photo.'

      );

    } finally {

      setLoading(false);

    }

  }

 const preview = useMemo(() => {
  return selectedFile
    ? URL.createObjectURL(selectedFile)
    : currentPhoto;
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

      const res = await profileService.uploadProfilePhoto(

        selectedFile

      );

     await loadProfilePhoto();

      setSelectedFile(null);

      toast.success(

        res.message ||

        'Profile photo updated.'

      );

    } catch (err: any) {

      toast.error(

        err?.response?.data?.message ??

        'Unable to upload photo.'

      );

    } finally {

      setUploading(false);

    }

  }

  async function deletePhoto() {

  try {

    setDeleting(true);

    const res = await profileService.removeProfilePhoto();

    toast.success(

      res.message ||

      'Profile photo removed.'

    );

    setCurrentPhoto('');

    setSelectedFile(null);

    setDeleteDialogOpen(false);

  }

  catch (err: any) {

    toast.error(

      err?.response?.data?.message ??

      'Unable to remove profile photo.'

    );

  }

  finally {

    setDeleting(false);

  }

}

  return (

    <AdminCard>

      <div className="space-y-6">

        <div>

          <h3 className="text-xl font-bold text-white">

            Profile Photo

          </h3>

          <p className="text-slate-400 mt-1">

            Upload a new profile picture.

          </p>

        </div>

        {/* ---------------- Avatar ---------------- */}

        <div className="flex justify-center">

          <div className="relative">

            {

              loading ?

              (

                <div className="w-40 h-40 rounded-full bg-slate-800 flex items-center justify-center">

                  <Loader2 className="w-10 h-10 animate-spin text-brand-green"/>

                </div>

              )

              :

              preview ?

              (

                <img

                  src={preview}

                  alt="Profile"

                  className="w-40 h-40 rounded-full object-cover border-4 border-brand-green shadow-xl"

                />

              )

              :

              (

                <div className="w-40 h-40 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">

                  <UserCircle className="w-24 h-24 text-slate-500"/>

                </div>

              )

            }

          </div>

        </div>

        {/* ---------------- File Picker ---------------- */}

        <input

          type="file"

          accept="image/*"

          onChange={(e)=>{

            if(e.target.files?.length){

              setSelectedFile(

                e.target.files[0]

              );

            }

          }}

          className="block w-full text-sm text-slate-300
          file:mr-4
          file:px-4
          file:py-2
          file:border-0
          file:rounded-lg
          file:bg-brand-green
          file:text-white
          file:cursor-pointer"

        />

        {/* ---------------- Upload Button ---------------- */}

        <Button

          className="w-full"

          leftIcon={<Upload className="w-4 h-4"/>}

          isLoading={uploading}

          onClick={uploadPhoto}

        >

          Upload Profile Photo

        </Button>
<Button
  variant="danger"
  className="w-full"
  leftIcon={<Trash2 className="w-4 h-4" />}
  onClick={() => setDeleteDialogOpen(true)}
  disabled={!currentPhoto && !selectedFile}
>
  Remove Profile Photo
</Button>
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