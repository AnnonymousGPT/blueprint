import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload a file directly to Supabase Storage
 * @param {File|Blob} file - The file or blob to upload
 * @param {string} category - Document category (PAN, AADHAAR, etc)
 * @param {string} userId - User ID for path namespacing  
 * @returns {Promise<{path: string, size: number, name: string}>}
 */
export const uploadToStorage = async (file, category, userId) => {
  const normalizedCat = (category || 'other').toUpperCase().replace(/\s+/g, '_');
  const timestamp = Date.now();
  const safeName = (file.name || `capture_${timestamp}.jpg`).replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${userId}/${normalizedCat.toLowerCase()}/${timestamp}_${safeName}`;
  
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(storagePath, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false
    });
  
  if (error) throw new Error(`Upload failed: ${error.message}`);
  
  return {
    path: data.path,
    size: file.size,
    name: safeName
  };
};

/**
 * Get a temporary download URL for a stored file
 */
export const getDownloadUrl = async (filePath) => {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, 3600);
  if (error) throw new Error(`Download URL failed: ${error.message}`);
  return data.signedUrl;
};
