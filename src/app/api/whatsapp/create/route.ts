import { NextResponse } from "next/server";
import { InstanceCreatePayload, InstanceCreateResponse } from "../../../../../types/evolution";

export async function POST(req: Request) {
  try {
    const { instanceName, number }: { instanceName: string; number: string } = await req.json();

    const payload: InstanceCreatePayload = {
      instanceName,
      number,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
      groupsIgnore: true,
      webhook: {
        url: "https://webhook.linqapps.com/webhook/3e949337-89b9-4fcc-a461-45458213b840",
        byEvents: true,
        base64: true,
        headers: {
          "Content-Type": "application/json",
        },
        events: ["MESSAGES_UPDATE"],
      },
    };

    const res = await fetch(`${process.env.EVO_API_URL}/instance/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.EVOLUTION_API_KEY ?? "", 
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data: InstanceCreateResponse = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 500 });
  }
}
