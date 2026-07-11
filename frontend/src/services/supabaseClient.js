import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';

const supabaseUrl = 'https://uoobhadlcqnnvbemkfil.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvb2JoYWRsY3FubnZiZW1rZmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTg3NzcsImV4cCI6MjA5OTI5NDc3N30.PeXECJ3SiO4RWmG8O_FXaEcUuvXwh0HR91_919mta-I';

const isNative = Capacitor.isNativePlatform();

// When running inside Android Webview, the main URL is https://localhost/ which doesn't have the auth hash.
// If detectSessionInUrl is true on native, it conflicts with manual exchangeCodeForSession verifiers.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: !isNative, // Disable on native!
    autoRefreshToken: true,
    persistSession: true,
  }
});
