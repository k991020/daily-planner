import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Robust fallback logic
const isValidUrl = (url: string | undefined) => url && url.startsWith("http");

const supabaseUrl = isValidUrl(envUrl) && !envUrl?.includes("your_supabase_url") 
  ? envUrl 
  : "https://fskbgatcikojzbagtpcw.supabase.co";

const supabaseAnonKey = (envKey && !envKey.includes("your_supabase_anon_key")) 
  ? envKey 
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZza2JnYXRjaWtvanpiYWd0cGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzM3OTYsImV4cCI6MjA4NTkwOTc5Nn0.dJz9qWcwi-1LXnRxL5W4j1MEYKEtQxxwsODUF0W0PnU";

console.log("Supabase Client Init:", { supabaseUrl, keyLength: supabaseAnonKey?.length });

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or Anon Key is missing. Connect logic will fail until .env is configured.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);