import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const { data, error } = await supabase.from("dados_cliente").select("*").limit(2);
    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("Columns:", Object.keys(data[0] || {}));
        console.log("Data:", data[0]);
    }
}
check();
