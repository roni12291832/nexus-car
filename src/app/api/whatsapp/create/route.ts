import { NextResponse } from "next/server";
import { UazapiInstanceResponse } from "../../../../../types/uazapi";

export async function POST(req: Request) {
  try {
    const { instanceName }: { instanceName: string } = await req.json();

    // 1. Call n8n Webhook to generate QR and setup instance (Restoring 23:39 behavior)
    const n8nRes = await fetch(process.env.WPP_CREATE_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instance_name: instanceName,
        user_id: instanceName,
        receipt_webhook_url: process.env.WHATSAPP_WEBHOOK_URL
      }),
    });

    if (!n8nRes.ok) {
      const err = await n8nRes.text();
      return NextResponse.json({ error: `Erro no n8n: ${err}` }, { status: n8nRes.status });
    }

    const n8nData = await n8nRes.json();
    return NextResponse.json(n8nData);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 500 });
  }
}
