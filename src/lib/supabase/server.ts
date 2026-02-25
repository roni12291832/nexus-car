import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "As variáveis de ambiente do Supabase não estão configuradas corretamente."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseService = serviceRoleKey 
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;
