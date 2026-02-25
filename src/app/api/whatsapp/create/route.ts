import { NextResponse } from "next/server";

// Aumenta o timeout da função serverless na Vercel para 60 segundos
// Necessário porque o N8N precisa criar instância + configurar webhook + gerar QR
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { instanceName }: { instanceName: string } = await req.json();

    // 1. Call n8n Webhook to generate QR and setup instance (Restoring 23:39 behavior)
    // Timeout de 55s para dar margem antes do limite de 60s da Vercel
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    let n8nRes: Response;
    try {
      n8nRes = await fetch(process.env.WPP_CREATE_WEBHOOK_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instance_name: instanceName,
          user_id: instanceName,
          receipt_webhook_url: process.env.WHATSAPP_WEBHOOK_URL
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!n8nRes.ok) {
      const err = await n8nRes.text();
      return NextResponse.json({ error: `Erro no n8n: ${err}` }, { status: n8nRes.status });
    }

    const n8nData = await n8nRes.json();
    console.log("[API /whatsapp/create] Status do n8n:", n8nRes.status);
    console.log("[API /whatsapp/create] Dados recebidos do n8n:", JSON.stringify(n8nData).slice(0, 200) + "...");

    return NextResponse.json(n8nData);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 500 });
  }
}
