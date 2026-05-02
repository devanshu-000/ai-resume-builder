import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Single shared Supabase client (safe for both server and client components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable Supabase auth — we use Clerk for authentication
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});