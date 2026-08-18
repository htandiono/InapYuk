import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import { env, hasCloudinary } from '../config/env';
import { logger } from './logger';

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export type UploadFolder = 'avatars' | 'properties' | 'rooms' | 'payment-proofs';

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'uploads');

function uploadToCloudinary(buffer: Buffer, folder: UploadFolder): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `inapyuk/${folder}`, resource_type: 'image' },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

async function uploadToDisk(
  buffer: Buffer,
  folder: UploadFolder,
  originalName: string,
): Promise<string> {
  const dir = path.join(LOCAL_UPLOAD_DIR, folder);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${crypto.randomUUID()}${path.extname(originalName).toLowerCase()}`;
  await fs.writeFile(path.join(dir, filename), buffer);
  return `/uploads/${folder}/${filename}`;
}

/**
 * Uploads to Cloudinary when configured, otherwise writes to ./uploads and
 * returns a path served by the static middleware. Keeps local dev working
 * without any third-party account.
 */
export async function uploadImage(
  file: Express.Multer.File,
  folder: UploadFolder,
): Promise<string> {
  if (hasCloudinary) return uploadToCloudinary(file.buffer, folder);
  logger.debug(`Cloudinary not configured - storing ${folder} upload on disk`);
  return uploadToDisk(file.buffer, folder, file.originalname);
}
