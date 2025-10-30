import type { NextApiRequest, NextApiResponse } from "next";

type WhatsAppInstance = {
  instance_name: string;
  number?: string;
  status: "conectado" | "desconectado";
  evolution?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WhatsAppInstance[] | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const url = `${process.env.EVO_API_URL}/instance/fetchInstances`;

    console.log("Enviando requisição para Evolution:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.EVOLUTION_API_KEY}`, // ou "apikey"
      },
      body: JSON.stringify({ instanceName: "" }),
    });

    console.log("Status da resposta Evolution:", response.status, response.statusText);

    if (!response.ok) {
      const text = await response.text();
      console.log("Resposta raw da API Evolution:", text);
      throw new Error(`Erro na API Evolution: ${response.status} - ${text}`);
    }

    const dataRaw = await response.text();
    console.log("Resposta raw da API Evolution:", dataRaw);

    const dataJson = dataRaw ? JSON.parse(dataRaw) : [];

    const instances: WhatsAppInstance[] = dataJson.map((inst: any) => ({
      instance_name: inst.name,
      number: inst.ownerJid?.split("@")[0],
      status: inst.connectionStatus === "open" ? "conectado" : "desconectado",
      evolution: inst.profileName,
    }));

    res.status(200).json(instances);
  } catch (error: unknown) {
    console.error("Erro ao buscar instâncias da Evolution:", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Erro desconhecido" });
    }
  }
}
