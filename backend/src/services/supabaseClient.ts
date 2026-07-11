import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Fallback to placeholder values if env variables are not yet configured on Render dashboard
const cleanUrl = supabaseUrl || 'https://placeholder-project-id.supabase.co';
const cleanKey = supabaseServiceKey || 'placeholder-anon-key-that-prevents-boot-crash';

export const supabase = createClient(cleanUrl, cleanKey, {
  auth: { persistSession: false }
});

// Auto-create storage bucket on module load
(async () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[Supabase] URL or Service Key not set in Render environment. Storage features will fail at runtime.');
    return;
  }
  try {
    const { data } = await supabase.storage.getBucket('documents');
    if (!data) {
      await supabase.storage.createBucket('documents', {
        public: false,
        fileSizeLimit: 10485760  // 10MB
      });
      console.log('[Supabase Storage] Created "documents" bucket');
    } else {
      console.log('[Supabase Storage] "documents" bucket ready');
    }
  } catch (err: any) {
    console.warn('[Supabase Storage] Bucket check skipped:', err?.message);
  }
})();
