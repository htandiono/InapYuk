import { v2 as cloudinary } from 'cloudinary';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
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

function deleteFromCloudinary(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const match = url.match(/\/upload\/(?:v\d+\/)?(inapyuk\/.+?)\.\w+$/);
    if (!match) return resolve(); // Not a recognizable cloudinary URL

    cloudinary.uploader.destroy(match[1], (error) => {
      if (error) return reject(error);
      resolve();
    });
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

async function deleteFromDisk(url: string): Promise<void> {
  if (!url.startsWith('/uploads/')) return;
  const filePath = path.join(process.cwd(), url.replace(/^\//, ''));
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
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

export async function deleteImage(url: string): Promise<void> {
  if (!url) return;
  if (hasCloudinary && url.includes('cloudinary.com')) {
    await deleteFromCloudinary(url);
  } else if (url.startsWith('/uploads/')) {
    await deleteFromDisk(url);
  }
}
