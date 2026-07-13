import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function run() {
  try {
    console.log('Connecting to Supabase Storage at:', supabaseUrl);
    
    // Check if bucket exists
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket('documents');
    
    if (bucketError) {
      console.warn('Bucket "documents" not found or error occurred:', bucketError.message);
      console.log('Attempting to create "documents" bucket...');
      
      const { data: createData, error: createError } = await supabase.storage.createBucket('documents', {
        public: false,
        fileSizeLimit: 10485760  // 10MB
      });
      
      if (createError) {
        throw new Error(`Failed to create bucket: ${createError.message}`);
      }
      
      console.log('Bucket "documents" created successfully:', createData);
    } else {
      console.log('Bucket "documents" exists and is ready:', bucket);
    }
    
    // Try listing files
    const { data: files, error: listError } = await supabase.storage.from('documents').list('', { limit: 5 });
    if (listError) {
      throw new Error(`Failed to list files: ${listError.message}`);
    }
    console.log('Listed files successfully. Count:', files?.length || 0);
    console.log('First few files:', files);
    console.log('--- Supabase Storage Check Passed Successfully ---');
  } catch (error: any) {
    console.error('Supabase Storage Verification Failed:', error.message);
    process.exit(1);
  }
}

run();
