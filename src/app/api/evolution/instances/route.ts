import { NextResponse } from "next/server";

type EvolutionInstanceResponse = {
  name: string;
  ownerJid?: string;
  connectionStatus?: string;
  profileName?: string;
};

type WhatsAppInstance = {
  instance_name: string;
  number?: string;
  status: "conectado" | "desconectado";
  evolution?: string;
};

export async function POST() {
  try {
    const url = `${process.env.EVO_API_URL}/instance/fetchInstances`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EVOLUTION_API_KEY}`,
      },
      body: JSON.stringify({ instanceName: "" }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Erro na API Evolution: ${response.status} - ${text}`);
    }

    const dataRaw = await response.text();
    const dataJson: EvolutionInstanceResponse[] = dataRaw
      ? JSON.parse(dataRaw)
      : [];

    const instances: WhatsAppInstance[] = dataJson.map((inst) => ({
      instance_name: inst.name,
      number: inst.ownerJid?.split("@")[0],
      status: inst.connectionStatus === "open" ? "conectado" : "desconectado",
      evolution: inst.profileName,
    }));

    return NextResponse.json(instances);
  } catch (error) {
    console.error("Erro ao buscar instâncias da Evolution:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 500 });
  }
}
