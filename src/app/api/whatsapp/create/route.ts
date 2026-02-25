import { NextResponse } from "next/server";
import { UazapiInstanceResponse } from "../../../../../types/uazapi";

export async function POST(req: Request) {
  try {
    const { instanceName }: { instanceName: string } = await req.json();

    // 1. Call UAZAPI directly to initialize instance (NexusCar Reality)
    const res = await fetch(`${process.env.UAZAPI_BASE_URL}/instance/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        admintoken: process.env.UAZAPI_ADMIN_TOKEN ?? "",
      },
      body: JSON.stringify({ name: instanceName }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Erro na UAZAPI: ${err}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 500 });
  }
}
