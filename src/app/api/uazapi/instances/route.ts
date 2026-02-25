import { NextResponse } from "next/server";

type UazapiInstance = {
  id: string;
  name: string;
  token: string;
  status: "connected" | "connecting" | "disconnected";
  createdAt: string;
};

type WhatsAppInstance = {
  instance_name: string;
  number?: string;
  status: "conectado" | "desconectado";
  uazapi_token?: string;
};

export async function POST() {
  try {
    const url = `${process.env.UAZAPI_BASE_URL}/instance/all`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        admintoken: process.env.UAZAPI_ADMIN_TOKEN ?? "",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Erro na API UAZAPI: ${response.status} - ${text}`);
    }

    const dataJson: UazapiInstance[] = await response.json();

    const instances: WhatsAppInstance[] = dataJson.map((inst) => ({
      instance_name: inst.name,
      // UAZAPI /instance/all summary might not contain number, but let's map what we can
      status: inst.status === "connected" ? "conectado" : "desconectado",
      uazapi_token: inst.token,
    }));

    return NextResponse.json(instances);
  } catch (error) {
    console.error("Erro ao buscar instâncias da UAZAPI:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 500 });
  }
}
