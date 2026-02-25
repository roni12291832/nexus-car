// Script temporário para adicionar coluna uazapi_token na tabela whatsapp_instances
// Execute: node scripts/migrate-add-uazapi-token.js
// Depois apague este arquivo.

const SUPABASE_URL = 'https://kmkcrqlozwmzsgfdgath.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtta2NycWxvendtenNnZmRnYXRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjkwNzQ0OCwiZXhwIjoyMDcyNDgzNDQ4fQ.oo2nabZxXzBuu9xOp5F9GIbDRJ1vwiS0EzkXUKXQfrk';

async function run() {
    // Usa a API de storage do Supabase para rodar SQL via RPC 
    // Tentativa via fetch direto na API do Supabase postgres-meta
    const metaUrl = `${SUPABASE_URL}/pg/columns`;

    // Verifica colunas atuais
    const colRes = await fetch(`${SUPABASE_URL}/rest/v1/whatsapp_instances?select=*&limit=0`, {
        headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            Prefer: 'return=minimal',
        },
    });
    const headers = [...colRes.headers.entries()];
    console.log('Status check:', colRes.status);

    // Como não temos acesso DDL via REST, precisamos usar a connection string direta
    // Vamos usar o pacote @supabase/supabase-js para confirmar que a coluna nao existe
    // e depois orientar o usuario

    // Testa se coluna existe
    const testRes = await fetch(`${SUPABASE_URL}/rest/v1/whatsapp_instances?select=uazapi_token&limit=1`, {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    const testData = await testRes.json();

    if (testRes.ok) {
        console.log('✅ Coluna uazapi_token JÁ EXISTE na tabela whatsapp_instances!');
        console.log('Dados:', JSON.stringify(testData));
    } else {
        console.log('❌ Coluna uazapi_token NÃO EXISTE:', testData.message);
        console.log('\nSQL para executar no Supabase SQL Editor:');
        console.log('ALTER TABLE public.whatsapp_instances ADD COLUMN IF NOT EXISTS uazapi_token TEXT;');
    }
}

run().catch(console.error);
