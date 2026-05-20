import { createClient } from "@supabase/supabase-js";

type SupabaseClient = ReturnType<typeof createClient>;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function missingSupabaseClient(name: string): SupabaseClient {
  return new Proxy({} as SupabaseClient, {
    get() {
      throw new Error(`${name} is unavailable because Supabase environment variables are missing.`);
    },
  });
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : missingSupabaseClient("supabase");

export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : missingSupabaseClient("supabaseAdmin");
