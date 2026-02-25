import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://kmkcrqlozwmzsgfdgath.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtta2NycWxvendtenNnZmRnYXRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjkwNzQ0OCwiZXhwIjoyMDcyNDgzNDQ4fQ.oo2nabZxXzBuu9xOp5F9GIbDRJ1vwiS0EzkXUKXQfrk'
);

const { data, error } = await supabase
    .from('whatsapp_instances')
    .select('uazapi_token')
    .limit(1);

if (!error) {
    console.log('✅ Coluna uazapi_token JA EXISTE!');
} else {
    console.log('❌ Coluna nao existe:', error.message);
    console.log('\nSQL para executar no Supabase SQL Editor:');
    console.log('ALTER TABLE public.whatsapp_instances ADD COLUMN IF NOT EXISTS uazapi_token TEXT;');
}
