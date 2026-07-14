// ─────────────────────────────────────────────────────────────
// Profile Photo Types
// ─────────────────────────────────────────────────────────────

export interface ProfilePhotoResponse {

  photoUrl: string;

  userType: string;

}

export interface UploadProfilePhotoResponse {

  message: string;

  photoUrl: string;

  userType: string;

}

export interface DeleteProfilePhotoResponse {

  message: string;

}