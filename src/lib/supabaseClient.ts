import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://fskbgatcikojzbagtpcw.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZza2JnYXRjaWtvanpiYWd0cGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzM3OTYsImV4cCI6MjA4NTkwOTc5Nn0.dJz9qWcwi-1LXnRxL5W4j1MEYKEtQxxwsODUF0W0PnU";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or Anon Key is missing. Connect logic will fail until .env is configured.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);