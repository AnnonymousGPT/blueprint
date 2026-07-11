import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';

const supabaseUrl = 'https://uoobhadlcqnnvbemkfil.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvb2JoYWRsY3FubnZiZW1rZmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTg3NzcsImV4cCI6MjA5OTI5NDc3N30.PeXECJ3SiO4RWmG8O_FXaEcUuvXwh0HR91_919mta-I';

const isNative = Capacitor.isNativePlatform();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'implicit',
    detectSessionInUrl: true,
    autoRefreshToken: true,
    persistSession: true,
  }
});
