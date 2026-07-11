import { supabase } from './supabaseClient';

const BUCKET = 'documents';

export const uploadFileToStorage = async (filePath: string, fileBuffer: Buffer, contentType: string) => {
  const { data, error } = await supabase.storage.from(BUCKET).upload(filePath, fileBuffer, {
    contentType,
    upsert: true
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return data.path;
};

export const getSignedDownloadUrl = async (filePath: string, expiresIn = 3600): Promise<string> => {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, expiresIn);
  if (error) throw new Error(`Signed URL failed: ${error.message}`);
  return data.signedUrl;
};

export const deleteFileFromStorage = async (filePath: string): Promise<void> => {
  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
};

// Legacy exports for backward compatibility
export const getUploadPresignedUrl = async (key: string, _fileType: string) => {
  return { url: `supabase-storage://${BUCKET}/${key}`, uploadKey: key };
};
export const getDownloadPresignedUrl = getSignedDownloadUrl;
export const deleteS3Object = deleteFileFromStorage;
