import { Platform } from 'react-native';
import ApiService from '@config/apiService';
import { API_ENDPOINTS } from '@config/apiConfig';
import { devDebugger } from '@utils/devDebugger';

/**
 * Helper to check if an error was due to upload cancellation/abort.
 */
export const isUploadAborted = (err: any, signal?: AbortSignal | null): boolean => {
  return !!(
    signal?.aborted ||
    err?.name === 'AbortError' ||
    err?.name === 'CanceledError' ||
    err?.code === 'ERR_CANCELED' ||
    err?.message === 'Upload aborted' ||
    err?.message === 'canceled'
  );
};

/**
 * Utility to get a presigned URL from the backend.
 * Uses the new payload structure: { contentType, fileSize, folder }
 */
export const getPresignedUrl = async (
  fileSize: number,
  contentType: string,
  folder: 'client' | 'contractor' | 'contractor-docs' | 'job-evidence' | 'admin' = 'client',
  signal?: AbortSignal
) => {
  try {
    if (signal?.aborted) {
      throw new Error('Upload aborted');
    }

    const res = await ApiService.post(
      API_ENDPOINTS.UTIL.PRESIGNED_URL,
      {
        contentType,
        fileSize,
        folder,
      },
      { signal }
    );

    if (res.success && res.data) {
      // Normalize backend response: some endpoints return 'url' while frontend expects 'uploadUrl'
      const uploadUrl = res.data.url || res.data.uploadUrl;
      const fileUrl = uploadUrl; // Use the full URL as requested

      return {
        ...res.data,
        uploadUrl,
        fileUrl, // The base download URI stripped of query params
        key: res.data.key,
      };
    } else {
      throw new Error(res.message || 'Failed to get presigned URL');
    }
  } catch (err: any) {
    if (isUploadAborted(err, signal)) {
      devDebugger.log('[AWS Upload Helper] Presigned URL fetch aborted by user');
      throw new Error('Upload aborted');
    }
    throw new Error(err.message || 'Presigned URL fetch error');
  }
};

/**
 * Utility to upload a file to S3.
 * Uses binary upload for Android to ensure compatibility.
 */
export const uploadToS3 = async (
  uploadUrl: string,
  fileUri: string,
  contentType: string = 'application/octet-stream',
  signal?: AbortSignal
) => {
  try {
    if (signal?.aborted) {
      throw new Error('Upload aborted');
    }

    // Safer path handling: only prepend file:// if it's not already a file:// or content:// URI
    const filePath = (fileUri.startsWith('file://') || fileUri.startsWith('content://'))
      ? fileUri
      : `file://${fileUri}`;

    // Use fetch + blob for both platforms as it's the most compatible way to handle binary S3 uploads in React Native
    const fileResponse = await fetch(filePath, { signal });
    const blob = await fileResponse.blob();

    if (signal?.aborted) {
      throw new Error('Upload aborted');
    }

    const result = await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': contentType,
      },
      signal,
    });

    if (!result.ok) {
      const errorText = await result.text().catch(() => '');
      devDebugger.error('[AWS Upload Helper] S3 Upload Failed:', result.status, errorText);
      throw new Error(`S3 upload failed with status ${result.status}`);
    }
    return true;
  } catch (err: any) {
    if (isUploadAborted(err, signal)) {
      devDebugger.log('[AWS Upload Helper] S3 upload aborted by user');
      throw new Error('Upload aborted');
    }
    devDebugger.error('[AWS Upload Helper] S3 upload error:', err);
    throw new Error(err.message || 'S3 upload failed');
  }
};

/**
 * Utility to transform S3 URL to CloudFront URL.
 */
export const getCloudFrontUrl = (url: string | undefined): string => {
  if (!url) return '';
  const s3Domain = 'https://mern-octal.s3.ap-south-1.amazonaws.com';
  const cloudFrontDomain = 'https://d1f23llskj06r6.cloudfront.net';

  if (url.startsWith(s3Domain)) {
    return url.replace(s3Domain, cloudFrontDomain);
  }
  return url;
};
