import path from 'node:path';
import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';
import { badRequest } from '../utils/app-error';

export const MAX_FILE_SIZE_BYTES = 1024 * 1024;

/** Profile pictures - spec allows .jpg, .jpeg, .png and .gif, max 1MB. */
export const PROFILE_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

/** Payment proof - spec is stricter: only .jpg and .png, max 1MB. */
export const PAYMENT_PROOF_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

/** Property images - spec strictly only .jpg and .png */
export const PROPERTY_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

function buildFileFilter(allowed: string[]) {
  return (_req: Request, file: Express.Multer.File, callback: FileFilterCallback): void => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(extension)) {
      callback(badRequest(`Only ${allowed.join(', ')} files are allowed`));
      return;
    }
    callback(null, true);
  };
}

/**
 * Files are kept in memory so the size and extension rules run before anything
 * touches disk or Cloudinary.
 */
function buildUploader(allowed: string[], maxSizeBytes: number = MAX_FILE_SIZE_BYTES) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSizeBytes, files: 10 },
    fileFilter: buildFileFilter(allowed),
  });
}

export const uploadProfileImage = buildUploader(PROFILE_IMAGE_EXTENSIONS);
export const uploadPaymentProof = buildUploader(PAYMENT_PROOF_EXTENSIONS);
export const uploadPropertyImages = buildUploader(PROPERTY_IMAGE_EXTENSIONS, 5 * 1024 * 1024);
