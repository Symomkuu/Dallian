/**
 * Direct Cloudinary upload utility for the Dallian admin dashboard.
 *
 * Flow:
 *   1. POST to /api/dashboard/media/upload-signature/ → get signed payload from backend.
 *   2. POST file + signed payload directly to Cloudinary (no server round-trip for the bytes).
 *   3. Return { secureUrl, publicId, width, height, format } to the caller.
 */

import { fetchCloudinaryUploadSignature } from '@/utils/api';

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
}

export async function uploadImageToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const signature = await fetchCloudinaryUploadSignature();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signature.api_key);
  formData.append('timestamp', String(signature.timestamp));
  formData.append('folder', signature.folder);
  formData.append('public_id', signature.public_id);
  formData.append('signature', signature.signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const text = await response.text();
    let message = `Cloudinary upload failed (HTTP ${response.status}).`;
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string } };
      if (parsed.error?.message) message += ` ${parsed.error.message}`;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  const payload = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
    width?: number;
    height?: number;
    format?: string;
  };

  if (!payload.secure_url || !payload.public_id) {
    throw new Error('Cloudinary upload response is missing required fields.');
  }

  return {
    secureUrl: payload.secure_url,
    publicId: payload.public_id,
    width: payload.width,
    height: payload.height,
    format: payload.format,
  };
}
