// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://suoivgkdejziveococgi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1b2l2Z2tkZWp6aXZlb2NvY2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MjIyOTYsImV4cCI6MjA2ODM5ODI5Nn0.WXJmbLnXGkzJGfWH_8nY5eUUv3flvF4dvjN0-RGHYvI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});