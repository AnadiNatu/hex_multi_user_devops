import { apiService } from './apiService';
import { API_ENDPOINTS } from './apiService';

import type {
  ProfilePhotoResponse,
  UploadProfilePhotoResponse,
  DeleteProfilePhotoResponse,
} from '../types/profile';

export const profileService = {

  // ============================================================
  // Get Current Profile Photo
  // ============================================================

  async getProfilePhoto(): Promise<ProfilePhotoResponse> {

    return apiService.get<ProfilePhotoResponse>(
      API_ENDPOINTS.PROFILE_PHOTO
    );

  },

  // ============================================================
  // Upload Profile Photo
  // ============================================================

  async uploadProfilePhoto(
    file: File
  ): Promise<UploadProfilePhotoResponse> {

    const formData = new FormData();

    formData.append('file', file);

    return apiService.upload<UploadProfilePhotoResponse>(
      API_ENDPOINTS.PROFILE_PHOTO,
      formData,
      'POST'
    );

  },

  // ============================================================
  // Delete Profile Photo
  // ============================================================

  async removeProfilePhoto(): Promise<DeleteProfilePhotoResponse> {

    return apiService.delete<DeleteProfilePhotoResponse>(
      API_ENDPOINTS.PROFILE_PHOTO
    );

  },

};